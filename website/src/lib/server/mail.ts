type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type MailProvider = {
  send(message: MailMessage): Promise<void>;
};

function requiredMailEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function fromAddress(): string {
  return requiredMailEnv("MAIL_FROM");
}

function resendProvider(): MailProvider {
  const apiKey = requiredMailEnv("RESEND_API_KEY");
  return {
    async send(message) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromAddress(), ...message }),
      });
      if (!response.ok) throw new Error(`Resend returned ${response.status}`);
    },
  };
}

function postmarkProvider(): MailProvider {
  const apiKey = requiredMailEnv("POSTMARK_SERVER_TOKEN");
  return {
    async send(message) {
      const response = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: { "X-Postmark-Server-Token": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          From: fromAddress(),
          To: message.to,
          Subject: message.subject,
          TextBody: message.text,
          HtmlBody: message.html,
          MessageStream: process.env.POSTMARK_MESSAGE_STREAM?.trim() || "outbound",
        }),
      });
      if (!response.ok) throw new Error(`Postmark returned ${response.status}`);
    },
  };
}

function provider(): MailProvider {
  switch (process.env.MAIL_PROVIDER?.trim().toLowerCase()) {
    case "resend":
      return resendProvider();
    case "postmark":
      return postmarkProvider();
    default:
      throw new Error("MAIL_PROVIDER must be resend or postmark");
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

/**
 * Sends only when explicitly enabled. Signup persistence never depends on email
 * provider availability; callers should log a rejected result and continue.
 */
export async function sendWaitlistEmails(input: {
  email: string;
  source: string | null;
  xUsername: string | null;
}): Promise<{ enabled: boolean; sent: number }> {
  if (process.env.WAITLIST_EMAIL_ENABLED !== "1") return { enabled: false, sent: 0 };

  const mailer = provider();
  const safeEmail = escapeHtml(input.email);
  const messages: MailMessage[] = [
    {
      to: input.email,
      subject: "You're on the SolWear waitlist",
      text: "You're on the SolWear waitlist. We'll email you when there is something worth sharing.",
      html: "<p>You're on the <strong>SolWear</strong> waitlist.</p><p>We'll email you when there is something worth sharing.</p>",
    },
  ];

  const adminEmail = process.env.WAITLIST_ADMIN_EMAIL?.trim();
  if (adminEmail) {
    const detail = `${input.source ?? "unknown"}${input.xUsername ? ` / @${input.xUsername}` : ""}`;
    messages.push({
      to: adminEmail,
      subject: "New SolWear waitlist signup",
      text: `New signup: ${input.email}\nSource: ${detail}`,
      html: `<p>New signup: <strong>${safeEmail}</strong></p><p>Source: ${escapeHtml(detail)}</p>`,
    });
  }

  const results = await Promise.allSettled(messages.map((message) => mailer.send(message)));
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length) throw new Error(`${failures.length} of ${messages.length} waitlist emails failed`);
  return { enabled: true, sent: messages.length };
}
