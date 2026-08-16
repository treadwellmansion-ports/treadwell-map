import { Resend } from "resend";
import type { Recommendation } from "./types";
import { TREADWELL_ORIGIN } from "./constants";

export type CartRecommendation = Pick<Recommendation, "id" | "name" | "address" | "phone">;

const FROM = process.env.CART_FROM_EMAIL || "onboarding@resend.dev";
const NOTIFICATION_EMAIL = process.env.CART_NOTIFICATION_EMAIL;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function recommendationListHtml(recommendations: CartRecommendation[]) {
  return recommendations
    .map(
      (r) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #E9D8B5;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:bold;color:#1B1408;">${escapeHtml(r.name)}</div>
            <div style="font-size:14px;color:#4A3B2A;margin-top:2px;">${escapeHtml(r.address)}</div>
            ${r.phone ? `<div style="font-size:13px;color:#6b5636;margin-top:2px;">${escapeHtml(r.phone)}</div>` : ""}
          </td>
        </tr>`
    )
    .join("");
}

function wrapEmailHtml(title: string, bodyHtml: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#F0E2C7;padding:24px;">
      <div style="max-width:520px;margin:0 auto;background:#FBF6EA;border-radius:12px;padding:28px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:0.15em;color:#A98235;text-transform:uppercase;">
          The Treadwell Mansion
        </div>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1B1408;margin:8px 0 20px;">
          ${escapeHtml(title)}
        </h1>
        ${bodyHtml}
      </div>
    </div>`;
}

export async function sendCartEmails({
  guestEmail,
  guestName,
  deliveryMethod,
  recommendations,
}: {
  guestEmail: string;
  guestName: string | null;
  deliveryMethod: "email" | "sms";
  recommendations: CartRecommendation[];
}): Promise<{ guestSent: boolean; ownerSent: boolean }> {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("Email sending isn't configured yet -- ask the front desk to set up RESEND_API_KEY.");
  }

  const greeting = guestName ? `Hi ${escapeHtml(guestName)},` : "Hi there,";
  const guestHtml = wrapEmailHtml(
    "Your Portsmouth Picks",
    `
      <p style="font-size:15px;color:#4A3B2A;line-height:1.5;">${greeting}</p>
      <p style="font-size:15px;color:#4A3B2A;line-height:1.5;">
        Here's the list you put together while exploring the map at ${escapeHtml(TREADWELL_ORIGIN.name)}.
        Tap an address to get directions.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        ${recommendationListHtml(recommendations)}
      </table>
      <p style="font-size:13px;color:#6b5636;margin-top:20px;">
        Enjoy Portsmouth! -- ${escapeHtml(TREADWELL_ORIGIN.name)}
      </p>
    `
  );

  const { error: guestError } = await resend.emails.send({
    from: FROM,
    to: guestEmail,
    subject: "Your Treadwell Mansion picks",
    html: guestHtml,
  });

  let ownerSent = false;
  if (NOTIFICATION_EMAIL) {
    const ownerHtml = wrapEmailHtml(
      "Guest Cart Submission",
      `
        <p style="font-size:15px;color:#4A3B2A;line-height:1.5;">
          A guest sent themselves a list of ${recommendations.length} recommendation${recommendations.length === 1 ? "" : "s"}.
        </p>
        <p style="font-size:14px;color:#4A3B2A;">
          <strong>From:</strong> ${escapeHtml(guestName || "(no name given)")} &lt;${escapeHtml(guestEmail)}&gt;<br/>
          <strong>Sent via:</strong> ${escapeHtml(deliveryMethod)}
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          ${recommendationListHtml(recommendations)}
        </table>
      `
    );

    const { error: ownerError } = await resend.emails.send({
      from: FROM,
      to: NOTIFICATION_EMAIL,
      subject: `Guest cart: ${recommendations.length} pick${recommendations.length === 1 ? "" : "s"} sent via ${deliveryMethod}`,
      html: ownerHtml,
    });
    ownerSent = !ownerError;
  }

  return { guestSent: !guestError, ownerSent };
}
