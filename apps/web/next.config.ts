import type { NextConfig } from "next"
import createMDX from "@next/mdx"
import remarkFrontmatter from "remark-frontmatter"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
  },
})

const config: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  experimental: {
    mdxRs: false,
  },
  // Ensure workspace packages and framer-motion are compiled by Next.js
  transpilePackages: ["@cerebros/lib", "@cerebros/ui", "framer-motion"],
  // Suppress the workspace root warning (monorepo with multiple lockfiles)
  outputFileTracingRoot: require("path").join(__dirname, "../../"),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
}

export default withMDX(config)
