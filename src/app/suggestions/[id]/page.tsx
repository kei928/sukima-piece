"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import ActionMap from "@/components/ActionMap";
import Image from "next/image";

// 場所の詳細情報の型
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
  duration?: number;
};

// マイピースの型
type ActionDetails = {
  title: string;
  description?: string;
  address?: string;
  duration: number;
  lat?: number; // 緯度経度は別途取得する必要がある
  lng?: number;
};

const StarRating = ({ rating }: { rating: number }) => {
  if (!rating) return null;
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full_${i}`} className="text-yellow-400">
          ★
        </span>
      ))}
      {halfStar && <span className="text-yellow-400">★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty_${i}`} className="text-gray-300">
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function SuggestionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const mode = searchParams.get("mode");
  const duration = searchParams.get("duration");

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
          if (duration) {
            response.data.duration = parseInt(duration, 10);
          }
        } else {
          // myActions
          response = await axios.get(`/api/actions/${id}`);
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
  }, [id, mode, duration]);

  const handleNavigation = () => {
    const address =
      mode === "nearby"
        ? (details as PlaceDetails).formattedAddress
        : (details as ActionDetails).address;

    if (address) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        address
      )}`;
      window.open(url, "_blank");
    } else {
      alert("この場所の住所情報がないため、ルート案内を開始できません。");
    }
  };

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

  const photo =
    mode === "nearby" ? (details as PlaceDetails).photos?.[0] : null;
  const photoUrl = photo
    ? `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {photoUrl ? (
          <div className="relative w-full h-64">
            <Image
              src={photoUrl}
              alt={(details as PlaceDetails).displayName?.text || "場所の写真"}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">写真はありません</p>
          </div>
        )}

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

          {mode === "nearby" && (details as PlaceDetails).rating && (
            <div className="mb-4">
              <StarRating rating={(details as PlaceDetails).rating!} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">詳細情報</h2>
              <div className="space-y-4 text-gray-700">
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

                <button
                  onClick={handleNavigation}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-teal-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  ルートを見る
                </button>

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
                {mode === "nearby" && (details as PlaceDetails).reviews && (
                  <div className="mt-8 pt-6 border-t">
                    <h2 className="text-2xl font-bold mb-4">レビュー</h2>
                    <div className="space-y-6">
                      {(details as PlaceDetails).reviews
                        ?.slice(0, 3)
                        .map((review, index) => (
                          <div
                            key={index}
                            className="border-b pb-4 last:border-b-0"
                          >
                            <div className="flex items-center mb-2">
                              <p className="font-semibold">
                                {review.authorAttribution.displayName}
                              </p>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {review.text?.text || "レビュー本文なし"}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
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
        </div>
      </div>
    </div>
  );
}