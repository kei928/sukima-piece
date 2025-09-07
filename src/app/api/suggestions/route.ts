import { prisma } from "@/libs/prismaClient";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { Action } from "@prisma/client";
import axios from "axios";

export type SuggestionsRequest = {
    availableTime: number;
    latitude: number;
    longitude: number;
};

//Google Maps APIからのレスポンスの型定義
type DistanceMatrixResponse = {
    rows: {
        elements: {
            status: string;
            duration?: {
                value: number; //秒単位の所要時間
            };
        }[];
    }[];
    status: string;
    error_message?: string;
};

type GeocodingResponse = {
    results: {
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    }[];
    status: string;
};

export type Suggestion = Action & {
    travelTime: number; //移動時間（秒）
    totalTime: number; //合計時間（アクションの所要時間 + 移動時間）
    isPossible: boolean; //利用可能かどうか
    lat: number; //緯度
    lng: number; //経度
};

const getDurations = async (origin: string, destinations: string[], mode: 'transit' | 'walking', apiKey: string): Promise<DistanceMatrixResponse['rows'][0]['elements']> => {
    const destinationsString = destinations.join('|');
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinationsString}&key=${apiKey}&mode=${mode}`;

    const response = await axios.get<DistanceMatrixResponse>(url);

    if (response.data.status !== 'OK') {
        console.error(`Google Maps API Error (mode: ${mode}):`, response.data.error_message || response.data.status);
        throw new Error(`Distance Matrix APIのリクエストに失敗しました。Status: ${response.data.status}`);
    }
    return response.data.rows[0].elements;
}


export const POST = async (req: NextRequest): Promise<NextResponse> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json(
                { message: '認証されていません' },
                { status: 401 },
            );
        }
        const requestBody: SuggestionsRequest = await req.json();
        const availableTime = Number(requestBody.availableTime);
        const { latitude, longitude } = requestBody;
        const userId = session.user.id;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            throw new Error('Google Maps APIキーが設定されていません');
        }

        //ユーザーのアクションを取得
        const userActions = await prisma.action.findMany({
            where: {
                userId,
                address: {
                    not: null
                }
            },
        });
        //アクションが一つもない場合は空配列を返す
        if (userActions.length === 0) {
            return NextResponse.json([], { status: 200 });
        }
        const origins = `${latitude},${longitude}`;
        const actionAddresses = userActions.map(action => action.address as string);

        //ジオコーディングAPIを使って住所から緯度経度を取得
        const geocodingPromises = actionAddresses.map(address => {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
            return axios.get<GeocodingResponse>(url);
        });

        const geocodingResponses = await Promise.all(geocodingPromises);

        const coordinatesMap: { [address: string]: { lat: number, lng: number } } = {};
        geocodingResponses.forEach((res, index) => {
            if (res.data.status === 'OK' && res.data.results.length > 0) {
                const address = actionAddresses[index];
                coordinatesMap[address] = res.data.results[0].geometry.location;
            }
        });



        // まず公共交通機関(transit)で試す ここらへんなんかうまく動いてなさそう
        const transitElements = await getDurations(origins, actionAddresses, 'transit', apiKey);

        const successfulDurations: { [address: string]: number } = {};
        const failedActions: Action[] = [];
        transitElements.forEach((element, index) => {
            const address = actionAddresses[index];
            if (element.status === 'OK' && element.duration) {
                successfulDurations[address] = element.duration.value;
            } else {
                failedActions.push(userActions[index]);
            }
        });

        if (failedActions.length > 0) {
            // 公共交通機関で失敗したアクションについては徒歩(walking)で再試行 ★
            const failedAddresses = failedActions.map(action => action.address as string);
            const walkingElements = await getDurations(origins, failedAddresses, 'walking', apiKey);

            walkingElements.forEach((element, index) => {
                const address = failedAddresses[index];
                if (element.status === 'OK' && element.duration) {
                    successfulDurations[address] = element.duration.value;
                }
            });
        }

        // 各アクションについて間に合うか判定
        const suggestions: Suggestion[] = userActions.map((action) => {
            const address = action.address as string;
            const travelTimeInSeconds = successfulDurations[address] || 0;
            const location = coordinatesMap[address];
            //座標が取得できなかった場合はスキップ
            if (!location) return null;

            const roundTripTravelTime = Math.ceil((travelTimeInSeconds * 2) / 60);
            const totalTime = action.duration + roundTripTravelTime;
            const isPossible = totalTime <= availableTime;

            return {
                ...action,
                travelTime: roundTripTravelTime,
                totalTime,
                isPossible,
                lat: location.lat,
                lng: location.lng,
            };
        }).filter((s): s is Suggestion => s !== null); // nullを除外

        return NextResponse.json(suggestions, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: '提案の取得に失敗しました' },
            { status: 500 },
        )
    };
    
}


