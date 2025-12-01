// index.js
require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const pino = require("pino")
const fs = require("fs").promises
const { google } = require("googleapis")
const OAuthStore = require("./oauth-store")
const EmailProcessor = require("./email-processor")

const logger = pino()

// env and defaults
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  GMAIL_API_SCOPES = "https://www.googleapis.com/auth/gmail.readonly",
  PORT = 3000,
  APP_BASE_URL = `http://localhost:${PORT}`,
  POLL_INTERVAL_SECONDS = 60,
  TOKEN_STORE = "file",
  TOKEN_STORE_FILE = "./.tokens.json",
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  SUPABASE_LOG_TABLE,
  ADMIN_JWT_SECRET = "change-me",
} = process.env

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !OAUTH_REDIRECT_URI) {
  logger.error("Missing Google OAuth configuration in environment variables. Aborting.")
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_REDIRECT_URI)

// token store
const tokenStore = new OAuthStore({
  mode: TOKEN_STORE,
  filePath: TOKEN_STORE_FILE,
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_SERVICE_KEY,
})

const emailProcessor = new EmailProcessor({
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_SERVICE_KEY,
  supabaseTable: SUPABASE_LOG_TABLE || "email_monitor",
})

const app = express()
app.use(bodyParser.json())

// Health
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }))

// Start OAuth flow
app.get("/auth", (req, res) => {
  const scopes = (GMAIL_API_SCOPES || "").split(/\s*,\s*|\s+/).filter(Boolean)
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  })
  res.redirect(url)
})

// OAuth callback
app.get("/oauth2/callback", async (req, res) => {
  try {
    const code = req.query.code
    if (!code) return res.status(400).send("Missing code parameter.")
    const { tokens } = await oauth2Client.getToken(code)
    await tokenStore.set("API.LIVE", tokens)
    res.send("OAuth success — tokens saved. You can close this window.")
    logger.info("Saved new tokens for API.LIVE")
  } catch (err) {
    logger.error({ err }, "OAuth callback error")
    res.status(500).send("OAuth error. Check server logs.")
  }
})

// Admin endpoint to clear tokens (protected by a simple JWT or secret header — keep it secure)
app.post("/admin/clear-tokens", async (req, res) => {
  const adminSecret = req.headers["x-admin-secret"]
  if (!adminSecret || adminSecret !== ADMIN_JWT_SECRET) return res.status(403).json({ error: "forbidden" })
  try {
    await tokenStore.delete("API.LIVE")
    return res.json({ ok: true })
  } catch (err) {
    logger.error({ err }, "error clearing tokens")
    return res.status(500).json({ error: "failed" })
  }
})

// Start server
const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server started")
  // start the poller once server is listening
  startPoller()
})

// Poller internals
let pollTimer = null
let isPolling = false

async function ensureCredentials() {
  const saved = await tokenStore.get("API.LIVE")
  if (!saved) return null
  oauth2Client.setCredentials(saved)
  // attach token change handler to persist refreshed tokens
  oauth2Client.on("tokens", async (tokens) => {
    logger.info("OAuth2 client issued new tokens — persisting")
    // Merge with existing stored token to keep refresh_token when absent
    const existing = (await tokenStore.get("API.LIVE")) || {}
    const merged = { ...existing, ...tokens }
    await tokenStore.set("API.LIVE", merged)
  })
  return oauth2Client
}

async function pollOnce() {
  if (isPolling) return
  isPolling = true
  try {
    const client = await ensureCredentials()
    if (!client) {
      logger.warn("No OAuth tokens found for API.LIVE — visit /auth to authorize")
      return
    }
    const gmail = google.gmail({ version: "v1", auth: client })

    // list messages (unread only) - use labelIds INBOX,UNREAD
    const res = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX", "UNREAD"],
      maxResults: parseInt(process.env.POLL_PAGE_SIZE || "50", 10),
    })

    const messages = res.data.messages || []
    if (messages.length === 0) {
      logger.info("No new messages found")
      return
    }

    logger.info({ count: messages.length }, "Found new message ids")

    for (const m of messages) {
      try {
        const normalized = await emailProcessor.normalizeMessage(m, gmail)
        // emit to event bus
        emailProcessor.emit("EMAIL_MONITOR", normalized)
        // mark as read? (optional) - COMMENTED OUT by default. If you want auto-ack, uncomment.
        /*
        await gmail.users.messages.modify({
          userId: 'me',
          id: m.id,
          requestBody: { removeLabelIds: ['UNREAD'] }
        });
        */
      } catch (err) {
        logger.error({ err, messageId: m.id }, "Error processing individual message")
      }
    }
  } catch (err) {
    logger.error({ err }, "Poller error")
  } finally {
    isPolling = false
  }
}

function startPoller() {
  const intervalMs = Math.max(10, Number(POLL_INTERVAL_SECONDS || 60)) * 1000
  // run immediately then schedule
  pollOnce()
  pollTimer = setInterval(() => {
    pollOnce()
  }, intervalMs)
}

// graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down")
  clearInterval(pollTimer)
  server.close(() => process.exit(0))
})
process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down")
  clearInterval(pollTimer)
  server.close(() => process.exit(0))
})
