import Link from "next/link";

export default function UpgradeSucessoPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem" }}>
      <div style={{ fontSize: "4rem" }}>🎉</div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Seja bem-vindo ao Premium!</h1>
      <p style={{ color: "#94a3b8", textAlign: "center", maxWidth: 400 }}>
        Sua assinatura foi ativada. Agora você tem acesso completo a questões exclusivas e ao simulado cronometrado.
      </p>
      <Link href="/dashboard" style={{ background: "#facc15", color: "#0f172a", padding: "0.75rem 2rem", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
        Ir para o Dashboard
      </Link>
    </main>
  );
}
