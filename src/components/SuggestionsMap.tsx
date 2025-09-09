"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { Suggestion } from "@/app/api/suggestions/route";

type SuggestionsMapProps = {
  suggestions: Suggestion[]; 
  currentLocation: { lat: number; lng: number };
  highlightedId: string | null;
};

export default function SuggestionsMap({
  suggestions,
  currentLocation,
  highlightedId,
}: SuggestionsMapProps) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps APIキーが設定されていません。");
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      
      <Map
        defaultZoom={13}
        defaultCenter={currentLocation}
        mapId={"sukimable-interactive-map"}
        className="w-full h-96 rounded-lg"
      >
        {/* 現在地のマーカー */}
        <AdvancedMarker position={currentLocation}>
            <span className="text-2xl">📍</span>
        </AdvancedMarker>

        {/* 提案場所のマーカー */}
        {suggestions.map((suggestion) => ( 
          <AdvancedMarker
            key={suggestion.id}
            position={{ lat: suggestion.lat, lng: suggestion.lng }}
          >
            <Pin
              background={highlightedId === suggestion.id ? '#1D4ED8' : '#FB923C'}
              borderColor={'#000'}
              glyphColor={'#fff'}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}