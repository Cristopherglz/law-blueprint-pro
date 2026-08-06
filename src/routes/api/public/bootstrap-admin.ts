import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["ADMIN_BOOTSTRAP_TOKEN"];
        if (!token || request.headers.get("x-bootstrap-token") !== token) {
          return new Response("Unauthorized", { status: 401 });
        }
        const body = (await request.json()) as { email?: string; password?: string };
        if (!body.email || !body.password) {
          return new Response("Missing email or password", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: existingAdmins } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("role", "admin")
          .limit(1);
        if (existingAdmins && existingAdmins.length > 0) {
          return Response.json({ status: "already_exists" });
        }

        const created = await supabaseAdmin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,
        });
        if (created.error || !created.data.user) {
          return Response.json({ status: "error", message: created.error?.message }, { status: 400 });
        }

        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: created.data.user.id, role: "admin" });
        if (roleError) {
          return Response.json({ status: "error", message: roleError.message }, { status: 400 });
        }

        return Response.json({ status: "created", userId: created.data.user.id });
      },
    },
  },
});