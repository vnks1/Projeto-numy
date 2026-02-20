"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
    {
        id: "faq-1",
        question: "Como a Numa funciona com o WhatsApp?",
        answer: (
            <ul className="list-disc list-inside space-y-1 text-[#4B5563] text-sm">
                <li>Resumir conversas longas automaticamente</li>
                <li>Mostrar as mensagens mais importantes primeiro</li>
                <li>Identificar ações que precisam da sua atenção</li>
                <li>Organizar grupos e contatos por prioridade</li>
            </ul>
        ),
    },
    {
        id: "faq-2",
        question: "A Numa envia mensagens por mim?",
        answer: (
            <p className="text-[#4B5563] text-sm leading-relaxed">
                Não sem sua permissão. A Numa pode sugerir respostas e rascunhos, mas você sempre revisa e decide o que enviar. Você mantém total controle sobre sua comunicação.
            </p>
        ),
    },
    {
        id: "faq-3",
        question: "Minhas conversas são privadas?",
        answer: (
            <p className="text-[#4B5563] text-sm leading-relaxed">
                Sim. A Numa processa suas mensagens de forma segura e não armazena o conteúdo das suas conversas além do necessário para o funcionamento. Sua privacidade é nossa prioridade.
            </p>
        ),
    },
    {
        id: "faq-4",
        question: "A Numa lê todas as minhas mensagens?",
        answer: (
            <p className="text-[#4B5563] text-sm leading-relaxed">
                A Numa acessa apenas as conversas que você autorizar. Você pode escolher quais chats deseja que ela organize e monitore, mantendo total controle sobre o acesso.
            </p>
        ),
    },
];

export function FAQ() {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (id: string) => setOpenId(openId === id ? null : id);

    return (
        <section id="faq" className="relative z-10 bg-[#FFFFFF] py-20 lg:py-24">
            <div className="max-w-3xl mx-auto px-6">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-medium text-[#111827] tracking-[-0.02em]">
                        Perguntas frequentes
                    </h2>
                    <p className="text-[#4B5563] mt-4 text-base">
                        Tudo o que você precisa saber sobre a Numa.
                    </p>
                </div>

                {/* Accordion */}
                <div
                    className="flex flex-col gap-3"
                    role="list"
                    aria-label="Perguntas frequentes"
                >
                    {FAQ_ITEMS.map((item) => {
                        const isOpen = openId === item.id;
                        return (
                            <div
                                key={item.id}
                                role="listitem"
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <button
                                    id={`trigger-${item.id}`}
                                    aria-expanded={isOpen}
                                    aria-controls={`content-${item.id}`}
                                    onClick={() => toggle(item.id)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50/50 transition-colors"
                                >
                                    <span className="font-medium text-[#111827] text-sm sm:text-base">
                                        {item.question}
                                    </span>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className={cn(
                                            "flex-shrink-0 text-[#6B7280] transition-transform duration-200",
                                            isOpen && "rotate-180"
                                        )}
                                    >
                                        <path
                                            d="M4 6l4 4 4-4"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                <div
                                    id={`content-${item.id}`}
                                    role="region"
                                    aria-labelledby={`trigger-${item.id}`}
                                    className={cn(
                                        "overflow-hidden transition-all duration-200",
                                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    )}
                                >
                                    <div className="px-6 pb-5">{item.answer}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
