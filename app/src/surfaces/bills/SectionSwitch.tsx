import { useNavigate } from 'react-router-dom'
import Segmented from '../../components/chowk/Segmented'
import { useT } from '../../i18n'

export type Section = 'pipeline' | 'constitution' | 'constituency'

const ROUTE: Record<Section, string> = {
  pipeline: '/s/bills',
  constitution: '/s/bills/constitution',
  constituency: '/s/bills/constituency',
}

/** The three rooms of Surface 3, in the order a citizen tends to need them. */
export default function SectionSwitch({ active }: { active: Section }) {
  const t = useT()
  const navigate = useNavigate()
  return (
    <Segmented
      label={t('bills.title')}
      value={active}
      onChange={(next) => navigate(ROUTE[next])}
      options={[
        { id: 'pipeline', label: t('bills.section.pipeline') },
        { id: 'constitution', label: t('bills.section.constitution') },
        { id: 'constituency', label: t('bills.section.constituency') },
      ]}
    />
  )
}
