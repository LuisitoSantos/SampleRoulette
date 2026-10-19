import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins:[react()],
  server:{proxy:{'/api/musicbrainz':{target:'https://musicbrainz.org',changeOrigin:true,rewrite:()=>'/ws/2/recording',configure(proxy){proxy.on('proxyReq',request=>request.setHeader('User-Agent','SampleRoulette/1.1 (http://localhost:5173/)'))}}}},
  build:{target:'es2022',rollupOptions:{output:{manualChunks(id){if(id.includes('/node_modules/mp4-muxer/'))return 'video-export'}}}}
});
