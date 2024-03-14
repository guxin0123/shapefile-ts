import path from 'path' 
import resolve from '@rollup/plugin-node-resolve' 
import commonjs from '@rollup/plugin-commonjs' 
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel' 
import { DEFAULT_EXTENSIONS } from '@babel/core' 
import json from "@rollup/plugin-json";
import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert { type: "json" }; 
import nodePolyfills from 'rollup-plugin-polyfill-node';

const env = "production";

const config = { 
    // 入口文件，src/index.ts 
    input: path.resolve(__dirname, 'src/index.ts'), 
    // 输出文件 
    output: [ 
        // commonjs 
        { 
            // package.json 配置的 main 属性 
            file: pkg.main, 
            format: 'cjs', 
        }, 
        // es module 
        { 
            // package.json 配置的 module 属性 
            file: pkg.module, 
            format: 'es', 
        }, 
        // umd 
        { 
            // umd 导出文件的全局变量 
            name:"shp", 
            // package.json 配置的 umd 属性 
            file: pkg.umd, 
            format: 'umd' ,
            sourcemap: true,
        } 
    ], 
    plugins: [ 
      // 识别 commonjs 模式第三方依赖 
      commonjs(),
        // 解析第三方依赖 
        resolve({
          browser:true,
        }), 
        nodePolyfills(),
        
        json(),
        // rollup 编译 typescript 
        typescript(), 
        // babel 配置 
        babel({ 
            // 编译库使用 
            babelHelpers: 'runtime', 
            // 只转换源代码，不转换外部依赖 
            exclude: 'node_modules/**', 
            // babel 默认不支持 ts 需要手动添加 
            extensions: [ 
                ...DEFAULT_EXTENSIONS, 
                '.ts', 
            ], 
        }), 
    ] ,

} 
// 若打包正式环境，压缩代码 
if (env === 'production') { 
    config.plugins.push(terser({ 
        compress: { 
            pure_getters: true, 
            unsafe: true, 
            unsafe_comps: true, 
            warnings: false 
        } 
    })) 
} 

export default config
