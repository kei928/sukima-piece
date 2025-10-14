import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import {
    GoogleGenerativeAI,
    GenerationConfig,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";
import { AiSuggestionResponse } from "../ai-suggestions/route";

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// --- 型定義 ---
type NearbyRequest = {
    latitude: number;
    longitude: number;
    theme: string;
    availableTime: number;
};
type Place = {
    id: string;
    displayName?: { text: string; languageCode: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    regularOpeningHours?: { openNow: boolean };
    rating?: number;
    types?: string[];
};
type DistanceMatrixResponse = {
    rows: {
        elements: {
            status: string;
            duration?: { value: number };
        }[];
    }[];
};

// --- 関数 (変更なし) ---
const searchPlacesByCategory = (
    category: string,
    latitude: number,
    longitude: number,
    apiKey: string
) => {
    const url = "https://places.googleapis.com/v1/places:searchNearby";
    const requestBody = {
        includedTypes: [category],
        maxResultCount: 5, // 取得件数を少し増やす
        locationRestriction: {
            circle: { center: { latitude, longitude }, radius: 1500.0 },
        },
        languageCode: "ja",
    };
    return axios.post<{ places: Place[] }>(url, requestBody, {
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
                "places.id,places.displayName,places.formattedAddress,places.location,places.regularOpeningHours,places.rating,places.types",
        },
    });
};

const themeToCategories: { [key: string]: string[] } = {
    relax: ["cafe", "park", "book_store"],
    eat: ["restaurant", "cafe"],
    fun: ["amusement_park", "movie_theater"],
    anything: [
        "cafe",
        "park",
        "museum",
        "restaurant",
        "book_store",
        "shopping_mall",
    ],
};


export const POST = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "認証されていません" },
                { status: 401 }
            );
        }

        const { latitude, longitude, theme, availableTime }: NearbyRequest =
            await req.json();
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) throw new Error("APIキーが設定されていません");

        // 周辺のスポットを検索 
        const categoriesToSearch =
            themeToCategories[theme] || themeToCategories.anything;
        const placesPromises = categoriesToSearch.map((category) =>
            searchPlacesByCategory(category, latitude, longitude, apiKey)
        );
        const responses = await Promise.all(placesPromises);
        const allPlaces = responses.flatMap((res) => res.data.places || []);
        const uniquePlaces = Array.from(
            new Map(allPlaces.map((place) => [place.id, place])).values()
        );
        const openPlaces = uniquePlaces.filter(
            (place) => place.regularOpeningHours?.openNow
        );

        if (openPlaces.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        // 各スポットまでの移動時間を計算
        const origin = `${latitude},${longitude}`;
        const destinations = openPlaces.map((place) => `place_id:${place.id}`);
        const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations.join(
            "|"
        )}&key=${apiKey}&language=ja&mode=walking`;
        const matrixResponse = await axios.get<DistanceMatrixResponse>(matrixUrl);
        const elements = matrixResponse.data.rows[0].elements;

        // AIに渡すための場所リストを作成
        const placesForAI = openPlaces.map((place, index) => {
            const element = elements[index];
            if (element.status !== 'OK' || !element.duration) return null;

            const roundtripTravelTime = Math.ceil((element.duration.value * 2) / 60);
            const remainingTime = availableTime - roundtripTravelTime;

            if (remainingTime <= 10) return null;

            return {
                placeId: place.id,
                placeName: place.displayName?.text || '不明な場所',
                category: place.types?.find(t => categoriesToSearch.includes(t)) || '場所',
                remainingTime: remainingTime,
            };
        }).filter((p): p is NonNullable<typeof p> => p !== null);

        if (placesForAI.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        // AIに一度だけリクエストを送信
        const schema = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    placeId: { type: "string" },
                    estimatedDuration: { type: "number" },
                    activities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                icon: { type: "string" },
                            },
                        },
                    },
                },
                required: ["placeId", "estimatedDuration", "activities"],
            },
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            } as GenerationConfig,
        });

        const prompt = `
        あなたは卓越したライフスタイルプランナーです。
        以下の場所リストそれぞれについて、ユーザーが利用可能な最大時間に基づき、最適な「滞在時間」と具体的な「過ごし方」を提案してください。

        # ユーザーが利用可能な合計すきま時間: ${availableTime}分

        # 場所リスト:
        ${JSON.stringify(placesForAI, null, 2)}

        # 指示
        - 各場所について、'remainingTime'（移動時間を除いた残り時間）を超えない範囲で、最も推奨される「滞在時間(estimatedDuration)」を推定してください。
        - その時間でできる具体的な「過ごし方(activities)」を2〜3個提案してください。
        - 必ず、リストにあるすべての場所に対して提案を生成し、指定されたJSONスキーマの配列形式で回答してください。
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiSuggestions: { placeId: string; estimatedDuration: number; activities: any[] }[] = JSON.parse(response.text());

        //  Google Mapsの情報とAIの提案をマージ
        const finalSuggestions = aiSuggestions.map(aiSuggestion => {
            const place = openPlaces.find(p => p.id === aiSuggestion.placeId);
            const element = elements[openPlaces.findIndex(p => p.id === aiSuggestion.placeId)];

            if (!place || !element || !element.duration) return null;

            const roundtripTravelTime = Math.ceil((element.duration.value * 2) / 60);
            const totalTime = aiSuggestion.estimatedDuration + roundtripTravelTime;

            if (totalTime > availableTime) return null;

            return {
                id: place.id,
                title: place.displayName?.text,
                address: place.formattedAddress,
                lat: place.location?.latitude,
                lng: place.location?.longitude,
                rating: place.rating,
                travelTime: roundtripTravelTime,
                duration: aiSuggestion.estimatedDuration,
                activities: aiSuggestion.activities,
                totalTime,
                isPossible: true,
            };
        }).filter((s): s is NonNullable<typeof s> => s !== null);

        // 合計時間が短い順にソート
        finalSuggestions.sort((a, b) => a.totalTime - b.totalTime);

        return NextResponse.json(finalSuggestions, { status: 200 });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                "周辺スポットの検索に失敗しました (Axios Error):",
                error.response?.data
            );
        } else {
            console.error("周辺スポットの検索に失敗しました:", error);
        }
        return NextResponse.json(
            { message: "提案の生成に失敗しました" },
            { status: 500 }
        );
    }
};