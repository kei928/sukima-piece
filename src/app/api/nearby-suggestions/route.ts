import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

//フロントエンドから受け取るデータの型
type NearbyRequest = {
    latitude: number;
    longitude: number;
    category: string; // カテゴリフィルター
    availableTime: number;
}

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

export const POST = async (req: NextRequest) => {
    try {
        const { latitude, longitude, category, availableTime }: NearbyRequest = await req.json();
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) throw new Error("APIキーが設定されていません");

        //Google Places APIで周辺のスポットを検索
        const placesUrl = "https://places.googleapis.com/v1/places:searchNearby";

        const requestBody = {
            includedTypes: [category],
            maxResultCount: 10, // 取得する件数 (最大20)
            locationRestriction: {
                circle: {
                    center: {
                        latitude: latitude,
                        longitude: longitude,
                    },
                    radius: 1500.0, // 検索範囲 (メートル)
                },
            },
            languageCode: "ja",
        };

        const placesResponse = await axios.post<{ places: Place[] }>(
            placesUrl,
            requestBody,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    // 必要な情報だけを取得するためのフィールドマスク
                    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.regularOpeningHours,places.rating",
                },
            }
        );

        const openPlaces = (placesResponse.data.places || []).filter(
            place => place.regularOpeningHours?.openNow
        );

        if (openPlaces.length === 0) {
            return NextResponse.json([], { status: 200 });
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

            const travelTimeInSeconds = element.duration.value;
            const roundtripTravelTime = Math.ceil((travelTimeInSeconds * 2) / 60);

            const stayDuration = category === 'cafe' ? 60 : 30;
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
