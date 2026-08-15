import Picture from './Picture.jsx'
import s from './PhoneBezel.module.css'

/**
 * Portrait projects render their first screenshot in a phone bezel, with the
 * remaining shots as a row of small thumbs below.
 */
export default function PhoneBezel({ entry, captions, onPick }) {
  const [first, ...rest] = entry.images

  return (
    <div className={s.wrap}>
      <div className={s.bezel}>
        <Picture
          name={first}
          alt={`${entry.title} — ${captions[0] ?? ''}`}
          sizes="250px"
          className={s.screen}
          eager
        />
      </div>

      {rest.length > 0 && (
        <div className={s.thumbs}>
          {rest.map((name, i) => {
            const caption = captions[i + 1] ?? ''
            const img = (
              <Picture
                name={name}
                alt={`${entry.title} — ${caption}`}
                sizes="54px"
                className={s.thumb}
              />
            )
            return onPick ? (
              <button key={name} type="button" className={s.thumbBtn} onClick={() => onPick(i + 1)}>
                {img}
              </button>
            ) : (
              <span key={name} className={s.thumbBtn}>
                {img}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
