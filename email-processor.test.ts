import { describe, expect, it, vi } from "vitest"
import EmailProcessor from "./email-processor"

describe("EmailProcessor", () => {
  describe("_getHeader", () => {
    it("should return null when headers is null", () => {
      const processor = new EmailProcessor({})
      // @ts-expect-error - accessing private method for testing
      expect(processor._getHeader(null, "From")).toBeNull()
    })

    it("should return null when header not found", () => {
      const processor = new EmailProcessor({})
      const headers = [{ name: "To", value: "test@example.com" }]
      // @ts-expect-error - accessing private method for testing
      expect(processor._getHeader(headers, "From")).toBeNull()
    })

    it("should find header case-insensitively", () => {
      const processor = new EmailProcessor({})
      const headers = [{ name: "FROM", value: "sender@example.com" }]
      // @ts-expect-error - accessing private method for testing
      expect(processor._getHeader(headers, "from")).toBe("sender@example.com")
    })
  })

  describe("_decodeBase64url", () => {
    it("should return empty string for null/undefined input", () => {
      const processor = new EmailProcessor({})
      // @ts-expect-error - accessing private method for testing
      expect(processor._decodeBase64url(null)).toBe("")
      // @ts-expect-error - accessing private method for testing
      expect(processor._decodeBase64url(undefined)).toBe("")
    })

    it("should decode base64url encoded string", () => {
      const processor = new EmailProcessor({})
      const original = "Hello, World!"
      const encoded = Buffer.from(original).toString("base64url")
      // @ts-expect-error - accessing private method for testing
      expect(processor._decodeBase64url(encoded)).toBe(original)
    })

    it("should handle base64url with special characters", () => {
      const processor = new EmailProcessor({})
      // Test string that would produce - and _ in base64url
      const original = "This is a test with special chars: <>?!"
      const base64 = Buffer.from(original).toString("base64")
      const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_")
      // @ts-expect-error - accessing private method for testing
      expect(processor._decodeBase64url(base64url)).toBe(original)
    })
  })

  describe("_extractBody", () => {
    it("should return empty object when payload is null", () => {
      const processor = new EmailProcessor({})
      // @ts-expect-error - accessing private method for testing
      expect(processor._extractBody(null)).toEqual({ text: "", html: "" })
    })

    it("should extract plain text body from simple message", () => {
      const processor = new EmailProcessor({})
      const textContent = "Hello, this is a test email"
      const payload = {
        mimeType: "text/plain",
        body: {
          data: Buffer.from(textContent).toString("base64url"),
        },
      }
      // @ts-expect-error - accessing private method for testing
      const result = processor._extractBody(payload)
      expect(result.text).toBe(textContent)
      expect(result.html).toBe("")
    })

    it("should extract HTML body from simple message", () => {
      const processor = new EmailProcessor({})
      const htmlContent = "<html><body>Hello!</body></html>"
      const payload = {
        mimeType: "text/html",
        body: {
          data: Buffer.from(htmlContent).toString("base64url"),
        },
      }
      // @ts-expect-error - accessing private method for testing
      const result = processor._extractBody(payload)
      expect(result.html).toBe(htmlContent)
      expect(result.text).toBe("")
    })

    it("should extract both text and html from multipart message", () => {
      const processor = new EmailProcessor({})
      const textContent = "Plain text content"
      const htmlContent = "<html><body>HTML content</body></html>"
      const payload = {
        mimeType: "multipart/alternative",
        parts: [
          {
            mimeType: "text/plain",
            body: {
              data: Buffer.from(textContent).toString("base64url"),
            },
          },
          {
            mimeType: "text/html",
            body: {
              data: Buffer.from(htmlContent).toString("base64url"),
            },
          },
        ],
      }
      // @ts-expect-error - accessing private method for testing
      const result = processor._extractBody(payload)
      expect(result.text).toBe(textContent)
      expect(result.html).toBe(htmlContent)
    })
  })

  describe("_extractAttachments", () => {
    it("should return empty array when payload is null", () => {
      const processor = new EmailProcessor({})
      // @ts-expect-error - accessing private method for testing
      expect(processor._extractAttachments(null)).toEqual([])
    })

    it("should return empty array when no parts", () => {
      const processor = new EmailProcessor({})
      // @ts-expect-error - accessing private method for testing
      expect(processor._extractAttachments({ mimeType: "text/plain" })).toEqual([])
    })

    it("should extract attachment info", () => {
      const processor = new EmailProcessor({})
      const payload = {
        mimeType: "multipart/mixed",
        parts: [
          {
            mimeType: "text/plain",
            body: { data: "test" },
          },
          {
            filename: "document.pdf",
            mimeType: "application/pdf",
            body: {
              size: 1024,
              attachmentId: "attachment-123",
            },
          },
        ],
      }
      // @ts-expect-error - accessing private method for testing
      const result = processor._extractAttachments(payload)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        filename: "document.pdf",
        mimeType: "application/pdf",
        size: 1024,
        attachmentId: "attachment-123",
      })
    })

    it("should extract nested attachments", () => {
      const processor = new EmailProcessor({})
      const payload = {
        mimeType: "multipart/mixed",
        parts: [
          {
            mimeType: "multipart/alternative",
            parts: [
              {
                filename: "nested.txt",
                mimeType: "text/plain",
                body: {
                  size: 512,
                  attachmentId: "nested-attachment",
                },
              },
            ],
          },
          {
            filename: "image.png",
            mimeType: "image/png",
            body: {
              size: 2048,
              attachmentId: "image-attachment",
            },
          },
        ],
      }
      // @ts-expect-error - accessing private method for testing
      const result = processor._extractAttachments(payload)
      expect(result).toHaveLength(2)
    })
  })

  describe("normalizeMessage", () => {
    it("should normalize a Gmail message", async () => {
      const processor = new EmailProcessor({})
      const messageRef = { id: "msg-123", threadId: "thread-456" }

      const mockGmail = {
        users: {
          messages: {
            get: vi.fn().mockResolvedValue({
              data: {
                id: "msg-123",
                threadId: "thread-456",
                labelIds: ["INBOX", "UNREAD"],
                snippet: "This is a test email snippet",
                internalDate: "1701388800000",
                sizeEstimate: 1234,
                payload: {
                  mimeType: "text/plain",
                  headers: [
                    { name: "From", value: "sender@example.com" },
                    { name: "To", value: "recipient@example.com" },
                    { name: "Subject", value: "Test Subject" },
                    { name: "Date", value: "Fri, 01 Dec 2023 00:00:00 +0000" },
                    { name: "Message-ID", value: "<message-id@example.com>" },
                  ],
                  body: {
                    data: Buffer.from("Test email body").toString("base64url"),
                  },
                },
              },
            }),
          },
        },
      }

      const result = await processor.normalizeMessage(messageRef, mockGmail as unknown as never)

      expect(result.id).toBe("msg-123")
      expect(result.threadId).toBe("thread-456")
      expect(result.from).toBe("sender@example.com")
      expect(result.to).toBe("recipient@example.com")
      expect(result.subject).toBe("Test Subject")
      expect(result.body.text).toBe("Test email body")
      expect(result.labelIds).toEqual(["INBOX", "UNREAD"])
      expect(result.sizeEstimate).toBe(1234)
    })
  })

  describe("event emission", () => {
    it("should be an EventEmitter", () => {
      const processor = new EmailProcessor({})
      expect(processor.emit).toBeDefined()
      expect(processor.on).toBeDefined()
    })

    it("should emit events", () => {
      const processor = new EmailProcessor({})
      const listener = vi.fn()

      processor.on("EMAIL_MONITOR", listener)
      processor.emit("EMAIL_MONITOR", { id: "test" })

      expect(listener).toHaveBeenCalledWith({ id: "test" })
    })
  })
})
