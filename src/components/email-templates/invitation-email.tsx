function escapeHtml(str: string) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });
}

export function buildInviteEmailHtml({
  inviteLink,
  invitedByName,
  businessName,
  previewText = `Join ${businessName} on Dukora`,
}: {
  inviteLink: string;
  invitedByName: string;
  businessName: string;
  previewText?: string;
}): string {
  const invitedEsc = escapeHtml(invitedByName);
  const businessEsc = escapeHtml(businessName);
  const inviteEsc = escapeHtml(inviteLink);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Join ${businessEsc} on Dukora</title>
  <style>
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse: collapse; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    a { color: inherit; text-decoration: none; }
    @media screen and (max-width:600px) {
      .container { width:100% !important; padding:16px !important; }
      .content { font-size:15px !important; line-height:22px !important; }
    }
  </style>
</head>
<body style="background-color:#ffffff; margin:0; padding:0;">

  <span style="display:none; max-height:0px; overflow:hidden; mso-hide:all;">
    ${escapeHtml(previewText)}
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" aria-hidden="false">
    <tr>
      <td align="center" style="padding:24px;">
        <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px; max-width:600px; border:1px solid #eaeaea; border-radius:8px; padding:32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background:#ffffff;">
          <tr>
            <td style="text-align:left;">
              <h1 style="margin:0 0 24px 0; font-size:22px; font-weight:600; color:#111;">
                Join <span style="font-weight:700;">${businessEsc}</span> on <span style="font-weight:700;">Dukora</span>
              </h1>

              <p class="content" style="margin:0 0 16px 0; color:#111; font-size:16px; line-height:24px;">
                Hello,
              </p>

              <p class="content" style="margin:0 0 16px 0; color:#111; font-size:16px; line-height:24px;">
                You’ve been invited by <strong>${invitedEsc}</strong> to join their business, <strong>${businessEsc}</strong>, on Dukora.
              </p>

              <p class="content" style="margin:0 0 24px 0; color:#111; font-size:16px; line-height:24px;">
                To accept the invitation, click the button below:
              </p>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${inviteEsc}" target="_blank" style="display:inline-block; padding:12px 20px; border-radius:6px; background:#2563eb; color:#ffffff; font-weight:600; font-size:16px;">
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px 0; color:#111; font-size:14px; line-height:20px;">
                Or open this link: <br/>
                <a href="${inviteEsc}" style="color:#2563eb; word-break:break-all;">${inviteEsc}</a>
              </p>

              <p style="margin:0 0 8px 0; color:#777; font-size:14px; line-height:20px;">
                If you didn't expect this invitation, you can ignore this email.
              </p>

              <p style="margin:20px 0 0 0; color:#111; font-size:14px; line-height:20px;">
                Best regards,<br/>
                The Dukora Team
              </p>

            </td>
          </tr>
        </table>

        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; margin-top:12px;">
          <tr>
            <td style="text-align:center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#999; font-size:12px;">
              Dukora — <span style="color:#999">Your company name / address here</span>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

export function buildInviteEmailText({
  inviteLink,
  invitedByName,
  businessName,
}: {
  inviteLink: string;
  invitedByName: string;
  businessName: string;
}) {
  return `Join ${businessName} on Dukora

Hello,

You've been invited by ${invitedByName} to join their business, ${businessName}, on Dukora.

Accept the invite: ${inviteLink}

If you didn't expect this, ignore this email.

Best regards,
The Dukora Team`;
}
