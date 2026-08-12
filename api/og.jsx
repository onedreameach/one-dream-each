import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge"
};

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#ffffff",
          fontSize: "70px",
          fontWeight: 700
        }}
      >
        ONE DREAM EACH
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
