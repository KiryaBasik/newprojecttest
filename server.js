import fetch from "node-fetch";
import http from "http";
import fs from "fs";

const readEnvFile = () => {
  const env = {};
  try {
    const txt = fs.readFileSync(".env", "utf8");
    txt.split(/\r?\n/).forEach((line) => {
      const s = line.trim();
      if (!s || s.startsWith("#")) return;
      const i = s.indexOf("=");
      if (i === -1) return;
      const k = s.slice(0, i).trim();
      const v = s.slice(i + 1).trim();
      env[k] = v;
    });
  } catch {}
  return env;
};

const env = readEnvFile();

const BOT_TOKEN = process.env.BOT_TOKEN || env.BOT_TOKEN || "";
const CHAT_ID = process.env.CHAT_ID || env.CHAT_ID || "";
const PORT = Number(process.env.PORT || env.PORT || 3333);

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

const sendToTelegramHtml = async (html) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: html,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!r.ok) throw new Error("telegram_error");
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST" || req.url !== "/feedback") {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const data = JSON.parse(body || "{}");
      const message = String(data.message || "").trim();
      const page = String(data.page || "").trim();

      if (!message) {
        res.writeHead(400);
        res.end("Empty message");
        return;
      }

      const now = formatDT(new Date());

      const html =
        `<b>📝 Новое сообщение с сайта</b>\n` +
        `🕒 <b>Дата:</b> ${escapeHtml(now)}\n` +
        (page ? `🌐 <b>Страница:</b> ${escapeHtml(page)}\n` : "") +
        `\n<b>Сообщение:</b>\n<pre>${escapeHtml(message)}</pre>`;

      await sendToTelegramHtml(html);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch {
      res.writeHead(500);
      res.end("Server error");
    }
  });
});

if (!BOT_TOKEN || !CHAT_ID) {
  console.log("Нет BOT_TOKEN или CHAT_ID в .env");
}

server.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
