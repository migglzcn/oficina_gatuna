export function Icon({ name, size = 20 }: { name: 'grid' | 'office' | 'team' | 'play' | 'arrow' | 'reset' | 'check' | 'clock' | 'spark' | 'layers' | 'cat'; size?: number }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    office: <><path d="M4 21V5l8-3 8 3v16M9 21v-5h6v5M2 21h20M8 7h1m6 0h1M8 11h1m6 0h1" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2" /></>,
    play: <path d="m8 5 11 7-11 7Z" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    reset: <><path d="M3 10a9 9 0 1 1 1 7M3 4v6h6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" /></>,
    layers: <><path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5" /></>,
    cat: <><path d="m5 9-1-6 6 4h4l6-4-1 6a8 8 0 1 1-14 0Z" /><path d="M8 12h.01M16 12h.01m-6 4 2 1 2-1M2 14l5 1m10 0 5-1" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
