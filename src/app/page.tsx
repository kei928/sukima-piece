"use client"; //コンポーネントがサーバーコンポーネントではなく、クライアントコンポーネントであることを示す

import { useState } from "react";
import SuggestionCard from "@/components/SuggestionCard";
import axios from "axios";
import { Suggestion, SuggestionsRequest } from "./api/suggestions/route";

type Location = {
  // 緯度経度を保存するための型
  latitude: number;
  longitude: number;
};

export default function Home() {
  const [availableTime, setAvailableTime] = useState(""); // スキマ時間な時間を管理するための状態変数
  const [location, setLocation] = useState<Location | null>(null); // 緯度経度を保存するstate
  const [locationLoading, setLocationLoading] = useState(false); // 読み込み中かどうかを示すstate
  const [locationError, setLocationError] = useState<string | null>(null); // エラーメッセージを保存するstate

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // 提案リストを保存するstate
  const [suggestionsLoading, setSuggestionsLoading] = useState(false); // 提案リストの読み込み中を示すstate
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null); // 提案リストのエラーメッセージを保存するstate

  //探すボタンが押されたときに呼ばれる関数
  const handleSuggestionSearch = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault(); // フォームのデフォルトの送信動作を防ぐ
    if (!availableTime || Number(availableTime) <= 0) {
      setSuggestionsError("有効なスキマ時間を入力してください。");
      return;
    }
    if (!location) {
      setSuggestionsError("現在地が取得できていません。");
      return;
    }

    setSuggestionsLoading(true);
    setSuggestionsError(null);
    setSuggestions([]); // 前の提案をクリア

    try {
      const requestData: SuggestionsRequest = {
        availableTime: Number(availableTime),
        latitude: location.latitude,
        longitude: location.longitude,
      };
      // バックエンドのAPIにリクエストを送信
      const response = await axios.post<Suggestion[]>(
        "/api/suggestions",
        requestData
      );
      setSuggestions(response.data);
    } catch (err) {
      console.error(err);
      setSuggestionsError("提案の取得に失敗しました。");
    } finally {
      setSuggestionsLoading(false);
    }
  };
  //現在地を取得する関数
  const handleGetCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("このブラウザでは位置情報が取得できません。");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError("位置情報の取得に失敗しました。");
        console.error(err);
        setLocationLoading(false);
      }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-800">Sukimable</h1>
        <p className="mt-2 text-lg text-gray-600">
          あなたの予定の隙間､埋めます
        </p>

        <div className="my-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 現在地取得 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Step 1: 現在地を取得
            </h2>
            <button
              onClick={handleGetCurrentLocation}
              disabled={locationLoading}
              className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {locationLoading ? "取得中…" : "現在地を取得する"}
            </button>
            {locationError && (
              <p className="text-red-500 text-sm mt-2">{locationError}</p>
            )}
            {location && (
              <div className="text-green-700 text-sm mt-2 p-2 bg-green-50 rounded-md">
                <p>✓ 位置情報を取得しました</p>
              </div>
            )}
          </div>

          {/*  スキマ時間入力と検索 */}
          <form onSubmit={handleSuggestionSearch}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Step 2: スキマ時間を入力
            </h2>
            <label
              htmlFor="time-input"
              className="block text-sm font-medium text-gray-700 text-left mb-1"
            >
              次の予定までの空き時間
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                id="time-input"
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="例: 60"
                min="1"
              />
              <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                分
              </span>
            </div>
            <button
              type="submit"
              disabled={suggestionsLoading}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {suggestionsLoading ? "検索中…" : "間に合うことを探す"}
            </button>
          </form>
        </div>
      </div>

      {/* 提案カード表示エリア */}
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          提案リスト
        </h2>
        {suggestionsLoading && <p className="text-center">検索しています...</p>}
        {suggestionsError && (
          <p className="text-center text-red-500">{suggestionsError}</p>
        )}

        {!suggestionsLoading && suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                title={suggestion.title}
                taskTime={suggestion.duration} // actionのdurationを使用
                travelTime={suggestion.travelTime}
                isPossible={suggestion.isPossible}
              />
            ))}
          </div>
        )}

        {!suggestionsLoading &&
          !suggestionsError &&
          suggestions.length === 0 && (
            <p className="text-center text-gray-500">
              条件に合うアクションは見つかりませんでした。
            </p>
          )}
      </div>
    </main>
  );
}
