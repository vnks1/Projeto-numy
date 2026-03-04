// SVG-based iPhone 16 Pro style phone mockup with chat UI inside
export function PhoneMockup() {
    return (
        <div className="relative w-[300px] sm:w-[340px] select-none">
            {/* Floating notification: top right */}
            <div className="absolute -top-4 -right-8 z-20 bg-white rounded-2xl shadow-lg px-4 py-2 flex items-center gap-2 whitespace-nowrap text-xs font-medium text-[#111827] border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-[#818CF8]" />
                Resumindo últimas mensagens...
            </div>

            {/* Floating notification: bottom left */}
            <div className="absolute -bottom-6 -left-10 z-20 bg-white rounded-2xl shadow-lg px-3 py-2 w-[200px] border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
                    <div>
                        <p className="text-[10px] font-semibold text-[#111827]">David Marson</p>
                        <p className="text-[9px] text-[#6B7280]">Ainda como discutir</p>
                    </div>
                </div>
                <p className="text-[9px] text-[#4B5563] leading-tight">Quer ajuda para responder alguém?</p>
                <div className="flex gap-2 mt-1">
                    <button className="text-[9px] text-[#4B5563] border border-gray-200 rounded-full px-2 py-0.5">Sim por IA</button>
                    <button className="text-[9px] text-[#4B5563] border border-gray-200 rounded-full px-2 py-0.5">De seu jeito</button>
                </div>
                <p className="text-[10px] font-medium text-[#111827] mt-1.5 flex items-center gap-1">
                    <span className="text-blue-500">◉</span> Respondendo Davi Marson
                </p>
            </div>

            {/* Phone shell */}
            <div className="relative bg-[#1a1a1a] rounded-[44px] p-2 shadow-2xl ring-1 ring-black/20">
                {/* Inner screen */}
                <div className="bg-[#F0F2F8] rounded-[36px] overflow-hidden relative" style={{ height: "600px" }}>
                    {/* Status bar */}
                    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 pt-3 pb-1">
                        <span className="text-[11px] font-semibold text-[#111827]">9:41</span>
                        <div className="flex items-center gap-1.5">
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="#111827"><rect x="0" y="3" width="3" height="7" rx="0.5" /><rect x="4.5" y="2" width="3" height="8" rx="0.5" /><rect x="9" y="0.5" width="3" height="9.5" rx="0.5" /><rect x="13.5" y="0" width="2.5" height="10" rx="0.5" /></svg>
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="#111827"><path d="M7 2C9.5 2 11.7 3.1 13 4.8L14 3.7C12.4 1.8 9.8 0.5 7 0.5C4.2 0.5 1.6 1.8 0 3.7L1 4.8C2.3 3.1 4.5 2 7 2Z" /><path d="M7 5C8.7 5 10.2 5.7 11.3 6.8L12.3 5.7C10.9 4.4 9 3.5 7 3.5C5 3.5 3.1 4.4 1.7 5.7L2.7 6.8C3.8 5.7 5.3 5 7 5Z" /><circle cx="7" cy="9" r="1.5" /></svg>
                        </div>
                    </div>

                    {/* Dynamic Island */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black rounded-full w-28 h-8" />

                    {/* Gradient spheres background */}
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        <div className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 blur-3xl opacity-70 top-16 left-4" />
                        <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 to-cyan-200 blur-2xl opacity-60 top-32 right-8" />
                        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 blur-2xl opacity-50 bottom-40 left-16" />
                    </div>

                    {/* Header bar */}
                    <div className="absolute top-12 left-0 right-0 flex items-center justify-between px-5 py-2 z-10">
                        <svg width="18" height="12" viewBox="0 0 18 12" fill="#111827"><rect y="0" width="18" height="2" rx="1" /><rect y="5" width="18" height="2" rx="1" /><rect y="10" width="12" height="2" rx="1" /></svg>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
                    </div>

                    {/* Chat content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-10 gap-2">
                        <h2 className="text-2xl font-bold text-[#111827] text-center leading-tight">
                            Olá Ítalo, como posso te ajudar hoje?
                        </h2>
                    </div>

                    {/* Input bar */}
                    <div className="absolute bottom-6 left-4 right-4 z-10">
                        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-3 flex items-center gap-2 border border-gray-200">
                            <span className="text-[#6B7280] text-xs flex-1">Mandar mensagem para alguém...</span>
                            <div className="w-1 h-1 rounded-full bg-[#6B7280]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
