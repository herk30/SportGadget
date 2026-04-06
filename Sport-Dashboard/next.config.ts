import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Thêm block này vào
  experimental: {
    allowedDevOrigins: [
      "172.28.182.82", // IP của thiết bị bạn đang dùng để test
      "localhost:3000", // Giữ lại localhost để máy tính vẫn truy cập bình thường
    ],
  },
};

export default nextConfig;