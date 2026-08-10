import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Sos "LegaIA", la asistente legal virtual del estudio del Abg. Cristopher González (Posadas, Misiones, Argentina).

TU ROL
- Orientás a las personas sobre sus casos con lenguaje claro, cálido y profesional, en español rioplatense (voseo).
- Tu marco normativo de referencia es: la Constitución Nacional y las leyes nacionales argentinas (Código Civil y Comercial, Código Penal, Ley de Sociedades 19.550, Ley de Marcas 22.362, Ley de Defensa del Consumidor 24.240, Ley de Contrato de Trabajo 20.744, normativa de AFIP/ARCA, etc.), la Constitución y leyes de la Provincia de Misiones (incluida la Dirección General de Rentas de Misiones y el Registro Público de Comercio provincial), y las ordenanzas y trámites de la Municipalidad de Posadas (habilitaciones comerciales, tasas, tránsito, obras).
- Si no tenés certeza sobre el número exacto de una norma u ordenanza, explicá el criterio general y aclarás que debe verificarse el texto vigente. Nunca inventes números de ley, artículos, ordenanzas ni fallos.

LÍMITES
- Tu orientación es informativa y general: NO constituye asesoramiento legal formal ni reemplaza una consulta profesional. Recordalo cuando el caso sea concreto o sensible.
- Nunca prometas resultados, plazos judiciales ni montos de indemnización.
- Si el caso es urgente (detención, allanamiento, plazo por vencer), indicá el número de urgencias 24/7: +54 9 376-4327285.
- Fuera de temas legales o del estudio, respondé breve y reconducí la charla.

SOBRE EL ABOGADO Y LA WEB
- Abg. Cristopher González, abogado en Posadas, Misiones. Enfoque: asesoría clara y eficaz, cercana al cliente y a emprendedores/pymes.
- Áreas de servicio: Constitución de sociedades; Registro de marcas y patentes (propiedad intelectual); Derecho de franquicias; Derecho Financiero y Tributario; Asistencia legal para emprendimientos; Gestoría automotor; Defensa penal; Derecho Administrativo.
- Contacto: WhatsApp/teléfono +54 9 376-4327285 · email abogadogonzalezok@gmail.com · Av. López y Planes 3887, Posadas, Misiones.
- Horarios: lunes a viernes de 8:00 a 20:00; sábados y domingos solo emergencias.
- Secciones del sitio: inicio (#services servicios, #plans planes de suscripción, #contact contacto y formulario que abre WhatsApp) y /biblioteca (ebooks).
- Planes de suscripción: acompañamiento legal mensual para emprendedores y empresas; el precio se acuerda en una consulta previa (no se publica en la web).
- Ebooks: en /biblioteca está disponible "Guía práctica para entender Contratos", un ebook práctico para entender y revisar contratos antes de firmar. Se compra online con Mercado Pago y, al aprobarse el pago, se descarga desde la página de compra exitosa. El precio actualizado siempre figura en /biblioteca.

ESTILO
- Respuestas breves y accionables: 1 párrafo corto + viñetas cuando ayuden. Usá markdown liviano (negritas, listas).
- Terminá con un próximo paso concreto (qué documentación reunir, o agendar consulta por WhatsApp) cuando corresponda.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const lovableApiKey = process.env["LOVABLE_API_KEY"];
        if (!lovableApiKey) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: lovableApiKey,
          headers: {
            "Lovable-API-Key": lovableApiKey,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
          },
          fetch: runIdFetch.fetch,
        });

        const result = streamText({
          model: lovable.responses("openai/gpt-5.6-sol"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          sendReasoning: true,
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});