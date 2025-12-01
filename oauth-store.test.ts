import { describe, expect, it, beforeEach, afterEach } from "vitest"
import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import OAuthStore from "./oauth-store"

describe("OAuthStore", () => {
  let tempDir: string
  let testFilePath: string

  beforeEach(async () => {
    // Create a temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "oauth-store-test-"))
    testFilePath = path.join(tempDir, "test-tokens.json")
  })

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true })
    } catch {
      // Ignore errors
    }
  })

  describe("file storage mode", () => {
    describe("get", () => {
      it("should return null when file does not exist", async () => {
        const store = new OAuthStore({ mode: "file", filePath: testFilePath })

        const result = await store.get("test-key")
        expect(result).toBeNull()
      })

      it("should return null when key does not exist in file", async () => {
        const store = new OAuthStore({ mode: "file", filePath: testFilePath })

        // Create file with different key
        await fs.writeFile(testFilePath, JSON.stringify({ "other-key": { token: "abc" } }))

        const result = await store.get("test-key")
        expect(result).toBeNull()
      })

      it("should return token when key exists in file", async () => {
        const store = new OAuthStore({ mode: "file", filePath: testFilePath })
        const expectedTokens = { access_token: "test-token", refresh_token: "refresh-token" }

        await fs.writeFile(testFilePath, JSON.stringify({ "test-key": expectedTokens }))

        const result = await store.get("test-key")
        expect(result).toEqual(expectedTokens)
      })
    })

    describe("set", () => {
      it("should create new file when it does not exist", async () => {
        const store = new OAuthStore({ mode: "file", filePath: testFilePath })
        const tokens = { access_token: "new-token" }

        await store.set("test-key", tokens)

        const fileContent = await fs.readFile(testFilePath, "utf8")
        expect(JSON.parse(fileContent)).toEqual({ "test-key": tokens })
      })

      it("should update existing file with new key", async () => {
        const store = new OAuthStore({ mode: "file", filePath: testFilePath })
        const existingTokens = { "other-key": { token: "existing" } }
        const newTokens = { access_token: "new-token" }

        await fs.writeFile(testFilePath, JSON.stringify(existingTokens))

        await store.set("test-key", newTokens)

        const fileContent = await fs.readFile(testFilePath, "utf8")
        expect(JSON.parse(fileContent)).toEqual({ ...existingTokens, "test-key": newTokens })
      })

      it("should overwrite existing key in file", async () => {
        const store = new OAuthStore({ mode: "file", filePath: testFilePath })
        const existingTokens = { "test-key": { token: "old" } }
        const newTokens = { access_token: "new-token" }

        await fs.writeFile(testFilePath, JSON.stringify(existingTokens))

        await store.set("test-key", newTokens)

        const fileContent = await fs.readFile(testFilePath, "utf8")
        expect(JSON.parse(fileContent)).toEqual({ "test-key": newTokens })
      })
    })

    describe("delete", () => {
      it("should do nothing when file does not exist", async () => {
        const store = new OAuthStore({ mode: "file", filePath: testFilePath })

        await expect(store.delete("test-key")).resolves.not.toThrow()
      })

      it("should remove key from file", async () => {
        const store = new OAuthStore({ mode: "file", filePath: testFilePath })
        const existingTokens = { "test-key": { token: "abc" }, "other-key": { token: "xyz" } }

        await fs.writeFile(testFilePath, JSON.stringify(existingTokens))

        await store.delete("test-key")

        const fileContent = await fs.readFile(testFilePath, "utf8")
        expect(JSON.parse(fileContent)).toEqual({ "other-key": { token: "xyz" } })
      })
    })
  })

  describe("supabase storage mode", () => {
    it("should throw error when supabase URL or key is missing", async () => {
      const store = new OAuthStore({ mode: "supabase" })

      await expect(store.get("test-key")).rejects.toThrow("Supabase URL and key are required")
    })
  })
})
