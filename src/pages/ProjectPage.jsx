import { useParams } from 'react-router-dom'
import { bySlug } from '../content/entries.js'
import { useLocale } from '../i18n/index.js'
import NotFound from './NotFound.jsx'

export default function ProjectPage() {
  const { slug } = useParams()
  const entry = bySlug(slug)
  const { tEntry } = useLocale()

  if (!entry) return <NotFound />

  return (
    <main id="content" style={{ padding: '44px var(--gutter) 110px' }}>
      <h1>{entry.title}</h1>
      <p>{tEntry(entry.slug).short}</p>
    </main>
  )
}
