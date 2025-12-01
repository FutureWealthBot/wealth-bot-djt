const EventEmitter = require("events")

/**
 * EmailProcessor - Handles email normalization and event emission
 */
class EmailProcessor extends EventEmitter {
  constructor(options = {}) {
    super()
    this.supabaseUrl = options.supabaseUrl
    this.supabaseKey = options.supabaseKey
    this.supabaseTable = options.supabaseTable || "email_monitor"
    this._supabaseClient = null
  }

  _getSupabaseClient() {
    if (!this._supabaseClient && this.supabaseUrl && this.supabaseKey) {
      const { createClient } = require("@supabase/supabase-js")
      this._supabaseClient = createClient(this.supabaseUrl, this.supabaseKey)
    }
    return this._supabaseClient
  }

  /**
   * Extract header value from message headers
   * @param {Array} headers - Array of header objects with name and value
   * @param {string} name - Header name to find
   * @returns {string|null} Header value or null
   */
  _getHeader(headers, name) {
    if (!headers) return null
    const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase())
    return header ? header.value : null
  }

  /**
   * Decode base64url encoded string
   * @param {string} data - Base64url encoded string
   * @returns {string} Decoded string
   */
  _decodeBase64url(data) {
    if (!data) return ""
    // Convert base64url to base64
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/")
    return Buffer.from(base64, "base64").toString("utf8")
  }

  /**
   * Extract body content from message parts
   * @param {Object} payload - Message payload
   * @returns {{text: string, html: string}} Body content
   */
  _extractBody(payload) {
    const result = { text: "", html: "" }

    if (!payload) return result

    // Simple message with body data
    if (payload.body && payload.body.data) {
      const decoded = this._decodeBase64url(payload.body.data)
      if (payload.mimeType === "text/plain") {
        result.text = decoded
      } else if (payload.mimeType === "text/html") {
        result.html = decoded
      }
      return result
    }

    // Multipart message
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          result.text = this._decodeBase64url(part.body.data)
        } else if (part.mimeType === "text/html" && part.body && part.body.data) {
          result.html = this._decodeBase64url(part.body.data)
        } else if (part.parts) {
          // Nested multipart
          const nested = this._extractBody(part)
          if (nested.text && !result.text) result.text = nested.text
          if (nested.html && !result.html) result.html = nested.html
        }
      }
    }

    return result
  }

  /**
   * Extract attachments info from message parts
   * @param {Object} payload - Message payload
   * @returns {Array} Attachment info array
   */
  _extractAttachments(payload) {
    const attachments = []

    if (!payload || !payload.parts) return attachments

    for (const part of payload.parts) {
      if (part.filename && part.filename.length > 0) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body?.size || 0,
          attachmentId: part.body?.attachmentId || null,
        })
      }
      // Check nested parts
      if (part.parts) {
        attachments.push(...this._extractAttachments(part))
      }
    }

    return attachments
  }

  /**
   * Normalize a Gmail message into a standard format
   * @param {Object} messageRef - Message reference with id and threadId
   * @param {Object} gmail - Gmail API client
   * @returns {Promise<Object>} Normalized message object
   */
  async normalizeMessage(messageRef, gmail) {
    // Fetch full message
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageRef.id,
      format: "full",
    })

    const message = response.data
    const headers = message.payload?.headers || []
    const body = this._extractBody(message.payload)
    const attachments = this._extractAttachments(message.payload)

    const normalized = {
      id: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds || [],
      snippet: message.snippet,
      internalDate: message.internalDate,
      receivedAt: new Date(parseInt(message.internalDate, 10)).toISOString(),
      from: this._getHeader(headers, "From"),
      to: this._getHeader(headers, "To"),
      cc: this._getHeader(headers, "Cc"),
      bcc: this._getHeader(headers, "Bcc"),
      subject: this._getHeader(headers, "Subject"),
      date: this._getHeader(headers, "Date"),
      messageId: this._getHeader(headers, "Message-ID"),
      inReplyTo: this._getHeader(headers, "In-Reply-To"),
      references: this._getHeader(headers, "References"),
      body: {
        text: body.text,
        html: body.html,
      },
      attachments,
      sizeEstimate: message.sizeEstimate,
    }

    // Log to Supabase if configured
    await this._logToSupabase(normalized)

    return normalized
  }

  /**
   * Log normalized email to Supabase
   * @param {Object} normalizedEmail - Normalized email object
   */
  async _logToSupabase(normalizedEmail) {
    const client = this._getSupabaseClient()
    if (!client) return

    try {
      const { error } = await client.from(this.supabaseTable).insert({
        gmail_id: normalizedEmail.id,
        thread_id: normalizedEmail.threadId,
        from_address: normalizedEmail.from,
        to_address: normalizedEmail.to,
        subject: normalizedEmail.subject,
        snippet: normalizedEmail.snippet,
        received_at: normalizedEmail.receivedAt,
        body_text: normalizedEmail.body.text,
        body_html: normalizedEmail.body.html,
        has_attachments: normalizedEmail.attachments.length > 0,
        attachment_count: normalizedEmail.attachments.length,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error logging to Supabase:", error)
      }
    } catch (err) {
      console.error("Error logging to Supabase:", err)
    }
  }
}

module.exports = EmailProcessor
