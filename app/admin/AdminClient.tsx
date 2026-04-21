"use client";
import { useEffect, useState } from "react";

const AREAS: Record<string,string> = { port:"Português",mat:"Matemática",info:"Informática",adm:"Administração",leg:"Legislação",pet:"Petróleo",ing:"Inglês",con:"Contabilidade" };

interface Question {
  id:string; area:string; banca:string; ano:number; dif:string; enunciado:string;
  isPremium:boolean; ativa:boolean;
}

export default function AdminClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/questions");
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePremium(q: Question) {
    await fetch("/api/admin/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id, isPremium: !q.isPremium }),
    });
    load();
  }

  async function toggleAtiva(q: Question) {
    await fetch("/api/admin/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id, ativa: !q.ativa }),
    });
    load();
  }

  const filtered = filter === "all" ? questions : filter === "premium" ? questions.filter(q => q.isPremium) : questions.filter(q => !q.isPremium);

  return (
    <main style={{ minHeight:"100vh", background:"#0f172a", color:"#f8fafc", padding:"2rem 1rem" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
          <h1 style={{ fontSize:"1.75rem", fontWeight:700 }}>Admin — Questões</h1>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            {["all","free","premium"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"0.4rem 0.9rem", borderRadius:8, border:"1px solid #334155", background: filter===f ? "#facc15" : "transparent", color: filter===f ? "#0f172a" : "#94a3b8", cursor:"pointer", fontWeight: filter===f ? 700 : 400 }}>
                {f === "all" ? "Todas" : f === "premium" ? "Premium" : "Grátis"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ color:"#64748b", marginBottom:"1rem" }}>{filtered.length} questões</div>

        {loading ? (
          <p style={{ color:"#64748b" }}>Carregando...</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {filtered.map(q => (
              <div key={q.id} style={{ background:"#1e293b", borderRadius:12, padding:"1rem 1.25rem", border:"1px solid #334155", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.4rem", flexWrap:"wrap" }}>
                    <span style={{ background:"#0f172a", color:"#94a3b8", fontSize:"0.75rem", padding:"0.1rem 0.5rem", borderRadius:6 }}>{AREAS[q.area] ?? q.area}</span>
                    <span style={{ background:"#0f172a", color:"#94a3b8", fontSize:"0.75rem", padding:"0.1rem 0.5rem", borderRadius:6 }}>{q.banca}</span>
                    <span style={{ background:"#0f172a", color:"#94a3b8", fontSize:"0.75rem", padding:"0.1rem 0.5rem", borderRadius:6 }}>{q.ano}</span>
                    {q.isPremium && <span style={{ background:"#92400e", color:"#facc15", fontSize:"0.75rem", padding:"0.1rem 0.5rem", borderRadius:6 }}>★ Premium</span>}
                    {!q.ativa && <span style={{ background:"#450a0a", color:"#fca5a5", fontSize:"0.75rem", padding:"0.1rem 0.5rem", borderRadius:6 }}>Inativa</span>}
                  </div>
                  <p style={{ fontSize:"0.9rem", color:"#cbd5e1", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{q.enunciado}</p>
                </div>
                <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
                  <button onClick={() => togglePremium(q)}
                    style={{ padding:"0.35rem 0.75rem", borderRadius:8, border:"1px solid #334155", background:"transparent", color: q.isPremium ? "#facc15" : "#64748b", cursor:"pointer", fontSize:"0.8rem" }}>
                    {q.isPremium ? "★ Premium" : "☆ Free"}
                  </button>
                  <button onClick={() => toggleAtiva(q)}
                    style={{ padding:"0.35rem 0.75rem", borderRadius:8, border:"1px solid #334155", background:"transparent", color: q.ativa ? "#22c55e" : "#ef4444", cursor:"pointer", fontSize:"0.8rem" }}>
                    {q.ativa ? "Ativa" : "Inativa"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
