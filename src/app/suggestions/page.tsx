"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import SuggestionCard from '@/components/SuggestionCard';
import { Suggestion } from '../api/suggestions/route';

// useSearchParamsをラップするコンポーネント
function SuggestionsContent() {
    const searchParams = useSearchParams();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            const time = searchParams.get('time');
            const lat = searchParams.get('lat');
            const lng = searchParams.get('lng');

            if (!time || !lat || !lng) {
                setError("検索条件が不足しています。");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.post<Suggestion[]>('/api/suggestions', {
                    availableTime: Number(time),
                    latitude: Number(lat),
                    longitude: Number(lng),
                });
                setSuggestions(response.data);
            } catch (err) {
                setError("提案の取得中にエラーが発生しました。");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [searchParams]);

    if (isLoading) {
        return <p className="text-center">提案を探しています...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
                スキマ時間: {searchParams.get('time')}分
            </h1>
            {suggestions.length > 0 ? (
                <div className="space-y-4">
                    {suggestions.map((suggestion) => (
                        <SuggestionCard
                            key={suggestion.id}
                            title={suggestion.title}
                            taskTime={suggestion.duration}
                            travelTime={suggestion.travelTime}
                            isPossible={suggestion.isPossible}
                            lat={suggestion.lat}
                            lng={suggestion.lng}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">条件に合うアクションは見つかりませんでした。</p>
            )}
        </div>
    );
}

// Suspenseでラップしたページ本体
export default function SuggestionsPage() {
    return (
        <Suspense fallback={<p className="text-center">読み込み中...</p>}>
            <SuggestionsContent />
        </Suspense>
    );
}