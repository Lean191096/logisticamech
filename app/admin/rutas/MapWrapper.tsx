"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

export default function MapWrapper({ rutas }: { rutas: any[] }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [router]);

  return <MapComponent rutas={rutas} />;
}
