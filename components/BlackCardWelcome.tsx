'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BlackCard from './BlackCard';

/** Plays once when a member gets a black card: the card flips in, then the royal welcome. */
export default function BlackCardWelcome({ slug, bizName, logoUrl, username }: { slug: string; bizName: string; logoUrl?: string; username: string }) {
  const [open, setOpen] = useState(true);
  const close = () => {
    setOpen(false);
    fetch(`/api/b/${slug}/card/blackcard`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }).catch(() => {});
    window.history.replaceState(null, '', `/${slug}/card`);
  };
  const line = (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6, ease: 'easeOut' as const } });
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="bcw" role="dialog" aria-modal="true" aria-labelledby="bcw-title"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
          <div className="bcw-glow" aria-hidden="true" />
          <div className="bcw-inner">
            <motion.div style={{ perspective: 1200 }} initial={{ opacity: 0, y: 80, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.2 }}>
              <motion.div initial={{ rotateY: 180, rotateX: 12 }} animate={{ rotateY: 0, rotateX: 0 }} transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}>
                <BlackCard bizName={bizName} logoUrl={logoUrl} username={username} />
              </motion.div>
            </motion.div>
            <motion.div className="bcw-crown" aria-hidden="true" {...line(1.5)}>👑</motion.div>
            <motion.h2 id="bcw-title" className="bcw-title" {...line(1.7)}>You are a super VIP</motion.h2>
            <motion.p className="bcw-text" {...line(2.0)}>Welcome to your new black card, <strong>@{username}</strong>.</motion.p>
            <motion.p className="bcw-text bcw-gold" {...line(2.3)}>Free coffees for life… or until you piss off the owners.</motion.p>
            <motion.button className="bcw-btn" onClick={close} autoFocus {...line(2.7)}>Enter, your majesty</motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
