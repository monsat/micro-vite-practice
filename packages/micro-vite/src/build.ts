import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import parse from 'node-html-parser'
import { rolldown } from 'rolldown'
import type { Plugin } from 'rolldown'

import { insertVirtualScript } from './reloadPlugin'

const root = process.cwd()

export const startBuild = async () => {
  const dist = path.resolve(root, './dist')
  const plugins: Plugin[] = []
  await build(dist, plugins)
}

export const build = async (
  dist: string,
  plugins: Plugin[],
  isDev = false,
) => {
  await fs.rm(dist, {
    recursive: true,
    force: true,
  }).catch(() => {})

  fs.mkdir(dist, { recursive: true })

  const indexHtmlPath = path.resolve(root, './index.html')
  const distIndexHtmlPath = path.resolve(dist, './index.html')
  // index.html を加工して dist/index.html に出力する
  await processHtml(
    indexHtmlPath,
    distIndexHtmlPath,
    isDev,
    async (src) => {
    // rolldown でバンドルする
    const bundle = await rolldown({
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
  isDev: boolean,
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
  if (isDev) {
    insertVirtualScript(doc)
  }
  await fs.writeFile(distPath, doc.toString(), 'utf-8')
}
