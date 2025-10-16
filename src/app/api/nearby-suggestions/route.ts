import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import { prisma } from "@/libs/prismaClient";

//フロントエンドから受け取るデータの型
type NearbyRequest = {
    latitude: number;
    longitude: number;
    theme: string; // カテゴリフィルター
    availableTime: number;
}

//テーマに基づいて使用するカテゴリを定義
const themeToCategories: { [key: string]: string[] } = {
    relax: ['cafe', 'park', 'book_store'],
    eat: ['restaurant', 'cafe'],
    fun: ['amusement_park', 'movie_theater',],
    anything: ['cafe', 'park', 'museum', 'restaurant', 'amusement_park', 'movie_theater', 'book_store', 'shopping_mall'],
};

//Google Places APIのレスポンスの型
type Place = {
    id: string; // place_id
    displayName?: {
        text: string;
        languageCode: string;
    };
    formattedAddress?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    regularOpeningHours?: {
        openNow: boolean;
    };
    rating?: number;
    types?: string[];
};


type DistanceMatrixResponse = {
    rows: {
        elements: {
            status: string;
            duration?: {
                value: number;
            };
        }[];
    }[];
};

//特定のカテゴリで近くの場所を検索
const searchPlacesByCategory = (category: string, latitude: number, longitude: number, apiKey: string) => {
    const url = "https://places.googleapis.com/v1/places:searchNearby";
    const requestBody = {
        includedTypes: [category],
        maxResultCount: 5, // 1カテゴリあたりの取得件数を調整
        locationRestriction: { circle: { center: { latitude, longitude }, radius: 1500.0 } },
        languageCode: "ja",
    };
    return axios.post<{ places: Place[] }>(url, requestBody, {
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.regularOpeningHours,places.rating",
        },
    });
};

export const POST = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        const { latitude, longitude, theme, availableTime }: NearbyRequest = await req.json();
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) throw new Error("APIキーが設定されていません");

        const categoriesToSearch = themeToCategories[theme] || themeToCategories.anything;

        //選択されたテーマに基づいて複数のカテゴリで場所を検索
        const placesPromises = categoriesToSearch.map(category =>
            searchPlacesByCategory(category, latitude, longitude, apiKey)
        );

        const responses = await Promise.all(placesPromises);

        //重複を排除し、すべての場所を一つの配列にまとめる
        const allPlaces = responses.flatMap(res => res.data.places || []);
        const uniquePlaces = Array.from(new Map(allPlaces.map(place => [place.id, place])).values());// place.idで重複排除

        const openPlaces = uniquePlaces.filter(place => place.regularOpeningHours?.openNow);

        if (openPlaces.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const durationMap = new Map<string, number>();
        // ログインしている場合のみ、DBから滞在時間設定を取得
        if (session?.user?.id) {
            const durationSettings = await prisma.categoryDuration.findMany({
                where: { userId: session.user.id },
            });
            durationSettings.forEach(d => durationMap.set(d.category, d.duration));
        }

        // 各場所までの移動時間を計算
        const origin = `${latitude},${longitude}`;
        const destinations = openPlaces.map(place => `place_id:${place.id}`).join('|');
        const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&key=${apiKey}&language=ja&mode=walking`;

        const matrixResponse = await axios.get<DistanceMatrixResponse>(matrixUrl);
        const elements = matrixResponse.data.rows[0].elements;

        //利用可能な時間内に行ける場所をフィルタリング
        const suggestions = openPlaces.map((place, index) => {
            const element = elements[index];
            if (element.status !== 'OK' || !element.duration) return null;


            // カテゴリに合った滞在時間を取得 (設定がなければ30分)
            const categoryKey = categoriesToSearch.find(cat => place.types?.includes(cat)) || categoriesToSearch[0];
            const stayDuration = durationMap.get(categoryKey) || 30;

            const travelTimeInSeconds = element.duration.value;
            const roundtripTravelTime = Math.ceil((travelTimeInSeconds * 2) / 60);

            const totalTime = stayDuration + roundtripTravelTime;

            if (totalTime <= availableTime) {
                return {
                    id: place.id, // IDとしてplace.idを使用
                    title: place.displayName?.text,
                    address: place.formattedAddress,
                    duration: stayDuration,
                    lat: place.location?.latitude,
                    lng: place.location?.longitude,
                    travelTime: roundtripTravelTime,
                    totalTime: totalTime,
                    isPossible: true,
                    rating: place.rating,
                };
            }
            return null;
        }).filter(Boolean); // nullを除外

        return NextResponse.json(suggestions, { status: 200 });

    } catch (error) {
        // Axiosのエラーレスポンスをログに出力
        if (axios.isAxiosError(error)) {
            console.error("周辺スポットの検索に失敗しました (Axios Error):", error.response?.data);
        } else {
            console.error("周辺スポットの検索に失敗しました:", error);
        }
        return NextResponse.json({ message: "提案の生成に失敗しました" }, { status: 500 });
    }
}
