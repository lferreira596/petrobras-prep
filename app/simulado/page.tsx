"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TOTAL_SEGUNDOS = 4 * 60 * 60; // 4 horas

interface Question {
  id: string; area: string; enunciado: string;
  opcoes: string[]; correta: number; tipo: string; explicacao: string;
}

type Respostas = Record<string, number>;

function formatTime(seg: number) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function SimuladoPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(TOTAL_SEGUNDOS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STORAGE_KEY = "simulado_tempo";

  useEffect(() => {
    fetch("/api/simulado")
      .then((r) => {
        if (r.status === 403) { setForbidden(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setQuestions(data.questions);
        setLoading(false);
        const saved = localStorage.getItem(STORAGE_KEY);
        setTempoRestante(saved ? parseInt(saved) : TOTAL_SEGUNDOS);
      });
  }, []);

  useEffect(() => {
    if (loading || forbidden || finished) return;
    timerRef.current = setInterval(() => {
      setTempoRestante((prev) => {
        const next = prev - 1;
        localStorage.setItem(STORAGE_KEY, String(next));
        if (next <= 0) { clearInterval(timerRef.current!); setFinished(true); }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [loading, forbidden, finished]);

  const handleResponder = useCallback((qId: string, opcao: number) => {
    setRespostas((prev) => ({ ...prev, [qId]: opcao }));
  }, []);

  function handleFinish() {
    clearInterval(timerRef.current!);
    localStorage.removeItem(STORAGE_KEY);
    setFinished(true);
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0f172a", color:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center" }}>
      Carregando simulado...
    </div>
  );

  if (forbidden) return (
    <div style={{ minHeight:"100vh", background:"#0f172a", color:"#f8fafc", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.5rem" }}>
      <div style={{ fontSize:"3rem" }}>🔒</div>
      <h1 style={{ fontSize:"1.75rem", fontWeight:700 }}>Recurso Premium</h1>
      <p style={{ color:"#94a3b8" }}>O simulado cronometrado está disponível apenas no plano Premium.</p>
      <Link href="/upgrade" style={{ background:"#facc15", color:"#0f172a", padding:"0.75rem 2rem", borderRadius:8, fontWeight:700, textDecoration:"none" }}>
        Ver planos
      </Link>
    </div>
  );

  if (finished) {
    const acertos = questions.filter((q) => respostas[q.id] === q.correta).length;
    const total = questions.length;
    const pct = total > 0 ? Math.round((acertos / total) * 100) : 0;
    const AREAS_PT: Record<string,string> = { port:"Português",mat:"Matemática",info:"Informática",adm:"Administração",leg:"Legislação",pet:"Petróleo",ing:"Inglês",con:"Contabilidade" };

    const porArea: Record<string,{acertos:number;total:number}> = {};
    for (const q of questions) {
      if (!porArea[q.area]) porArea[q.area] = { acertos:0, total:0 };
      porArea[q.area].total++;
      if (respostas[q.id] === q.correta) porArea[q.area].acertos++;
    }

    return (
      <main style={{ minHeight:"100vh", background:"#0f172a", color:"#f8fafc", padding:"2rem 1rem" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <h1 style={{ fontSize:"2rem", fontWeight:700, marginBottom:"0.5rem" }}>Resultado do Simulado</h1>
          <p style={{ color:"#94a3b8", marginBottom:"2rem" }}>Você acertou <strong style={{ color: pct >= 60 ? "#22c55e" : "#ef4444" }}>{acertos}/{total} ({pct}%)</strong></p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"1rem", marginBottom:"2rem" }}>
            {Object.entries(porArea).map(([area, stat]) => (
              <div key={area} style={{ background:"#1e293b", borderRadius:12, padding:"1rem", border:"1px solid #334155" }}>
                <p style={{ color:"#64748b", fontSize:"0.8rem", marginBottom:"0.25rem" }}>{AREAS_PT[area] ?? area}</p>
                <p style={{ fontSize:"1.5rem", fontWeight:700, color: stat.acertos/stat.total >= 0.6 ? "#22c55e" : "#ef4444" }}>
                  {stat.acertos}/{stat.total}
                </p>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:"1rem" }}>
            <Link href="/dashboard" style={{ background:"#1e293b", color:"#f8fafc", padding:"0.75rem 1.5rem", borderRadius:8, textDecoration:"none" }}>
              Dashboard
            </Link>
            <button onClick={() => { setFinished(false); setRespostas({}); setCurrent(0); setTempoRestante(TOTAL_SEGUNDOS); }} style={{ background:"#facc15", color:"#0f172a", padding:"0.75rem 1.5rem", borderRadius:8, border:"none", fontWeight:700, cursor:"pointer" }}>
              Novo Simulado
            </button>
          </div>
        </div>
      </main>
    );
  }

  const q = questions[current];

  return (
    <main style={{ minHeight:"100vh", background:"#0f172a", color:"#f8fafc", padding:"1rem" }}>
      {/* Header */}
      <div style={{ maxWidth:900, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", padding:"0.75rem 1rem", background:"#1e293b", borderRadius:12 }}>
        <span style={{ fontWeight:700 }}>Simulado Petrobras — {current+1}/{questions.length}</span>
        <span style={{ fontFamily:"monospace", fontSize:"1.25rem", color: tempoRestante < 600 ? "#ef4444" : "#22c55e", fontWeight:700 }}>
          ⏱ {formatTime(tempoRestante)}
        </span>
        <button onClick={handleFinish} style={{ background:"#ef4444", color:"#fff", border:"none", borderRadius:8, padding:"0.4rem 1rem", cursor:"pointer" }}>
          Finalizar
        </button>
      </div>

      {/* Questão */}
      <div style={{ maxWidth:900, margin:"0 auto", background:"#1e293b", borderRadius:16, padding:"1.5rem" }}>
        <p style={{ color:"#64748b", fontSize:"0.8rem", marginBottom:"0.75rem" }}>Questão {current+1}</p>
        <p style={{ fontSize:"1rem", lineHeight:1.7, marginBottom:"1.5rem" }}>{q.enunciado}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
          {q.opcoes.map((op, i) => {
            const selected = respostas[q.id] === i;
            return (
              <button key={i} onClick={() => handleResponder(q.id, i)}
                style={{ textAlign:"left", padding:"0.75rem 1rem", borderRadius:8, border:`1px solid ${selected ? "#facc15" : "#334155"}`, background: selected ? "#2d2a00" : "transparent", color:"#f8fafc", cursor:"pointer", fontSize:"0.95rem" }}>
                <span style={{ color: selected ? "#facc15" : "#64748b", marginRight:"0.5rem" }}>{String.fromCharCode(65+i)})</span>
                {op}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navegação */}
      <div style={{ maxWidth:900, margin:"1rem auto", display:"flex", justifyContent:"space-between" }}>
        <button onClick={() => setCurrent((c) => Math.max(0, c-1))} disabled={current === 0}
          style={{ background:"#1e293b", color:"#f8fafc", border:"1px solid #334155", borderRadius:8, padding:"0.5rem 1.25rem", cursor: current===0 ? "not-allowed" : "pointer", opacity: current===0 ? 0.4 : 1 }}>
          ← Anterior
        </button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c+1)}
            style={{ background:"#facc15", color:"#0f172a", border:"none", borderRadius:8, padding:"0.5rem 1.25rem", fontWeight:700, cursor:"pointer" }}>
            Próxima →
          </button>
        ) : (
          <button onClick={handleFinish}
            style={{ background:"#22c55e", color:"#0f172a", border:"none", borderRadius:8, padding:"0.5rem 1.25rem", fontWeight:700, cursor:"pointer" }}>
            Finalizar ✓
          </button>
        )}
      </div>
    </main>
  );
}
