"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Location = {
  latitude: number;
  longitude: number;
};

const themes = [
  { key: "relax", name: "リラックス" },
  { key: "eat", name: "食事" },
  { key: "fun", name: "お楽しみ" },
  { key: "anything", name: "おまかせ" },
];

type SearchMode = "myActions" | "nearby";

export default function Home() {
  const [availableTime, setAvailableTime] = useState("");
  const [isSearching, setIsSearching] = useState(false); // 検索処理中の状態
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [searchMode, setSearchMode] = useState<SearchMode>("nearby");
  const [theme, setTheme] = useState("relax");

  // handleSearchをasync関数に変更
  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!availableTime || Number(availableTime) <= 0) {
      setError("有効なスキマ時間を入力してください。");
      return;
    }

    setIsSearching(true); // 検索開始

    // 現在地を取得するPromise
    const getCurrentLocation = (): Promise<Location> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(
            "お使いのブラウザでは位置情報サービスがサポートされていません。"
          );
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            console.log(err);
            reject(
              "位置情報の取得に失敗しました。ブラウザの設定を確認してください。"
            );
          }
        );
      });
    };

    try {
      // 位置情報を取得
      const location = await getCurrentLocation();

      // URLクエリパラメータを作成
      const params = new URLSearchParams({
        time: availableTime,
        lat: location.latitude.toString(),
        lng: location.longitude.toString(),
        mode: searchMode,
      });

      if (searchMode === "nearby") {
        params.append("theme", theme);
      }

      // /suggestionsページにパラメータを付けて遷移
      router.push(`/suggestions?${params.toString()}`);
    } catch (err: unknown) {
      // ★★★ 'any' を 'unknown' に変更
      // ★★★ 型ガードを追加して安全にエラーメッセージをセット
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("予期せぬエラーが発生しました。");
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-5xl font-extrabold text-teal-600">Sukima Piece</h1>
        <p className="mt-3 text-lg text-slate-600">
          あなたの日常に、新しいピースを。
        </p>

        <div className="mt-10 p-8 bg-white rounded-2xl shadow-lg border border-slate-200 text-left">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* スキマ時間入力 */}
            <div>
              <label
                htmlFor="time-input"
                className="text-sm font-bold text-slate-700"
              >
                スキマ時間
              </label>
              <div className="mt-2 flex rounded-lg shadow-sm">
                <input
                  type="number"
                  id="time-input"
                  value={availableTime}
                  onChange={(e) => setAvailableTime(e.target.value)}
                  className="block w-full flex-1 rounded-none rounded-l-lg border-slate-300 px-4 py-3 text-lg focus:border-teal-500 focus:ring-teal-500"
                  placeholder="例: 60"
                  min="1"
                />
                <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-4 text-slate-600">
                  分
                </span>
              </div>
            </div>

            {/* 検索モード */}
            <div>
              <label className="text-sm font-bold text-slate-700">
                何を探す？
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setSearchMode("nearby")}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    searchMode === "nearby"
                      ? "bg-white text-teal-600 shadow"
                      : "bg-transparent text-slate-600"
                  }`}
                >
                  周辺のスポット
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("myActions")}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    searchMode === "myActions"
                      ? "bg-white text-teal-600 shadow"
                      : "bg-transparent text-slate-600"
                  }`}
                >
                  マイピース
                </button>
              </div>
            </div>

            {/* 気分選択 */}
            {searchMode === "nearby" && (
              <div>
                <label className="text-sm font-bold text-slate-700">
                  どんな気分？
                </label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {themes.map(({ key, name }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTheme(key)}
                      className={`p-3 rounded-lg text-sm font-semibold transition-colors border-2 ${
                        theme === key
                          ? "bg-orange-100 border-orange-400 text-slate-700"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm text-center pt-2">{error}</p>
            )}

            {/* メインアクションボタン */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSearching} // 検索中はボタンを無効化
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-teal-600 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:bg-slate-400 disabled:cursor-wait"
              >
                {isSearching ? "探しています..." : "ピースを探す"}
                <Image
                  src="/SP_logo.svg"
                  alt="Sukima Piece Logo"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
