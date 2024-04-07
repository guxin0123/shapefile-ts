/** @type {import('vite').UserConfig} */
import { resolve } from 'path'
import { defineConfig } from 'vite'



const staticFilePlugin = (path) => ({
   name: "static-file-middleware",
   configureServer(serve) {
      serve.middlewares.use((req, res, next) => {
         if (req.url.startsWith(path)) {
            // const isRaw = excludes.some((dir) => req.url.includes(dir))
            // if (!isRaw) req.url = path;
            // console.log(excludes);
            // res.statusCode = 404;
            //res.status(404).set({ 'Content-Type': 'text/html' }).end("");
            next(new Error("file not find"))
         }else{
            next()
         }
        
      })
   },
})


export default defineConfig({
   plugins:[
     // staticFilePlugin('/files/')
   ],
   root: "test",
   mode: 'production',
   build: {
      sourcemap: true,
   },
   // server:{
   //       proxy: {
   //         // 字符串简写写法：http://localhost:5173/foo -> http://localhost:4567/foo
   //         '/files': 'file://',
   //       }
   // }

})