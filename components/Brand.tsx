import StampIcon from './StampIcon';
import type { Business } from '@/lib/business';

export default function Brand({ biz, right }: { biz: Business; right?: React.ReactNode }) {
  return (
    <header className="brand">
      {biz.settings.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={biz.settings.logoUrl} alt="" />
      ) : (
        <span className="mark"><StampIcon icon={biz.settings.stampIcon} size={24} /></span>
      )}
      <div className="grow">
        <div className="name">{biz.name}</div>
        <div className="muted small">Rewards</div>
      </div>
      {right}
    </header>
  );
}
