// File text extraction utilities

export async function extractTextFromFile(
  file: Buffer,
  fileType: string
): Promise<string> {
  switch (fileType) {
    case "text/plain":
    case "text/csv":
      return file.toString("utf-8");

    case "application/pdf":
      return extractFromPDF(file);

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractFromDOCX(file);

    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return extractFromPPTX(file);

    default:
      // Try as plain text
      return file.toString("utf-8");
  }
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

async function extractFromPPTX(buffer: Buffer): Promise<string> {
  // Basic PPTX text extraction using JSZip-like approach
  // PPTX files are ZIP archives with XML content
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buffer);
    let text = "";

    // Get all slide files
    const slideFiles = Object.keys(zip.files)
      .filter((name) => name.match(/ppt\/slides\/slide\d+\.xml/))
      .sort();

    for (const slideName of slideFiles) {
      const content = await zip.files[slideName].async("string");
      // Extract text content from XML tags
      const textMatches = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
      if (textMatches) {
        const slideText = textMatches
          .map((match) => match.replace(/<[^>]+>/g, ""))
          .join(" ");
        text += slideText + "\n\n";
      }
    }

    return text || "No text content found in presentation";
  } catch (error) {
    console.error("PPTX parsing error:", error);
    throw new Error("Failed to parse PPTX file");
  }
}

// Validate file before processing
export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];

  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".pptx", ".txt"];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be under 10MB" };
  }

  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  if (
    !ALLOWED_TYPES.includes(file.type) &&
    !ALLOWED_EXTENSIONS.includes(extension)
  ) {
    return {
      valid: false,
      error: "Only PDF, DOCX, PPTX, and TXT files are allowed",
    };
  }

  return { valid: true };
}
