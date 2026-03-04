"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PlatformIcon } from "@/components/icons/platform-icons";

type Status = "idle" | "loading" | "success" | "error";
type FlowStep = 1 | 2 | 3 | 4 | "form";
type MessageVolume =
  | "daily_briefing"
  | "smart_drafts"
  | "second_brain"
  | "unified_assistant";
type PainPoint =
  | "no_priority"
  | "forget_reply"
  | "long_conversations"
  | "lack_organization"
  | "all_of_it";
type RoutineChannel =
  | "gmail"
  | "whatsapp"
  | "slack"
  | "teams"
  | "instagram"
  | "linkedin"
  | "outlook";
type WeeklyNotificationHours = "one_to_two" | "two_to_four" | "five_or_more";

type UTM = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};

type StepOption<T extends string> = {
  value: T;
  label: string;
};

type StepQuestion<T extends string> = {
  step: 1 | 2 | 3 | 4;
  title: string;
  question: string;
  options: StepOption<T>[];
};

const EMAIL_ERROR = "Digite um e-mail válido.";
const RATE_LIMIT_ERROR =
  "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
const DB_ERROR = "Configure o banco de dados para concluir o cadastro.";
const SERVER_CONFIG_ERROR =
  "Configuração do servidor incompleta. Tente novamente mais tarde.";
const GENERIC_ERROR = "Algo deu errado. Tente novamente em instantes.";

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;

const MESSAGE_VOLUME_LABELS: Record<MessageVolume, string> = {
  daily_briefing: "🎯 Receber um briefing diário com o que é prioridade",
  smart_drafts: "✍️ Criar rascunhos inteligentes a partir das minhas conversas",
  second_brain: "🧠 Ter um “second brain” que organiza tudo para mim",
  unified_assistant: "🤖 Uma assistente que unifica meus canais de comunicação",
};

const PAIN_POINT_LABELS: Record<PainPoint, string> = {
  no_priority: "🚨 Não saber o que é prioridade",
  forget_reply: "⏰ Esquecer de responder alguém",
  long_conversations: "💬 Conversas muito longas",
  lack_organization: "🗂️ Falta de organização",
  all_of_it: "🤯 Tudo isso",
};

const ROUTINE_CHANNEL_LABELS: Record<RoutineChannel, string> = {
  gmail: "Gmail",
  whatsapp: "WhatsApp",
  slack: "Slack",
  teams: "Teams",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  outlook: "Outlook",
};

const WEEKLY_NOTIFICATION_HOURS_LABELS: Record<
  WeeklyNotificationHours,
  string
> = {
  one_to_two: "1-2 Horas",
  two_to_four: "2-4 Horas",
  five_or_more: "5 Horas ou mais",
};

const STEPS: [
  StepQuestion<MessageVolume>,
  StepQuestion<PainPoint>,
  StepQuestion<RoutineChannel>,
  StepQuestion<WeeklyNotificationHours>,
] = [
  {
    step: 1,
    title: "Antes de começar, me conta uma coisa:",
    question: "O que mais chamou sua atenção na numa?",
    options: [
      {
        value: "daily_briefing",
        label: MESSAGE_VOLUME_LABELS.daily_briefing,
      },
      {
        value: "smart_drafts",
        label: MESSAGE_VOLUME_LABELS.smart_drafts,
      },
      { value: "second_brain", label: MESSAGE_VOLUME_LABELS.second_brain },
      {
        value: "unified_assistant",
        label: MESSAGE_VOLUME_LABELS.unified_assistant,
      },
    ],
  },
  {
    step: 2,
    title: "O que mais te incomoda hoje?",
    question: "Qual dessas situações mais atrapalha sua rotina?",
    options: [
      { value: "no_priority", label: PAIN_POINT_LABELS.no_priority },
      { value: "forget_reply", label: PAIN_POINT_LABELS.forget_reply },
      {
        value: "long_conversations",
        label: PAIN_POINT_LABELS.long_conversations,
      },
      {
        value: "lack_organization",
        label: PAIN_POINT_LABELS.lack_organization,
      },
      { value: "all_of_it", label: PAIN_POINT_LABELS.all_of_it },
    ],
  },
  {
    step: 3,
    title: "Onde sua rotina de trabalho acontece?",
    question: "Escolha um ou mais canais da sua rotina.",
    options: [
      { value: "gmail", label: ROUTINE_CHANNEL_LABELS.gmail },
      { value: "whatsapp", label: ROUTINE_CHANNEL_LABELS.whatsapp },
      { value: "slack", label: ROUTINE_CHANNEL_LABELS.slack },
      { value: "teams", label: ROUTINE_CHANNEL_LABELS.teams },
      { value: "instagram", label: ROUTINE_CHANNEL_LABELS.instagram },
      { value: "linkedin", label: ROUTINE_CHANNEL_LABELS.linkedin },
      { value: "outlook", label: ROUTINE_CHANNEL_LABELS.outlook },
    ],
  },
  {
    step: 4,
    title:
      "Quantas horas semanalmente você acredita que gasta respondendo e lendo notificações do seu trabalho?",
    question: "Selecione uma opção.",
    options: [
      {
        value: "one_to_two",
        label: WEEKLY_NOTIFICATION_HOURS_LABELS.one_to_two,
      },
      {
        value: "two_to_four",
        label: WEEKLY_NOTIFICATION_HOURS_LABELS.two_to_four,
      },
      {
        value: "five_or_more",
        label: WEEKLY_NOTIFICATION_HOURS_LABELS.five_or_more,
      },
    ],
  },
];

const MULTI_SELECT_OPTION_BASE_CLASS =
  "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border px-3 py-2 text-center text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";
const MULTI_SELECT_OPTION_ACTIVE_CLASS =
  "border-zinc-900 bg-zinc-900 text-white";
const MULTI_SELECT_OPTION_INACTIVE_CLASS =
  "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-900 hover:bg-zinc-50";
const SINGLE_SELECT_OPTION_CLASS =
  "flex min-h-[56px] w-full items-center rounded-[10px] border border-zinc-300 bg-white px-4 py-3 text-left text-[15px] font-semibold text-zinc-900 transition hover:border-zinc-900 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type SubmitValidationResult =
  | { success: true; trimmedName: string; normalizedEmail: string }
  | { success: false; error: string };

type WaitlistInputFieldProps = {
  id: string;
  name: string;
  label: string;
  type: "text" | "email";
  autoComplete: string;
  maxLength: number;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  icon: ReactNode;
};

function isMessageVolume(value: string): value is MessageVolume {
  return value in MESSAGE_VOLUME_LABELS;
}

function isPainPoint(value: string): value is PainPoint {
  return value in PAIN_POINT_LABELS;
}

function isRoutineChannel(value: string): value is RoutineChannel {
  return value in ROUTINE_CHANNEL_LABELS;
}

function isWeeklyNotificationHours(
  value: string,
): value is WeeklyNotificationHours {
  return value in WEEKLY_NOTIFICATION_HOURS_LABELS;
}

function getOptionButtonClass(isStepThree: boolean, isSelected: boolean) {
  if (!isStepThree) {
    return SINGLE_SELECT_OPTION_CLASS;
  }

  if (isSelected) {
    return `${MULTI_SELECT_OPTION_BASE_CLASS} ${MULTI_SELECT_OPTION_ACTIVE_CLASS}`;
  }

  return `${MULTI_SELECT_OPTION_BASE_CLASS} ${MULTI_SELECT_OPTION_INACTIVE_CLASS}`;
}

function validateSubmitFields(
  name: string,
  email: string,
): SubmitValidationResult {
  const trimmedName = name.trim();
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return {
      success: false,
      error: `O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`,
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return { success: false, error: EMAIL_ERROR };
  }

  return {
    success: true,
    trimmedName,
    normalizedEmail,
  };
}

function getOnboardingPayload(
  messageVolume: MessageVolume | null,
  painPoint: PainPoint | null,
  routineChannels: RoutineChannel[],
  weeklyNotificationHours: WeeklyNotificationHours | null,
) {
  const messageVolumeLabel = messageVolume
    ? MESSAGE_VOLUME_LABELS[messageVolume]
    : undefined;
  const painPointLabel = painPoint ? PAIN_POINT_LABELS[painPoint] : undefined;
  const routineChannel = routineChannels.length
    ? routineChannels
        .map((channel) => ROUTINE_CHANNEL_LABELS[channel])
        .join(", ")
    : undefined;
  const weeklyHoursLabel = weeklyNotificationHours
    ? WEEKLY_NOTIFICATION_HOURS_LABELS[weeklyNotificationHours]
    : undefined;

  return {
    messageVolume: messageVolumeLabel,
    painPoint: painPointLabel,
    routineChannel,
    weeklyNotificationHours: weeklyHoursLabel,
  };
}

function getSubmitErrorMessage(payload: unknown) {
  let code: string | undefined;
  let error: string | undefined;

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    if ("code" in payload && typeof payload.code === "string") {
      code = payload.code;
    }
    if ("error" in payload && typeof payload.error === "string") {
      error = payload.error;
    }
  }

  if (code === "RATE_LIMITED") {
    return RATE_LIMIT_ERROR;
  }
  if (code === "DB_NOT_CONFIGURED") {
    return DB_ERROR;
  }
  if (code === "IP_HASH_SALT_MISSING" || code === "RATE_LIMIT_NOT_CONFIGURED") {
    return SERVER_CONFIG_ERROR;
  }
  if (error === "Invalid email" || code === "INVALID_EMAIL") {
    return EMAIL_ERROR;
  }

  return GENERIC_ERROR;
}

function WaitlistInputField({
  id,
  name,
  label,
  type,
  autoComplete,
  maxLength,
  value,
  onValueChange,
  required,
  icon,
}: WaitlistInputFieldProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label
        htmlFor={id}
        className="font-['Inter',sans-serif] text-[14px] font-semibold leading-[20px] text-zinc-900"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-zinc-500">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className="flex h-[42px] w-full items-center gap-[12px] overflow-hidden rounded-[8px] border border-zinc-300 bg-white px-[12px] pl-[40px] text-[14px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-900"
          placeholder=""
        />
      </div>
    </div>
  );
}

export function WaitlistForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [flowStep, setFlowStep] = useState<FlowStep>(1);
  const [messageVolume, setMessageVolume] = useState<MessageVolume | null>(
    null,
  );
  const [painPoint, setPainPoint] = useState<PainPoint | null>(null);
  const [routineChannels, setRoutineChannels] = useState<RoutineChannel[]>([]);
  const [weeklyNotificationHours, setWeeklyNotificationHours] =
    useState<WeeklyNotificationHours | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referrer] = useState<string | null>(() =>
    typeof document !== "undefined" ? document.referrer || null : null,
  );
  const [website, setWebsite] = useState("");

  const utm = useMemo<UTM>(() => {
    return {
      source: searchParams.get("utm_source") ?? undefined,
      medium: searchParams.get("utm_medium") ?? undefined,
      campaign: searchParams.get("utm_campaign") ?? undefined,
      term: searchParams.get("utm_term") ?? undefined,
      content: searchParams.get("utm_content") ?? undefined,
    };
  }, [searchParams]);

  const currentStep = typeof flowStep === "number" ? flowStep : null;
  const activeQuestion = currentStep ? STEPS[currentStep - 1] : null;

  const handleBack = () => {
    if (status === "success") {
      router.back();
      return;
    }

    if (flowStep === 1) {
      router.back();
      return;
    }

    if (flowStep === "form") {
      setFlowStep(4);
      return;
    }

    if (flowStep === 2) {
      setFlowStep(1);
      return;
    }

    if (flowStep === 3) {
      setFlowStep(2);
      return;
    }

    if (flowStep === 4) {
      setFlowStep(3);
    }
  };

  const handleStepSelect = (value: string) => {
    if (flowStep === 1 && isMessageVolume(value)) {
      setMessageVolume(value);
      setFlowStep(2);
      return;
    }

    if (flowStep === 2 && isPainPoint(value)) {
      setPainPoint(value);
      setFlowStep(3);
      return;
    }

    if (flowStep === 3 && isRoutineChannel(value)) {
      const channel = value;
      setRoutineChannels((prev) =>
        prev.includes(channel)
          ? prev.filter((item) => item !== channel)
          : [...prev, channel],
      );
      return;
    }

    if (flowStep === 4 && isWeeklyNotificationHours(value)) {
      setWeeklyNotificationHours(value);
      setFlowStep("form");
    }
  };

  const handleStepThreeContinue = () => {
    if (routineChannels.length === 0) {
      return;
    }

    setFlowStep(4);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const validation = validateSubmitFields(name, email);
    if (!validation.success) {
      setErrorMessage(validation.error);
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validation.trimmedName || null,
          email: validation.normalizedEmail,
          utm,
          referrer,
          website,
          onboarding: getOnboardingPayload(
            messageVolume,
            painPoint,
            routineChannels,
            weeklyNotificationHours,
          ),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setErrorMessage(getSubmitErrorMessage(payload));
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
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="-mt-6 mb-8 inline-flex h-10 w-10 items-center justify-center self-start rounded-full border border-zinc-200 bg-white text-black transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
        <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.288px] text-zinc-900">
          Cadastro confirmado!
        </h1>
        <p className="max-w-[430px] text-[18px] leading-[24px] text-zinc-600">
          Em breve enviaremos novidades sobre a Numa. Fique de olho no seu
          e-mail.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="-mt-6 mb-8 inline-flex h-10 w-10 items-center justify-center self-start rounded-full border border-zinc-200 bg-white text-black transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>

        {currentStep && activeQuestion && (
          <>
            <div className="mb-3 flex items-center justify-between text-[13px] font-semibold text-zinc-500">
              <span>Passo {currentStep} de 4</span>
            </div>
            <div className="mb-7 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-[#000625] transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.288px] text-zinc-900">
              {activeQuestion.title}
            </h1>
            <p className="max-w-[430px] text-[18px] leading-[24px] text-zinc-600">
              {activeQuestion.question}
            </p>
          </>
        )}

        {flowStep === "form" && (
          <>
            <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.288px] text-zinc-900">
              Último passo!
            </h1>
            <p className="max-w-[430px] text-[18px] leading-[24px] text-zinc-600">
              Garanta seu acesso antecipado preenchendo nome e e-mail.
            </p>
          </>
        )}
      </div>

      {currentStep && activeQuestion && (
        <div className="flex w-full flex-col gap-3">
          {activeQuestion.options.map((option) => {
            const isStepThree = flowStep === 3;
            const routineValue = isRoutineChannel(option.value)
              ? option.value
              : null;
            const isStepThreeRoutineOption =
              isStepThree && routineValue !== null;
            const isSelected = isStepThreeRoutineOption
              ? routineChannels.includes(routineValue)
              : false;
            const ariaPressed = isStepThree ? isSelected : undefined;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStepSelect(option.value)}
                aria-pressed={ariaPressed}
                className={getOptionButtonClass(isStepThree, isSelected)}
              >
                {isStepThreeRoutineOption ? (
                  <>
                    <PlatformIcon
                      platform={routineValue}
                      className="h-4 w-4 shrink-0"
                    />
                    <span>{option.label}</span>
                  </>
                ) : (
                  option.label
                )}
              </button>
            );
          })}
        </div>
      )}

      {flowStep === 3 && (
        <button
          type="button"
          onClick={handleStepThreeContinue}
          disabled={routineChannels.length === 0}
          className="mt-4 flex h-[42px] w-full items-center justify-center rounded-[8px] bg-[#000625] px-[20px] py-[10px] font-['Inter',sans-serif] text-[16px] font-semibold leading-[22px] tracking-[-0.112px] text-white transition hover:bg-[#0A1033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continuar
        </button>
      )}

      {flowStep === "form" && (
        <form
          className="flex w-full flex-col gap-[14px]"
          onSubmit={handleSubmit}
        >
          <div className="hidden" aria-hidden="true">
            <label htmlFor="waitlist-website">Website</label>
            <input
              id="waitlist-website"
              name="website"
              type="text"
              autoComplete="off"
              tabIndex={-1}
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <WaitlistInputField
            id="waitlist-name"
            name="name"
            label="Nome"
            type="text"
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onValueChange={setName}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />

          <WaitlistInputField
            id="waitlist-email"
            name="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            maxLength={MAX_EMAIL_LENGTH}
            value={email}
            onValueChange={setEmail}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
          />

          {status === "error" && (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 flex h-[42px] w-full items-center justify-center gap-[10px] overflow-hidden rounded-[8px] bg-[#000625] px-[20px] py-[10px] font-['Inter',sans-serif] text-[16px] font-semibold leading-[22px] tracking-[-0.112px] text-white transition hover:bg-[#0A1033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Enviando..." : "Entrar na lista de espera"}
          </button>
        </form>
      )}
    </div>
  );
}
