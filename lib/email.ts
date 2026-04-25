import { Resend } from "resend";

const FROM = "Prepara Concursos <noreply@petrobras-prep.com.br>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from   : FROM,
    to,
    subject: "Bem-vindo ao Prepara Concursos!",
    html   : `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0f172a;color:#f8fafc;padding:2rem;border-radius:12px">
        <h1 style="color:#facc15">Olá, ${name}!</h1>
        <p>Sua conta no <strong>Prepara Concursos</strong> foi criada com sucesso.</p>
        <p>Acesse agora e teste 10 questões grátis. No Premium, você treina com mais de 500 questões estratégicas.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard"
           style="display:inline-block;background:#facc15;color:#0f172a;padding:.75rem 1.5rem;border-radius:8px;font-weight:700;text-decoration:none;margin-top:1rem">
          Ir para o Dashboard
        </a>
        <p style="color:#64748b;font-size:.8rem;margin-top:2rem">Prepara Concursos — não afiliado à Petrobras S.A.</p>
      </div>
    `,
  });
}

export async function sendReviewReminderEmail(to: string, name: string, qtd: number) {
  return getResend().emails.send({
    from   : FROM,
    to,
    subject: `Você tem ${qtd} questão(ões) para revisar hoje`,
    html   : `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0f172a;color:#f8fafc;padding:2rem;border-radius:12px">
        <h1 style="color:#facc15">${name}, não perca o ritmo!</h1>
        <p>Hoje você tem <strong>${qtd} questão(ões)</strong> agendada(s) pelo seu plano de revisão espaçada.</p>
        <p>Revisões curtas agora valem mais do que longas sessões na véspera.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard"
           style="display:inline-block;background:#facc15;color:#0f172a;padding:.75rem 1.5rem;border-radius:8px;font-weight:700;text-decoration:none;margin-top:1rem">
          Revisar agora
        </a>
        <p style="color:#64748b;font-size:.8rem;margin-top:2rem">Prepara Concursos — não afiliado à Petrobras S.A.</p>
      </div>
    `,
  });
}

export async function sendPremiumConfirmationEmail(to: string, name: string) {
  return getResend().emails.send({
    from   : FROM,
    to,
    subject: "Seja bem-vindo ao Premium!",
    html   : `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0f172a;color:#f8fafc;padding:2rem;border-radius:12px">
        <h1 style="color:#facc15">Parabéns, ${name}!</h1>
        <p>Sua assinatura <strong>Premium</strong> está ativa. Agora você tem acesso a:</p>
        <ul style="color:#cbd5e1;line-height:1.8">
          <li>Mais de 500 questões estratégicas</li>
          <li>Simulado cronometrado (100q / 4h)</li>
          <li>Revisão inteligente e dashboard</li>
        </ul>
        <a href="${process.env.NEXTAUTH_URL}/simulado"
           style="display:inline-block;background:#facc15;color:#0f172a;padding:.75rem 1.5rem;border-radius:8px;font-weight:700;text-decoration:none;margin-top:1rem">
          Fazer um Simulado
        </a>
        <p style="color:#64748b;font-size:.8rem;margin-top:2rem">Prepara Concursos — não afiliado à Petrobras S.A.</p>
      </div>
    `,
  });
}
