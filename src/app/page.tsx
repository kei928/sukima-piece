"use client"; //コンポーネントがサーバーコンポーネントではなく、クライアントコンポーネントであることを示す

import { useState } from "react";
import { useRouter } from "next/navigation"; // next/navigationからuseRouterをインポート

type Location = {
  // 緯度経度を保存するための型
  latitude: number;
  longitude: number;
};

export default function Home() {
  const [availableTime, setAvailableTime] = useState(""); // スキマ時間な時間を管理するための状態変数
  const [location, setLocation] = useState<Location | null>(null); // 緯度経度を保存するstate
  const [locationLoading, setLocationLoading] = useState(false); // 読み込み中かどうかを示すstate

  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // useRouterフックを使用

  //探すボタンが押されたときに呼ばれる関数
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // フォームのデフォルトの送信動作を防ぐ
    setError(null);

    if (!availableTime || Number(availableTime) <= 0) {
      setError("有効なスキマ時間を入力してください。");
      return;
    }
    if (!location) {
      setError("まず現在地を取得してください。");
      return;
    }

    // URLクエリパラメータを作成
    const params = new URLSearchParams({
      time: availableTime,
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
    });

    // /suggestionsページにパラメータを付けて遷移
    router.push(`/suggestions?${params.toString()}`);
  };
  const handleGetCurrentLocation = () => {
    setLocationLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(
        "お使いのブラウザでは位置情報サービスがサポートされていません。"
      );
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
        setError(
          "位置情報の取得に失敗しました。ブラウザの設定を確認してください。"
        );
        setLocationLoading(false);
      }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-800">Sukima Piece</h1>
        <p className="mt-2 text-lg text-gray-600">
          あなたの予定の隙間､埋めます
        </p>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
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
            {location && (
              <div className="text-green-700 text-sm mt-2 p-2 bg-green-50 rounded-md">
                <p>✓ 位置情報を取得しました</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSearch}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Step 2: スキマ時間を入力
            </h2>
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
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              type="submit"
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              間に合うことを探す
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
