import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import parse from 'node-html-parser'
import { rollup } from 'rollup'
import { getPlugins } from './plugins'

const root = process.cwd()
const dist = path.resolve(root, './dist')

export const startBuild = async () => {
  const plugins = getPlugins(false) // 本番環境用のプラグインを取得

  await fs.rm(dist, {
    recursive: true,
    force: true,
  }).catch(() => {})

  fs.mkdir(dist, { recursive: true })

  const indexHtmlPath = path.resolve(root, './index.html')
  const distIndexHtmlPath = path.resolve(dist, './index.html')
  // index.html を加工して dist/index.html に出力する
  await processHtml(indexHtmlPath, distIndexHtmlPath, async (src) => {
    // rollup でバンドルする
    const bundle = await rollup({
      input: path.resolve(root, `.${src}`),
      plugins,
    })

    const { output } = await bundle.write({
      dir: dist,
      format: 'es',
      entryFileNames: 'assets/[name].[hash].js',
      chunkFileNames: 'assets/chunks/[name].[hash].js',
    })

    await bundle.close()

    // 出力されたファイル名を返し、スクリプトタグの src 属性を書き換える
    return `/${output[0].fileName}`
  })
}

const processHtml = async (
  srcPath: string,
  distPath: string,
  // エントリーポイントの src を受け取って新しい src を返す関数
  bundleEntryPoint: (src: string) => Promise<string>,
) => {
  const htmlContent = await fs.readFile(srcPath, 'utf-8')
  const doc = parse(htmlContent)
  const scriptTag = doc.querySelector('script') // とりあえず最初の script タグだけ対象にする
  if (scriptTag) {
    const src = scriptTag.getAttribute('src')
    if (src) {
      const newSrc = await bundleEntryPoint(src)
      scriptTag.setAttribute('src', newSrc)
    }
  }
  await fs.writeFile(distPath, doc.toString(), 'utf-8')
}
