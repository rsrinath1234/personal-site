import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDir = path.join(process.cwd(), 'posts')

export function getAllPosts() {
  if (!fs.existsSync(postsDir)) return []
  
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  
  const posts = files.map(filename => {
    const slug = filename.replace('.md', '')
    const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8')
    const { data } = matter(raw)
    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      excerpt: data.excerpt || '',
      private: data.private || false,
    }
  })

  // Sort by date descending
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string) {
  const raw = fs.readFileSync(path.join(postsDir, `${slug}.md`), 'utf8')
  const { data, content } = matter(raw)
  const processed = await remark().use(html).process(content)
  
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    excerpt: data.excerpt || '',
    private: data.private || false,
    contentHtml: processed.toString(),
  }
}
