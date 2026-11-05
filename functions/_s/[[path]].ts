// Serves Umami's tracker and beacon from float.gilla.fun itself, so blockers that list analytics hosts let them through.
const UMAMI_ORIGIN = 'https://analytics.gilla.fun';

interface Context {
  request: Request;
  params: { path?: string | string[] };
}

export async function onRequest({ request, params }: Context): Promise<Response> {
  const path = ([] as string[]).concat(params.path ?? []).join('/');

  if (request.method === 'GET' && path === 'f.js') {
    const upstream = await fetch(`${UMAMI_ORIGIN}/script.js`);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  }

  if (request.method === 'POST' && path === 'api/send') {
    const body = (await request.json().catch(() => null)) as { payload?: Record<string, unknown> } | null;
    if (!body?.payload) return new Response('Bad request', { status: 400 });

    // Through this hop Umami would see Cloudflare as the visitor. An explicit ip is used for the visitor hash and
    // the GeoIP lookup, and Umami does not store it.
    const ip = request.headers.get('cf-connecting-ip');
    if (ip) body.payload.ip = ip;

    const headers = new Headers({ 'content-type': 'application/json' });
    for (const [name, value] of request.headers) {
      if (name === 'user-agent' || name.startsWith('x-umami-')) headers.set(name, value);
    }
    const upstream = await fetch(`${UMAMI_ORIGIN}/api/send`, { method: 'POST', headers, body: JSON.stringify(body) });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  return new Response('Not found', { status: 404 });
}
