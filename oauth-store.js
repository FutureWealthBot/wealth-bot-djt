const fs = require("fs").promises

/**
 * OAuthStore - A simple token storage abstraction
 * Supports file-based storage or Supabase
 */
class OAuthStore {
  constructor(options = {}) {
    this.mode = options.mode || "file"
    this.filePath = options.filePath || "./.tokens.json"
    this.supabaseUrl = options.supabaseUrl
    this.supabaseKey = options.supabaseKey
    this.supabaseTable = options.supabaseTable || "oauth_tokens"
    this._supabaseClient = null
  }

  _getSupabaseClient() {
    if (!this._supabaseClient) {
      if (!this.supabaseUrl || !this.supabaseKey) {
        throw new Error("Supabase URL and key are required for Supabase storage mode")
      }
      const { createClient } = require("@supabase/supabase-js")
      this._supabaseClient = createClient(this.supabaseUrl, this.supabaseKey)
    }
    return this._supabaseClient
  }

  async get(key) {
    if (this.mode === "file") {
      return this._getFromFile(key)
    }
    return this._getFromSupabase(key)
  }

  async set(key, value) {
    if (this.mode === "file") {
      return this._setToFile(key, value)
    }
    return this._setToSupabase(key, value)
  }

  async delete(key) {
    if (this.mode === "file") {
      return this._deleteFromFile(key)
    }
    return this._deleteFromSupabase(key)
  }

  async _getFromFile(key) {
    try {
      const data = await fs.readFile(this.filePath, "utf8")
      const tokens = JSON.parse(data)
      return tokens[key] || null
    } catch (err) {
      if (err.code === "ENOENT") {
        return null
      }
      throw err
    }
  }

  async _setToFile(key, value) {
    let tokens = {}
    try {
      const data = await fs.readFile(this.filePath, "utf8")
      tokens = JSON.parse(data)
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err
      }
    }
    tokens[key] = value
    await fs.writeFile(this.filePath, JSON.stringify(tokens, null, 2), { mode: 0o600 })
  }

  async _deleteFromFile(key) {
    try {
      const data = await fs.readFile(this.filePath, "utf8")
      const tokens = JSON.parse(data)
      delete tokens[key]
      await fs.writeFile(this.filePath, JSON.stringify(tokens, null, 2), { mode: 0o600 })
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err
      }
    }
  }

  async _getFromSupabase(key) {
    const client = this._getSupabaseClient()
    const { data, error } = await client.from(this.supabaseTable).select("tokens").eq("id", key).single()

    if (error) {
      if (error.code === "PGRST116") {
        // Row not found
        return null
      }
      throw error
    }
    return data?.tokens || null
  }

  async _setToSupabase(key, value) {
    const client = this._getSupabaseClient()
    const { error } = await client.from(this.supabaseTable).upsert(
      {
        id: key,
        tokens: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )

    if (error) {
      throw error
    }
  }

  async _deleteFromSupabase(key) {
    const client = this._getSupabaseClient()
    const { error } = await client.from(this.supabaseTable).delete().eq("id", key)

    if (error) {
      throw error
    }
  }
}

module.exports = OAuthStore
