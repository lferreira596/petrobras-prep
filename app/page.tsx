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
        <Image src="/icon.png" alt="Concursos Prep" width={36} height={36} style={{ borderRadius: 8 }} />
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

      <footer style={{ textAlign: "center", padding: "1.75rem 1.5rem", color: "#475569", fontSize: "0.8rem", borderTop: "1px solid #1e293b" }}>
        <a
          href="https://wa.me/5531998352644?text=Olá!%20Tenho%20uma%20dúvida%20ou%20sugestão%20sobre%20o%20Petrobras%20Prep."
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#25D366", color: "#fff",
            padding: "0.55rem 1.25rem", borderRadius: 99,
            fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
            marginBottom: "1rem",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Dúvidas ou sugestões? Fale conosco
        </a>
        <div>Concursos Prep — Não afiliado à Petrobras S.A.</div>
      </footer>
    </main>
  );
}
