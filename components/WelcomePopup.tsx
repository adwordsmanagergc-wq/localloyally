'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

/** Shown once, right after sign-up: what the new member got. */
export default function WelcomePopup({ slug, title, body, note }: { slug: string; title: string; body: string; note?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const close = () => { setOpen(false); router.replace(`/${slug}/card`, { scroll: false }); };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="popup-backdrop" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="popup card stack center" role="dialog" aria-modal="true" aria-labelledby="welcome-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
            <div className="popup-emoji" aria-hidden="true">☕</div>
            <h2 id="welcome-title">{title}</h2>
            <p>{body}</p>
            {note && <p className="small muted">{note}</p>}
            <button className="btn block" autoFocus onClick={close}>See my card</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
