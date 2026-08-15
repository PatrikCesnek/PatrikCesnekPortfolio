import { useLocale } from '../i18n/index.js'
import s from './Footer.module.css'

const LINKS = [
  { label: 'SIDEQ', href: 'https://sidequest-ios.netlify.app/' },
  { label: 'WORLDWANDERER', href: 'https://worldwanderer-web.netlify.app/' },
]

export default function Footer() {
  const { t } = useLocale()

  return (
    <footer className={`mono ${s.footer}`}>
      <span className="text-muted">{t('footer.identity')}</span>
      <div className={s.links}>
        <a className={s.link} href="mailto:pcesnek290@gmail.com">
          {t('footer.email')}
        </a>
        {LINKS.map(({ label, href }) => (
          <a key={label} className={s.link} href={href} target="_blank" rel="noopener">
            {label}
          </a>
        ))}
      </div>
    </footer>
  )
}
