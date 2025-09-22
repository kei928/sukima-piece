"use client";

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full_${i}`} className="text-yellow-400">
          ★
        </span>
      ))}
      {halfStar === 1 && <span className="text-yellow-400">⭐</span>}{" "}
      {/* ここは半分星のアイコンなどに変えても良い */}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty_${i}`} className="text-gray-300">
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

type SuggestionCardProps = {
  title: string;
  taskTime: number;
  travelTime: number;
  isPossible: boolean;
  rating?: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function SuggestionCard({
  title,
  taskTime,
  travelTime,
  isPossible,
  rating,
  onMouseEnter,
  onMouseLeave,
}: SuggestionCardProps) {
  const totalTime = taskTime + travelTime;

  const cardClasses = `
    p-6 rounded-lg shadow-lg transition-all duration-300 cursor-pointer puzzle-piece transform hover:scale-105
    ${
      isPossible
        ? "bg-orange-100 [filter:drop-shadow(0_0_2px_rgba(34,197,94,0.6))_drop-shadow(0_0_5px_rgba(34,197,94,0.4))]"
        : "bg-red-50 opacity-90 [filter:drop-shadow(0_0_2px_rgba(239,68,68,0.6))_drop-shadow(0_0_5px_rgba(239,68,68,0.4))]"
    }
  `;

  return (
    <div
      className={cardClasses}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          {/*ratingが存在する場合に星評価コンポーネントを表示 */}
          {rating && rating > 0 && (
            <div className="mt-1">
              <StarRating rating={rating} />
            </div>
          )}
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
      </div>
    </div>
  );
}
