import Picture from './Picture.jsx'
import s from './LandscapeShots.module.css'

/** Landscape projects (Apex Ryde) stack captioned wide figures. */
export default function LandscapeShots({ entry, captions }) {
  return (
    <div className={s.wrap}>
      {entry.images.map((name, i) => (
        <figure key={name} className={s.figure}>
          <Picture
            name={name}
            alt={`${entry.title} — ${captions[i] ?? ''}`}
            sizes="(max-width: 900px) 100vw, 460px"
            className={s.shot}
            eager={i === 0}
          />
          <figcaption className={`mono ${s.caption}`}>{captions[i]}</figcaption>
        </figure>
      ))}
    </div>
  )
}
