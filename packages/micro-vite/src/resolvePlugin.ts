import type { Plugin } from 'rollup'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'

const root = process.cwd()

export const resolve = (): Plugin => {
  return {
    name: 'micro-vite:resolve',
    // id のファイルが存在すれば絶対パスの id を返す
    async resolveId(id: string) {
      const absolutePath = path.resolve(root, `.${id}`)
      // console.log('resolveId', id, absolutePath)
      try {
        const stat = await fs.stat(absolutePath)
        if (stat.isFile()) {
          return absolutePath
        }
      } catch {}
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
