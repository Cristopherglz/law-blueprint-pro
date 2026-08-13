-- 1. Internal config table (no Data API grants: unreachable from the client)
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.app_config TO service_role;

INSERT INTO public.app_config (key, value)
VALUES ('order_confirm_secret', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.assert_order_secret(_secret text)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _secret IS NULL OR _secret = '' OR _secret <> (SELECT value FROM public.app_config WHERE key = 'order_confirm_secret') THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.assert_order_secret(text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_order_confirm_secret()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT value INTO v FROM public.app_config WHERE key = 'order_confirm_secret';
  RETURN v;
END $$;
REVOKE ALL ON FUNCTION public.get_order_confirm_secret() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_confirm_secret() TO authenticated;

-- 2. Ebook file contents (admin-only; delivered through a security definer function)
CREATE TABLE IF NOT EXISTS public.ebook_files (
  ebook_id uuid PRIMARY KEY REFERENCES public.ebooks(id) ON DELETE CASCADE,
  filename text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/pdf',
  content_base64 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebook_files TO authenticated;
GRANT ALL ON public.ebook_files TO service_role;
ALTER TABLE public.ebook_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ebook file contents" ON public.ebook_files
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS ebook_files_set_updated_at ON public.ebook_files;
CREATE TRIGGER ebook_files_set_updated_at BEFORE UPDATE ON public.ebook_files
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Create an order (public checkout, no service role)
CREATE OR REPLACE FUNCTION public.create_order(_ebook_id uuid, _buyer_name text, _buyer_email text)
RETURNS TABLE (order_id uuid, order_token uuid, order_amount numeric, order_currency text, ebook_title text, ebook_description text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e public.ebooks;
BEGIN
  IF _buyer_email IS NULL OR _buyer_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  SELECT * INTO e FROM public.ebooks WHERE id = _ebook_id AND is_published;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ebook no disponible'; END IF;

  RETURN QUERY
  WITH ins AS (
    INSERT INTO public.orders (ebook_id, buyer_name, buyer_email, amount, currency, status)
    VALUES (e.id, left(coalesce(_buyer_name, ''), 120), lower(_buyer_email), e.price, e.currency, 'pending')
    RETURNING orders.id, orders.download_token, orders.amount, orders.currency
  )
  SELECT ins.id, ins.download_token, ins.amount, ins.currency, e.title, coalesce(e.description, '') FROM ins;
END $$;
REVOKE ALL ON FUNCTION public.create_order(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(uuid, text, text) TO anon, authenticated;

-- 4. Store the Mercado Pago preference id
CREATE OR REPLACE FUNCTION public.set_order_preference(_order_id uuid, _preference_id text, _secret text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.assert_order_secret(_secret);
  UPDATE public.orders SET mp_preference_id = _preference_id WHERE id = _order_id;
END $$;
REVOKE ALL ON FUNCTION public.set_order_preference(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_order_preference(uuid, text, text) TO anon, authenticated;

-- 5. Confirm a payment (webhook / server-side verification)
CREATE OR REPLACE FUNCTION public.confirm_order_payment(_order_id uuid, _payment_id text, _status text, _secret text)
RETURNS TABLE (
  id uuid, status text, buyer_name text, buyer_email text, download_token uuid,
  delivery_email_sent_at timestamptz, ebook_title text, has_file boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.assert_order_secret(_secret);
  IF _status NOT IN ('paid', 'pending', 'rejected') THEN RAISE EXCEPTION 'invalid status'; END IF;

  UPDATE public.orders o
  SET status = _status,
      mp_payment_id = coalesce(_payment_id, o.mp_payment_id),
      paid_at = CASE WHEN _status = 'paid' THEN coalesce(o.paid_at, now()) ELSE NULL END
  WHERE o.id = _order_id;

  RETURN QUERY
  SELECT o.id, o.status, o.buyer_name, o.buyer_email, o.download_token,
         o.delivery_email_sent_at, e.title,
         EXISTS (SELECT 1 FROM public.ebook_files f WHERE f.ebook_id = e.id)
  FROM public.orders o JOIN public.ebooks e ON e.id = o.ebook_id
  WHERE o.id = _order_id;
END $$;
REVOKE ALL ON FUNCTION public.confirm_order_payment(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_order_payment(uuid, text, text, text) TO anon, authenticated;

-- 6. Read a purchase using its private download token
CREATE OR REPLACE FUNCTION public.get_purchase_by_token(_token uuid)
RETURNS TABLE (id uuid, status text, buyer_name text, ebook_title text, has_file boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.id, o.status, o.buyer_name, e.title,
         EXISTS (SELECT 1 FROM public.ebook_files f WHERE f.ebook_id = e.id)
  FROM public.orders o JOIN public.ebooks e ON e.id = o.ebook_id
  WHERE o.download_token = _token
$$;
REVOKE ALL ON FUNCTION public.get_purchase_by_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_purchase_by_token(uuid) TO anon, authenticated;

-- 7. Download the purchased file (only when the payment is confirmed)
CREATE OR REPLACE FUNCTION public.download_purchase(_token uuid)
RETURNS TABLE (filename text, mime_type text, content_base64 text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT f.filename, f.mime_type, f.content_base64
  FROM public.orders o
  JOIN public.ebook_files f ON f.ebook_id = o.ebook_id
  WHERE o.download_token = _token AND o.status = 'paid';
END $$;
REVOKE ALL ON FUNCTION public.download_purchase(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.download_purchase(uuid) TO anon, authenticated;

-- 8. Order data for the delivery email + mark as sent
CREATE OR REPLACE FUNCTION public.get_order_for_delivery(_order_id uuid, _secret text)
RETURNS TABLE (
  id uuid, status text, buyer_name text, buyer_email text, download_token uuid,
  delivery_email_sent_at timestamptz, ebook_title text, has_file boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.assert_order_secret(_secret);
  RETURN QUERY
  SELECT o.id, o.status, o.buyer_name, o.buyer_email, o.download_token,
         o.delivery_email_sent_at, e.title,
         EXISTS (SELECT 1 FROM public.ebook_files f WHERE f.ebook_id = e.id)
  FROM public.orders o JOIN public.ebooks e ON e.id = o.ebook_id
  WHERE o.id = _order_id;
END $$;
REVOKE ALL ON FUNCTION public.get_order_for_delivery(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_for_delivery(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_order_delivered(_order_id uuid, _secret text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.assert_order_secret(_secret);
  UPDATE public.orders SET delivery_email_sent_at = now() WHERE id = _order_id;
END $$;
REVOKE ALL ON FUNCTION public.mark_order_delivered(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_order_delivered(uuid, text) TO anon, authenticated;

-- 9. Storage: covers readable publicly, admin-only writes
DROP POLICY IF EXISTS "Public read ebook covers" ON storage.objects;
CREATE POLICY "Public read ebook covers" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'ebook-files' AND name LIKE 'covers/%');

DROP POLICY IF EXISTS "Admins read ebook files" ON storage.objects;
CREATE POLICY "Admins read ebook files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins insert ebook files" ON storage.objects;
CREATE POLICY "Admins insert ebook files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update ebook files" ON storage.objects;
CREATE POLICY "Admins update ebook files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete ebook files" ON storage.objects;
CREATE POLICY "Admins delete ebook files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'));

-- 10. Cover now served as a static file from public/
UPDATE public.ebooks SET cover_url = '/ebook-contratos.png' WHERE cover_url LIKE '/__l5e/%';
