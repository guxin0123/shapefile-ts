/** @type {import('vite').UserConfig} */
import { resolve } from 'path'
import { defineConfig } from 'vite'



export default defineConfig({
   root: "test",
   build: {
      sourcemap: true,
      //   rollupOptions: {
      //    input: {
      //      main: resolve(__dirname, 'test/index.html')
      //    },
      //  },
   }
})