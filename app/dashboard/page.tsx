import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserStats, getStudyPlan, getUserPlan } from "@/lib/db/queries";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [stats, plan, userPlan] = await Promise.all([
    getUserStats(session.user.id),
    getStudyPlan(session.user.id),
    getUserPlan(session.user.id),
  ]);
  const isPremium = userPlan === "premium";

  return (
    <main style={{
      minHeight:"100vh",
      background:"radial-gradient(ellipse at 15% 40%, #041a2e 0%, #08080f 55%, #0a0a1a 100%)",
      fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#dde4ff", padding:"24px 16px 100px",
    }}>
      <div style={{maxWidth:720, margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          {session.user.image && (
            <img src={session.user.image} alt="" width={40} height={40} style={{borderRadius:"50%",border:"2px solid rgba(0,229,180,0.3)"}}/>
          )}
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700}}>Olá, {session.user.name?.split(" ")[0]} 👋</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
              <div style={{fontSize:11,color:"#7a82a8"}}>Ênfase: Administração e Controle</div>
              {isPremium ? (
                <span style={{background:"rgba(250,204,21,0.15)",border:"1px solid rgba(250,204,21,0.35)",borderRadius:99,padding:"2px 8px",fontSize:10,color:"#facc15",fontWeight:700}}>★ PREMIUM</span>
              ) : (
                <span style={{background:"rgba(100,116,139,0.2)",border:"1px solid rgba(100,116,139,0.3)",borderRadius:99,padding:"2px 8px",fontSize:10,color:"#94a3b8",fontWeight:700}}>GRATUITO</span>
              )}
            </div>
          </div>
          <div style={{background:"rgba(245,200,66,0.1)",border:"1px solid rgba(245,200,66,0.2)",borderRadius:99,padding:"4px 12px",fontSize:12,color:"#f5c842",fontWeight:700}}>
            🔥 {stats.streakDias}d streak
          </div>
        </div>

        {/* Banner upgrade — só para free */}
        {!isPremium && (
          <a href="/upgrade" style={{display:"block",textDecoration:"none",marginBottom:16}}>
            <div style={{background:"linear-gradient(135deg,rgba(250,204,21,0.1),rgba(251,146,60,0.07))",border:"1px solid rgba(250,204,21,0.25)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:"#facc15",marginBottom:4}}>
                    ★ Você está no plano Gratuito
                  </div>
                  <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
                    Limitado a <strong style={{color:"#dde4ff"}}>60 questões</strong> · Sem simulado cronometrado · Sem analytics avançado
                  </div>
                </div>
                <div style={{flexShrink:0,background:"#facc15",color:"#0f172a",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>
                  Ver Premium →
                </div>
              </div>
            </div>
          </a>
        )}

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
            {icon:"🧠",label:"Iniciar Quiz",desc:"Nova sessão de estudo",href:"/quiz",cor:"#00e5b4",locked:false},
            {icon:"🔁",label:"Revisar Erros",desc:`${stats.filaRevisao} questões`,href:"/revisao",cor:"#ff5050",locked:false},
            {icon:"📅",label:"Plano Semanal",desc:"Ver cronograma",href:"/plano",cor:"#f5c842",locked:false},
            {icon:"⏱",label:"Simulado Completo",desc:"100q · 4h · Premium",href: isPremium ? "/simulado" : "/upgrade",cor:"#a78bfa",locked:!isPremium},
          ].map(a=>(
            <a key={a.label} href={a.href} style={{
              display:"block",padding:"16px",textDecoration:"none",
              background: a.locked ? "rgba(100,116,139,0.08)" : `${a.cor}10`,
              border:`1px solid ${a.locked ? "rgba(100,116,139,0.2)" : a.cor+"25"}`,
              borderRadius:14,position:"relative",opacity: a.locked ? 0.8 : 1,
            }}>
              {a.locked && (
                <div style={{position:"absolute",top:8,right:8,fontSize:10,background:"rgba(250,204,21,0.15)",color:"#facc15",borderRadius:6,padding:"2px 6px",fontWeight:700}}>
                  ★ Premium
                </div>
              )}
              <div style={{fontSize:26,marginBottom:6}}>{a.locked ? "🔒" : a.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color: a.locked ? "#64748b" : a.cor}}>{a.label}</div>
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
