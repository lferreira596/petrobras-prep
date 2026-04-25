"use client";
import { useEffect, useRef, useState } from "react";

type Question = {
  id:string; area:string; sub:string; banca:string; ano:number;
  dif:string; tipo:string; enunciado:string; opcoes:string[]; correta:number; explicacao:string;
};
type ProgressMap = Record<string, { erros:number; acertos:number; tentativas:number }>;
type Plan = "guest" | "free" | "premium";

const DIF_COR:Record<string,string> = { facil:"#4ade80", media:"#facc15", dificil:"#f87171" };
const DIF_LABEL:Record<string,string> = { facil:"Fácil", media:"Médio", dificil:"Difícil" };
const AREA_INFO:Record<string,{label:string;emoji:string;cor:string}> = {
  port:{label:"Português", emoji:"📝", cor:"#7eb8f7"},
  mat:{label:"Mat./Lógica", emoji:"🔢", cor:"#f7d07e"},
  info:{label:"Informática", emoji:"💻", cor:"#a78bfa"},
  adm:{label:"Administração", emoji:"📊", cor:"#f78b7e"},
  leg:{label:"Legislação", emoji:"⚖️", cor:"#7ef7a7"},
  pet:{label:"Petróleo", emoji:"🛢️", cor:"#f7a77e"},
  ing:{label:"Inglês", emoji:"🌐", cor:"#7ef7f0"},
  con:{label:"Contabilidade", emoji:"🏦", cor:"#f77eb8"},
};

function shuffle<T>(arr:T[]): T[] { return [...arr].sort(()=>Math.random()-0.5); }

export default function QuizClient({ questions, progressMap, userId, userPlan }:
  { questions:Question[]; progressMap:ProgressMap; userId?:string; userPlan:Plan }) {

  const isDemo = userPlan !== "premium";
  const isGuest = userPlan === "guest";
  const [fila, setFila] = useState<Question[]>(questions);
  const [idx, setIdx] = useState(0);
  const [resp, setResp] = useState<number|null>(null);
  const [mostraExp, setMostraExp] = useState(false);
  const [placar, setPlacar] = useState({ac:0, er:0});
  const [tempoQ, setTempoQ] = useState(0);
  const [streak, setStreak] = useState(0);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sessionStart] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(()=>{ setFila(shuffle(questions)); }, [questions]);

  useEffect(()=>{
    if(finished || resp !== null){ clearInterval(timerRef.current!); return; }
    setTempoQ(0);
    clearInterval(timerRef.current!);
    timerRef.current = setInterval(()=>setTempoQ(t=>t+1),1000);
    return ()=>clearInterval(timerRef.current!);
  },[idx, resp, finished]);

  const C = {
    bg:"#08080f", card:"rgba(255,255,255,0.035)", border:"rgba(255,255,255,0.07)",
    verde:"#22c55e", amarelo:"#facc15", vermelho:"#ff5050", texto:"#ffffff", sub:"#94a3b8",
  };

  async function saveSessionIfNeeded() {
    if (!userId) return;
    const areas = Array.from(new Set(fila.map(q=>q.area)));
    await fetch("/api/sessions", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        modo:"quiz",
        total:fila.length,
        acertos: placar.ac,
        erros: placar.er,
        duracaoSeg: Math.round((Date.now()-sessionStart)/1000),
        areas,
      }),
    });
  }

  if(!fila.length) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.sub,fontFamily:"sans-serif",fontSize:14}}>
      Nenhuma questão encontrada. <a href="/" style={{color:C.verde,marginLeft:6}}>← Voltar</a>
    </div>
  );

  if (finished) {
    const pctFinal = Math.round((placar.ac / fila.length) * 100);
    return (
      <main style={{minHeight:"100vh",background:"radial-gradient(ellipse at 15% 35%,#0f2f1c 0%,#08080f 48%,#0a0a0a 100%)",color:C.texto,fontFamily:"'Segoe UI',system-ui,sans-serif",padding:"28px 16px"}}>
        <section style={{maxWidth:720,margin:"0 auto",textAlign:"center",paddingTop:"8vh"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,border:`1px solid ${C.amarelo}`,color:C.amarelo,borderRadius:999,padding:"7px 14px",fontSize:12,fontWeight:900,textTransform:"uppercase",marginBottom:18}}>
            Resultado do teste grátis
          </div>
          <h1 style={{fontSize:"clamp(2.2rem,8vw,4.5rem)",lineHeight:.95,margin:"0 0 16px",fontWeight:1000,textTransform:"uppercase"}}>
            {pctFinal}% de acerto
          </h1>
          <p style={{color:C.sub,fontSize:18,lineHeight:1.6,maxWidth:560,margin:"0 auto 28px"}}>
            Você respondeu {fila.length} questões de demonstração. O plano gratuito para por aqui; o treino completo, revisão inteligente e simulado ficam no Premium.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"0 auto 28px",maxWidth:460}}>
            <div style={{border:`1px solid ${C.border}`,background:C.card,borderRadius:12,padding:14}}>
              <strong style={{display:"block",fontSize:26,color:C.verde}}>{placar.ac}</strong>
              <span style={{fontSize:11,color:C.sub,textTransform:"uppercase",fontWeight:800}}>Acertos</span>
            </div>
            <div style={{border:`1px solid ${C.border}`,background:C.card,borderRadius:12,padding:14}}>
              <strong style={{display:"block",fontSize:26,color:C.vermelho}}>{placar.er}</strong>
              <span style={{fontSize:11,color:C.sub,textTransform:"uppercase",fontWeight:800}}>Erros</span>
            </div>
            <div style={{border:`1px solid ${C.border}`,background:C.card,borderRadius:12,padding:14}}>
              <strong style={{display:"block",fontSize:26,color:C.amarelo}}>{fila.length}</strong>
              <span style={{fontSize:11,color:C.sub,textTransform:"uppercase",fontWeight:800}}>Questões</span>
            </div>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/upgrade" style={{background:C.amarelo,color:"#0a0a0a",padding:"14px 22px",borderRadius:12,fontWeight:1000,textDecoration:"none",textTransform:"uppercase"}}>
              Desbloquear Premium
            </a>
            <a href={isGuest ? "/login" : "/dashboard"} style={{background:"rgba(255,255,255,0.05)",color:C.texto,padding:"14px 22px",borderRadius:12,fontWeight:900,textDecoration:"none",border:`1px solid ${C.border}`}}>
              {isGuest ? "Salvar progresso" : "Ir ao dashboard"}
            </a>
          </div>
        </section>
      </main>
    );
  }

  const q = fila[idx];
  const ai = AREA_INFO[q.area] ?? { label:q.area, emoji:"📋", cor:"#e2e8ff" };
  const pct = Math.round(((idx+(mostraExp?1:0))/fila.length)*100);
  const isCE = q.tipo === "certo_errado";
  const errInfo = progressMap[q.id];

  const responder = async (opcaoIdx:number)=>{
    if(resp!==null) return;
    clearInterval(timerRef.current!);
    const acertou = opcaoIdx === q.correta;
    setResp(opcaoIdx);
    setMostraExp(true);
    setPlacar(p=>({ac:p.ac+(acertou?1:0), er:p.er+(acertou?0:1)}));
    if(acertou) setStreak(s=>s+1); else setStreak(0);

    if (!userId) return;
    setSaving(true);
    try {
      await fetch("/api/progress", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ questionId: q.id, acertou }),
      });
    } catch(e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const proxQ = async ()=>{
    if(idx < fila.length-1){
      setIdx(i=>i+1);
      setResp(null);
      setMostraExp(false);
      return;
    }
    setSaving(true);
    try {
      await saveSessionIfNeeded();
      setFinished(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 15% 40%,#102a18 0%,#08080f 52%,#0a0a0a 100%)",
      color:C.texto, fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"18px 16px 90px"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
          <a href={isGuest ? "/" : "/dashboard"} style={{color:C.sub,fontSize:12,textDecoration:"none",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"5px 12px"}}>← {isGuest ? "Início" : "Dashboard"}</a>
          <span style={{flex:1,fontSize:14,fontWeight:900,color:C.amarelo,textAlign:"center",textTransform:"uppercase"}}>{isDemo ? "Teste grátis" : "Quiz Premium"}</span>
          <span style={{fontSize:12,color:C.sub}}>✅{placar.ac} ❌{placar.er}</span>
        </div>

        {isDemo && (
          <div style={{background:"rgba(250,204,21,0.08)",border:"1px solid rgba(250,204,21,0.28)",borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:C.amarelo,flex:1,fontWeight:800}}>
              🔒 Grátis: 10 questões liberadas. Premium desbloqueia o banco completo, revisão SM-2 e simulado cronometrado.
            </span>
            <a href="/upgrade" style={{background:C.amarelo,color:"#0a0a0a",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:1000,textDecoration:"none",whiteSpace:"nowrap"}}>
              Ver Premium →
            </a>
          </div>
        )}

        <div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#22c55e,#facc15)",borderRadius:99,transition:"width .4s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:C.sub,marginBottom:16,flexWrap:"wrap",gap:4}}>
          <span>{idx+1}/{fila.length}</span>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <span style={{background:`${ai.cor}20`,border:`1px solid ${ai.cor}40`,color:ai.cor,padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:800}}>{ai.emoji} {ai.label}</span>
            <span style={{background:`${DIF_COR[q.dif]}20`,border:`1px solid ${DIF_COR[q.dif]}40`,color:DIF_COR[q.dif],padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:800}}>{DIF_LABEL[q.dif]}</span>
            <span style={{background:"rgba(126,184,247,0.15)",border:"1px solid rgba(126,184,247,0.3)",color:"#7eb8f7",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:800}}>{q.banca} {q.ano}</span>
          </div>
          <span>⏱ {tempoQ}s</span>
        </div>

        {errInfo?.erros > 0 && (
          <div style={{background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:10,padding:"7px 12px",marginBottom:10,fontSize:11,color:"#ff9090"}}>
            🔁 Você errou esta questão {errInfo.erros}x antes. Hora de virar o jogo.
          </div>
        )}

        <div style={{fontSize:11,color:C.sub,fontStyle:"italic",marginBottom:8}}>📌 {q.sub}</div>

        <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:14,padding:"15px",marginBottom:14,fontSize:14,lineHeight:1.65,color:C.texto}}>
          {q.enunciado}
        </div>

        {q.opcoes.map((op,i)=>{
          let bg=C.card,border=C.border,txtC=C.texto;
          if(resp!==null){
            if(i===q.correta){bg="rgba(34,197,94,0.12)";border="#22c55e88";txtC="#86efac";}
            else if(i===resp){bg="rgba(255,80,80,0.12)";border="#ff505088";txtC="#ff8080";}
          }
          return(
            <div key={i} onClick={()=>responder(i)} style={{
              display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",
              borderRadius:12,marginBottom:8,background:bg,border:`1px solid ${border}`,
              color:txtC,cursor:resp===null?"pointer":"default",transition:"all .15s",
              fontSize:13,lineHeight:1.5,
            }}>
              <div style={{
                width:24,height:24,borderRadius:7,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,
                background:resp===null?"rgba(255,255,255,0.08)":i===q.correta?C.verde:i===resp?C.vermelho:"rgba(255,255,255,0.06)",
                color:(resp!==null&&(i===q.correta||i===resp))?"#08080f":C.sub,
              }}>
                {resp!==null&&i===q.correta?"✓":resp!==null&&i===resp?"×":isCE?(i===0?"C":"E"):String.fromCharCode(65+i)}
              </div>
              <span>{op}</span>
            </div>
          );
        })}

        {mostraExp && (
          <div style={{
            background:resp===q.correta?"rgba(34,197,94,0.08)":"rgba(255,140,66,0.07)",
            border:`1px solid ${resp===q.correta?"rgba(34,197,94,0.28)":"rgba(255,140,66,0.25)"}`,
            borderRadius:12,padding:"14px",marginTop:8,
            fontSize:12,color:resp===q.correta?"#bbf7d0":"#f5e0a0",lineHeight:1.65,
          }}>
            <div style={{fontWeight:900,marginBottom:4}}>
              {resp===q.correta?"✅ Correto!":"❌ Incorreto"} — {q.banca} {q.ano}
            </div>
            {q.explicacao}
            {resp!==q.correta && userId && (
              <div style={{marginTop:8,padding:"7px 10px",background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:8,fontSize:11,color:"#ff9090"}}>
                🔁 Adicionada à fila de revisão.
              </div>
            )}
          </div>
        )}

        {streak>=3 && <div style={{background:"rgba(250,204,21,0.08)",border:"1px solid rgba(250,204,21,0.24)",borderRadius:10,padding:"7px 14px",marginTop:10,fontSize:12,color:C.amarelo,fontWeight:900}}>🔥 {streak} acertos seguidos!</div>}

        {resp!==null && (
          <button onClick={proxQ} disabled={saving} style={{
            display:"block",width:"100%",marginTop:14,padding:"14px",
            background:"linear-gradient(135deg,#22c55e,#facc15)",color:"#0a0a0a",
            fontWeight:1000,fontSize:14,border:"none",borderRadius:14,cursor:"pointer",
            opacity:saving?0.7:1,textTransform:"uppercase",
          }}>
            {saving?"Salvando...":idx<fila.length-1?"Próxima →":"Ver resultado"}
          </button>
        )}
      </div>
    </div>
  );
}
