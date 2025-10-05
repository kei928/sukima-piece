"use client";

// シンプルなピースアイコンのSVGコンポーネント
const PieceIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-teal-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
    />
  </svg>
);


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
      {halfStar === 1 && <span className="text-yellow-400">⭐</span>}
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
    p-6 bg-white rounded-lg shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105 relative border-l-4
    ${
      isPossible
        ? "border-teal-500"
        : "border-red-500"
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
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          {/*ratingが存在する場合に星評価コンポーネントを表示 */}
          {rating && rating > 0 && (
            <div className="mt-1">
              <StarRating rating={rating} />
            </div>
          )}
          <div className="text-sm text-slate-600 mt-2">
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
      <div className="absolute top-4 right-4">
        <PieceIcon />
      </div>
    </div>
  );
}