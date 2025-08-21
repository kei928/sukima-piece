type SuggestionCardProps = {
  title: string;       
  taskTime: number;  
  travelTime: number; 
  isPossible: boolean; // 間に合うかどうか 
};

// これがコンポーネントの本体､上記のデータ(props)を受け取って、表示を組み立てる
export default function SuggestionCard({ title, taskTime, travelTime, isPossible }: SuggestionCardProps) {// コンポーネントの引数として、SuggestionCardProps型を受け取る
  const totalTime = taskTime + travelTime;// 合計時間を計算

  // isPossible の値 (true/false) によって、カードの見た目を変える
  const cardClasses = `
    bg-white p-4 rounded-lg shadow-md border-l-4
    ${isPossible ? 'border-green-500' : 'border-red-500 opacity-60'}
  `;

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{title}</h3>
        <span className={`font-semibold ${isPossible ? 'text-green-600' : 'text-red-600'}`}>
          {isPossible ? '✓ 可能' : '✖ 時間オーバー'}
        </span>
      </div>
      <div className="text-sm text-gray-600 mt-2">
        <p>合計時間: 約 <strong>{totalTime}</strong> 分</p>
        <p className="mt-1"> (用事: {taskTime}分 + 往復移動: {travelTime}分)</p>
      </div>
    </div>
  );
}