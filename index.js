import { registerRootComponent } from 'expo';

import App from './App';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/impactos") {
      const { forca, lat, lon } = await request.json();
      await env.DB.prepare(
        "INSERT INTO impactos (forca, lat, lon, criado_em) VALUES (?, ?, ?, ?)"
      ).bind(forca, lat, lon, new Date().toISOString()).run();
      return new Response(JSON.stringify({ ok: true }), { status: 201 });
    }

    if (request.method === "GET" && url.pathname === "/impactos") {
      const { results } = await env.DB.prepare("SELECT * FROM impactos ORDER BY id DESC").all();
      return Response.json(results);
    }

    return new Response("Not found", { status: 404 });
  }
};

// if (request.method === "GET" && url.pathname === "/impactos/top") {
//   const { results } = await env.DB.prepare(
//     "SELECT * FROM impactos ORDER BY forca DESC LIMIT 20"
//   ).all();
//   return Response.json(results);
// }

registerRootComponent(App);
