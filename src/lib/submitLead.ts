// Envío de la solicitud de presupuesto.
// Para conectarlo con un CRM (n8n, GoHighLevel, Clientify…) añade en .env:
//   VITE_LEAD_WEBHOOK_URL=https://tu-webhook
// Se envía un POST con JSON. Si la variable no existe, se simula el envío (útil para la demo).

export type Lead = Record<string, string>

export async function submitLead(lead: Lead): Promise<{ ok: boolean; simulated: boolean }> {
  const url = import.meta.env.VITE_LEAD_WEBHOOK_URL as string | undefined
  const payload = { ...lead, enviado_en: new Date().toISOString(), origen: 'web-3d-tcr-area' }
  if (!url) {
    await new Promise((r) => setTimeout(r, 700))
    if (import.meta.env.DEV) console.info('[submitLead] simulado (sin VITE_LEAD_WEBHOOK_URL)', payload)
    return { ok: true, simulated: true }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Webhook ${res.status}`)
  return { ok: true, simulated: false }
}
