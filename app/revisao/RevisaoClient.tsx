"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Question = { id:string; area:string; sub:string; banca:string; ano:number; dif:string; tipo:string; enunciado:string; opcoes:string[]; correta:number; explicacao:string };
type ErrosMap = Record<string, { erros:number; tentativas:number }>;

const DIF_COR:Record<string,string> = { facil:"#4ade80", media:"#facc15", dificil:"#f87171" };
const DIF_LABEL:Record<string,string> = { facil:"Fácil", media:"Médio", dificil:"Difícil" };
const AREA_INFO:Record<string,{label:string;emoji:string;cor:string}> = {
  port:{label:"Português",emoji:"📝",cor:"#7eb8f7"},mat:{label:"Mat./Lógica",emoji:"🔢",cor:"#f7d07e"},
  info:{label:"Informática",emoji:"💻",cor:"#a78bfa"},adm:{label:"Administração",emoji:"📊",cor:"#f78b7e"},
  leg:{label:"Legislação",emoji:"⚖️",cor:"#7ef7a7"},pet:{label:"Petróleo",emoji:"🛢️",cor:"#f7a77e"},
  ing:{label:"Inglês",emoji:"🌐",cor:"#7ef7f0"},con:{label:"Contabilidade",emoji:"🏦",cor:"#f77eb8"},
};
function shuffle<T>(arr:T[]): T[] { return [...arr].sort(()=>Math.random()-0.5); }

export default function RevisaoClient({ questions, errosMap, userId }:
  { questions:Question[]; errosMap:ErrosMap; userId:string }) {

  const router = useRouter();
  const [fila] = useState<Question[]>(()=>shuffle(questions));
  const [idx, setIdx]           = useState(0);
  const [resp, setResp]         = useState<number|null>(null);
  const [mostraExp, setMostraExp] = useState(false);
  const [placar, setPlacar]     = useState({ac:0,er:0});
  const [tempoQ, setTempoQ]     = useState(0);
  const [saving, setSaving]     = useState(false);
  const [sessionStart]          = useState(Date.now());
  const timerRef                = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(()=>{
    if(resp!==null){ clearInterval(timerRef.current!); return; }
    setTempoQ(0);
    clearInterval(timerRef.current!);
    timerRef.current = setInterval(()=>setTempoQ(t=>t+1),1000);
    return ()=>clearInterval(timerRef.current!);
  },[idx,resp]);

  const q   = fila[idx];
  const ai  = AREA_INFO[q?.area] ?? { label: q?.area, emoji:"📋", cor:"#e2e8ff" };
  const pct = Math.round(((idx+(mostraExp?1:0))/fila.length)*100);
  const isCE = q?.tipo === "certo_errado";
  const eInfo = errosMap[q?.id];

  const C = { card:"rgba(255,255,255,0.035)", border:"rgba(255,255,255,0.07)",
    verde:"#00e5b4", amarelo:"#f5c842", vermelho:"#ff5050", texto:"#dde4ff", sub:"#7a82a8" };

  const responder = async (opcaoIdx:number)=>{
    if(resp!==null||!q) return;
    clearInterval(timerRef.current!);
    const acertou = opcaoIdx === q.correta;
    setResp(opcaoIdx); setMostraExp(true);
    setPlacar(p=>({ac:p.ac+(acertou?1:0), er:p.er+(acertou?0:1)}));

    setSaving(true);
    try {
      await fetch("/api/progress", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ questionId: q.id, acertou }),
      });
    } finally { setSaving(false); }
  };

  const proxQ = async ()=>{
    if(idx < fila.length-1){
      setIdx(i=>i+1); setResp(null); setMostraExp(false);
    } else {
      const areas = Array.from(new Set(fila.map(q=>q.area)));
      const finalAcertos = placar.ac + (resp===q.correta?1:0);
      await fetch("/api/sessions",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          modo:"revisao", total:fila.length,
          acertos: finalAcertos, erros: fila.length-finalAcertos,
          duracaoSeg: Math.round((Date.now()-sessionStart)/1000), areas,
        }),
      });
      router.push(`/dashboard?revisao=1&acertos=${finalAcertos}&total=${fila.length}`);
    }
  };

  if(!q) return null;

  return (
    <div style={{minHeight:"100vh",
      background:"radial-gradient(ellipse at 15% 40%,#1a0408 0%,#08080f 55%,#0a080a 100%)",
      color:C.texto,fontFamily:"'Segoe UI',system-ui,sans-serif",padding:"18px 16px 90px"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>

        {/* Header revisão */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,paddingBottom:12,borderBottom:"1px solid rgba(255,80,80,0.15)"}}>
          <a href="/dashboard" style={{color:"#ff7070",fontSize:12,textDecoration:"none",background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:10,padding:"5px 12px"}}>← Dashboard</a>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
            <span style={{fontSize:14,fontWeight:800,color:"#ff7070"}}>🔁 Modo Revisão</span>
          </div>
          <span style={{fontSize:12,color:"#7a82a8"}}>✅{placar.ac} ❌{placar.er}</span>
        </div>

        {/* Barra laranja */}
        <div style={{height:4,background:"rgba(255,80,80,0.15)",borderRadius:99,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#ff5050,#ff8c42)",borderRadius:99,transition:"width .4s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#7a82a8",marginBottom:14,flexWrap:"wrap",gap:4}}>
          <span>{idx+1}/{fila.length}</span>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <span style={{background:`${ai.cor}20`,border:`1px solid ${ai.cor}40`,color:ai.cor,padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{ai.emoji} {ai.label}</span>
            <span style={{background:`${DIF_COR[q.dif]}20`,border:`1px solid ${DIF_COR[q.dif]}40`,color:DIF_COR[q.dif],padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{DIF_LABEL[q.dif]}</span>
          </div>
          <span>⏱ {tempoQ}s</span>
        </div>

        {/* Badge de erros anteriores */}
        <div style={{background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:10,padding:"9px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center",fontSize:12}}>
          <span>🔁</span>
          <span style={{color:"#ff9090"}}>
            Você errou esta questão <strong>{eInfo?.erros??0}x</strong> — {eInfo?.tentativas??0} tentativa(s) no total
          </span>
        </div>

        <div style={{fontSize:11,color:"#7a82a8",fontStyle:"italic",marginBottom:8}}>📌 {q.sub}</div>

        {/* Enunciado */}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,80,80,0.1)",borderRadius:14,padding:"15px",marginBottom:14,fontSize:14,lineHeight:1.65,color:C.texto}}>
          {q.enunciado}
        </div>

        {/* Opções */}
        {q.opcoes.map((op,i)=>{
          let bg=C.card,border=C.border,txtC=C.texto;
          if(resp!==null){
            if(i===q.correta){bg="rgba(0,229,180,0.12)";border="#00e5b488";txtC="#00e5b4";}
            else if(i===resp){bg="rgba(255,80,80,0.12)";border="#ff505088";txtC="#ff8080";}
          }
          return(
            <div key={i} onClick={()=>responder(i)} style={{
              display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",
              borderRadius:12,marginBottom:8,background:bg,border:`1px solid ${border}`,
              color:txtC,cursor:resp===null?"pointer":"default",transition:"all .15s",fontSize:13,lineHeight:1.5,
            }}>
              <div style={{
                width:24,height:24,borderRadius:7,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,
                background:resp===null?"rgba(255,255,255,0.08)":i===q.correta?"#00e5b4":i===resp?"#ff5050":"rgba(255,255,255,0.06)",
                color:(resp!==null&&(i===q.correta||i===resp))?"#08080f":"#7a82a8",
              }}>
                {resp!==null&&i===q.correta?"✓":resp!==null&&i===resp?"✗":isCE?(i===0?"C":"E"):String.fromCharCode(65+i)}
              </div>
              <span>{op}</span>
            </div>
          );
        })}

        {/* Explicação */}
        {mostraExp && (
          <div style={{
            background:resp===q.correta?"rgba(0,229,180,0.06)":"rgba(255,140,66,0.07)",
            border:`1px solid ${resp===q.correta?"rgba(0,229,180,0.22)":"rgba(255,140,66,0.25)"}`,
            borderRadius:12,padding:"14px",marginTop:8,
            fontSize:12,color:resp===q.correta?"#a0f0df":"#f5e0a0",lineHeight:1.65,
          }}>
            <div style={{fontWeight:700,marginBottom:4}}>
              {resp===q.correta?"✅ Correto! Erro removido da fila ✨":"❌ Incorreto — vamos tentar de novo em breve"}
            </div>
            {q.explicacao}
          </div>
        )}

        {resp!==null && (
          <button onClick={proxQ} disabled={saving} style={{
            display:"block",width:"100%",marginTop:14,padding:"14px",
            background:"linear-gradient(135deg,#ff5050,#ff8c42)",color:"#fff",
            fontWeight:900,fontSize:14,border:"none",borderRadius:14,cursor:"pointer",
            opacity:saving?0.7:1,
          }}>
            {saving?"Salvando...":idx<fila.length-1?"Próxima →":"Concluir Revisão 🏆"}
          </button>
        )}
      </div>
    </div>
  );
}
