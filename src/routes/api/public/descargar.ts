import { createFileRoute } from "@tanstack/react-router";

/**
 * Descarga del ebook comprado. Valida el token privado de la orden mediante una
 * función SECURITY DEFINER de Postgres (sólo devuelve el archivo si el pago está
 * acreditado) y lo entrega como archivo. No usa la clave de servicio.
 */
export const Route = createFileRoute("/api/public/descargar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token");
        if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
          return new Response("Solicitud inválida", { status: 400 });
        }

        const { getPublicClient } = await import("@/lib/ebooks.server");
        const { data, error } = await getPublicClient().rpc("download_purchase", { _token: token });
        if (error) {
          console.error("descargar: error al validar la compra", error);
          return new Response("No pudimos preparar la descarga", { status: 500 });
        }

        const file = data?.[0];
        if (!file) return new Response("Compra no encontrada o pago pendiente", { status: 404 });

        const bytes = Uint8Array.from(atob(file.content_base64), (c) => c.charCodeAt(0));
        return new Response(bytes, {
          headers: {
            "Content-Type": file.mime_type || "application/pdf",
            "Content-Disposition": `attachment; filename="${file.filename.replace(/[^\w.\- ]/g, "_")}"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});