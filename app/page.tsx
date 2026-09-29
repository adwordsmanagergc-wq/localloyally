export default function Home() {
  const name = process.env.PLATFORM_NAME || 'Rewards';
  return (
    <main className="theme tx-pebble">
      <div className="wrap stack-lg" style={{ paddingTop: 60 }}>
        <h1>{name}</h1>
        <p className="muted">Digital stamp cards for cafes, restaurants, salons and studios. Customers join with WhatsApp, staff scan a QR code, rewards and spin-to-win prizes keep them coming back.</p>
        <a className="btn" href="/platform" style={{ justifySelf: 'start' }}>Business owner login</a>
      </div>
    </main>
  );
}
