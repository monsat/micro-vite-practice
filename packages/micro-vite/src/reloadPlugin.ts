import type { Plugin } from 'rollup'
import { parse } from 'node-html-parser'
import WebSocket, { WebSocketServer } from 'ws'

const port = 24678
const virtualScriptId = '/@micro-vite:reload/script.js'
const virtualScript = `
  const ws = new WebSocket('ws://localhost:${port}')
  ws.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data)
    // reload というメッセージが来たらリロードする
    if (msg.type === 'reload') {
      location.reload()
    }
  })
`

export const reload = (): Plugin => {
  return {
    name: 'micro-vite:reload',
    // virtualScriptId に対しては virtualScriptId を返す（load で対応するため）
    async resolveId(id: string) {
      if (id === virtualScriptId) {
        return virtualScriptId
      }
      return null
    },
    // virtualScriptId に対しては virtualScript を返す
    async load(id: string) {
      if (id === virtualScriptId) {
        return virtualScript
      }
      return null
    },
    // HTML ファイルに virtualScriptId へのリンクのある script タグを挿入
    async transform(code, id) {
      if (!id.endsWith('.html')) {
        return null
      }

      // HTML の head の末尾に virtualScriptId へのリンクのある script タグを挿入する
      const doc = parse(code)
      doc.querySelector('head')?.insertAdjacentHTML('beforeend', `<script src="${virtualScriptId}">`)
      // doc.querySelector('head')?.insertAdjacentHTML('beforeend', `<script src="${virtualScriptId}"></script>`)
      return doc.toString()
    },
  }
}

interface Data {
  type: string
}

export const setupReloadServer = () => {
  const wss = new WebSocketServer({
    port,
    host: 'localhost',
  })

  let ws: WebSocket
  wss.on('connection', (connectedWs) => {
    ws = connectedWs
  })

  return {
    send(data: Data) {
      if (!ws) {
        return
      }
      ws.send(JSON.stringify(data))
    },
  }
}
