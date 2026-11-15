import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MaterialAnalysis, Mission, MissionType, Question } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 8192,
  },
});

// ============ ANALYZE MATERIAL ============
export async function analyzeMaterial(text: string): Promise<MaterialAnalysis> {
  const prompt = `You are an educational content analyzer for English language learning materials (for Indonesian students).

Analyze the following teaching material and extract structured information. Be thorough but ONLY use information actually present in the text. Do NOT invent or fabricate any information.

MATERIAL TEXT:
"""
${text.substring(0, 30000)}
"""

Respond in valid JSON format with this structure:
{
  "main_topic": "The main subject/topic of the material",
  "learning_objectives": ["objective 1", "objective 2", ...],
  "key_concepts": ["concept 1", "concept 2", ...],
  "reading_passages": [
    {
      "title": "passage title or first line",
      "content": "the passage text (max 500 chars)",
      "source_page": null
    }
  ],
  "characters": [
    {
      "name": "character name",
      "description": "brief description",
      "role": "protagonist/antagonist/supporting",
      "relationships": ["relationship descriptions"]
    }
  ],
  "vocabulary": [
    {
      "word": "the word",
      "definition": "meaning",
      "part_of_speech": "noun/verb/adjective/etc",
      "context_sentence": "sentence from the material using this word"
    }
  ],
  "grammar_structures": [
    {
      "pattern": "grammar pattern name",
      "explanation": "how it works",
      "examples": ["example from text"]
    }
  ],
  "important_examples": ["example 1", "example 2"],
  "moral_values": ["value 1", "value 2"],
  "summary": "A brief 2-3 sentence summary of the entire material"
}

Important rules:
- Only extract information ACTUALLY present in the material
- For vocabulary, use words and context sentences FROM the material
- For characters, only list characters that appear in the text
- If a section has no relevant content, use an empty array []
- Keep the response as valid JSON only, no additional text`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI analysis response");
  }

  return JSON.parse(jsonMatch[0]) as MaterialAnalysis;
}

// ============ GENERATE MISSIONS ============
export async function generateMissions(
  analysis: MaterialAnalysis,
  studentLevel: "beginner" | "intermediate" | "advanced"
): Promise<Omit<Mission, "id" | "game_config_id">[]> {
  const missions: Omit<Mission, "id" | "game_config_id">[] = [];

  const missionTypes: {
    type: MissionType;
    number: 1 | 2 | 3 | 4 | 5;
    title: string;
  }[] = [
    { type: "story_structure", number: 1, title: "Story Structure" },
    { type: "character_detective", number: 2, title: "Character Detective" },
    { type: "vocabulary_treasure", number: 3, title: "Vocabulary Treasure" },
    { type: "grammar_challenge", number: 4, title: "Grammar Challenge" },
    { type: "story_master", number: 5, title: "Story Master" },
  ];

  for (const missionDef of missionTypes) {
    const questions = await generateQuestionsForMission(
      missionDef.type,
      analysis,
      studentLevel
    );

    missions.push({
      mission_number: missionDef.number,
      mission_type: missionDef.type,
      title: missionDef.title,
      description: getMissionDescription(missionDef.type),
      questions,
      status: "generated",
    });
  }

  return missions;
}

function getMissionDescription(type: MissionType): string {
  const descriptions: Record<MissionType, string> = {
    story_structure:
      "Test your understanding of the story's beginning, middle, and end. Identify key plot points and narrative elements.",
    character_detective:
      "Investigate the characters in the story. Discover their traits, actions, and relationships.",
    vocabulary_treasure:
      "Unlock the treasure of new words! Learn vocabulary from the story with their meanings and usage.",
    grammar_challenge:
      "Master the grammar patterns found in the reading material. Apply rules to new sentences.",
    story_master:
      "Prove your mastery! Answer comprehension and critical thinking questions about the story.",
  };
  return descriptions[type];
}

// ============ GENERATE QUESTIONS PER MISSION ============
async function generateQuestionsForMission(
  missionType: MissionType,
  analysis: MaterialAnalysis,
  level: string
): Promise<Omit<Question, "id" | "mission_id">[]> {
  const missionPrompts: Record<MissionType, string> = {
    story_structure: `Generate questions about the STORY STRUCTURE of the material.
Focus on:
- Beginning, middle, and end of the story
- Main conflict and resolution
- Setting and time
- Plot sequence events
- Cause and effect relationships

Use these reading passages: ${JSON.stringify(analysis.reading_passages)}
Summary: ${analysis.summary}

Question types to use: multiple_choice, true_false
Generate 7 questions.`,

    character_detective: `Generate questions about the CHARACTERS in the material.
Focus on:
- Character traits and descriptions
- Character motivations
- Character relationships
- Character actions and their consequences
- Comparing characters

Characters found: ${JSON.stringify(analysis.characters)}

Question types to use: multiple_choice, matching, true_false
Generate 7 questions.`,

    vocabulary_treasure: `Generate VOCABULARY questions from the material.
Focus on:
- Word meanings in context
- Synonyms and antonyms
- Word usage in sentences
- Parts of speech
- Context clues

Vocabulary found: ${JSON.stringify(analysis.vocabulary)}

Question types to use: multiple_choice, fill_blank, matching
Generate 7 questions.`,

    grammar_challenge: `Generate GRAMMAR questions based on patterns in the material.
Focus on:
- Grammar rules found in the text
- Sentence structure
- Verb tenses
- Subject-verb agreement
- Parts of speech usage

Grammar structures found: ${JSON.stringify(analysis.grammar_structures)}

Question types to use: multiple_choice, fill_blank, drag_drop
Generate 7 questions.`,

    story_master: `Generate READING COMPREHENSION and CRITICAL THINKING questions.
Focus on:
- Main idea and supporting details
- Inference and conclusion
- Author's purpose
- Summarizing
- Evaluating and giving opinions
- Connecting to real life

Use these passages: ${JSON.stringify(analysis.reading_passages)}
Key concepts: ${JSON.stringify(analysis.key_concepts)}
Moral values: ${JSON.stringify(analysis.moral_values)}

Question types to use: multiple_choice, true_false
Generate 7 questions.`,
  };

  const prompt = `You are an English language quiz generator for Indonesian students at ${level} level.

${missionPrompts[missionType]}

RULES:
- ONLY use information from the provided material
- Do NOT invent characters, events, or facts
- Every answer must be justifiable from the material
- Adjust language complexity for ${level} level students
- Avoid ambiguous questions
- Provide clear explanations for each answer
- Each question is worth 10 points

Respond in valid JSON array format:
[
  {
    "question_type": "multiple_choice",
    "question_text": "Question text here?",
    "options": [
      {"id": "a", "text": "Option A", "is_correct": false},
      {"id": "b", "text": "Option B", "is_correct": true},
      {"id": "c", "text": "Option C", "is_correct": false},
      {"id": "d", "text": "Option D", "is_correct": false}
    ],
    "correct_answer": "b",
    "explanation": "The correct answer is B because...",
    "source_reference": "From paragraph 2...",
    "difficulty": "medium",
    "points": 10
  },
  {
    "question_type": "true_false",
    "question_text": "Statement to evaluate",
    "options": [
      {"id": "true", "text": "True", "is_correct": true},
      {"id": "false", "text": "False", "is_correct": false}
    ],
    "correct_answer": "true",
    "explanation": "This is true because...",
    "source_reference": "Based on...",
    "difficulty": "easy",
    "points": 10
  },
  {
    "question_type": "fill_blank",
    "question_text": "The ___ jumped over the fence.",
    "correct_answer": "cat",
    "explanation": "In the story, the cat jumped over the fence.",
    "source_reference": "Page 3",
    "difficulty": "easy",
    "points": 10
  }
]

For matching questions, add:
"matching_pairs": [
  {"id": "1", "left": "Word", "right": "Definition"},
  ...
]

Return ONLY the JSON array, no other text.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error(`Failed to generate questions for ${missionType}`);
  }

  return JSON.parse(jsonMatch[0]);
}

// ============ REGENERATE SINGLE QUESTION ============
export async function regenerateQuestion(
  missionType: MissionType,
  analysis: MaterialAnalysis,
  level: string,
  existingQuestion: Question
): Promise<Omit<Question, "id" | "mission_id">> {
  const prompt = `You are an English language quiz generator for Indonesian students at ${level} level.

Generate ONE NEW replacement question for the "${missionType}" mission.
The question should be different from: "${existingQuestion.question_text}"
But same type: ${existingQuestion.question_type}

Material context:
${JSON.stringify(analysis)}

RULES:
- ONLY use information from the provided material
- Do NOT invent information
- The question must be clearly different from the original

Return ONLY valid JSON (single object, not array):
{
  "question_type": "${existingQuestion.question_type}",
  "question_text": "New question?",
  "options": [...],
  "correct_answer": "...",
  "explanation": "...",
  "source_reference": "...",
  "difficulty": "medium",
  "points": 10
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to regenerate question");
  }

  return JSON.parse(jsonMatch[0]);
}
