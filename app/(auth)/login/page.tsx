import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Image from "next/image";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main style={{
      minHeight:"100vh",
      background:"radial-gradient(ellipse at 15% 40%, #1f1b12 0%, #08080f 55%, #0a0a0a 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#dde4ff",
      padding:"24px",
    }}>
      <div style={{
        background:"rgba(255,255,255,0.035)", border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:20, padding:"40px 32px", maxWidth:420, width:"100%", textAlign:"center",
      }}>
        <Image
          src="/logo.png"
          alt="Prepara Concursos"
          width={260}
          height={90}
          priority
          style={{width:"min(260px,100%)",height:"auto",objectFit:"contain",marginBottom:16}}
        />
        <p style={{color:"#7a82a8", fontSize:13, margin:"0 0 32px"}}>
          10 questões grátis · Premium com 500+ estratégicas<br/>
          Progresso salvo · Revisão inteligente
        </p>

        <form action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}>
          <button type="submit" style={{
            width:"100%", padding:"14px",
            background:"linear-gradient(135deg,#facc15,#22c55e)",
            color:"#0a0a0a", fontWeight:900, fontSize:15,
            border:"none", borderRadius:14, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#0a0a0a" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#1f2937" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#111827" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#374151" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>
        </form>

        <p style={{color:"#7a82a8", fontSize:11, marginTop:24}}>
          Ao entrar, você concorda com os Termos de Uso.<br/>
          Seu progresso fica salvo automaticamente.
        </p>
      </div>
    </main>
  );
}
