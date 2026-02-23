"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "success" | "error";

type UTM = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};

const EMAIL_ERROR = "Digite um e-mail válido.";
const DOMAIN_ERROR = "Esse tipo de E-mail não é permitido";
const TURNSTILE_ERROR = "Confirme o captcha para continuar.";
const RATE_LIMIT_ERROR = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
const DB_ERROR = "Configure o banco de dados para concluir o cadastro.";
const CONFIG_ERROR = "Configuração incompleta. Tente novamente mais tarde.";
const GENERIC_ERROR = "Algo deu errado. Tente novamente em instantes.";

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "icloud.com",
  "hotmail.com",
  "outlook.com",
]);

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset?: (widgetId: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

export function WaitlistForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referrer, setReferrer] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => {
    setReferrer(document.referrer || null);
  }, []);

  useEffect(() => {
    if (!siteKey || !widgetRef.current) {
      return;
    }

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !widgetRef.current || !window.turnstile) {
        return;
      }

      if (widgetIdRef.current) {
        window.turnstile.reset?.(widgetIdRef.current);
        return;
      }

      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        callback: (token) => {
          setTurnstileToken(token);
        },
        "error-callback": () => {
          setTurnstileToken("");
          setErrorMessage(TURNSTILE_ERROR);
          setStatus("error");
        },
        "expired-callback": () => {
          setTurnstileToken("");
        },
      });
    };

    if (window.turnstile) {
      renderWidget();
      return () => {
        isMounted = false;
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-turnstile]"
    );

    if (existingScript) {
      existingScript.addEventListener("load", renderWidget, { once: true });
      return () => {
        isMounted = false;
        existingScript.removeEventListener("load", renderWidget);
      };
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.setAttribute("data-turnstile", "true");
    script.addEventListener("load", renderWidget, { once: true });
    document.body.appendChild(script);

    return () => {
      isMounted = false;
      script.removeEventListener("load", renderWidget);
      if (widgetIdRef.current) {
        window.turnstile?.remove?.(widgetIdRef.current);
      }
    };
  }, [siteKey]);

  const utm = useMemo<UTM>(() => {
    return {
      source: searchParams.get("utm_source") ?? undefined,
      medium: searchParams.get("utm_medium") ?? undefined,
      campaign: searchParams.get("utm_campaign") ?? undefined,
      term: searchParams.get("utm_term") ?? undefined,
      content: searchParams.get("utm_content") ?? undefined,
    };
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedName = name.trim();
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setErrorMessage(`O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`);
      setStatus("error");
      return;
    }

    const emailValue = email.trim().toLowerCase();
    if (emailValue.length > MAX_EMAIL_LENGTH) {
      setErrorMessage(EMAIL_ERROR);
      setStatus("error");
      return;
    }

    const emailDomain = emailValue.split("@")[1];
    if (!emailDomain || !ALLOWED_EMAIL_DOMAINS.has(emailDomain)) {
      setErrorMessage(DOMAIN_ERROR);
      setStatus("error");
      return;
    }

    if (!siteKey) {
      setErrorMessage(CONFIG_ERROR);
      setStatus("error");
      return;
    }

    if (!turnstileToken) {
      setErrorMessage(TURNSTILE_ERROR);
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName || null,
          email: emailValue,
          utm,
          referrer,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const error =
          payload?.code === "INVALID_EMAIL_DOMAIN"
            ? DOMAIN_ERROR
            : payload?.code === "BOT_VERIFICATION_FAILED"
              ? TURNSTILE_ERROR
              : payload?.code === "RATE_LIMITED"
                ? RATE_LIMIT_ERROR
                : payload?.code === "DB_NOT_CONFIGURED"
                  ? DB_ERROR
                  : payload?.code === "IP_HASH_SALT_MISSING" ||
                      payload?.code === "TURNSTILE_SECRET_MISSING" ||
                      payload?.code === "RATE_LIMIT_NOT_CONFIGURED"
                    ? CONFIG_ERROR
                    : payload?.error === "Invalid email" || payload?.code === "INVALID_EMAIL"
                      ? EMAIL_ERROR
                      : GENERIC_ERROR;
        setErrorMessage(error);
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage(GENERIC_ERROR);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className="mt-8 w-full max-w-[420px] rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <h3 className="text-lg font-semibold text-[#111827]">Cadastro confirmado!</h3>
        <p className="mt-2 text-sm text-[#6B7280]">
          Em breve enviaremos novidades sobre a Numa. Fique de olho no seu e-mail.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-8 flex w-full max-w-[420px] flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="waitlist-name" className="text-sm font-medium text-[#111827]">
          Nome
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-3.314 0-6 2.239-6 5v1h12v-1c0-2.761-2.686-5-6-5Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            id="waitlist-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-[#111827] shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#111827]/20"
            placeholder="Seu nome"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="waitlist-email" className="text-sm font-medium text-[#111827]">
          E-mail
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2v.511l8 4.8 8-4.8V8H4Zm16 8v-5.089l-7.438 4.463a1 1 0 0 1-1.124 0L4 10.911V16h16Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={MAX_EMAIL_LENGTH}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-[#111827] shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#111827]/20"
            placeholder="seuemail@exemplo.com"
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      <div
        ref={widgetRef}
        className="mt-1"
        aria-hidden={!siteKey}
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-[#0B0F1A] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Enviando..." : "Entrar na lista de espera"}
      </button>
    </form>
  );
}
