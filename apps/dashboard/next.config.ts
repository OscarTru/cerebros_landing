import type { NextConfig } from "next"

const config: NextConfig = {
  transpilePackages: ["@cerebros/lib", "@cerebros/ui"],
  outputFileTracingRoot: require("path").join(__dirname, "../../"),
}

export default config
