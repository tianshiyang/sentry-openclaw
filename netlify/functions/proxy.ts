import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const targetUrl = `https://tianshiyang.com/api/ai/conversation/all?type=skills`

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(
          Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v])
        ),
      },
      body: event.body || undefined,
    })

    const data = await response.text()

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: data,
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy error' }),
    }
  }
}

export { handler }
