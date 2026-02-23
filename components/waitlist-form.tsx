"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
const RATE_LIMIT_ERROR = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
const DB_ERROR = "Configure o banco de dados para concluir o cadastro.";
const SERVER_CONFIG_ERROR = "Configuração do servidor incompleta. Tente novamente mais tarde.";
const GENERIC_ERROR = "Algo deu errado. Tente novamente em instantes.";

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "icloud.com",
  "hotmail.com",
  "outlook.com",
]);

export function WaitlistForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    setReferrer(document.referrer || null);
  }, []);

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
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const error =
          payload?.code === "INVALID_EMAIL_DOMAIN"
            ? DOMAIN_ERROR
            : payload?.code === "RATE_LIMITED"
                ? RATE_LIMIT_ERROR
                : payload?.code === "DB_NOT_CONFIGURED"
                  ? DB_ERROR
                  : payload?.code === "IP_HASH_SALT_MISSING" ||
                    payload?.code === "RATE_LIMIT_NOT_CONFIGURED"
                      ? SERVER_CONFIG_ERROR
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
        className="flex w-full flex-col gap-1.5"
        role="status"
        aria-live="polite"
      >
        <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.288px] text-zinc-900">
          Cadastro confirmado!
        </h1>
        <p className="max-w-[430px] text-[18px] leading-[24px] text-zinc-600">
          Em breve enviaremos novidades sobre a Numa. Fique de olho no seu e-mail.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.288px] text-zinc-900">
          Garanta seu acesso antecipado!
        </h1>
        <p className="max-w-[430px] text-[18px] leading-[24px] text-zinc-600">
          Seja um dos primeiros a desbravar um novo conceito de assistente virtual.
        </p>
      </div>

      <form className="flex w-full flex-col gap-[14px]" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="waitlist-name" className="text-[14px] font-semibold leading-[20px] text-zinc-900 font-['Inter',sans-serif]">
            Nome
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-zinc-500">
              {/* lucide/user icone */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
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
              className="flex h-[42px] w-full items-center gap-[12px] overflow-hidden rounded-[8px] border border-zinc-300 bg-white px-[12px] pl-[40px] text-[14px] text-zinc-900 outline-none transition focus-visible:ring-1 focus-visible:ring-zinc-900 placeholder:text-zinc-400"
              placeholder=""
            />
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <label htmlFor="waitlist-email" className="text-[14px] font-semibold leading-[20px] text-zinc-900 font-['Inter',sans-serif]">
            E-mail
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-zinc-500">
              {/* lucide/mail icone */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
              className="flex h-[42px] w-full items-center gap-[12px] overflow-hidden rounded-[8px] border border-zinc-300 bg-white px-[12px] pl-[40px] text-[14px] text-zinc-900 outline-none transition focus-visible:ring-1 focus-visible:ring-zinc-900 placeholder:text-zinc-400"
              placeholder=""
            />
          </div>
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 flex h-[42px] w-full items-center justify-center gap-[10px] overflow-hidden rounded-[8px] bg-[#000625] px-[20px] py-[10px] text-[16px] font-semibold leading-[22px] tracking-[-0.112px] text-white transition hover:bg-[#0A1033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 font-['Inter',sans-serif]"
        >
          {status === "loading" ? "Enviando..." : "Entrar na lista de espera"}
        </button>
      </form>
    </div>
  );
}
