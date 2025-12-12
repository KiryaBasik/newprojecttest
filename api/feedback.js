const escapeHtml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const pad2 = (n) => String(n).padStart(2, "0");
const formatDT = (d) => {
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
};

const readJson = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
    return;
  }

  const BOT_TOKEN = process.env.BOT_TOKEN || "";
  const CHAT_ID = process.env.CHAT_ID || "";

  if (!BOT_TOKEN || !CHAT_ID) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "missing_env" }));
    return;
  }

  try {
    const data = await readJson(req);
    const message = String(data.message || "").trim();
    const page = String(data.page || "").trim();

    if (!message) {
      res.statusCode = 400;
      res.end("Empty message");
      return;
    }

    const now = formatDT(new Date());

    const html =
      `<b>📝 Новое сообщение с сайта</b>\n` +
      `🕒 <b>Дата:</b> ${escapeHtml(now)}\n` +
      (page ? `🌐 <b>Страница:</b> ${escapeHtml(page)}\n` : "") +
      `\n<b>Сообщение:</b>\n<pre>${escapeHtml(message)}</pre>`;

    const tg = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: html,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!tg.ok) {
      const text = await tg.text().catch(() => "");
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ ok: false, error: "telegram_error", details: text })
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch {
    res.statusCode = 500;
    res.end("Server error");
  }
}
