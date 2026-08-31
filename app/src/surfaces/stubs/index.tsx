import ComingSoon from './ComingSoon'

export function BharatStub() {
  return (
    <ComingSoon
      surface="Bharat"
      tagline="History, live data, trade — and your shop on a map everybody can see."
      planned={[
        { code: '2.1', title: 'State picker', detail: 'Map or list. Sets the scope for everything below it.' },
        { code: '2.2', title: 'State profile', detail: 'Formation, capital, districts, constituencies and a real timeline — not a summary paragraph.' },
        { code: '2.3', title: 'Live weather', detail: 'District-level, feeding sowing and transport advisories rather than sitting there as a number.' },
        { code: '2.4', title: 'Agriculture & export', detail: 'Commodity volumes, year-on-year movement, destination markets, port throughput. Every figure carries its lag.' },
        { code: '2.5', title: 'Brand directory', detail: 'Export houses and electric vehicle makers, filtered by state and sector.' },
        { code: '2.6', title: 'Open a store', detail: 'A stated business address you type — the map shows shops, never shoppers.' },
        { code: '2.7', title: 'Public map', detail: 'Every listed store, with weather, mandi and roadwork layers over it.' },
      ]}
    />
  )
}

export function WorksStub() {
  return (
    <ComingSoon
      surface="Works"
      tagline="Nobody digs before they book it here."
      existing={[
        { to: '/app/notices', label: 'Notices', detail: 'Water shutdowns, road work and health camps for the wards you follow' },
        { to: '/gov', label: 'Department portal', detail: 'Institutional sign-in, publishing, and the moderation queues' },
      ]}
      planned={[
        { code: '4.1', title: 'Live works map', detail: 'What is dug, closed or planned — each with the end date the department committed to.' },
        { code: '4.2', title: 'Schedule a work', detail: 'The department files intent: road, window, reason, restoration date.' },
        { code: '4.3', title: 'Clash detector', detail: 'Water booked this stretch last week. Resolve it before approval, not after the tarmac is up.' },
        { code: '4.4', title: 'Approval to permit', detail: 'The permit number is issued here. No permit, no dig.' },
        { code: '4.6', title: 'Overrun record', detail: 'Promised against actual, published per department, permanently. This is what makes 4.2 a commitment instead of paperwork.' },
      ]}
    />
  )
}
