import type { NextHandleFunction } from 'connect'
import type { PluginContainer } from './pluginContainer'

export const transformMiddleware = (pluginContainer: PluginContainer): NextHandleFunction => {
  const transformRequest = async (pathname: string): Promise<{
    mime: string
    content: string
  } | null> => {
    const idResult = await pluginContainer.resolveId(pathname) || { id: pathname }

    const loadResult = await pluginContainer.load(idResult.id)
    if (!loadResult) {
      return null
    }

    const code = typeof loadResult === 'string' ? loadResult : loadResult.code
    const transformResult = await pluginContainer.transform(code, idResult.id)
    if (!transformResult) {
      return null
    }

    const mime = /\.[jt]s$/.test(idResult.id) ? 'application/javascript' : undefined
    const content = transformResult.code
    return {
      mime,
      content,
    }
  }

  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next()
    }

    // req.url のパース
    let url: URL
    try {
      url = new URL(req.url!, 'http://localhost')
    } catch (e) {
      return next(e)
    }

    const pathname = url.pathname

    try {
      const result = await transformRequest(pathname)
      if (result) {
        res.statusCode = 200
        if (result.mime) {
          res.setHeader('Content-Type', result.mime)
        }
        return res.end(result.content)
      }
    } catch (e) {
      return next(e)
    }

    // 次のミドルウェアに処理を渡す
    next()
  }
}
