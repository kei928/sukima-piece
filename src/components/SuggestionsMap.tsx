"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { Suggestion } from "@/app/api/suggestions/route";

type SuggestionsProps = {
  suggestion: Suggestion[];
  currentLocation: { lat: number; lng: number };
  highlightId: string | null; //提案のID
};

export default function SuggestionsMap({
  suggestion,
  currentLocation,
  highlightId,
}: SuggestionsProps) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps APIキーが設定されていません。");
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultZoom={14}
        defaultCenter={currentLocation}
        mapId={"sukimable-interactive-map"}
        className="rounded-lg shadow-md"
      >
        {/* 現在位置のピン*/}
        <AdvancedMarker position={currentLocation}>
          <span className="text-2xl">📍</span>
        </AdvancedMarker>
        {/* 提案のピン */}
        {suggestion.map((suggestion) => (
          <AdvancedMarker
            key={suggestion.id}
            position={{ lat: suggestion.lat, lng: suggestion.lng }}
          >
            <Pin
              background={highlightId === suggestion.id ? "red" : "blue"}
              borderColor={"white"}
              glyphColor={"white"}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
