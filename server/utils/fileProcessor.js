const mammoth = require("mammoth");

/**
 * Normalizes and extracts content from an uploaded file (images, PDFs, Word docs, text files).
 * @param {Object} file - { base64: string, mimeType: string, name?: string }
 * @returns {Promise<{ geminiPart: Object|null, extractedText: string|null, isImage: boolean, isPdf: boolean, mimeType: string }>}
 */
async function processUploadedFile(file) {
  if (!file || !file.base64) {
    return { geminiPart: null, extractedText: null, isImage: false, isPdf: false, mimeType: "" };
  }

  let mimeType = (file.mimeType || "").toLowerCase();
  const fileName = (file.name || "").toLowerCase();

  // Infer mime type if missing
  if (!mimeType) {
    if (fileName.endsWith(".pdf")) mimeType = "application/pdf";
    else if (fileName.endsWith(".docx")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (fileName.endsWith(".doc")) mimeType = "application/msword";
    else if (fileName.endsWith(".txt")) mimeType = "text/plain";
    else if (fileName.endsWith(".csv")) mimeType = "text/csv";
    else if (fileName.endsWith(".png")) mimeType = "image/png";
    else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (fileName.endsWith(".webp")) mimeType = "image/webp";
    else mimeType = "application/octet-stream";
  }

  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf" || fileName.endsWith(".pdf");
  const isDocx = mimeType.includes("wordprocessingml") || fileName.endsWith(".docx");
  const isDoc = mimeType.includes("msword") || fileName.endsWith(".doc");
  const isText = mimeType.startsWith("text/") || fileName.endsWith(".txt") || fileName.endsWith(".csv") || fileName.endsWith(".md") || fileName.endsWith(".json");

  // 1. Case: Word documents (.docx / .doc)
  if (isDocx || isDoc) {
    try {
      const buffer = Buffer.from(file.base64, "base64");
      const result = await mammoth.extractRawText({ buffer });
      const extractedText = result.value ? result.value.trim() : "";
      return {
        geminiPart: { text: `[Content of attached document "${file.name || "document.docx"}"]:\n${extractedText}` },
        extractedText,
        isImage: false,
        isPdf: false,
        mimeType,
      };
    } catch (err) {
      console.warn("[fileProcessor] Mammoth docx extraction failed, trying plain text fallback:", err.message);
      try {
        const raw = Buffer.from(file.base64, "base64").toString("utf-8");
        const clean = raw.replace(/[^\x20-\x7E\t\r\n]/g, " ").replace(/\s+/g, " ").trim();
        return {
          geminiPart: { text: `[Content of attached document "${file.name || "document"}"]:\n${clean}` },
          extractedText: clean,
          isImage: false,
          isPdf: false,
          mimeType,
        };
      } catch (fallbackErr) {
        return {
          geminiPart: null,
          extractedText: null,
          isImage: false,
          isPdf: false,
          mimeType,
        };
      }
    }
  }

  // 2. Case: Text files (.txt, .csv, .md, .json)
  if (isText) {
    try {
      const textContent = Buffer.from(file.base64, "base64").toString("utf-8");
      return {
        geminiPart: { text: `[Content of attached file "${file.name || "file.txt"}"]:\n${textContent}` },
        extractedText: textContent,
        isImage: false,
        isPdf: false,
        mimeType: "text/plain",
      };
    } catch {
      // fallback to inlineData if decode fails
      return {
        geminiPart: { inlineData: { mimeType: "text/plain", data: file.base64 } },
        extractedText: null,
        isImage: false,
        isPdf: false,
        mimeType: "text/plain",
      };
    }
  }

  // 3. Case: PDF document (.pdf)
  if (isPdf) {
    return {
      geminiPart: {
        inlineData: {
          mimeType: "application/pdf",
          data: file.base64,
        },
      },
      extractedText: null,
      isImage: false,
      isPdf: true,
      mimeType: "application/pdf",
    };
  }

  // 4. Case: Image (.png, .jpg, .jpeg, .webp, etc.)
  if (isImage) {
    return {
      geminiPart: {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: file.base64,
        },
      },
      extractedText: null,
      isImage: true,
      isPdf: false,
      mimeType: mimeType || "image/jpeg",
    };
  }

  // Generic fallback
  return {
    geminiPart: {
      inlineData: {
        mimeType: mimeType || "application/octet-stream",
        data: file.base64,
      },
    },
    extractedText: null,
    isImage: false,
    isPdf: false,
    mimeType,
  };
}

module.exports = { processUploadedFile };
