//rollup.umd.config.mjs
import { nodeResolve } from '@rollup/plugin-node-resolve';

import basicConfig from './rollup.config.mjs'
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace'


import { readFile } from 'fs/promises';
const pkg = JSON.parse(
  await readFile(
    new URL('../package.json', import.meta.url)
  )
);

const config = {
    ...basicConfig, //整合公共部分配置
    output: [
        {
            name: "shp",//浏览器引入的全局变量名称
            file: pkg.umd, //输出文件
            format: 'umd', //输出格式
            exports: 'named', //导出的是全局变量命名方式
            sourcemap: true,
            //   globals: { //对被排除的依赖命名
            //     'react': 'React', //三方库映射
            //     'react-dom': 'ReactDOM',
            //     'axios': 'Axios'
            //   },
            plugins: [
                terser({
                    compress: {
                        pure_getters: true,
                        unsafe: true,
                        unsafe_comps: true,
                        warnings: false
                    }
                }) //terser插件在rollup打包过程当中实现代码压缩
            ],
        },
    ],
    plugins: [
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'), //该插件在绑定时替换文件中的目标字符串
            preventAssignment: true
        }),

        // 解析第三方依赖 
        nodeResolve({
            browser: true,
        }),
        ...basicConfig.plugins //整合公共部分插件
    ],
    //有时候一些外部引用的库我们并不想一并打包在我们的库中，
    //如：lodash、react，可以在配置文件中使用 external 字段来告诉rollup不要将这些库打包
    //external: ['react', 'react-dom', 'axios'] //排除的这些需要在页面中单独引入cdn link 链接
}


export default config
