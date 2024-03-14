/** @type {import('vite').UserConfig} */
import { resolve } from 'path'
import { defineConfig } from 'vite'



export default defineConfig({
   root: "test",
   build: {
      sourcemap: true,
      //   rollupOptions: {
      //    input: {
      //      main: resolve(__dirname, 'index.html'),
      //      sec:  resolve(__dirname, 'index1.html')
      //    },
      //  },
   }
})