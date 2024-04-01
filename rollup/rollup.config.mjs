
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel'
import { DEFAULT_EXTENSIONS } from '@babel/core'

const config = {
    // 入口文件，src/index.ts 
    input: 'src/index.ts',
    plugins: [
       
        typescript(),
        // // babel 配置 
        // babel({
        //     // 编译库使用 
        //     babelHelpers: 'runtime',
        //     // 只转换源代码，不转换外部依赖 
        //     exclude: 'node_modules/**',
        //     // babel 默认不支持 ts 需要手动添加 
        //     extensions: [
        //         ...DEFAULT_EXTENSIONS,
        //         '.ts',
        //     ],
        // }),
        
        
    ]

}

export default config
