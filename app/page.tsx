import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  { icon: "📚", title: "130+ Questões Reais", desc: "Questões originais de CESGRANRIO e CEBRASPE, as bancas do concurso Petrobras." },
  { icon: "🧠", title: "Repetição Espaçada", desc: "Algoritmo SM-2 que identifica seus pontos fracos e programa revisões no momento certo." },
  { icon: "📊", title: "Dashboard Inteligente", desc: "Acompanhe seu desempenho por área e visualize sua evolução ao longo do tempo." },
  { icon: "⏱", title: "Simulado Cronometrado", desc: "100 questões em 4 horas, no formato exato do concurso. Exclusivo Premium." },
];

export default async function RootPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "sans-serif" }}>
      {/* Navbar */}
      <nav style={{ maxWidth: 900, margin: "0 auto", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: 10 }}>
        <Image src="/icon.png" alt="Petrobras Prep" width={36} height={36} style={{ borderRadius: 8 }} />
        <span style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.3px" }}>
          Petrobras <span style={{ color: "#facc15" }}>Prep</span>
        </span>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem 4rem", textAlign: "center" }}>
        <Image src="/icon.png" alt="" width={72} height={72} style={{ marginBottom: "1.5rem", filter: "drop-shadow(0 0 24px rgba(250,204,21,0.35))" }} />
        <div style={{ display: "inline-block", background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
          🛢 Especializado no concurso Petrobras Nível Técnico Júnior
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem" }}>
          Passe na Petrobras com{" "}
          <span style={{ color: "#facc15" }}>método científico</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.15rem", maxWidth: 600, margin: "0 auto 2.5rem" }}>
          A única plataforma com questões reais da CESGRANRIO/CEBRASPE, repetição espaçada SM-2 e simulados no formato exato do concurso.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{ background: "#facc15", color: "#0f172a", padding: "0.85rem 2rem", borderRadius: 10, fontWeight: 700, fontSize: "1.05rem", textDecoration: "none" }}>
            Começar grátis
          </Link>
          <Link href="/upgrade" style={{ background: "#1e293b", color: "#f8fafc", padding: "0.85rem 2rem", borderRadius: 10, fontWeight: 600, fontSize: "1.05rem", textDecoration: "none", border: "1px solid #334155" }}>
            Ver planos →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.25rem" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "#1e293b", borderRadius: 14, padding: "1.5rem", border: "1px solid #334155" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.4rem" }}>{f.title}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section style={{ background: "#1e293b", borderTop: "1px solid #334155", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Comece agora, pague depois
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
          Plano gratuito sem cartão. Upgrade para Premium por <strong style={{ color: "#facc15" }}>R$9,90/mês</strong> no lançamento.
        </p>
        <Link href="/login" style={{ background: "#facc15", color: "#0f172a", padding: "0.85rem 2.5rem", borderRadius: 10, fontWeight: 700, fontSize: "1.05rem", textDecoration: "none" }}>
          Criar conta gratuita
        </Link>
      </section>

      <footer style={{ textAlign: "center", padding: "1.5rem", color: "#475569", fontSize: "0.8rem" }}>
        Petrobras Prep — Não afiliado à Petrobras S.A.
      </footer>
    </main>
  );
}
