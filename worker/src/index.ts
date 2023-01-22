interface Env {
  HORSE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    switch (request.method) {
      case "GET":
        if (!key) {
          const vals = [];
          const data = await env.HORSE.list();
          for (const key of Object.values(data.keys)) {
            const value = await env.HORSE.get(key.name);
            if (!value) {
              continue;
            }
            vals.push({
              key: key.name,
              value,
            });
          }
          return new Response(JSON.stringify(vals, null, 2));
        }
        const value = await env.HORSE.get(key);
        if (!value) {
          return new Response(`Key ${key} not found.`, { status: 400 });
        }
        return new Response(value);
      case "PUT":
        const body = await request.text();
        try {
          const data = JSON.parse(body);
          await env.HORSE.put(key, data.data);
          return new Response(`Set ${data.data} to ${key}`, { status: 200 });
        } catch (err) {
          return new Response(`${err}`, { status: 500 });
        }
      case "DELETE":
        try {
          await env.HORSE.delete(key);
          return new Response(`Deleted ${key}`, { status: 200 });
        } catch (err) {
          return new Response(`${err}`, { status: 500 });
        }
      default:
        return new Response("Invalid method. Use GET or PUT", { status: 400 });
    }
  },
};