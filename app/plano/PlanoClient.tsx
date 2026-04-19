"use client";
import { useState } from "react";

const PLANO_DEFAULT = [
  { dia:"Seg", foco:"Português + Raciocínio Lógico",  horas:3, cor:"#7eb8f7" },
  { dia:"Ter", foco:"Administração + Contabilidade",   horas:3, cor:"#f78b7e" },
  { dia:"Qua", foco:"Legislação + Petróleo",           horas:3, cor:"#7ef7a7" },
  { dia:"Qui", foco:"Informática + Inglês",            horas:2, cor:"#a78bfa" },
  { dia:"Sex", foco:"Revisão + Simulado Completo",     horas:4, cor:"#f5c842" },
  { dia:"Sáb", foco:"Questões anteriores + Erros",     horas:5, cor:"#7eb8f7" },
  { dia:"Dom", foco:"Revisão leve + Descanso",         horas:1, cor:"#ff8c42" },
];

export default function PlanoClient({ plan, userId }: { plan: any; userId: string }) {
  const config = plan?.config?.diasSemana ?? PLANO_DEFAULT;
  const meta   = plan?.config?.metaHorasSemana ?? 21;
  const totalHoras = config.reduce((s: number, d: any) => s + d.horas, 0);

  const C = { card:"rgba(255,255,255,0.035)", border:"rgba(255,255,255,0.07)",
    verde:"#00e5b4", amarelo:"#f5c842", texto:"#dde4ff", sub:"#7a82a8" };

  return (
    <div style={{ minHeight:"100vh",
      background:"radial-gradient(ellipse at 15% 40%,#041a2e 0%,#08080f 55%,#0a0a1a 100%)",
      color:C.texto, fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"20px 16px 100px" }}>
      <div style={{ maxWidth:720, margin:"0 auto" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:22,paddingBottom:14,borderBottom:`1px solid ${C.border}` }}>
          <a href="/dashboard" style={{ color:C.sub,fontSize:12,textDecoration:"none",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"5px 12px" }}>← Dashboard</a>
          <h1 style={{ flex:1,margin:0,fontSize:16,fontWeight:900,
            background:"linear-gradient(90deg,#00e5b4,#f5c842)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",textAlign:"center" }}>
            📅 Plano Semanal
          </h1>
        </div>

        {/* Meta */}
        <div style={{ background:"rgba(0,229,180,0.06)",border:"1px solid rgba(0,229,180,0.15)",borderRadius:14,padding:"14px 16px",marginBottom:18,display:"flex",gap:16,alignItems:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:26,fontWeight:900,color:C.verde }}>{totalHoras}h</div>
            <div style={{ fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:.5 }}>semana</div>
          </div>
          <div>
            <div style={{ fontSize:13,fontWeight:700 }}>🎯 Meta: {meta}h semanais</div>
            <div style={{ fontSize:11,color:C.sub,marginTop:2 }}>Ênfase: Administração e Controle · Petrobras 2026</div>
          </div>
        </div>

        {/* Cronograma */}
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px",marginBottom:16 }}>
          {config.map((d: any, i: number) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<config.length-1?`1px solid ${C.border}`:"none" }}>
              <div style={{ width:42,height:42,borderRadius:10,background:`${d.cor}18`,border:`1px solid ${d.cor}38`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:d.cor,flexShrink:0 }}>
                {d.dia}
              </div>
              <div style={{ flex:1,fontSize:13 }}>{d.foco}</div>
              <div style={{ background:`${d.cor}18`,border:`1px solid ${d.cor}38`,color:d.cor,
                padding:"3px 10px",borderRadius:99,fontSize:12,fontWeight:700,flexShrink:0 }}>
                {d.horas}h
              </div>
            </div>
          ))}
        </div>

        {/* Técnica Pomodoro */}
        <div style={{ background:"rgba(245,200,66,0.06)",border:"1px solid rgba(245,200,66,0.2)",borderRadius:14,padding:"14px 16px",marginBottom:12 }}>
          <div style={{ fontSize:12,fontWeight:700,color:C.amarelo,marginBottom:4 }}>⏱ Técnica Pomodoro</div>
          <div style={{ fontSize:12,color:"#f5e8a0",lineHeight:1.6 }}>
            Estude <strong>25 minutos</strong>, descanse <strong>5 minutos</strong>. A cada 4 ciclos, faça uma pausa de 20 minutos.
            Ideal para manter o foco e consolidar a memória de longo prazo.
          </div>
        </div>

        {/* Dica Cesgranrio */}
        <div style={{ background:"rgba(0,229,180,0.05)",border:"1px solid rgba(0,229,180,0.15)",borderRadius:14,padding:"14px 16px" }}>
          <div style={{ fontSize:12,fontWeight:700,color:C.verde,marginBottom:4 }}>💡 Dica para a Cesgranrio</div>
          <div style={{ fontSize:12,color:"#b0f0e8",lineHeight:1.6 }}>
            Português e Matemática representam <strong>40% da prova</strong>. Dominar essas disciplinas garante
            uma vantagem enorme. Aloque pelo menos 2× mais tempo para elas do que para as demais.
          </div>
        </div>
      </div>
    </div>
  );
}
