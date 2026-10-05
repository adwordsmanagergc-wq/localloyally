/** The black card itself: matte black, gold foil, the café's logo and the member's username. */
export default function BlackCard({ bizName, logoUrl, username, since }: { bizName: string; logoUrl?: string; username: string; since?: string }) {
  return (
    <div className="bc" role="img" aria-label={`${bizName} Black card for @${username}`}>
      <div className="bc-shine" aria-hidden="true" />
      <div className="bc-top">
        {logoUrl ? <img className="bc-logo" src={logoUrl} alt="" /> : <span className="bc-logo-text">{bizName}</span>}
        <span className="bc-tag">BLACK CARD</span>
      </div>
      <div className="bc-chip" aria-hidden="true" />
      <div className="bc-name">@{username}</div>
      <div className="bc-foot">
        <span>{since ? `MEMBER SINCE ${since}` : 'SUPER VIP'}</span>
        <span>FREE COFFEE · FOR LIFE</span>
      </div>
    </div>
  );
}
