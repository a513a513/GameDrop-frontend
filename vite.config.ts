import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // 러버블의 기본 설정을 무시하고 Vercel용으로 강제 지정
  server: {
    preset: 'vercel'
  }
});
