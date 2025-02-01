import type { NextHandleFunction } from 'connect'

export const transformMiddleware = (): NextHandleFunction => {
  const transformRequest = async (pathname: string): Promise<{
    mime: string
    content: string
  } | null> => {
    if (pathname.endsWith('.ts')) {
      return {
        mime: 'application/javascript',
        content: `console.log('file: ${pathname}')`,
      }
    }
    return null
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
        res.setHeader('Content-Type', result.mime)
        return res.end(result.content)
      }
    } catch (e) {
      return next(e)
    }

    // 次のミドルウェアに処理を渡す
    next()
  }
}
