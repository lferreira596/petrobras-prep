import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserStats, getStudyPlan, getUserAccess } from "@/lib/db/queries";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [stats, plan, access] = await Promise.all([
    getUserStats(session.user.id),
    getStudyPlan(session.user.id),
    getUserAccess(session.user.id),
  ]);
  const isPremium = access.isPremium;
  const hasFullAccess = isPremium || access.isFreeAccessActive;

  return (
    <main style={{
      minHeight:"100vh",
      background:"radial-gradient(ellipse at 15% 40%, #041a2e 0%, #08080f 55%, #0a0a1a 100%)",
      fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#dde4ff", padding:"24px 16px 100px",
    }}>
      <div style={{maxWidth:720, margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,paddingBottom:12}}>
          <Image src="/logo-dark.png" alt="Prepara Concursos" width={900} height={330} priority style={{width:190,height:"auto",objectFit:"contain"}}/>
        </div>
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
        {access.shouldShowUpgrade && (
          <a href="/upgrade" style={{display:"block",textDecoration:"none",marginBottom:16}}>
            <div style={{background:"linear-gradient(135deg,rgba(250,204,21,0.1),rgba(251,146,60,0.07))",border:"1px solid rgba(250,204,21,0.25)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:"#facc15",marginBottom:4}}>
                    Seu acesso gratuito terminou
                  </div>
                  <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
                    Continue treinando com questões estratégicas, revisão inteligente, simulado e analytics no Premium.
                  </div>
                </div>
                <div style={{flexShrink:0,background:"#facc15",color:"#0f172a",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>
                  Assinar Premium →
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
            {icon:"⏱",label:"Simulado Completo",desc: hasFullAccess ? "100q · 4h" : "100q · 4h · Premium",href: hasFullAccess ? "/simulado" : "/upgrade",cor:"#a78bfa",locked:!hasFullAccess},
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
        {/* Rodapé WhatsApp */}
        <div style={{marginTop:32,textAlign:"center"}}>
          <a
            href="https://wa.me/5531998352644?text=Olá!%20Tenho%20uma%20dúvida%20ou%20sugestão%20sobre%20o%20Petrobras%20Prep."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:"inline-flex",alignItems:"center",gap:8,
              background:"rgba(37,211,102,0.12)",border:"1px solid rgba(37,211,102,0.3)",
              color:"#25D366",padding:"10px 20px",borderRadius:99,
              fontWeight:700,fontSize:13,textDecoration:"none",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Dúvidas ou sugestões? WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
