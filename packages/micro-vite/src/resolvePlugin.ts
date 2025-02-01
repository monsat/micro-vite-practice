import type { Plugin } from 'rollup'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'

const root = process.cwd()

const extensions = ['', '.js', '.ts']

const fileExists = async (path: string) => {
  try {
    const stat = await fs.stat(path)
    if (stat.isFile()) {
      return true
    }
  } catch {}
  return false
}

export const resolve = (): Plugin => {
  return {
    name: 'micro-vite:resolve',
    // id のファイルが存在すれば絶対パスの id を返す
    async resolveId(id: string) {
      for (const ext of extensions) {
        const absolutePath = path.resolve(root, `.${id}${ext}`)
        // console.log('resolveId', id, absolutePath)
        if (await fileExists(absolutePath)) {
          return absolutePath
        }
      }

      // 末尾が / で終わる場合は index.html があるかをチェックして id を変更する
      if (id.endsWith('/')) {
        const absolutePath = path.resolve(root, `.${id}index.html`)
        if (await fileExists(absolutePath)) {
          return absolutePath
        }
      }

      return null
    },
    // パスのファイルを読み出す
    async load(id: string) {
      try {
        const res = await fs.readFile(id, 'utf-8')
        return res
      } catch {}
      return null
    },
  }
}
