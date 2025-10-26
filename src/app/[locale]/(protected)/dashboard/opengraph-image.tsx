import { ImageResponse } from "next/og";

export const alt = "Dashboard - Dukora";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#0f172a",
          backgroundImage: "linear-gradient(to bottom right, #1e293b, #0f172a)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "80px",
            width: "100%",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 40 }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                marginRight: 20,
              }}
            />
            <span style={{ fontSize: 36, color: "#fff", fontWeight: 600 }}>
              Dukora
            </span>
          </div>

          <h1
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              fontSize: 36,
              color: "#94a3b8",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Real-time inventory and sales analytics
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
