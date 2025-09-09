"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import SuggestionCard from "@/components/SuggestionCard";
import { Suggestion } from "../api/suggestions/route";
import SuggestionsMap from "@/components/SuggestionsMap";

// useSearchParamsをラップするコンポーネント
function SuggestionsContent() {
  const searchParams = useSearchParams();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null); // ハイライト用State

  const currentLocation = {
    lat: Number(searchParams.get("lat")),
    lng: Number(searchParams.get("lng")),
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      const time = searchParams.get("time");
      if (!time || !currentLocation.lat || !currentLocation.lng) {
        setError("検索条件が不足しています。");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post<Suggestion[]>("/api/suggestions", {
          availableTime: Number(time),
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        });
        setSuggestions(response.data);
      } catch (err) {
        setError("提案の取得中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [searchParams, currentLocation.lat, currentLocation.lng]);

  if (isLoading) {
    return <p className="text-center">提案を探しています...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // 緯度経度が不正な場合はエラー表示
  if (isNaN(currentLocation.lat) || isNaN(currentLocation.lng)) {
    return <p className="text-center mt-10 text-red-500">無効な座標です。</p>;
  }

   return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-88px)]"> {/* ヘッダー分の高さを引く */}
            {/* 左側: 地図エリア */}
            <div className="md:w-1/2 h-1/2 md:h-full p-4">
                <SuggestionsMap 
                    suggestion={suggestions}
                    currentLocation={currentLocation}
                    highlightId={highlightedId}
                />
            </div>

            {/* 右側: リストエリア */}
            <div className="md:w-1/2 h-1/2 md:h-full overflow-y-auto p-4 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    スキマ時間 ({searchParams.get('time')}分) の提案
                </h1>
                {suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                        <SuggestionCard
                            key={suggestion.id}
                            title={suggestion.title}
                            taskTime={suggestion.duration}
                            travelTime={suggestion.travelTime}
                            isPossible={suggestion.isPossible}
                            onMouseEnter={() => setHighlightedId(suggestion.id)}
                            onMouseLeave={() => setHighlightedId(null)}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">条件に合うアクションは見つかりませんでした。</p>
                )}
            </div>
        </div>
    );
}

export default function SuggestionsPage() {
    return (
        <Suspense fallback={<p className="text-center mt-10">読み込み中...</p>}>
            <SuggestionsContent />
        </Suspense>
    );
}