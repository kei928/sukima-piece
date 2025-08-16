"use client"; //コンポーネントがサーバーコンポーネントではなく、クライアントコンポーネントであることを示す

import { useState } from "react";
import SuggestionCard from "@/components/SuggestionCard"; 

const dummySuggestions = [// ダミーデータとして提案リストを定義 実際に時間をどう決めるかは検討中
  { id: 1, title: '郵便局で荷物を出す', taskTime: 10, travelTime: 15, isPossible: true },
  { id: 2, title: '近くのカフェでコーヒーを飲む', taskTime: 30, travelTime: 10, isPossible: true },
  { id: 3, title: '書店で新刊をチェック', taskTime: 20, travelTime: 25, isPossible: false },
  { id: 4, title: 'スーパーで昼食を買う', taskTime: 5, travelTime: 8, isPossible: true },
  { id: 5, title: '隣町の人気ラーメン店に行く', taskTime: 40, travelTime: 45, isPossible: false },
];


export default function Home() {
  const [avaivlavleTime, setAvailableTime] = useState(""); // スキマ時間な時間を管理するための状態変数

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {// フォームの送信時に呼ばれる関数
    event.preventDefault(); // フォームのデフォルトの送信動作を防ぐ
    alert(`スキマ時間: ${avaivlavleTime} 分`); // 入力されたスキマ時間をがわかるようアラートで表示
  };
  return (
     <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-800">Sukimable</h1>
        <p className="mt-2 text-lg text-gray-600">
          あなたの予定の隙間､埋めます
        </p>

        {/* スキマ時間を入力するためのフォーム */}
        <form onSubmit={handleSubmit} className="mt-8">
          <label
            htmlFor="time-input"
            className="block text-sm font-medium text-gray-700 items-center"
          >
            スキマ時間 (分):
          </label>
          {/* 入力のさせ方もっと見やすいやり方ありそう*/}
          <div className="mt-2 flex rouded-md shadow-sm">
            <input
              type="number"
              id="time-input"
              value={avaivlavleTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="例: 30"
            />
            <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">分</span>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            間に合うことを探す
          </button>
        </form>
      </div>

      {/* 提案カードを表示するためのセクション */}
      <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800">提案リスト</h2>
          <div className="mt-4 space-y-4">
            {/* 仮にサンプルデータから取り出す*/}
            
            {dummySuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id} // 各カードの一意のキーとしてIDを使用
                title={suggestion.title}
                taskTime={suggestion.taskTime}
                travelTime={suggestion.travelTime}
                isPossible={suggestion.isPossible}
              />
            ))}
          </div>
        </div>
    </main>
  );
}
