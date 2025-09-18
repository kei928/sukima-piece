import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const placeId = params.id;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ message: 'Google Maps APIキーが設定されていません' }, { status: 500 });
    }

    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                // 取得する情報をフィールドマスクで指定
                'X-Goog-FieldMask': 'displayName,formattedAddress,location,rating,websiteUri,photos,reviews',
            },
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Google Places APIのエラー:', error.response?.data || error.message);
        } else {
            console.error('予期せぬエラー:', error);
        }
        return NextResponse.json({ message: '場所の詳細情報の取得に失敗しました' }, { status: 500 });
    }
}