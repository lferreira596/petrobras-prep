import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

const STATS = [
  { value: "10", label: "questões grátis" },
  { value: "500+", label: "questões estratégicas" },
  { value: "SM-2", label: "revisão inteligente" },
];

const FEATURES = [
  { icon: "🎯", title: "Treino direcionado", text: "Português, matemática, informática, legislação, petróleo e administração para nível técnico." },
  { icon: "✅", title: "Correção imediata", text: "Responda, veja a alternativa certa e entenda o erro na hora." },
  { icon: "📊", title: "Progresso salvo", text: "Com login, seus acertos, erros e revisões ficam organizados no dashboard." },
  { icon: "⏱", title: "Simulado Premium", text: "Treino cronometrado no formato de prova para acelerar sua preparação." },
];

export default async function RootPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff", fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>
      <section style={{
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        padding: "20px 16px 52px",
        background: "radial-gradient(circle at 50% 18%, rgba(250,204,21,0.22), transparent 30%), radial-gradient(circle at 12% 45%, rgba(34,197,94,0.18), transparent 28%), linear-gradient(180deg,#101010 0%,#050505 100%)",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.74))" }} />
        <div style={{ maxWidth: 1040, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 44 }}>
            <Image src="/logo.png" alt="Prepara Concursos" width={260} height={90} priority style={{ width: "min(260px, 58vw)", height: "auto", objectFit: "contain" }} />
            <Link href="/login" style={{ color: "#ffffff", textDecoration: "none", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "9px 14px", fontSize: 13, fontWeight: 800 }}>
              Entrar
            </Link>
          </nav>

          <div style={{ textAlign: "center", maxWidth: 880, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#facc15", border: "1px solid rgba(250,204,21,0.45)", background: "rgba(250,204,21,0.08)", borderRadius: 999, padding: "8px 14px", fontSize: 12, fontWeight: 1000, textTransform: "uppercase", marginBottom: 20 }}>
              ⚠️ Concurso Petrobras nível técnico
            </div>
            <h1 style={{ fontSize: "clamp(2.7rem, 9vw, 6.4rem)", lineHeight: 0.88, margin: "0 0 22px", fontWeight: 1000, letterSpacing: 0, textTransform: "uppercase" }}>
              Quem treina, passa.
            </h1>
            <p style={{ color: "#d4d4d4", fontSize: "clamp(1.05rem, 2.4vw, 1.35rem)", lineHeight: 1.55, maxWidth: 720, margin: "0 auto 28px" }}>
              Teste agora 10 questões grátis, sem login. Depois desbloqueie mais de 500 questões estratégicas, revisão inteligente e simulado cronometrado.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 34 }}>
              <Link href="/quiz" style={{ background: "#facc15", color: "#0a0a0a", padding: "15px 24px", borderRadius: 12, fontWeight: 1000, fontSize: 15, textDecoration: "none", textTransform: "uppercase", boxShadow: "0 12px 36px rgba(250,204,21,0.28)" }}>
                Testar grátis agora
              </Link>
              <Link href="/upgrade" style={{ background: "rgba(255,255,255,0.06)", color: "#ffffff", padding: "15px 22px", borderRadius: 12, fontWeight: 900, fontSize: 15, textDecoration: "none", border: "1px solid rgba(255,255,255,0.16)" }}>
                Ver Premium →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, maxWidth: 620, margin: "0 auto 26px" }}>
              {STATS.map((item) => (
                <div key={item.label} style={{ border: "1px solid rgba(255,255,255,0.11)", background: "rgba(255,255,255,0.045)", borderRadius: 12, padding: "13px 10px" }}>
                  <strong style={{ display: "block", color: item.value === "10" ? "#22c55e" : "#facc15", fontSize: 25, lineHeight: 1 }}>{item.value}</strong>
                  <span style={{ display: "block", color: "#a3a3a3", fontSize: 11, textTransform: "uppercase", fontWeight: 900, marginTop: 5 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 720, margin: "0 auto", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, background: "rgba(5,5,5,0.72)", boxShadow: "0 28px 90px rgba(0,0,0,0.45)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ color: "#facc15", fontSize: 12, fontWeight: 1000, textTransform: "uppercase" }}>Questão demo</span>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>CESGRANRIO • Administração</span>
            </div>
            <div style={{ padding: "18px 16px" }}>
              <p style={{ margin: "0 0 14px", color: "#ffffff", lineHeight: 1.6, fontSize: 15 }}>
                Na função administrativa de controle, qual ação vem depois de comparar o resultado com o padrão esperado?
              </p>
              {["Ignorar desvios pequenos", "Aplicar ação corretiva", "Encerrar o planejamento"].map((op, i) => (
                <div key={op} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginTop: 8, borderRadius: 10, border: `1px solid ${i === 1 ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.1)"}`, background: i === 1 ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.035)", color: i === 1 ? "#86efac" : "#d4d4d4", fontSize: 13 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: i === 1 ? "#22c55e" : "rgba(255,255,255,0.08)", color: i === 1 ? "#0a0a0a" : "#94a3b8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 1000 }}>{i === 1 ? "✓" : String.fromCharCode(65+i)}</span>
                  {op}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 16px", background: "#ffffff", color: "#0a0a0a" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ maxWidth: 680, marginBottom: 26 }}>
            <p style={{ margin: "0 0 8px", color: "#22c55e", fontWeight: 1000, textTransform: "uppercase", fontSize: 12 }}>Dor → Solução → Aprovação</p>
            <h2 style={{ margin: 0, fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1, fontWeight: 1000, textTransform: "uppercase" }}>
              Disciplina hoje, aprovação amanhã.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            {FEATURES.map((f) => (
              <article key={f.title} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, background: "#fafafa" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 1000, textTransform: "uppercase" }}>{f.title}</h3>
                <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.55, fontSize: 14 }}>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "58px 16px", background: "#0a0a0a", color: "#ffffff", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <h2 style={{ margin: "0 auto 12px", maxWidth: 720, fontSize: "clamp(2rem,6vw,4rem)", lineHeight: 1, fontWeight: 1000, textTransform: "uppercase" }}>
          Comece sem cadastro.
        </h2>
        <p style={{ color: "#a3a3a3", margin: "0 auto 24px", maxWidth: 560, fontSize: 17, lineHeight: 1.55 }}>
          Faça o teste grátis agora. Se fizer sentido para sua rotina, desbloqueie o Premium por R$9,90/mês no lançamento.
        </p>
        <Link href="/quiz" style={{ display: "inline-flex", background: "#facc15", color: "#0a0a0a", padding: "15px 26px", borderRadius: 12, fontWeight: 1000, textDecoration: "none", textTransform: "uppercase" }}>
          Responder 10 questões
        </Link>
      </section>
    </main>
  );
}
