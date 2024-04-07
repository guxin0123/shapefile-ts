
import typescript from '@rollup/plugin-typescript';

const config = {
    // 入口文件，src/index.ts 
    input: 'src/index.ts',
    plugins: [
        typescript(),
    ]

}
export default config
