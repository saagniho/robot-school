/**
 * The diploma mail room — two independent, no-backend channels (DESIGN.md §8):
 *
 *  - captureParentEmail → the existing Formspree form (emails the builder),
 *    so the grown-up's address is never lost even while the second channel
 *    is still being set up.
 *  - sendDiplomaEmail → EmailJS's public REST API, which mails the diploma
 *    link straight to the grown-up. OFF until the EMAILJS_* ids below are
 *    filled in. Setup (free, ~5 min at emailjs.com): add an email service,
 *    create a template whose "To email" is {{to_email}} and whose body uses
 *    {{teacher}}, {{robot}} and {{diploma_url}}, then paste the three ids.
 *
 * Every id here is a public client-side identifier — no secrets in this file.
 * Per DESIGN.md §8 this address must always belong to a GROWN-UP, never the kid.
 */

const FORMSPREE_ENDPOINT = "https://formspree.io/f/meebwzno";

const EMAILJS_SERVICE_ID = "";
const EMAILJS_TEMPLATE_ID = "";
const EMAILJS_PUBLIC_KEY = "";

export const EMAILJS_READY = Boolean(
  EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY,
);

export type DiplomaMail = {
  parentEmail: string;
  teacher: string;
  robot: string;
  diplomaUrl: string;
};

/** Tell the builder a diploma went home, and to whom. Best-effort. */
export async function captureParentEmail(mail: DiplomaMail): Promise<boolean> {
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        form: "diploma",
        parentEmail: mail.parentEmail,
        teacher: mail.teacher,
        robot: mail.robot,
        diplomaUrl: mail.diplomaUrl,
        at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Mail the diploma link to the grown-up. False while EmailJS is unconfigured. */
export async function sendDiplomaEmail(mail: DiplomaMail): Promise<boolean> {
  if (!EMAILJS_READY) return false;
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: mail.parentEmail,
          teacher: mail.teacher,
          robot: mail.robot,
          diploma_url: mail.diplomaUrl,
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
