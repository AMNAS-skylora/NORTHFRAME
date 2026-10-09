import { storeEnquiry } from "@/lib/cms/enquiries";
import tls from "node:tls";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FIELD_LENGTH = 4000;

type ContactPayload = {
  services?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  projectDetails?: unknown;
  website?: unknown;
};

function cleanText(value: unknown, max = MAX_FIELD_LENGTH) {
  return typeof value === "string"
    ? value.replace(/\0/g, "").trim().slice(0, max)
    : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function encodeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function dotStuff(value: string) {
  return value
    .replace(/\r?\n/g, "\r\n")
    .replace(/^\./gm, "..");
}

function buildEmail({
  name,
  phone,
  email,
  projectDetails,
  services,
  sender,
  recipient,
}: {
  name: string;
  phone: string;
  email: string;
  projectDetails: string;
  services: string[];
  sender: string;
  recipient: string;
}) {
  const subject = `New NORTHFRAME enquiry — ${name}`;
  const submittedAt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email || "Not provided");
  const safeDetails = escapeHtml(projectDetails || "Not provided").replace(
    /\n/g,
    "<br />"
  );
  const safeServices = services.map(escapeHtml).join(", ");
  const safeSubmittedAt = escapeHtml(submittedAt);

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-collapse:collapse;">
            <tr>
              <td style="background:#05080b;padding:30px 32px;">
                <div style="font-size:12px;letter-spacing:2px;color:#1677ff;font-weight:700;">NORTHFRAME</div>
                <div style="margin-top:8px;font-size:27px;line-height:1.15;color:#ffffff;font-weight:700;">New website enquiry</div>
                <div style="margin-top:10px;font-size:13px;color:#a7a7a7;">${safeSubmittedAt}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 7px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#1677ff;">Client</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 24px;font-size:22px;font-weight:700;color:#111111;">${safeName}</td>
                  </tr>

                  <tr>
                    <td style="padding:18px 0 8px;border-top:1px solid #ececec;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#6b7280;">Selected services</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 24px;font-size:16px;line-height:1.6;color:#111111;">${safeServices}</td>
                  </tr>

                  <tr>
                    <td style="padding:18px 0 8px;border-top:1px solid #ececec;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#6b7280;">Contact details</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 7px;font-size:16px;color:#111111;"><strong>Phone:</strong> ${safePhone}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 24px;font-size:16px;color:#111111;"><strong>Email:</strong> ${safeEmail}</td>
                  </tr>

                  <tr>
                    <td style="padding:18px 0 8px;border-top:1px solid #ececec;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#6b7280;">Project details</td>
                  </tr>
                  <tr>
                    <td style="padding:0;font-size:16px;line-height:1.7;color:#333333;">${safeDetails}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#1677ff;padding:16px 32px;font-size:12px;color:#ffffff;">
                NORTHFRAME · Website contact enquiry
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "NORTHFRAME — New website enquiry",
    `Submitted: ${submittedAt}`,
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "Not provided"}`,
    `Services: ${services.join(", ")}`,
    "",
    "Project details:",
    projectDetails || "Not provided",
  ].join("\n");

  const boundary = `northframe-${Date.now()}`;
  const replyTo = email && isEmail(email) ? safeHeader(email) : sender;

  return [
    `From: NORTHFRAME Website <${safeHeader(sender)}>`,
    `To: ${safeHeader(recipient)}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <northframe-${Date.now()}@${safeHeader(sender).split("@")[1] || "localhost"}>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
  ].join("\r\n");
}

type SmtpReader = {
  next: () => Promise<{ code: number; message: string }>;
  dispose: () => void;
};

function createSmtpReader(socket: tls.TLSSocket): SmtpReader {
  let buffer = "";
  let currentLines: string[] = [];
  const queue: Array<{ code: number; message: string }> = [];
  const waiters: Array<
    (value: { code: number; message: string }) => void
  > = [];

  const flush = () => {
    let newlineIndex = buffer.indexOf("\r\n");

    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 2);

      if (line) {
        currentLines.push(line);

        if (/^\d{3} /.test(line)) {
          const code = Number(line.slice(0, 3));
          const response = {
            code,
            message: currentLines.join("\n"),
          };

          currentLines = [];

          const waiter = waiters.shift();
          if (waiter) {
            waiter(response);
          } else {
            queue.push(response);
          }
        }
      }

      newlineIndex = buffer.indexOf("\r\n");
    }
  };

  const onData = (chunk: Buffer) => {
    buffer += chunk.toString("utf8");
    flush();
  };

  socket.on("data", onData);

  return {
    next: () =>
      new Promise((resolve) => {
        const queued = queue.shift();
        if (queued) {
          resolve(queued);
          return;
        }
        waiters.push(resolve);
      }),
    dispose: () => {
      socket.off("data", onData);
    },
  };
}

async function sendSmtpCommand(
  socket: tls.TLSSocket,
  reader: SmtpReader,
  command: string,
  expectedCodes: number[]
) {
  socket.write(`${command}\r\n`);
  const response = await reader.next();

  if (!expectedCodes.includes(response.code)) {
    throw new Error(
      `SMTP command failed with status ${response.code}: ${response.message}`
    );
  }

  return response;
}

async function sendViaSmtp({
  rawMessage,
  sender,
  recipient,
}: {
  rawMessage: string;
  sender: string;
  recipient: string;
}) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = (process.env.SMTP_SECURE || "true").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_APP_PASSWORD;

  if (!user || !password) {
    throw new Error("SMTP credentials are not configured.");
  }

  if (!secure) {
    throw new Error(
      "This contact endpoint expects SMTP_SECURE=true with implicit TLS."
    );
  }

  await new Promise<void>((resolve, reject) => {
    const socket = tls.connect({
      host,
      port,
      servername: host,
      rejectUnauthorized: true,
    });

    const reader = createSmtpReader(socket);
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      reader.dispose();
      socket.destroy();

      if (error) reject(error);
      else resolve();
    };

    socket.setTimeout(15000, () => {
      finish(new Error("SMTP connection timed out."));
    });

    socket.once("error", (error) => finish(error));

    socket.once("secureConnect", async () => {
      try {
        const greeting = await reader.next();
        if (greeting.code !== 220) {
          throw new Error(`Unexpected SMTP greeting: ${greeting.message}`);
        }

        await sendSmtpCommand(socket, reader, "EHLO northframe.website", [250]);
        await sendSmtpCommand(socket, reader, "AUTH LOGIN", [334]);
        await sendSmtpCommand(
          socket,
          reader,
          Buffer.from(user, "utf8").toString("base64"),
          [334]
        );
        await sendSmtpCommand(
          socket,
          reader,
          Buffer.from(password, "utf8").toString("base64"),
          [235]
        );
        await sendSmtpCommand(
          socket,
          reader,
          `MAIL FROM:<${safeHeader(sender)}>`,
          [250]
        );
        await sendSmtpCommand(
          socket,
          reader,
          `RCPT TO:<${safeHeader(recipient)}>`,
          [250, 251]
        );
        await sendSmtpCommand(socket, reader, "DATA", [354]);

        socket.write(`${dotStuff(rawMessage)}\r\n.\r\n`);
        const sent = await reader.next();

        if (sent.code !== 250) {
          throw new Error(
            `SMTP message was not accepted: ${sent.message}`
          );
        }

        try {
          await sendSmtpCommand(socket, reader, "QUIT", [221]);
        } catch {
          // The message is already accepted; QUIT failure is non-fatal.
        }

        finish();
      } catch (error) {
        finish(
          error instanceof Error
            ? error
            : new Error("Unknown SMTP delivery error.")
        );
      }
    });
  });
}

export async function POST(request: Request) {
  let stored = false;
  try {
    const payload = (await request.json()) as ContactPayload;

    // Honeypot: silently accept bot submissions without sending mail.
    if (cleanText(payload.website, 200)) {
      return NextResponse.json({ ok: true });
    }

    const services = Array.isArray(payload.services)
      ? payload.services
          .filter((item): item is string => typeof item === "string")
          .map((item) => cleanText(item, 80))
          .filter(Boolean)
          .slice(0, 10)
      : [];

    const name = cleanText(payload.name, 120);
    const phone = cleanText(payload.phone, 40);
    const email = cleanText(payload.email, 180);
    const projectDetails = cleanText(payload.projectDetails, 4000);

    if (!name || !phone || services.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Please complete the required fields." },
        { status: 400 }
      );
    }

    if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    if (email && !isEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (process.env.MONGODB_URI) {
      await storeEnquiry({name,phone,email,projectDetails,services});
      stored = true;
    }
    const sender = cleanText(process.env.SMTP_USER, 180);
    const recipient = cleanText(process.env.CONTACT_TO_EMAIL, 180) || sender;

    if (!sender || !recipient || !isEmail(sender) || !isEmail(recipient)) {
      throw new Error("SMTP sender or contact recipient is not configured.");
    }

    const rawMessage = buildEmail({
      name,
      phone,
      email,
      projectDetails,
      services,
      sender,
      recipient,
    });

    await sendViaSmtp({
      rawMessage,
      sender,
      recipient,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (stored) {
      console.error("Enquiry saved; email notification unavailable.");
      return NextResponse.json({ ok: true });
    }
    console.error(
      "Contact SMTP error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not send your enquiry right now. Please try WhatsApp or email us directly.",
      },
      { status: 500 }
    );
  }
}
