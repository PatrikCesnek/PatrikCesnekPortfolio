import { useLocale } from '../i18n/index.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import s from './Hire.module.css'

/**
 * The page that answers a commercial search.
 *
 * Every other route answers "who is this" — this one answers "can I hire him,
 * for what, and where". It is the only page carrying Praha and Bratislava as
 * words on the page rather than as a claim in JSON-LD, and the FAQ below is
 * the site's only prose written against questions people actually type.
 */
export default function Hire() {
  const { t } = useLocale()

  useDocumentTitle(t('meta.titleHire'))

  return (
    <main id="content" className={s.page}>
      <h1 className={s.title}>{t('hire.title')}</h1>
      <p className={s.lede}>{t('hire.lede')}</p>

      <p className={`mono ${s.status}`}>
        <span className={s.dot} aria-hidden="true" />
        {t('hire.status')}
      </p>

      <section className={s.block}>
        <h2 className={`mono ${s.heading}`}>{t('hire.servicesHeading')}</h2>
        <div className={s.grid}>
          {t('hire.services').map(({ name, body }) => (
            <article key={name} className={s.card}>
              <h3 className={s.cardTitle}>{name}</h3>
              <p className={s.cardBody}>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={s.block}>
        <h2 className={`mono ${s.heading}`}>{t('hire.whereHeading')}</h2>
        <div className={s.grid}>
          {t('hire.cities').map(({ name, body }) => (
            <article key={name} className={s.card}>
              <h3 className={s.cardTitle}>{name}</h3>
              <p className={s.cardBody}>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={s.block}>
        <h2 className={`mono ${s.heading}`}>{t('hire.processHeading')}</h2>
        {/* An ordered list because the order is the point — and because a
            crawler reading three <li> in sequence gets the same steps a
            sighted visitor reads off the numerals. */}
        <ol className={s.steps}>
          {t('hire.process').map(({ name, body }) => (
            <li key={name} className={s.step}>
              <h3 className={s.stepTitle}>{name}</h3>
              <p className={s.cardBody}>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={s.block}>
        <h2 className={`mono ${s.heading}`}>{t('hire.faqHeading')}</h2>
        {/* Rendered open, not in a <details>. The answers are the page's
            densest prose and the reason it has a chance of matching a
            long-tail query; nothing is gained by hiding them behind a click. */}
        <div className={s.faq}>
          {t('hire.faq').map(({ q, a }) => (
            <div key={q} className={s.qa}>
              <h3 className={s.question}>{q}</h3>
              <p className={s.answer}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={s.cta}>
        <h2 className={s.ctaHeading}>{t('hire.ctaHeading')}</h2>
        <p className={s.ctaBody}>{t('hire.ctaBody')}</p>
        <a className="btn btn-primary" href="mailto:pcesnek290@gmail.com">
          {t('hire.ctaButton')}
        </a>
      </section>
    </main>
  )
}
