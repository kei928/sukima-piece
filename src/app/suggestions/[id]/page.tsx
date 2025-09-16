"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import ActionMap from "@/components/ActionMap";

// 場所の詳細情報の型 (Google Places APIのレスポンスに合わせる)
type PlaceDetails = {
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  websiteUri?: string;
  reviews?: {
    authorAttribution: { displayName: string };
    text: { text: string };
  }[];
  photos?: { name: string }[];
};

// マイアクションの型
type ActionDetails = {
  title: string;
  description?: string;
  address?: string;
  duration: number;
  lat?: number; // 緯度経度は別途取得する必要がある
  lng?: number;
};

export default function SuggestionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const mode = searchParams.get("mode");

  const [details, setDetails] = useState<PlaceDetails | ActionDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !mode) {
      setError("不正なアクセスです。");
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        let response;
        if (mode === "nearby") {
          response = await axios.get(`/api/places/${id}`);
        } else {
          // myActions
          response = await axios.get(`/api/actions/${id}`);
          // マイアクションの場合、住所から緯度経度を別途取得
          if (response.data.address) {
            const geoResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                response.data.address
              )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            if (geoResponse.data.results[0]) {
              const location = geoResponse.data.results[0].geometry.location;
              response.data.lat = location.lat;
              response.data.lng = location.lng;
            }
          }
        }
        setDetails(response.data);
      } catch (err) {
        setError("詳細情報の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, mode]);

  if (isLoading) return <p className="text-center p-10">読み込み中...</p>;
  if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
  if (!details)
    return <p className="text-center p-10">情報が見つかりません。</p>;

  // 緯度経度を取得
  const location =
    mode === "nearby"
      ? (details as PlaceDetails).location
      : {
          latitude: (details as ActionDetails).lat,
          longitude: (details as ActionDetails).lng,
        };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* TODO: Google Places APIから写真を取得して表示する */}

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">
            {mode === "nearby"
              ? (details as PlaceDetails).displayName?.text
              : (details as ActionDetails).title}
          </h1>
          <p className="text-gray-600 mb-4">
            {mode === "nearby"
              ? (details as PlaceDetails).formattedAddress
              : (details as ActionDetails).address}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">詳細情報</h2>
              <div className="space-y-2 text-gray-700">
                {mode === "myActions" && (
                  <p>
                    <strong>説明:</strong>{" "}
                    {(details as ActionDetails).description || "なし"}
                  </p>
                )}
                <p>
                  <strong>所要時間:</strong> 約{" "}
                  {(details as { duration: number }).duration} 分
                </p>
                {mode === "nearby" && (details as PlaceDetails).rating && (
                  <p>
                    <strong>評価:</strong>{" "}
                    {(details as PlaceDetails).rating?.toFixed(1)} ★
                  </p>
                )}
                {mode === "nearby" && (details as PlaceDetails).websiteUri && (
                  <p>
                    <strong>ウェブサイト:</strong>{" "}
                    <a
                      href={(details as PlaceDetails).websiteUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      サイトを見る
                    </a>
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-3">場所</h2>
              {location && location.latitude && location.longitude ? (
                <ActionMap lat={location.latitude} lng={location.longitude} />
              ) : (
                <p className="text-gray-500">地図情報を表示できません。</p>
              )}
            </div>
          </div>

          {/* TODO: Google Places APIからレビューを取得して表示する */}
        </div>
      </div>
    </div>
  );
}
