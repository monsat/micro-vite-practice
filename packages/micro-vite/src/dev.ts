import * as path from 'node:path'
import connect from 'connect'
import historyApiFallback from 'connect-history-api-fallback'
import sirv from 'sirv'

import { createFileWatcher } from './fileWatcher'
import { createPluginContainer } from './pluginContainer'
import { getPlugins } from './plugins'
import { setupReloadServer as setupWsServer } from './reloadPlugin'
import { transformMiddleware } from './transformMiddleware'
import { build } from './build'

export const startDev = async () => {
  const server = connect()
  server.listen(3000, 'localhost')
  const ws = setupWsServer()

  const root = process.cwd()
  const distPath = './.micro-vite/dist'
  const dist = path.resolve(root, distPath)

  const plugins = getPlugins()
  await build(dist, plugins, true)
  const pluginContainer = createPluginContainer(plugins)

  server.use(transformMiddleware(pluginContainer))
  server.use(
    sirv(distPath, {
      dev: true,
      etag: true,
    })
  )
  server.use(historyApiFallback() as any)

  console.log('dev server running at http://localhost:3000')

  createFileWatcher(async (eventName, path) => {
    console.log(`Detected file change (${eventName}) reloading: ${path}`)
    await build(dist, plugins, true)
    ws.send({ type: 'reload' })
  })
}
