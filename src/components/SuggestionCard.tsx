"use client";

import { useState } from "react";
import ActionMap from "./ActionMap";

type SuggestionCardProps = {
  title: string;
  taskTime: number;
  travelTime: number;
  isPossible: boolean;
  lat: number;
  lng: number;
};

export default function SuggestionCard({
  title,
  taskTime,
  travelTime,
  isPossible,
  lat,
  lng,
}: SuggestionCardProps) {
  const [showMap, setShowMap] = useState(false); // 地図の表示/非表示を管理するState
  const totalTime = taskTime + travelTime;

  const cardClasses = `
    bg-white p-4 rounded-lg shadow-md border-l-4 transition-all duration-300
    ${isPossible ? "border-green-500" : "border-red-500 opacity-60"}
  `;

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="text-sm text-gray-600 mt-2">
            <p>
              合計時間: 約 <strong>{totalTime}</strong> 分
            </p>
            <p className="mt-1">
              {" "}
              (用事: {taskTime}分 + 往復移動: {travelTime}分)
            </p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`font-semibold ${
              isPossible ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPossible ? "✓ 可能" : "✖ 時間オーバー"}
          </span>
          <button
            onClick={() => setShowMap(!showMap)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            {showMap ? "地図を閉じる" : "地図で見る"}
          </button>
        </div>
      </div>

      {/* showMapがtrueの時だけActionMapコンポーネントを表示 */}
      {showMap && <ActionMap lat={lat} lng={lng} />}
    </div>
  );
}
