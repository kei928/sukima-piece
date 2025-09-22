"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// 設定するカテゴリのリスト
const categories = [
  { key: "cafe", name: "カフェ" },
  { key: "restaurant", name: "レストラン" },
  { key: "park", name: "公園" },
  { key: "book_store", name: "本屋" },
  { key: "movie_theater", name: "映画館" },
];

export default function DurationSettingsPage() {
  const [durations, setDurations] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ページ読み込み時に現在の設定を取得
  useEffect(() => {
    const fetchDurations = async () => {
      try {
        const response = await axios.get("/api/durations");
        setDurations(response.data);
      } catch (error) {
        console.error("設定の読み込みに失敗しました", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDurations();
  }, []);

  const handleInputChange = (category: string, value: string) => {
    setDurations({
      ...durations,
      [category]: Number(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("保存中...");
    try {
      await axios.post("/api/durations", durations);
      setMessage("設定を保存しました！");
    } catch (error) {
      setMessage("エラーが発生しました。");
      console.error("設定の保存に失敗しました", error);
    }
  };

  if (isLoading) {
    return <p className="text-center">読み込み中...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-teal-600 mb-4 text-center">
            カテゴリ別滞在時間の設定
          </h1>
          <p className="mb-8 text-slate-600 text-center">
            「周辺のスポット」を検索する際の、
            <br />
            カテゴリごとのデフォルトの滞在時間を設定します。
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {categories.map(({ key, name }) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <label
                  htmlFor={key}
                  className="text-lg font-medium text-slate-800"
                >
                  {name}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    id={key}
                    value={durations[key] || 30} // デフォルト値は30分
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-28 border-slate-300 rounded-lg shadow-sm text-center text-lg py-2 focus:border-teal-500 focus:ring-teal-500"
                    min="1"
                  />
                  <span className="text-slate-600">分</span>
                </div>
              </div>
            ))}

            <div className="text-right pt-4">
              <button
                type="submit"
                className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
              >
                保存する
              </button>
              {message && (
                <p className="text-sm mt-4 text-center text-slate-500">
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
