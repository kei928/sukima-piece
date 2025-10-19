"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import SuggestionCard from "@/components/SuggestionCard";
import SuggestionsMap from "@/components/SuggestionsMap";
import Link from "next/link";
import { Activity } from "../api/ai-suggestions/route"; // AIが生成する過ごし方の型をインポート
import { Suggestion as ApiSuggestion } from "../api/suggestions/route"; // 既存の型をインポート

// ページ内で使用するSuggestionの型を拡張
export type Suggestion = (ApiSuggestion | { rating?: number; activities: Activity[] }) & {
  id: string;
  title: string;
  travelTime: number;
  totalTime: number;
  isPossible: boolean;
  lat: number;
  lng: number;
  duration: number;
};

// メインの処理コンポーネント
function SuggestionsContent() {
  const searchParams = useSearchParams();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const mode = searchParams.get("mode");

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

        if (mode === "nearby") {
          apiUrl = "/api/nearby-suggestions";
          requestBody = {
            availableTime: Number(time),
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            theme: theme || "relax",
          };
        } else {
          apiUrl = "/api/suggestions";
          requestBody = {
            availableTime: Number(time),
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
          };
        }

        const response = await axios.post<Suggestion[]>(apiUrl, requestBody);
        setSuggestions(response.data);
      } catch (err) {
        setError("提案の取得中にエラーが発生しました。");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!isNaN(currentLocation.lat) && !isNaN(currentLocation.lng)) {
        fetchSuggestions();
    } else {
        setError("無効な座標です。");
        setIsLoading(false);
    }
  }, [searchParams, currentLocation.lat, currentLocation.lng]);

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <p className="text-lg font-semibold text-teal-600">
          AIがあなたにぴったりの過ごし方を考えています...
        </p>
        <p className="text-slate-500 mt-2">
          周辺のスポット情報と合わせて、最適な滞在時間と過ごし方を提案します。
        </p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 p-10">{error}</p>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-8">
      <div className="md:w-1/2 p-4 flex-1">
        <SuggestionsMap
          suggestions={suggestions as unknown as ApiSuggestion[]}
          currentLocation={currentLocation}
          highlightedId={highlightedId}
        />
      </div>
      <div className="md:w-1/2 p-4 space-y-4 overflow-y-auto flex-1">
        <h1 className="text-2xl font-bold text-gray-800">
          スキマ時間 ({searchParams.get("time")}分) の提案
        </h1>
        {suggestions.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {suggestions.map((suggestion) => {
              // activities がある場合のみURLパラメータとして渡す
              const suggestionActivities = 'activities' in suggestion ? suggestion.activities : [];
              const href = `/suggestions/${suggestion.id}?mode=${mode}&duration=${suggestion.duration}${
                suggestionActivities.length > 0
                  ? `&activities=${encodeURIComponent(JSON.stringify(suggestionActivities))}`
                  : ''
              }`;

              return (
                <Link href={href} key={suggestion.id}>
                  <SuggestionCard
                    title={suggestion.title}
                    taskTime={suggestion.duration}
                    travelTime={suggestion.travelTime}
                    isPossible={suggestion.isPossible}
                    rating={'rating' in suggestion ? suggestion.rating : undefined}
                    activities={'activities' in suggestion ? suggestion.activities : undefined}
                    onMouseEnter={() => setHighlightedId(suggestion.id)}
                    onMouseLeave={() => setHighlightedId(null)}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">
            条件に合うピースは見つかりませんでした。
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