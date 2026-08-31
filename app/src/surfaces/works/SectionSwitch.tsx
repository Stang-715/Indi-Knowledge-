import { useNavigate } from 'react-router-dom'
import Segmented from '../../components/chowk/Segmented'
import { useT } from '../../i18n'

export type Section = 'map' | 'mine' | 'record'

const ROUTE: Record<Section, string> = {
  map: '/s/works',
  mine: '/s/works/mine',
  record: '/s/works/record',
}

export default function SectionSwitch({ active }: { active: Section }) {
  const t = useT()
  const navigate = useNavigate()
  return (
    <Segmented
      label={t('works.title')}
      value={active}
      onChange={(next) => navigate(ROUTE[next])}
      options={[
        { id: 'map', label: t('works.section.map') },
        { id: 'mine', label: t('works.section.mine') },
        { id: 'record', label: t('works.section.record') },
      ]}
    />
  )
}
