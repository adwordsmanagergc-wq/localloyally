'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import ScanTab from './ScanTab';
import ApprovalsTab from './ApprovalsTab';
import { DashboardTab, MembersTab, TeamTab } from './AdminTabs';
import SettingsTab from './SettingsTab';
import GiftsTab from './GiftsTab';

export type BizInfo = {
  slug: string; name: string; rewards: { stamps: number; label: string }[]; maxPerVisit: number;
  itemWord: string; itemWordPlural: string; social: boolean; stampIcon: string; stampImageUrl?: string;
  currency: string; giftsEnabled: boolean;
};
export type Toast = (msg: string) => void;

export default function StaffConsole({ biz, staff }: { biz: BizInfo; staff: { id: string; name: string; role: string } }) {
  const router = useRouter();
  const [tab, setTab] = useState('scan');
  const [toast, setToast] = useState('');
  const [pending, setPending] = useState(0);
  const show: Toast = useCallback((m) => { setToast(m); setTimeout(() => setToast(''), 2600); }, []);
  const manager = staff.role === 'manager';

  const loadPending = useCallback(async () => {
    if (!biz.social) return;
    try { setPending((await api(`/api/b/${biz.slug}/staff/social`)).items.length); } catch {}
  }, [biz.slug, biz.social]);
  useEffect(() => { loadPending(); const t = setInterval(loadPending, 30000); return () => clearInterval(t); }, [loadPending]);

  const tabs = [
    ['scan', 'Scan'],
    ...(biz.social ? [['approvals', `Posts${pending ? ` (${pending})` : ''}`]] : []),
    ...(biz.giftsEnabled ? [['gifts', 'Gifts']] : []),
    ...(manager ? [['dashboard', 'Dashboard'], ['members', 'Members'], ['settings', 'Settings'], ['team', 'Team']] : []),
  ];

  return (
    <div className="stack">
      <div className="row between">
        <div className="on-bg">
          <div className="head" style={{ fontSize: '1.3rem' }}>{biz.name}</div>
          <div className="small muted">Logged in as {staff.name}</div>
        </div>
        <button className="btn ghost small" onClick={async () => {
          await api(`/api/b/${biz.slug}/staff/logout`, {}).catch(() => {}); router.refresh();
        }}>Log out</button>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'scan' && <ScanTab biz={biz} toast={show} onSocialChange={loadPending} />}
      {tab === 'approvals' && <ApprovalsTab slug={biz.slug} toast={show} onChange={loadPending} />}
      {tab === 'gifts' && <GiftsTab biz={biz} toast={show} manager={manager} />}
      {tab === 'dashboard' && <DashboardTab slug={biz.slug} />}
      {tab === 'members' && <MembersTab slug={biz.slug} toast={show} />}
      {tab === 'settings' && <SettingsTab slug={biz.slug} toast={show} />}
      {tab === 'team' && <TeamTab slug={biz.slug} toast={show} me={staff.id} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
