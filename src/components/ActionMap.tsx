"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

type ActionMapProps = {
  lat: number;
  lng: number;
};

export default function ActionMap({ lat, lng }: ActionMapProps) {
  const position = { lat, lng };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps APIキーが設定されていません。");
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <div style={{ height: "250px", width: "100%", marginTop: "1rem" }}>
        <Map zoom={15} center={position} mapId={"sukimable-map"}>
          <AdvancedMarker position={position} />
        </Map>
      </div>
    </APIProvider>
  );
}
