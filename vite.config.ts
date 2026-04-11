import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import path from 'path'

function apiProxy(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')
      Object.assign(process.env, env)

      server.middlewares.use('/api/subscribe', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const bodyText = Buffer.concat(chunks).toString()

        const webReq = new Request('http://localhost/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyText,
        })

        try {
          const { default: handler } = await server.ssrLoadModule('/api/subscribe.ts')
          const webRes: Response = await handler(webReq)

          res.statusCode = webRes.status
          webRes.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(await webRes.text())
        } catch (e) {
          console.error('API proxy error:', e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    apiProxy(),
    react(),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
