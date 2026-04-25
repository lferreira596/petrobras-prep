import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

function getMp() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
}

export const PRECO = 9.90;

export async function createCheckout(payerEmail: string, userId: string) {
  const preference = new Preference(getMp());
  return preference.create({
    body: {
      items: [{
        id          : "premium-30d",
        title       : "Prepara Concursos Premium — 30 dias",
        unit_price  : PRECO,
        quantity    : 1,
        currency_id : "BRL",
      }],
      payer            : { email: payerEmail },
      external_reference: userId,
      back_urls        : {
        success : `${process.env.NEXTAUTH_URL}/upgrade/sucesso`,
        failure : `${process.env.NEXTAUTH_URL}/upgrade`,
        pending : `${process.env.NEXTAUTH_URL}/upgrade/sucesso`,
      },
      auto_return      : "approved",
      statement_descriptor: "PREPARA CONC",
    },
  });
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(getMp());
  return payment.get({ id: paymentId });
}
