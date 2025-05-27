"use client";

import { useEffect } from "react";

interface AdProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical";
  style?: React.CSSProperties;
}

export default function Ad({ slot, format = "auto", style }: AdProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className="my-4" style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1231326966189682"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
