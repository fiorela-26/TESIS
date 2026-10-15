"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/LoginForm";

const VERDE_LIMA = "#65A30D";
const VERDE_LIMA_CLARO = "#84CC16";
const CARBON_VERDE = "#0A1410";
const PANEL_VERDE = "#0F1A14";
const ROJO = "#D94343";

const MARCOS = [
    { w: 140, h: 180, etiqueta: "CASCO 0.92", color: VERDE_LIMA_CLARO, delay: 0, anim: "ss-marco-1" },
    { w: 120, h: 120, etiqueta: "SIN CHALECO 0.81", color: ROJO, delay: 3, anim: "ss-marco-2" },
    { w: 130, h: 150, etiqueta: "CHALECO 0.88", color: VERDE_LIMA_CLARO, delay: 6, anim: "ss-marco-3" },
    { w: 110, h: 130, etiqueta: "CASCO 0.90", color: VERDE_LIMA_CLARO, delay: 9, anim: "ss-marco-4" },
];

function Esquinas({ color }: { color: string }) {
    const largo = 18;
    const trazo = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "square" as const };
    return (
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <path d={`M0 ${largo} V0 H${largo}`} {...trazo} />
            <g>
                <line x1="100%" y1="0" x2="100%" y2={largo} {...trazo} />
                <line x1={`calc(100% - ${largo}px)`} y1="0" x2="100%" y2="0" {...trazo} />
                <line x1="0" y1="100%" x2="0" y2={`calc(100% - ${largo}px)`} {...trazo} />
                <line x1="0" y1="100%" x2={largo} y2="100%" {...trazo} />
                <line x1="100%" y1="100%" x2="100%" y2={`calc(100% - ${largo}px)`} {...trazo} />
                <line x1={`calc(100% - ${largo}px)`} y1="100%" x2="100%" y2="100%" {...trazo} />
            </g>
        </svg>
    );
}

function Logo() {
    return (
        <span className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="relative inline-block h-6 w-6">
                <span className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
                <span className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
                <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2" style={{ borderColor: VERDE_LIMA }} />
                <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2" style={{ borderColor: VERDE_LIMA }} />
            </span>
            SystemSafety <span style={{ color: VERDE_LIMA }}>AI</span>
        </span>
    );
}

function FondoAnimado() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <style>{`
        @keyframes ss-etiqueta { 0%,4% { opacity: 0 } 8%,26% { opacity: 1 } 32%,100% { opacity: 0 } }
        @keyframes ss-pulso-borde {
          0%, 100% { box-shadow: 0 0 0 0 rgba(101,163,13,0); }
          50%      { box-shadow: 0 0 0 6px rgba(101,163,13,0.15); }
        }
        @keyframes ss-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ss-fade-1 { animation: ss-fade-up 0.7s ease-out both; }
        .ss-fade-2 { animation: ss-fade-up 0.7s ease-out 0.12s both; }
        .ss-fade-3 { animation: ss-fade-up 0.7s ease-out 0.24s both; }
        .ss-fade-4 { animation: ss-fade-up 0.7s ease-out 0.36s both; }

        @keyframes ss-marco-1 {
          0%   { left: 52%; top: 12%; opacity: 0; }
          15%  { opacity: 1; }
          50%  { left: 68%; top: 32%; opacity: 1; }
          85%  { opacity: 1; }
          100% { left: 52%; top: 12%; opacity: 0; }
        }
        .ss-marco-1 { animation: ss-marco-1 18s ease-in-out infinite; }

        @keyframes ss-marco-2 {
          0%   { left: 78%; top: 12%; opacity: 0; }
          15%  { opacity: 1; }
          50%  { left: 60%; top: 42%; opacity: 1; }
          85%  { opacity: 1; }
          100% { left: 78%; top: 12%; opacity: 0; }
        }
        .ss-marco-2 { animation: ss-marco-2 22s ease-in-out infinite; }

        @keyframes ss-marco-3 {
          0%   { left: 55%; top: 60%; opacity: 0; }
          15%  { opacity: 1; }
          50%  { left: 72%; top: 40%; opacity: 1; }
          85%  { opacity: 1; }
          100% { left: 55%; top: 60%; opacity: 0; }
        }
        .ss-marco-3 { animation: ss-marco-3 20s ease-in-out infinite; }

        @keyframes ss-marco-4 {
          0%   { left: 80%; top: 65%; opacity: 0; }
          15%  { opacity: 1; }
          50%  { left: 62%; top: 72%; opacity: 1; }
          85%  { opacity: 1; }
          100% { left: 80%; top: 65%; opacity: 0; }
        }
        .ss-marco-4 { animation: ss-marco-4 24s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ss-anim, .ss-fade-1, .ss-fade-2, .ss-fade-3, .ss-fade-4,
          .ss-marco-1, .ss-marco-2, .ss-marco-3, .ss-marco-4 { animation: none !important }
          .ss-etiqueta { animation: none !important; opacity: 1 !important }
          .hero-video-bg { display: none }
        }
      `}</style>

            <video
                className="hero-video-bg absolute inset-0 h-full w-full object-cover"
                autoPlay muted loop playsInline preload="auto"
            >
                <source src="/videos/video2.mp4" type="video/mp4" />
            </video>

            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(95deg, rgba(10,20,16,0.94) 0%, rgba(10,20,16,0.82) 35%, rgba(10,20,16,0.55) 70%, rgba(10,20,16,0.35) 100%)",
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(10,20,16,0.5) 0%, transparent 30%, transparent 70%, rgba(10,20,16,0.7) 100%)",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
            linear-gradient(rgba(101,163,13,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(101,163,13,0.08) 1px, transparent 1px)
          `,
                    backgroundSize: "56px 56px",
                    maskImage: "radial-gradient(ellipse at 70% 50%, black 30%, transparent 85%)",
                    WebkitMaskImage: "radial-gradient(ellipse at 70% 50%, black 30%, transparent 85%)",
                }}
            />

            {MARCOS.map((m, i) => (
                <div
                    key={i}
                    className={`ss-anim ${m.anim} hidden md:block`}
                    style={{
                        position: "absolute",
                        width: m.w,
                        height: m.h,
                    }}
                >
                    <Esquinas color={m.color} />
                    <span
                        className="ss-anim ss-etiqueta"
                        style={{
                            position: "absolute",
                            top: -24,
                            left: 0,
                            background: m.color,
                            color: m.color === ROJO ? "#fff" : CARBON_VERDE,
                            fontFamily: "var(--font-mono), monospace",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 6px",
                            whiteSpace: "nowrap",
                            opacity: 0,
                            animation: "ss-etiqueta 12s ease-in-out infinite",
                            animationDelay: `${m.delay}s`,
                        }}
                    >
                        {m.etiqueta}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function Hero() {
    const [abierto, setAbierto] = useState(false);

    useEffect(() => {
        const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
        window.addEventListener("keydown", alTeclear);
        return () => window.removeEventListener("keydown", alTeclear);
    }, []);

    return (
        <div className="flex min-h-screen overflow-hidden" style={{ background: CARBON_VERDE }}>
            <div className="relative min-w-0 flex-1 overflow-y-auto">
                <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
                    <Logo />
                    <nav className="flex items-center gap-6 text-sm">
                        <a href="#como-funciona" className="hidden text-white/70 hover:text-white sm:block">
                            Cómo funciona
                        </a>
                        <Button
                            size="sm"
                            onClick={() => setAbierto(!abierto)}
                            className="font-semibold"
                            style={{ background: VERDE_LIMA, color: CARBON_VERDE }}
                        >
                            {abierto ? "Cerrar" : "Iniciar sesión"}
                        </Button>
                    </nav>
                </header>

                <section className="relative min-h-[calc(100vh-76px)]">
                    <FondoAnimado />
                    <div className="relative z-10 flex min-h-[calc(100vh-76px)] max-w-2xl flex-col justify-center px-6 pb-24 md:px-12">
                        <span
                            className="ss-fade-1 mb-5 w-fit rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm"
                            style={{
                                borderColor: `${VERDE_LIMA}66`,
                                color: VERDE_LIMA_CLARO,
                                background: `${VERDE_LIMA}14`,
                            }}
                        >
                            Control de EPP con visión artificial
                        </span>

                        <h1 className="ss-fade-2 text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                            Cada acceso a la obra,
                            <br />
                            <span style={{ color: VERDE_LIMA_CLARO }}>verificado en tiempo real</span>
                        </h1>

                        <p className="ss-fade-3 mt-6 max-w-lg text-base text-white/75 md:text-lg">
                            Detecta casco y chaleco, activa una alerta al instante y gestiona las salidas a campo,
                            sin identificar a nadie en el acceso.
                        </p>

                        <div className="ss-fade-4 mt-10 flex flex-wrap gap-3">
                            <Button
                                size="lg"
                                onClick={() => setAbierto(true)}
                                className="font-semibold"
                                style={{
                                    background: VERDE_LIMA,
                                    color: CARBON_VERDE,
                                    animation: "ss-pulso-borde 3s ease-in-out infinite",
                                }}
                            >
                                Ingresar al panel
                            </Button>
                            <a
                                href="#como-funciona"
                                className="inline-flex h-10 items-center rounded-md border border-white/30 px-6 text-sm font-medium text-white hover:bg-white/10"
                            >
                                Ver cómo funciona
                            </a>
                        </div>
                    </div>
                </section>

                <section
                    id="como-funciona"
                    className="relative z-10 border-t border-white/10 px-6 py-14 md:px-12"
                    style={{ background: CARBON_VERDE }}
                >
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            ["Detección en vivo", "El modelo YOLO revisa cada acceso y reconoce casco y chaleco faltantes."],
                            ["Alerta inmediata", "Una infracción activa el buzzer del ESP32 y queda registrada con su foto."],
                            ["Papeletas digitales", "El trabajador solicita su salida y el supervisor la aprueba desde el panel."],
                        ].map(([titulo, texto]) => (
                            <div
                                key={titulo}
                                className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                            >
                                <h3 className="font-semibold text-white">{titulo}</h3>
                                <p className="mt-2 text-sm text-white/60">{texto}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* PANEL DESLIZANTE CON LOGIN DIRECTO */}
            <aside
                aria-hidden={!abierto}
                inert={!abierto}
                className={`fixed inset-y-0 right-0 z-50 w-[min(440px,100%)] overflow-hidden border-l text-white transition-all duration-500 ease-out md:static md:z-auto md:shrink-0 ${abierto
                        ? "translate-x-0 opacity-100 pointer-events-auto md:w-[440px]"
                        : "translate-x-full opacity-0 pointer-events-none md:w-0 md:translate-x-0"
                    }`}
                style={{ background: PANEL_VERDE, borderColor: "rgba(255,255,255,0.08)" }}
            >
                <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    aria-label="Cerrar"
                    className="absolute right-4 top-4 z-10 rounded-md px-2 py-1 text-xl text-white/60 hover:bg-white/10"
                >
                    ×
                </button>

                <div className="flex h-full w-[min(440px,100vw)] flex-col justify-between overflow-y-auto p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                            <span className="relative inline-block h-5 w-5">
                                <span className="absolute left-0 top-0 h-1.5 w-1.5 border-l-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
                                <span className="absolute right-0 top-0 h-1.5 w-1.5 border-r-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
                                <span className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b-2 border-l-2" style={{ borderColor: VERDE_LIMA }} />
                                <span className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b-2 border-r-2" style={{ borderColor: VERDE_LIMA }} />
                            </span>
                            SystemSafety <span style={{ color: VERDE_LIMA }}>AI</span>
                        </span>
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest"
                            style={{
                                borderColor: `${VERDE_LIMA}44`,
                                background: `${VERDE_LIMA}0F`,
                                color: VERDE_LIMA_CLARO,
                                fontFamily: "var(--font-geist-mono), monospace",
                            }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: VERDE_LIMA }} />
                            Acceso seguro
                        </span>
                    </div>

                    {/* Formulario */}
                    <div className="my-8">
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Iniciar sesión</h2>
                        <p className="mb-6 mt-2 text-sm text-white/50">
                            Ingresa con tu cuenta para acceder al panel de control.
                        </p>
                        <LoginForm />
                    </div>

                    {/* Chips estado */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px]" style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
                        {["cámara activa", "mqtt ok", "norma g.050"].map((label) => (
                            <span
                                key={label}
                                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
                                style={{
                                    borderColor: "rgba(101,163,13,0.3)",
                                    background: "rgba(101,163,13,0.08)",
                                    color: VERDE_LIMA_CLARO,
                                }}
                            >
                                <span className="h-1 w-1 rounded-full" style={{ background: VERDE_LIMA_CLARO }} />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}   