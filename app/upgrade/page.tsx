"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FEATURES_FREE = [
  "10 questões de demonstração",
  "Sem login para testar",
  "Correção imediata",
  "Ideal para conhecer o método",
];

const FEATURES_PREMIUM = [
  "Tudo do teste grátis",
  "Mais de 500 questões estratégicas",
  "Revisão inteligente com SM-2",
  "Dashboard de desempenho",
  "Simulado cronometrado (100q / 4h)",
  "Suporte prioritário",
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpgrade() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setErro(data.error ?? "Erro ao iniciar pagamento. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%,rgba(250,204,21,0.16),transparent 28%),#0a0a0a", color: "#f8fafc", padding: "2rem 1rem", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#22c55e", fontSize: 12, fontWeight: 1000, textTransform: "uppercase", margin: "0 0 10px" }}>
            Quem treina, passa
          </p>
          <h1 style={{ fontSize: "clamp(2.3rem,7vw,4rem)", lineHeight: 1, fontWeight: 1000, margin: "0 0 0.75rem", textTransform: "uppercase" }}>
            Escolha seu plano
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.55, maxWidth: 620, margin: "0 auto" }}>
            Teste 10 questões grátis sem login. Para continuar treinando com mais de 500 questões estratégicas, revisão inteligente e simulado, desbloqueie o Premium por <strong style={{ color: "#facc15" }}>R$9,90/mês</strong>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "2rem", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, fontWeight: 900 }}>Gratuito</p>
            <p style={{ fontSize: "2.8rem", fontWeight: 1000, margin: "0.5rem 0" }}>R$0</p>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Para testar antes de criar conta</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {FEATURES_FREE.map((f) => (
                <li key={f} style={{ display: "flex", gap: "0.5rem", color: "#cbd5e1" }}>
                  <span style={{ color: "#22c55e", fontWeight: 1000 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/quiz")}
              style={{ marginTop: "2rem", width: "100%", padding: "0.85rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", background: "transparent", color: "#ffffff", cursor: "pointer", fontSize: "1rem", fontWeight: 900 }}
            >
              Testar grátis
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.055)", borderRadius: 16, padding: "2rem", border: "2px solid #facc15", position: "relative", boxShadow: "0 24px 70px rgba(250,204,21,0.15)" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#facc15", color: "#0a0a0a", fontSize: "0.75rem", fontWeight: 1000, padding: "0.25rem 0.8rem", borderRadius: 20, whiteSpace: "nowrap" }}>
              OFERTA DE LANÇAMENTO
            </div>
            <p style={{ color: "#facc15", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, fontWeight: 1000 }}>Premium</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0.5rem 0" }}>
              <p style={{ fontSize: "2.8rem", fontWeight: 1000, margin: 0 }}>R$9,90</p>
              <span style={{ color: "#64748b", textDecoration: "line-through" }}>R$19,90</span>
            </div>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>por mês — cancele quando quiser</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {FEATURES_PREMIUM.map((f) => (
                <li key={f} style={{ display: "flex", gap: "0.5rem", color: "#cbd5e1" }}>
                  <span style={{ color: "#facc15", fontWeight: 1000 }}>★</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{ marginTop: "2rem", width: "100%", padding: "0.9rem", borderRadius: 10, border: "none", background: loading ? "#92400e" : "#facc15", color: "#0a0a0a", fontWeight: 1000, cursor: loading ? "not-allowed" : "pointer", fontSize: "1rem", textTransform: "uppercase" }}
            >
              {loading ? "Redirecionando..." : "Assinar Premium"}
            </button>
            {erro && (
              <p style={{ textAlign: "center", color: "#f87171", fontSize: "0.8rem", marginTop: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: 8, padding: "0.5rem" }}>
                ⚠ {erro}
              </p>
            )}
            <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.75rem", marginTop: "0.5rem" }}>
              Pagamento seguro via MercadoPago
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
