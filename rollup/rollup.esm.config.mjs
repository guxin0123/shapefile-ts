import basicConfig from './rollup.config.mjs'
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle"
import pkg from '../package.json' assert { type: "json" };

const config = {
  ...basicConfig, //整合公共部分
  output: [
    {
      file: pkg.module, //输出文件
      format: 'es' //输出格式
    }
  ],
  plugins: [ //插件
    ...basicConfig.plugins, //整合公共部分插件
    excludeDependenciesFromBundle() //忽略掉dependencies和peerDependencies的依赖
  ]
}

export default config