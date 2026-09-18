/** Verified Resend sending domain (Hostinger subdomain). Override with RESEND_FROM_EMAIL in Vercel if needed. */
const DEFAULT_RESEND_FROM = "Shah Foladi <bookings@send.shahfoladi.com>";

export function getResendFromAddress() {
  return (process.env.RESEND_FROM_EMAIL || DEFAULT_RESEND_FROM).trim();
}
