import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.all("/api/trpc/*", async (c) => {
  const resHeaders = new Headers();
  const res = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, resHeaders }),
  });

  resHeaders.forEach((value, key) => {
    res.headers.append(key, value);
  });

  return res;
});

// ── Image Upload ─────────────────────────────────────────────
app.post("/api/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"] as File;
  
  if (!file) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  const { writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { nanoid } = await import("nanoid");

  const buffer = await file.arrayBuffer();
  const ext = file.name.split(".").pop() || "png";
  const filename = `${nanoid()}.${ext}`;
  const filePath = join(process.cwd(), "public", "uploads", filename);

  await writeFile(filePath, Buffer.from(buffer));

  return c.json({ 
    url: `/uploads/${filename}` 
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));


export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}
