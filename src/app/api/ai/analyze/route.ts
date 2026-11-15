import { NextRequest, NextResponse } from "next/server";
import { analyzeMaterial } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { texts, fileNames } = await request.json();

    if (!texts || texts.length === 0) {
      return NextResponse.json(
        { error: "No text content provided" },
        { status: 400 }
      );
    }

    // Combine all texts with file name separators
    const combinedText = texts
      .map((text: string, idx: number) => {
        const fileName = fileNames?.[idx] || `File ${idx + 1}`;
        return `=== ${fileName} ===\n${text}`;
      })
      .join("\n\n");

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
