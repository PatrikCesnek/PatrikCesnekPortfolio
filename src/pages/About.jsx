import { useLocale } from '../i18n/index.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { PORTRAIT } from '../assets/manifest.js'
import SkillsList from '../components/SkillsList.jsx'
import s from './About.module.css'

export default function About() {
  const { t } = useLocale()
  const paragraphs = t('about.paragraphs')

  useDocumentTitle(t('meta.titleAbout'))

  return (
    <main id="content" className={s.page}>
      <div className={s.left}>
        <h1 className={s.title}>{t('about.title')}</h1>

        {paragraphs.map((para, i) => (
          <p key={i} className={i === 0 ? s.lede : s.body}>
            {para}
          </p>
        ))}

        <SkillsList />
      </div>

      <div className={s.right}>
        <figure className={s.figure}>
          {/* A pre-cropped head-and-shoulders derivative, so plain cover works
              — the prototype faked this with background-size: 260%. */}
          <picture>
            <source type="image/avif" srcSet={PORTRAIT.avif} sizes="300px" />
            <source type="image/webp" srcSet={PORTRAIT.webp} sizes="300px" />
            <img
              src={PORTRAIT.src}
              srcSet={PORTRAIT.jpg}
              sizes="300px"
              alt={t('about.portraitAlt')}
              className={s.portrait}
              width="640"
              height="800"
              decoding="async"
            />
          </picture>
          <figcaption className={`mono ${s.caption}`}>{t('about.portraitCaption')}</figcaption>
        </figure>

        <div className={`mono ${s.contact}`}>
          <a className={s.link} href="mailto:pcesnek290@gmail.com">
            pcesnek290@gmail.com
          </a>
          <a className={s.link} href="tel:+421948093464">
            +421 948 093 464
          </a>
          <span className="text-muted">{t('about.location')}</span>
        </div>
      </div>
    </main>
  )
}
