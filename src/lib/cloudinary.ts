/**
 * Cloudinary image helper for Cerebros Esponjosos
 *
 * Usage in MDX frontmatter:
 *   image: "sueno-cerebro"          ← just the public_id (no extension needed)
 *   image: "blog/sueno-cerebro"     ← with folder prefix
 *
 * The helper auto-applies: WebP/AVIF conversion, smart compression,
 * responsive width, and lazy loading via srcSet.
 *
 * Setup:
 *   1. Create a free account at cloudinary.com
 *   2. Add VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name to your .env.local
 *   3. In Vercel → Settings → Environment Variables, add the same var
 *   4. Upload images via Cloudinary dashboard (drag & drop)
 *   5. Use the public_id (filename without extension) in the MDX frontmatter
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined

/** Returns true if the string looks like a Cloudinary public_id (no http/https) */
export function isCloudinaryId(image: string): boolean {
  return !image.startsWith("http://") && !image.startsWith("https://") && !image.startsWith("/")
}

/**
 * Build a Cloudinary URL with responsive transformations.
 *
 * @param publicId  Cloudinary public_id, e.g. "sueno-cerebro" or "blog/sueno-cerebro"
 * @param width     Desired display width in px (used for w_ transform + srcSet)
 */
export function cloudinaryUrl(publicId: string, width: number): string {
  if (!CLOUD_NAME) {
    console.warn("[cloudinary] VITE_CLOUDINARY_CLOUD_NAME is not set")
    return ""
  }
  const transforms = `w_${width},f_auto,q_auto,c_fill,g_auto`
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

/**
 * Build a srcSet string for responsive images.
 * Generates 400w, 800w, and 1200w variants automatically.
 */
export function cloudinarySrcSet(publicId: string): string {
  if (!CLOUD_NAME) return ""
  return [400, 800, 1200]
    .map((w) => `${cloudinaryUrl(publicId, w)} ${w}w`)
    .join(", ")
}
