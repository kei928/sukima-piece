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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">カテゴリ別滞在時間の設定</h1>
      <p className="mb-6 text-gray-600">
        「周辺のスポット」を検索する際の、カテゴリごとのデフォルトの滞在時間を設定します。
      </p>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-lg shadow-sm"
      >
        {categories.map(({ key, name }) => (
          <div key={key} className="flex items-center justify-between">
            <label htmlFor={key} className="text-lg font-medium text-gray-700">
              {name}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id={key}
                value={durations[key] || 30} // デフォルト値は30分
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="w-24 border-gray-300 rounded-md shadow-sm text-center"
                min="1"
              />
              <span>分</span>
            </div>
          </div>
        ))}

        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存する
          </button>
          {message && <p className="text-sm mt-4 text-center">{message}</p>}
        </div>
      </form>
    </div>
  );
}
