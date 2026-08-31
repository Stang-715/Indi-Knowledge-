import { useNavigate } from 'react-router-dom'
import Segmented from '../../components/chowk/Segmented'
import { useT } from '../../i18n'

export type Section = 'state' | 'data' | 'trade' | 'shops'

const ROUTE: Record<Section, string> = {
  state: '/s/bharat',
  data: '/s/bharat/weather',
  trade: '/s/bharat/trade',
  shops: '/s/bharat/shops',
}

export default function SectionSwitch({ active }: { active: Section }) {
  const t = useT()
  const navigate = useNavigate()
  return (
    <Segmented
      label={t('bharat.title')}
      value={active}
      onChange={(next) => navigate(ROUTE[next])}
      options={[
        { id: 'state', label: t('bharat.section.state') },
        { id: 'data', label: t('bharat.section.data') },
        { id: 'trade', label: t('bharat.section.trade') },
        { id: 'shops', label: t('bharat.section.stores') },
      ]}
    />
  )
}
