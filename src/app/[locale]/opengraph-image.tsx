import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/config/site";

export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        backgroundImage:
          "radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)",
        backgroundSize: "100px 100px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          backgroundColor: "white",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxWidth: "900px",
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            background: "linear-gradient(to bottom right, #000, #666)",
            backgroundClip: "text",
            color: "transparent",
            margin: 0,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {SITE_NAME}
        </h1>
        <p
          style={{
            fontSize: 32,
            color: "#666",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {SITE_DESCRIPTION}
        </p>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
