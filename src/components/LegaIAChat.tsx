import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, RotateCcw, AlertTriangle, Phone } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import legaiaLogo from "@/assets/legaia-icon.png.asset.json";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

const STORAGE_KEY = "legaia.conversation.v1";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=5493764327285&type=phone_number&app_absent=0&text=" +
  encodeURIComponent("Hola! Estuve consultando con LegaIA y quiero hablar con el Abg. González.");

const SUGGESTIONS = [
  "¿Cómo registro mi marca en Argentina?",
  "Quiero constituir una SAS en Misiones",
  "¿Qué necesito para habilitar un local en Posadas?",
  "Contame sobre el ebook de contratos",
];

function loadStoredMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const LegaIAChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [initialMessages] = useState<UIMessage[]>(() => loadStoredMessages());
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "legaia",
    messages: initialMessages,
    transport,
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status === "streaming") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [messages, status]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  useEffect(() => {
    if (open) focusInput();
  }, [open, focusInput, status]);

  const send = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value || isBusy) return;
      setInput("");
      void sendMessage({ text: value });
      focusInput();
    },
    [isBusy, sendMessage, focusInput],
  );

  const reset = useCallback(() => {
    setMessages([]);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    focusInput();
  }, [setMessages, focusInput]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Cerrar chat con LegaIA" : "Abrir chat con LegaIA"}
        className={`fixed bottom-28 right-6 z-50 items-center gap-3 rounded-full bg-primary px-5 py-4 text-primary-foreground shadow-[0_18px_45px_-12px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-12px_rgba(0,0,0,0.6)] ${open ? "hidden sm:flex" : "flex"}`}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden font-body text-sm font-medium tracking-wide sm:inline">
          {open ? "Cerrar" : "Consultar con LegaIA"}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden border-border bg-background shadow-[0_35px_90px_-30px_rgba(0,0,0,0.6)] sm:inset-auto sm:bottom-44 sm:right-6 sm:h-[min(78vh,680px)] sm:w-[min(440px,calc(100vw-3rem))] sm:rounded-2xl sm:border">
          <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground">
              <img
                src={legaiaLogo.url}
                alt="LegaIA"
                width={512}
                height={512}
                loading="lazy"
                className="h-5 w-5 object-contain"
              />
            </span>
            <div className="min-w-0">
              <p className="font-display text-base leading-tight">LegaIA</p>
              <p className="truncate font-body text-[11px] text-primary-foreground/70">
                Asistente legal · Abg. Cristopher González
              </p>
            </div>
            <div className="flex shrink-0 items-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hablar por WhatsApp con el Abg. González"
              className="rounded-full p-2 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => setShowWarning((value) => !value)}
              aria-label="Advertencia de uso"
              aria-expanded={showWarning}
              className="rounded-full p-2 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                aria-label="Reiniciar conversación"
                className="rounded-full p-2 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="rounded-full p-2 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            </div>
          </header>

          {showWarning && (
            <div className="border-b border-border bg-secondary px-5 py-4">
              <p className="font-body text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Advertencia de uso:</span> LegaIA brinda
                orientación informativa general y <strong>no reemplaza la consulta profesional</strong>.
                Puede cometer errores o dar información incompleta, por lo que sus respuestas deben ser
                verificadas con el Abg. Cristopher González antes de tomar cualquier decisión legal.
                Consultá las{" "}
                <a href="/terminos-y-condiciones.html" className="underline hover:no-underline">
                  condiciones de uso
                </a>
                .
              </p>
            </div>
          )}

          <Conversation className="min-h-0 flex-1 bg-secondary/40">
            <ConversationContent className="gap-4 p-4 pb-2">
              {messages.length === 0 ? (
                <div className="space-y-4 py-4">
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    Hola, soy <span className="font-medium text-foreground">LegaIA</span>. Te oriento
                    sobre tu caso según la normativa nacional, las leyes de Misiones y las ordenanzas
                    de Posadas, y te cuento todo sobre el estudio, los servicios y los ebooks.
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => send(suggestion)}
                        className="rounded-lg border border-border bg-background px-4 py-3 text-left font-body text-sm text-foreground transition-colors hover:border-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    Orientación informativa, no reemplaza una consulta profesional.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const text = message.parts
                    .map((part) => (part.type === "text" ? part.text : ""))
                    .join("");
                  if (!text) return null;
                  return (
                    <Message key={message.id} from={message.role}>
                      {message.role === "user" ? (
                        <MessageContent className="bg-primary text-primary-foreground">
                          <p className="font-body text-sm leading-relaxed">{text}</p>
                        </MessageContent>
                      ) : (
                        <MessageContent className="bg-transparent p-0 text-foreground">
                          <MessageResponse className="font-body text-sm leading-relaxed">
                            {text}
                          </MessageResponse>
                        </MessageContent>
                      )}
                    </Message>
                  );
                })
              )}
              {status === "submitted" && (
                <Shimmer className="font-body text-sm">Analizando tu consulta...</Shimmer>
              )}
              {error && (
                <p className="font-body text-sm text-destructive">
                  No pude responder en este momento. Probá de nuevo o escribinos por WhatsApp al +54
                  9 376-4327285.
                </p>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="shrink-0 border-t border-border bg-background px-3 pb-3 pt-2">
            <PromptInput
              onSubmit={(_message, event) => {
                event.preventDefault();
                send(input);
              }}
            >
              <PromptInputTextarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribí tu consulta legal..."
                rows={1}
                className="max-h-28 min-h-10 text-sm"
                autoFocus
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  status={status}
                  disabled={!input.trim() && !isBusy}
                  size="icon-sm"
                />
              </PromptInputFooter>
            </PromptInput>
            <div className="mt-2 flex items-center justify-between gap-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-1.5 font-body text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
              >
                <Phone className="h-3 w-3 shrink-0" />
                <span className="truncate">Hablar con el Abg. González</span>
              </a>
              <button
                type="button"
                onClick={() => setShowWarning((value) => !value)}
                className="flex shrink-0 items-center gap-1.5 font-body text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <AlertTriangle className="h-3 w-3" /> Advertencia de uso
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LegaIAChat;