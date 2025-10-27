// kei928/sukima-piece/sukima-piece-featAI/src/app/suggestions/[id]/page.tsx

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react"; // useMemo は不要になったので削除
import axios from "axios";
import ActionMap from "@/components/ActionMap";
import Image from "next/image";
// Activity と AiSuggestionResponse の型をインポート
import { Activity, AiSuggestionResponse } from "@/app/api/ai-suggestions/route";

// 場所の詳細情報の型
type PlaceDetails = {
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  websiteUri?: string;
  reviews?: {
    authorAttribution: { displayName: string };
    text: { text: string };
  }[];
  photos?: { name: string }[];
  types?: string[]; // カテゴリ判定用に types を追加
  duration?: number; // AI推奨滞在時間 or マイピース所要時間
};

// マイピースの型
type ActionDetails = {
  id: string; // 修正: idを追加 (ActionMapなどで使う場合)
  title: string;
  description?: string;
  address?: string;
  duration: number;
  lat?: number;
  lng?: number;
};

// 星評価コンポーネント
const StarRating = ({ rating }: { rating: number }) => {
  if (!rating) return null;
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full_${i}`} className="text-yellow-400">
          ★
        </span>
      ))}
      {halfStar && <span className="text-yellow-400">★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty_${i}`} className="text-gray-300">
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

// AI提案を1つ表示するためのカードコンポーネント
const AiSuggestionCard = ({ suggestion }: { suggestion: Activity }) => (
  <div className="bg-teal-50 border-l-4 border-teal-400 p-4 rounded-r-lg">
    <h4 className="font-bold text-lg">
      <span className="mr-2">{suggestion.icon}</span>
      {suggestion.title}
    </h4>
    <p className="text-slate-600 mt-1">{suggestion.description}</p>
  </div>
);

export default function SuggestionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const placeOrActionId = params.id as string; // Place ID または Action ID
  const mode = searchParams.get("mode"); // 'nearby' or 'myActions'
  const estimatedDurationParam = searchParams.get("duration"); // AIが提案した滞在時間 or マイピース所要時間
  const availableTimeParam = searchParams.get("availableTime"); // ユーザーが最初に入力した利用可能時間

  const [details, setDetails] = useState<PlaceDetails | ActionDetails | null>(
    null
  );
  // AI提案用のStateを追加
  const [aiSuggestions, setAiSuggestions] = useState<Activity[]>([]);
  const [aiEstimatedDuration, setAiEstimatedDuration] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- useEffect フック ---

  // 1. 場所/アクション詳細を取得するuseEffect
  useEffect(() => {
    if (!placeOrActionId || !mode) {
      setError("不正なアクセスです。");
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true); // ローディング開始
      setError(null);
      try {
        let response;
        if (mode === "nearby") {
          response = await axios.get<PlaceDetails>(`/api/places/${placeOrActionId}`);
          // estimatedDurationParam があれば details に duration を設定
          if (estimatedDurationParam) {
            // response.data が変更不可の場合があるので、新しいオブジェクトを作成
            setDetails({
              ...response.data,
              duration: parseInt(estimatedDurationParam, 10),
            });
          } else {
             setDetails(response.data);
          }
        } else {
          // mode が 'myActions' の場合
          response = await axios.get<ActionDetails>(`/api/actions/${placeOrActionId}`);
           // マイピースの場合は estimatedDurationParam をそのまま duration として使う
           if (estimatedDurationParam) {
              setDetails({
                ...response.data,
                duration: parseInt(estimatedDurationParam, 10),
              });
           } else {
              setDetails(response.data); // duration がない場合 (通常はないはずだが念のため)
           }
        }
      } catch (err) {
        console.error("詳細情報の取得エラー:", err);
        setError("詳細情報の取得に失敗しました。");
        setDetails(null); // エラー時は details を null に
      } finally {
        setIsLoading(false); // ローディング終了
      }
    };

    fetchDetails();
  }, [placeOrActionId, mode, estimatedDurationParam]); // 依存配列

  // 2. AI提案を取得するuseEffect
  useEffect(() => {
    // 詳細情報があり、モードが'nearby'、利用可能時間があり、AI提案取得中でない場合に実行
    if (details && mode === 'nearby' && availableTimeParam && !isAiLoading) {
      const fetchAiSuggestions = async () => {
        setIsAiLoading(true);
        setAiError(null);
        setAiSuggestions([]); // 取得前にクリア
        setAiEstimatedDuration(null);

        try {
          const placeDetails = details as PlaceDetails;
          // Place Details の types 配列からカテゴリとして使えそうなものを探す
          // 例: 'cafe', 'restaurant', 'park', etc. なければ '場所' を使う
          const knownCategories = ["cafe", "restaurant", "park", "book_store", "movie_theater", "museum", "art_gallery", "bakery", "bar"];
          const placeCategory = placeDetails.types?.find(type => knownCategories.includes(type)) || '場所';

          console.log("AI提案リクエスト:", { // デバッグ用ログ
              placeName: placeDetails.displayName?.text,
              placeCategory: placeCategory,
              availableTime: Number(availableTimeParam),
          });

          const response = await axios.post<AiSuggestionResponse>('/api/ai-suggestions', {
            placeName: placeDetails.displayName?.text || '不明な場所',
            placeCategory: placeCategory,
            availableTime: Number(availableTimeParam),
          });

           console.log("AI提案レスポンス:", response.data); // デバッグ用ログ

          setAiSuggestions(response.data.activities);
          setAiEstimatedDuration(response.data.estimatedDuration);

          // URLパラメータからの duration がなく、AIからの duration がある場合、details を更新
          // (API側の nearby-suggestions で duration が設定されるようになったので、不要かもしれないが念のため)
          if (!estimatedDurationParam && response.data.estimatedDuration) {
              setDetails(prevDetails => {
                  if (prevDetails && !prevDetails.duration) {
                      return { ...prevDetails, duration: response.data.estimatedDuration };
                  }
                  return prevDetails;
              });
          }

        } catch (err) {
          console.error("AI提案の取得に失敗しました:", err);
          setAiError("AI提案の取得に失敗しました。");
        } finally {
          setIsAiLoading(false);
        }
      };

      fetchAiSuggestions();
    } else if (mode === 'myActions') {
        // マイピースの場合はAI提案を取得しない
        setAiSuggestions([]);
        setIsAiLoading(false); // ローディング完了扱いにする
        setAiError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, mode, availableTimeParam]); // isAiLoading を依存配列から除外

  // --- ハンドラ関数 ---
  const handleNavigation = () => {
    const address =
      mode === "nearby"
        ? (details as PlaceDetails).formattedAddress
        : (details as ActionDetails).address;

    if (address) {
      // Google Maps の URL を生成（モバイルアプリが開くことを期待）
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
      window.open(url, "_blank");
    } else if (mode === 'nearby' && (details as PlaceDetails).location) {
        // 住所がないが座標がある場合 (Place Details API の場合)
        const loc = (details as PlaceDetails).location!;
        const url = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
        window.open(url, "_blank");
    } else if (mode === 'myActions' && (details as ActionDetails).lat && (details as ActionDetails).lng) {
        // 住所がないが座標がある場合 (マイピースで座標を保存する場合 - 現在の実装ではなし)
        const loc = details as ActionDetails;
        const url = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
         window.open(url, "_blank");
    } else {
      alert("この場所の住所または座標情報がないため、ルート案内を開始できません。");
    }
  };

  // --- レンダリング ---
  if (isLoading) return <p className="text-center p-10">場所の詳細を読み込み中...</p>;
  if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
  if (!details)
    return <p className="text-center p-10">情報が見つかりません。</p>;

  // 場所の座標を取得（nearby と myActions で取得元が異なる）
  const location =
    mode === "nearby" && (details as PlaceDetails).location
      ? {
          latitude: (details as PlaceDetails).location!.latitude,
          longitude: (details as PlaceDetails).location!.longitude,
        }
      : mode === 'myActions' && (details as ActionDetails).lat && (details as ActionDetails).lng
      ? {
          latitude: (details as ActionDetails).lat!,
          longitude: (details as ActionDetails).lng!,
      }
      : null; // 座標がない場合

  const photo =
    mode === "nearby" ? (details as PlaceDetails).photos?.[0] : null;
  const photoUrl = photo
    ? `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null;

  // 詳細情報から表示用の滞在時間を取得 (AI提案 -> URLパラメータ -> Actionのduration)
  const displayDuration = aiEstimatedDuration ?? (estimatedDurationParam ? parseInt(estimatedDurationParam, 10) : details.duration);


  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 写真表示 */}
        {photoUrl ? (
          <div className="relative w-full h-64">
            <Image
              src={photoUrl}
              alt={(details as PlaceDetails).displayName?.text || "場所の写真"}
              fill
              style={{ objectFit: "cover" }}
              priority // LCPになる可能性があるのでpriorityを設定
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // レスポンシブイメージのためのsizes
            />
          </div>
        ) : (
          // 写真がない場合のプレースホルダー
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">写真はありません</p>
          </div>
        )}

        <div className="p-6">
          {/* 場所/アクション名 */}
          <h1 className="text-3xl font-bold mb-2">
            {mode === "nearby"
              ? (details as PlaceDetails).displayName?.text
              : (details as ActionDetails).title}
          </h1>
          {/* 住所 */}
          <p className="text-gray-600 mb-4">
            {mode === "nearby"
              ? (details as PlaceDetails).formattedAddress
              : (details as ActionDetails).address || "住所情報なし"}
          </p>

          {/* 評価 (nearbyモードのみ) */}
          {mode === "nearby" && (details as PlaceDetails).rating && (
            <div className="mb-4">
              <StarRating rating={(details as PlaceDetails).rating!} />
            </div>
          )}

          {/* AIによる提案セクション (nearbyモードのみ) */}
          {mode === "nearby" && (
            <div className="my-8 pt-6 border-t">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span role="img" aria-label="ai">🤖</span> AIからの過ごし方提案
              </h2>
              {/* AI提案のローディングとエラー表示 */}
              {isAiLoading ? (
                <p className="text-slate-500">AIが提案を考えています...</p>
              ) : aiError ? (
                <p className="text-red-500">{aiError}</p>
              ) : (
                <div className="space-y-4">
                  {aiSuggestions.length > 0 ? (
                    aiSuggestions.map((suggestion, index) => (
                      <AiSuggestionCard key={index} suggestion={suggestion} />
                    ))
                  ) : (
                    // AI提案がない場合 (APIエラー以外)
                    <p className="text-slate-500">この場所での過ごし方の提案はありません。</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 詳細情報と地図 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
            {/* 左カラム: 詳細情報 */}
            <div>
              <h2 className="text-xl font-semibold mb-3">詳細情報</h2>
              <div className="space-y-4 text-gray-700">
                {/* 滞在時間 */}
                {displayDuration && (
                   <p>
                    <strong>推奨滞在時間:</strong> 約 {displayDuration} 分
                   </p>
                )}


                {/* ルート案内ボタン */}
                <button
                  onClick={handleNavigation}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-teal-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  ルートを見る
                </button>

                {/* ウェブサイト (nearbyモードのみ) */}
                {mode === "nearby" && (details as PlaceDetails).websiteUri && (
                  <p>
                    <strong>ウェブサイト:</strong>{" "}
                    <a
                      href={(details as PlaceDetails).websiteUri!} // Non-null assertion
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all" // 長いURLがはみ出ないように
                    >
                      サイトを見る
                    </a>
                  </p>
                )}

                 {/* マイピースの説明 (myActionsモードのみ) */}
                 {mode === "myActions" && (details as ActionDetails).description && (
                  <p>
                    <strong>説明:</strong> {(details as ActionDetails).description}
                  </p>
                )}


                {/* レビュー (nearbyモードのみ) */}
                {mode === "nearby" && (details as PlaceDetails).reviews && (
                  <div className="mt-8 pt-6 border-t">
                    <h2 className="text-2xl font-bold mb-4">レビュー</h2>
                    <div className="space-y-6">
                      {(details as PlaceDetails).reviews! // Non-null assertion
                        .slice(0, 3) // 最初の3件のみ表示
                        .map((review, index) => (
                          <div
                            key={index}
                            className="border-b pb-4 last:border-b-0"
                          >
                            <div className="flex items-center mb-2">
                              <p className="font-semibold">
                                {review.authorAttribution?.displayName || "匿名ユーザー"}
                              </p>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {review.text?.text || "レビュー本文なし"}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 右カラム: 地図 */}
            <div>
              <h2 className="text-xl font-semibold mb-3">場所</h2>
              {/* location があり、latitude と longitude が有効な数値の場合のみ地図を表示 */}
              {location && typeof location.latitude === 'number' && typeof location.longitude === 'number' ? (
                <ActionMap lat={location.latitude} lng={location.longitude} />
              ) : (
                <p className="text-gray-500">地図情報を表示できません。</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}