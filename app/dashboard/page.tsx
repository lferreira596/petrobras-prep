import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserStats, getStudyPlan } from "@/lib/db/queries";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const stats = await getUserStats(session.user.id);
  const plan  = await getStudyPlan(session.user.id);

  return (
    <main style={{
      minHeight:"100vh",
      background:"radial-gradient(ellipse at 15% 40%, #041a2e 0%, #08080f 55%, #0a0a1a 100%)",
      fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#dde4ff", padding:"24px 16px 100px",
    }}>
      <div style={{maxWidth:720, margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          {session.user.image && (
            <img src={session.user.image} alt="" width={40} height={40} style={{borderRadius:"50%",border:"2px solid rgba(0,229,180,0.3)"}}/>
          )}
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700}}>Olá, {session.user.name?.split(" ")[0]} 👋</div>
            <div style={{fontSize:11,color:"#7a82a8"}}>Ênfase: Administração e Controle</div>
          </div>
          <div style={{background:"rgba(245,200,66,0.1)",border:"1px solid rgba(245,200,66,0.2)",borderRadius:99,padding:"4px 12px",fontSize:12,color:"#f5c842",fontWeight:700}}>
            🔥 {stats.streakDias}d streak
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
          {[
            {n:stats.totalQuestoes,l:"Questões respondidas",c:"#00e5b4"},
            {n:stats.pctAcerto+"%",l:"Taxa de acerto",c:"#a78bfa"},
            {n:stats.filaRevisao,l:"Para revisar",c:stats.filaRevisao>0?"#ff5050":"#7a82a8"},
            {n:stats.totalSessoes,l:"Sessões de estudo",c:"#f5c842"},
          ].map(s=>(
            <div key={s.l} style={{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:900,color:s.c}}>{s.n}</div>
              <div style={{fontSize:10,color:"#7a82a8",textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Revisão CTA */}
        {stats.filaRevisao > 0 && (
          <a href="/revisao" style={{
            display:"block",padding:"16px",marginBottom:14,textDecoration:"none",
            background:"linear-gradient(135deg,rgba(255,80,80,0.12),rgba(255,140,66,0.08))",
            border:"1px solid rgba(255,80,80,0.3)",borderRadius:16,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28}}>🔁</span>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:"#ff7070"}}>{stats.filaRevisao} questão(ões) para revisar</div>
                <div style={{fontSize:11,color:"#7a82a8",marginTop:2}}>Clique para iniciar a sessão de revisão</div>
              </div>
              <span style={{marginLeft:"auto",color:"#ff7070",fontSize:18}}>→</span>
            </div>
          </a>
        )}

        {/* Quick Actions */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[
            {icon:"🧠",label:"Iniciar Quiz",desc:"Nova sessão de estudo",href:"/quiz",cor:"#00e5b4"},
            {icon:"🔁",label:"Revisar Erros",desc:`${stats.filaRevisao} questões`,href:"/revisao",cor:"#ff5050"},
            {icon:"📊",label:"Meu Progresso",desc:"Ver por disciplina",href:"/dashboard#stats",cor:"#a78bfa"},
            {icon:"📅",label:"Plano Semanal",desc:"Ver cronograma",href:"/plano",cor:"#f5c842"},
          ].map(a=>(
            <a key={a.label} href={a.href} style={{
              display:"block",padding:"16px",textDecoration:"none",
              background:`${a.cor}10`,border:`1px solid ${a.cor}25`,borderRadius:14,
            }}>
              <div style={{fontSize:26,marginBottom:6}}>{a.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:a.cor}}>{a.label}</div>
              <div style={{fontSize:11,color:"#7a82a8",marginTop:2}}>{a.desc}</div>
            </a>
          ))}
        </div>

        {/* Desempenho por área */}
        {Object.keys(stats.areaStats).length > 0 && (
          <div id="stats" style={{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"16px"}}>
            <div style={{fontSize:11,color:"#7a82a8",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:14}}>📊 Desempenho por Disciplina</div>
            {Object.entries(stats.areaStats).map(([area,s])=>{
              const tot=s.acertos+s.erros;
              if(!tot) return null;
              const pct=Math.round(s.acertos/tot*100);
              const LABEL:Record<string,string>={port:"Português",mat:"Mat./Lógica",info:"Informática",adm:"Administração",leg:"Legislação",pet:"Petróleo",ing:"Inglês",con:"Contabilidade"};
              const COR:Record<string,string>={port:"#7eb8f7",mat:"#f7d07e",info:"#a78bfa",adm:"#f78b7e",leg:"#7ef7a7",pet:"#f7a77e",ing:"#7ef7f0",con:"#f77eb8"};
              return(
                <div key={area} style={{marginBottom:10}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                    <span style={{fontSize:12,flex:1,color:"#dde4ff"}}>{LABEL[area]??area}</span>
                    <span style={{fontSize:11,color:"#7a82a8"}}>{s.acertos}/{tot}</span>
                    <span style={{fontSize:12,fontWeight:700,color:pct>=70?"#00e5b4":pct>=50?"#f5c842":"#ff5050"}}>{pct}%</span>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,borderRadius:99,background:COR[area]??'#00e5b4'}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
