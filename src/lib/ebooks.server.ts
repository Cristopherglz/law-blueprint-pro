import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const EBOOK_BUCKET = "ebook-files";
export const COVER_FOLDER = "covers";

/**
 * Clave privada compartida con las funciones SECURITY DEFINER de Postgres.
 * Permite que el webhook (que no tiene sesión de usuario) confirme pagos sin
 * usar la clave de servicio.
 */
export function getOrderSecret(): string {
  const secret = process.env["ORDER_CONFIRM_SECRET"];
  if (!secret) throw new Error("ORDER_CONFIRM_SECRET no está configurado");
  return secret;
}

export function getPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/**
 * Portadas: se guardan en el bucket privado bajo `covers/` y son legibles por
 * cualquiera mediante URL firmada (política de lectura pública sólo para esa
 * carpeta). No requiere clave de servicio.
 */
export async function resolveCoverUrl(coverUrl: string | null): Promise<string | null> {
  if (!coverUrl) return null;
  if (coverUrl.startsWith("http") || coverUrl.startsWith("/")) return coverUrl;
  const signed = await getPublicClient()
    .storage.from(EBOOK_BUCKET)
    .createSignedUrl(coverUrl, 60 * 60 * 6);
  return signed.data?.signedUrl ?? null;
}

export function getMercadoPagoToken(): string | null {
  return process.env["MERCADOPAGO_ACCESS_TOKEN"] ?? null;
}

export async function mpFetch(path: string, init?: RequestInit) {
  const token = getMercadoPagoToken();
  if (!token) throw new Error("MERCADOPAGO_NOT_CONFIGURED");
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`Mercado Pago ${path} failed [${res.status}]: ${body}`);
    throw new Error(`Mercado Pago error [${res.status}]: ${body}`);
  }
  return body ? JSON.parse(body) : {};
}