
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, QuestionType, Question, QuizTargetLanguage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuestionsFromText(
  text: string,
  count: number,
  difficulty: Difficulty,
  type: QuestionType,
  mcqRatio: number,
  targetLanguage: QuizTargetLanguage
): Promise<Question[]> {
  const model = 'gemini-3-pro-preview';

  let languageInstruction = '';
  if (targetLanguage === QuizTargetLanguage.AR) {
    languageInstruction = 'MANDATORY: All output (questions, options, and explanations) MUST be in ARABIC language.';
  } else if (targetLanguage === QuizTargetLanguage.EN) {
    languageInstruction = 'MANDATORY: All output (questions, options, and explanations) MUST be in ENGLISH language.';
  } else {
    languageInstruction = 'Output should be in the same language as the source text.';
  }

  const systemInstruction = `
    You are an expert medical educator. Generate a set of ${count} high-quality medical questions based on the provided text.
    Difficulty Level: ${difficulty}.
    Question Type: ${type === QuestionType.MIXED ? `A mix of MCQ and True/False (approximately ${mcqRatio}% MCQ)` : type}.
    
    ${languageInstruction}

    Ensure all questions are medically accurate and relevant to the provided text.
    For MCQ, provide 4 options.
    For True/False, the correct answer must be exactly "True" or "False" (in the target language if applicable, e.g., 'صح' or 'خطأ' if Arabic is requested).
    Provide a brief explanation for each correct answer.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['MCQ', 'TF'] },
        question: { type: Type.STRING },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Required for MCQ, empty for TF"
        },
        correctAnswer: { type: Type.STRING },
        explanation: { type: Type.STRING }
      },
      required: ['type', 'question', 'correctAnswer', 'explanation']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate medical questions from this text. Maintain professional medical terminology. Text: \n\n${text}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
      },
    });

    const questions: any[] = JSON.parse(response.text || '[]');
    return questions.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate questions. Please try again with a shorter text or fewer questions.");
  }
}
