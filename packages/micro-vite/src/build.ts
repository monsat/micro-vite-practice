import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import parse from 'node-html-parser'

const root = process.cwd()
const dist = path.resolve(root, './dist')

export const startBuild = async () => {
  await fs.rm(dist, {
    recursive: true,
    force: true,
  }).catch(() => {})

  fs.mkdir(dist, { recursive: true })

  const indexHtmlPath = path.resolve(root, './index.html')
  const distIndexHtmlPath = path.resolve(dist, './index.html')
  // index.html を加工して dist/index.html に出力する
  await processHtml(indexHtmlPath, distIndexHtmlPath, async (src) => {
    // スクリプトタグの src 属性を変更する
    return src + '?processed'
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
