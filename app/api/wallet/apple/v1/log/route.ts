/** Apple posts pass errors here. Handy when setting up. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  console.warn('[Apple Wallet log]', JSON.stringify(body).slice(0, 2000));
  return new Response(null, { status: 200 });
}
