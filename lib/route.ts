import { getBusiness, type Business } from './business';
import { getCustomerId, getStaff, type StaffUser } from './auth';
import { RuleError } from './loyalty';
import { json } from './util';

type Ctx = { params: Promise<{ slug: string }> };

export async function body(req: Request): Promise<any> {
  return req.json().catch(() => ({}));
}

/** Wraps a per-business API route: finds the business, blocks cross-site form posts, turns rule errors into 400s. */
export function bizRoute(handler: (req: Request, biz: Business) => Promise<Response>) {
  return async (req: Request, ctx: Ctx) => {
    try {
      if (req.method !== 'GET' && !(req.headers.get('content-type') || '').includes('application/json'))
        return json({ error: 'Expected JSON' }, 415);
      const { slug } = await ctx.params;
      const biz = await getBusiness(slug);
      if (!biz) return json({ error: 'Business not found' }, 404);
      return await handler(req, biz);
    } catch (e) {
      if (e instanceof RuleError) return json({ error: e.message }, 400);
      console.error(e);
      return json({ error: 'Something went wrong, please try again' }, 500);
    }
  };
}

export const customerRoute = (h: (req: Request, biz: Business, customerId: string) => Promise<Response>) =>
  bizRoute(async (req, biz) => {
    const id = await getCustomerId(biz.id);
    return id ? h(req, biz, id) : json({ error: 'Please log in again' }, 401);
  });

export const staffRoute = (h: (req: Request, biz: Business, staff: StaffUser) => Promise<Response>) =>
  bizRoute(async (req, biz) => {
    const st = await getStaff(biz.id);
    return st ? h(req, biz, st) : json({ error: 'Staff login expired' }, 401);
  });

export const managerRoute = (h: (req: Request, biz: Business, staff: StaffUser) => Promise<Response>) =>
  staffRoute(async (req, biz, st) => (st.role === 'manager' ? h(req, biz, st) : json({ error: 'Managers only' }, 403)));
