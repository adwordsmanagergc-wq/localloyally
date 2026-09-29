const PATHS: Record<string, React.ReactNode> = {
  bean: (
    <>
      <ellipse cx="12" cy="12" rx="7" ry="9.5" transform="rotate(35 12 12)" fill="currentColor" />
      <path d="M8.2 18.2c2.6-2.2 1.2-5 3.2-7.3 1.6-1.8 3.9-2.1 4.6-5.2" stroke="var(--stamp-cut, #0003)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
  cup: <path fill="currentColor" d="M4 8h13v5.5A5.5 5.5 0 0 1 11.5 19h-2A5.5 5.5 0 0 1 4 13.5V8Zm13 1.5h1.2a2.8 2.8 0 0 1 0 5.6H16.7l.3-1.7h1.2a1.1 1.1 0 0 0 0-2.2H17V9.5ZM3 20.2h15v1.3H3v-1.3ZM8 2.5c1 1-.9 2 0 3.2M11 2.5c1 1-.9 2 0 3.2M14 2.5c1 1-.9 2 0 3.2" stroke="currentColor" strokeWidth="1" />,
  leaf: <path fill="currentColor" d="M20 3.5C10 3.5 4 8.5 4 15.5c0 1.6.4 3 1.1 4.2L3.6 21.2l1.1 1 1.6-1.6A7 7 0 0 0 10 21.8c7.5 0 10.5-8 10-18.3ZM7.6 18.3c2.6-4.3 5.6-7 9.2-9.2-3 2.5-5.6 5.4-8 9.8l-1.2-.6Z" />,
  star: <path fill="currentColor" d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" />,
  heart: <path fill="currentColor" d="M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8c0 6.1-8.5 11.3-8.5 11.3Z" />,
  scissors: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="6.5" cy="17.5" r="3" /><circle cx="17.5" cy="17.5" r="3" /><path d="M8.6 15.4 18 3.5M15.4 15.4 6 3.5" />
    </g>
  ),
  paw: (
    <g fill="currentColor">
      <ellipse cx="12" cy="16" rx="5" ry="4.2" /><circle cx="5.5" cy="10.5" r="2.2" /><circle cx="9.3" cy="6.5" r="2.2" />
      <circle cx="14.7" cy="6.5" r="2.2" /><circle cx="18.5" cy="10.5" r="2.2" />
    </g>
  ),
  bolt: <path fill="currentColor" d="M13.5 2 4.5 13.5h6.2L9.8 22l9.7-12.2h-6.3L13.5 2Z" />,
  slice: <path fill="currentColor" d="M3 18.5 20.5 7.2c.6 1.3 1 2.8 1 4.3v7H3Zm0 1.5h18.5v1.5H3V20ZM4.5 16.6 18.8 7.3A9.5 9.5 0 0 0 12.4 4.5L4.5 16.6Z" />,
  drop: <path fill="currentColor" d="M12 2.5s6.5 7.2 6.5 11.8a6.5 6.5 0 0 1-13 0C5.5 9.7 12 2.5 12 2.5Z" />,
};

export default function StampIcon({ icon, size = 24 }: { icon: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {PATHS[icon] ?? PATHS.star}
    </svg>
  );
}
