import { NextRequest, NextResponse } from "next/server";
import { generateMissions } from "@/lib/gemini";
import type { MaterialAnalysis } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { analysis, studentLevel } = await request.json();

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis data provided" },
        { status: 400 }
      );
    }

    const validLevels = ["beginner", "intermediate", "advanced"];
    const level = validLevels.includes(studentLevel)
      ? studentLevel
      : "beginner";

    // Generate missions with Gemini AI
    const missions = await generateMissions(
      analysis as MaterialAnalysis,
      level
    );

    return NextResponse.json({ missions });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Mission generation failed" },
      { status: 500 }
    );
  }
}
