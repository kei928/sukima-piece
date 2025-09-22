"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { Suggestion } from "@/app/api/suggestions/route";
import Image from "next/image";

type SuggestionsMapProps = {
  suggestions: Suggestion[];
  currentLocation: { lat: number; lng: number };
  highlightedId: string | null;
};

// 見やすい地図のスタイル
const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ weight: "2.00" }],
  },
  {
    featureType: "all",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9c9c9c" }],
  },
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f2f2f2" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7b7b7b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#46bcec" }, { visibility: "on" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#c8d7d4" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#070707" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
];


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
        mapId={"sukima-piece-interactive-map"}
        className="w-full h-full rounded-lg"
        styles={mapStyles}
      >
        {/* 現在地のマーカー */}
        <AdvancedMarker position={currentLocation}>
          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
            <span role="img" aria-label="現在地" className="text-lg">
              🚶
            </span>
          </div>
        </AdvancedMarker>

        {/* 提案場所のマーカー */}
        {suggestions.map((suggestion) => (
          <AdvancedMarker
            key={suggestion.id}
            position={{ lat: suggestion.lat, lng: suggestion.lng }}
          >
            <div
              className={`transition-transform duration-300 ${
                highlightedId === suggestion.id ? "transform scale-125" : ""
              }`}
            >
              <Image
                src="/SP_logo.svg"
                alt="提案場所"
                width={30}
                height={30}
                className="bg-white rounded-full p-1 shadow "
              />
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}