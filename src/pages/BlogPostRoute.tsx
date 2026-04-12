import { useParams } from "react-router-dom"
import { BlogPost } from "./BlogPost"

export function BlogPostRoute() {
  const { slug } = useParams<{ slug: string }>()
  return <BlogPost key={slug} />
}
