"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FEATURES_FREE = [
  "60 questões de treino",
  "Repetição espaçada (SM-2)",
  "Dashboard de desempenho",
  "Plano de estudos semanal",
];

const FEATURES_PREMIUM = [
  "Tudo do plano gratuito",
  "+200 questões exclusivas",
  "Simulado cronometrado (100q / 4h)",
  "Analytics avançado com gráficos",
  "Heatmap de dias estudados",
  "Suporte prioritário",
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.initPoint) window.location.href = data.initPoint;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Escolha seu plano
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
            Invista na sua aprovação. Lance <strong style={{ color: "#facc15" }}>R$9,90/mês</strong> — oferta dos primeiros 100 assinantes.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Free */}
          <div style={{ background: "#1e293b", borderRadius: 16, padding: "2rem", border: "1px solid #334155" }}>
            <p style={{ color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1 }}>Gratuito</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0.5rem 0" }}>R$0</p>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Para começar a estudar</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {FEATURES_FREE.map((f) => (
                <li key={f} style={{ display: "flex", gap: "0.5rem", color: "#cbd5e1" }}>
                  <span style={{ color: "#22c55e" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/dashboard")}
              style={{ marginTop: "2rem", width: "100%", padding: "0.75rem", borderRadius: 8, border: "1px solid #475569", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "1rem" }}
            >
              Continuar grátis
            </button>
          </div>

          {/* Premium */}
          <div style={{ background: "#1e293b", borderRadius: 16, padding: "2rem", border: "2px solid #facc15", position: "relative" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#facc15", color: "#0f172a", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.8rem", borderRadius: 20 }}>
              OFERTA DE LANÇAMENTO
            </div>
            <p style={{ color: "#facc15", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1 }}>Premium</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0.5rem 0" }}>
              <p style={{ fontSize: "2.5rem", fontWeight: 700 }}>R$9,90</p>
              <span style={{ color: "#64748b", textDecoration: "line-through" }}>R$19,90</span>
            </div>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>por mês — cancele quando quiser</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {FEATURES_PREMIUM.map((f) => (
                <li key={f} style={{ display: "flex", gap: "0.5rem", color: "#cbd5e1" }}>
                  <span style={{ color: "#facc15" }}>★</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{ marginTop: "2rem", width: "100%", padding: "0.75rem", borderRadius: 8, border: "none", background: loading ? "#92400e" : "#facc15", color: "#0f172a", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: "1rem" }}
            >
              {loading ? "Redirecionando..." : "Assinar Premium"}
            </button>
            <p style={{ textAlign: "center", color: "#475569", fontSize: "0.75rem", marginTop: "0.75rem" }}>
              Pagamento seguro via MercadoPago
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
