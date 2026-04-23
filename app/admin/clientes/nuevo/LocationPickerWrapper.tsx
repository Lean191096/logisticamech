"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

export default function LocationPickerWrapper() {
  return <LocationPicker />;
}
