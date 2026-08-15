import s from './PlaceholderTile.module.css'

/** Entries with no screenshots get a striped tile carrying their coverNote. */
export default function PlaceholderTile({ label, className }) {
  return (
    <span className={`${s.tile} ${className ?? ''}`}>
      <span className={`mono ${s.label}`}>{label}</span>
    </span>
  )
}
