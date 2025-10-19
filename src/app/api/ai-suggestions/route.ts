import {
  GoogleGenerativeAI,
  GenerationConfig,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// フロントエンドから受け取るリクエストの型
export type AiSuggestionRequest = {
  placeName: string;
  placeCategory: string;
  availableTime: number; // ユーザーが入力した「すきま時間」
};

// AIに返却してほしい過ごし方提案の型
export type Activity = {
  title: string;
  description: string;
  icon: string;
};

// このAPIがフロントエンドに返すレスポンスの型
export type AiSuggestionResponse = {
  estimatedDuration: number; // AIが推定した滞在時間
  activities: Activity[]; // AIが提案する過ごし方のリスト
};

export async function POST(req: NextRequest) {
  try {
    const { placeName, placeCategory, availableTime }: AiSuggestionRequest =
      await req.json();

    // AIに構造化されたJSONを返させるためのスキーマ定義
    const schema = {
      type: "object",
      properties: {
        estimatedDuration: {
          type: "number",
          description: `ユーザーが利用可能な${availableTime}分という時間の中で、${placeName}で過ごすのに最も適した滞在時間（分）。${availableTime}分を超えてはならない。`,
        },
        activities: {
          type: "array",
          description: "推定された滞在時間で可能な、具体的で創造的な過ごし方の提案リスト。",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "簡潔でキャッチーな提案のタイトル",
              },
              description: {
                type: "string",
                description: "具体的な行動内容を説明する文章",
              },
              icon: {
                type: "string",
                description: "提案内容を象徴する絵文字1つ",
              },
            },
            required: ["title", "description", "icon"],
          },
        },
      },
      required: ["estimatedDuration", "activities"],
    };

    // モデルの設定
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      } as GenerationConfig,
      // 安全性設定（必要に応じて調整）
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    // AIへの指示（プロンプト）
    const prompt = `
      あなたは卓越したライフスタイルプランナーです。
      以下の条件に基づき、ユーザーにとって最高のすきま時間の過ごし方を提案してください。

      # 条件
      - 場所: ${placeName} (${placeCategory})
      - ユーザーが利用可能な最大時間: ${availableTime}分

      # 指示
      1. まず、上記の場所と利用可能な時間を考慮して、最も推奨される「滞在時間」を推定してください。ただし、滞在時間は${availableTime}分を超えないようにしてください。
      2. 次に、その推定した滞在時間内に実行可能で、具体的かつ創造的な「過ごし方」のアイデアを3つ提案してください。
      3. 必ず指定されたJSONスキーマに従って回答してください。
    `;

    // AIにリクエストを送信
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse: AiSuggestionResponse = JSON.parse(response.text());

    return NextResponse.json(aiResponse, { status: 200 });
  } catch (error) {
    console.error("AI提案の生成に失敗しました:", error);
    return NextResponse.json(
      { message: "AI提案の生成に失敗しました" },
      { status: 500 }
    );
  }
}