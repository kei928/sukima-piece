"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import SuggestionCard from "@/components/SuggestionCard";
import { Suggestion as ApiSuggestion } from "../api/suggestions/route";
import SuggestionsMap from "@/components/SuggestionsMap";
import Link from "next/link";

export type Suggestion = ApiSuggestion & {
  rating?: number;
};

// useSearchParamsをラップするコンポーネント
function SuggestionsContent() {
  const searchParams = useSearchParams();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null); // ハイライト用State
  const mode = searchParams.get("mode") ;

  const currentLocation = {
    lat: Number(searchParams.get("lat")),
    lng: Number(searchParams.get("lng")),
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      const time = searchParams.get("time");
      const mode = searchParams.get("mode");
      const theme = searchParams.get("theme");

      if (!time || !currentLocation.lat || !currentLocation.lng || !mode) {
        setError("検索条件が不足しています。");
        setIsLoading(false);
        return;
      }

      try {
        let apiUrl = "";
        let requestBody = {};

        // modeに応じてAPIのURLとリクエストボディを切り替える
        if (mode === "nearby") {
          apiUrl = "/api/nearby-suggestions";
          requestBody = {
            availableTime: Number(time),
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            theme: theme || "relax", // デフォルトは'relax'
          };
        } else {
          // デフォルトは 'myActions'
          apiUrl = "/api/suggestions";
          requestBody = {
            availableTime: Number(time),
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
          };
        }

        const response = await axios.post<Suggestion[]>(apiUrl, requestBody);

        //place_idをidとして利用するための変換
        const formattedSuggestions = response.data.map((s) => ({
          ...s,
          // @ts-ignore
          id: s.id || s.name, // name は place_id が入っている想定
        }));

        setSuggestions(formattedSuggestions);
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
    <div className="flex flex-col md:flex-row h-full">
      {/* 左側: 地図エリア */}
      <div className="md:w-1/2 p-4 flex-1">
        <SuggestionsMap
          suggestions={suggestions}
          currentLocation={currentLocation}
          highlightedId={highlightedId}
        />
      </div>

      {/* 右側: リストエリア */}
      <div className="md:w-1/2 p-4 space-y-4 overflow-y-auto flex-1">
        <h1 className="text-2xl font-bold text-gray-800">
          スキマ時間 ({searchParams.get("time")}分) の提案
        </h1>
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <Link
              href={`/suggestions/${suggestion.id}?mode=${mode}`}
              key={suggestion.id}
            >
              <SuggestionCard
                title={suggestion.title}
                taskTime={suggestion.duration}
                travelTime={suggestion.travelTime}
                isPossible={suggestion.isPossible}
                rating={suggestion.rating}
                onMouseEnter={() => setHighlightedId(suggestion.id)}
                onMouseLeave={() => setHighlightedId(null)}
              />
            </Link>
          ))
        ) : (
          <p className="text-gray-500">
            条件に合うアクションは見つかりませんでした。
          </p>
        )}
      </div>
    </div>
  );
}

export default function SuggestionsPage() {
  return (
    <div className="h-[calc(100vh-88px)]">
      <Suspense fallback={<p className="text-center mt-10">読み込み中...</p>}>
        <SuggestionsContent />
      </Suspense>
    </div>
  );
}
