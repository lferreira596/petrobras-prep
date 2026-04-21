import { MercadoPagoConfig, PreApproval, PreApprovalPlan } from "mercadopago";

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const PLAN_ID = process.env.MP_PLAN_ID!; // ID do plano de assinatura criado no MP

export async function createSubscription(payerEmail: string, userId: string) {
  const preApproval = new PreApproval(mp);
  return preApproval.create({
    body: {
      preapproval_plan_id : PLAN_ID,
      payer_email         : payerEmail,
      external_reference  : userId,
      back_url            : `${process.env.NEXTAUTH_URL}/upgrade/sucesso`,
    },
  });
}

export async function getSubscription(subscriptionId: string) {
  const preApproval = new PreApproval(mp);
  return preApproval.get({ id: subscriptionId });
}

export async function cancelSubscription(subscriptionId: string) {
  const preApproval = new PreApproval(mp);
  return preApproval.update({
    id  : subscriptionId,
    body: { status: "cancelled" },
  });
}
