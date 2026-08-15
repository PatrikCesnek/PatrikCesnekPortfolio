import { useLocale } from '../i18n/index.js'
import { useReveal } from '../hooks/useReveal.js'
import Picture from './Picture.jsx'
import s from './WebCard.module.css'

export default function WebCard({ site, index = 0 }) {
  const { t } = useLocale()
  const [ref, reveal] = useReveal()

  return (
    <a
      ref={ref}
      className={`reveal ${s.card}`}
      data-reveal={reveal ?? undefined}
      style={{ '--delay': `${Math.min(index, 5) * 45}ms` }}
      href={site.href}
      target="_blank"
      rel="noopener"
    >
      <span className={s.cover}>
        <Picture
          name={site.image}
          alt={t('web.shotAlt', { name: site.name })}
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 45vw, 360px"
          className={s.shot}
        />
      </span>

      <span className={s.body}>
        <span className={s.title}>{site.name}</span>
        <span className={`text-muted ${s.note}`}>{t(`web.sites.${site.slug}`)}</span>

        <span className={`mono ${s.locales}`}>{site.locales.join(' · ')}</span>

        <span className={s.tags}>
          {site.tags.map((tag) => (
            <span key={tag} className="tag tag-neutral">
              {tag}
            </span>
          ))}
        </span>

        <span className={`mono ${s.link}`}>{site.label} ↗</span>
      </span>
    </a>
  )
}
