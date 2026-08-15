import { SKILL_ITEMS } from '../content/skills.js'
import { useLocale } from '../i18n/index.js'
import s from './SkillsList.module.css'

export default function SkillsList() {
  const { t } = useLocale()
  const groups = t('skills')

  return (
    <div className={s.list}>
      {groups.map((group, i) => (
        <div key={group.group} className={s.row}>
          <span className={`mono ${s.group}`}>{group.group}</span>
          <div className={s.body}>
            <div className={s.tags}>
              {SKILL_ITEMS[i].map((item) => (
                <span key={item} className="tag tag-neutral">
                  {item}
                </span>
              ))}
            </div>
            <p className={`text-muted ${s.note}`}>{group.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
