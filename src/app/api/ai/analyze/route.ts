import { NextRequest, NextResponse } from "next/server";
import { analyzeMaterial } from "@/lib/gemini";
import { extractTextFromFile } from "@/lib/file-parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Extract text from each file server-side
    const textParts: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileType = file.type || "text/plain";

      const text = await extractTextFromFile(buffer, fileType);
      textParts.push(`=== ${file.name} ===\n${text}`);
    }

    const combinedText = textParts.join("\n\n");

    if (!combinedText.trim()) {
      return NextResponse.json(
        { error: "No text content could be extracted from files" },
        { status: 400 }
      );
    }

    // Analyze with Gemini AI
    const analysis = await analyzeMaterial(combinedText);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
