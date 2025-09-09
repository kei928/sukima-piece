"use client";

type SuggestionCardProps = {
  title: string;       
  taskTime: number;  
  travelTime: number; 
  isPossible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function SuggestionCard({ title, taskTime, travelTime, isPossible, onMouseEnter, onMouseLeave }: SuggestionCardProps) {
  const totalTime = taskTime + travelTime;

  const cardClasses = `
    bg-white p-4 rounded-lg shadow-md border-l-4 transition-all duration-200 cursor-pointer
    ${isPossible ? 'border-green-500 hover:shadow-lg' : 'border-red-500 opacity-70'}
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
          <div className="text-sm text-gray-600 mt-2">
            <p>合計時間: 約 <strong>{totalTime}</strong> 分</p>
            <p className="mt-1"> (用事: {taskTime}分 + 往復移動: {travelTime}分)</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`font-semibold ${isPossible ? 'text-green-600' : 'text-red-600'}`}>
            {isPossible ? '✓ 可能' : '✖ 時間オーバー'}
          </span>
        </div>
      </div>
    </div>
  );
}