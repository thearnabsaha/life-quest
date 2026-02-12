'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Zap, CheckSquare, Target, Calendar, BarChart3, Radar,
  ShoppingBag, BookOpen, Sparkles, ArrowRight, Star, Trophy,
  Flame, Shield, Swords, Crown, ChevronDown, Volume2, Palette,
  Bot, Users, TrendingUp, Heart,
} from 'lucide-react';

/* ===== Animated counter ===== */
function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ===== Floating particles ===== */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: 'var(--color-accent)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.3,
          }}
          animate={{
            y: [0, -30 - Math.random() * 60, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ===== Feature card ===== */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group border-2 p-6 transition-all hover:shadow-lg"
      style={{
        borderColor: 'var(--color-border-accent)',
        backgroundColor: 'var(--color-bg-card)',
      }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center border-2 mb-4 transition-all group-hover:scale-110"
        style={{
          borderColor: 'var(--color-accent)',
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
        }}
      >
        <Icon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
      </div>
      <h3
        className="font-heading text-sm mb-2 tracking-wider"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      <p className="font-body text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        {description}
      </p>
    </motion.div>
  );
}

/* ===== Stat card ===== */
function StatCard({
  value,
  label,
  icon: Icon,
  delay = 0,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center p-6 border-2"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
      }}
    >
      <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
      <p className="font-heading text-2xl md:text-3xl" style={{ color: 'var(--color-accent)' }}>
        <Counter value={value} />+
      </p>
      <p className="font-body text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
    </motion.div>
  );
}

/* ===== Rank badge ===== */
function RankBadge({ rank, label, delay }: { rank: string; label: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3 border-2 px-4 py-3"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg-elevated)',
      }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center border-2 font-heading text-sm"
        style={{
          borderColor: 'var(--color-accent-2)',
          color: 'var(--color-accent-2)',
          backgroundColor: 'color-mix(in srgb, var(--color-accent-2) 10%, transparent)',
        }}
      >
        {rank}
      </div>
      <span className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </span>
    </motion.div>
  );
}

/* ===== Main Landing Page ===== */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  const FEATURES = [
    { icon: CheckSquare, title: 'HABIT TRACKER', description: 'Track daily habits with Yes/No, hours, or manual XP. Build streaks and earn rewards for consistency.' },
    { icon: Zap, title: 'XP SYSTEM', description: 'Every action earns XP. Auto-calculated or manually edited. Watch your power level grow with every achievement.' },
    { icon: Target, title: 'CHALLENGES', description: 'Set short-term and long-term challenges. Track progress, hit milestones, and earn massive XP rewards.' },
    { icon: Calendar, title: 'ACTIVITY CALENDAR', description: 'GitHub-style heatmap showing your daily activity. Visualize your consistency and dedication over time.' },
    { icon: BarChart3, title: 'DEEP ANALYTICS', description: 'Radar charts, trend lines, category breakdowns. Understand your strengths and optimize your growth.' },
    { icon: Radar, title: 'STATS RADAR', description: 'RPG-style stat visualization. See your power distribution across all life categories at a glance.' },
    { icon: ShoppingBag, title: 'XP SHOP', description: 'Create custom rewards and redeem them with your earned XP. From Common to Mythic rarity tiers.' },
    { icon: BookOpen, title: 'RULEBOOK', description: 'Define your own game rules. Set XP formulas, level curves, and custom mechanics.' },
    { icon: Bot, title: 'AI ASSISTANT', description: 'Powered by Groq. Create habits, log activities, change themes, and control the app with natural language.' },
    { icon: Palette, title: 'THEMES & AUDIO', description: '10+ themes from Solo Leveling to Cyberpunk. Procedural sound effects and ambient music.' },
    { icon: Volume2, title: 'GAME AUDIO', description: 'XP gain sounds, level-up fanfares, habit completion chimes. Full immersive audio experience.' },
    { icon: Shield, title: 'FULL CONTROL', description: 'Override XP, levels, categories. Edit history, disable automation. Your game, your rules.' },
  ];

  const RANKS = [
    { rank: 'E', label: 'Beginner Hunter' },
    { rank: 'D', label: 'Apprentice' },
    { rank: 'C', label: 'Skilled Hunter' },
    { rank: 'B', label: 'Elite Fighter' },
    { rank: 'A', label: 'Master Hunter' },
    { rank: 'S', label: 'Shadow Monarch' },
    { rank: 'SS', label: 'Legendary' },
    { rank: 'SSS', label: 'Transcendent' },
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Particles />

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-accent) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 border-2 px-4 py-2 mb-8"
            style={{
              borderColor: 'var(--color-accent)',
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 5%, transparent)',
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--color-accent)' }}>
              SOLO LEVELING x NOTION x RPG
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-wider mb-6 animate-text-shimmer"
          >
            LIFE QUEST
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="font-body text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-4"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Gamify your entire life. Track habits, earn XP, level up your character,
            and become the strongest version of yourself.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-mono text-xs mb-10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Every. Single. Day. Counts.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group flex items-center gap-2 border-4 px-8 py-4 font-heading text-sm tracking-wider transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
              style={{
                borderColor: 'var(--color-accent)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg-base)',
                boxShadow: '6px 6px 0px 0px var(--color-border-accent)',
              }}
            >
              START YOUR JOURNEY
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 border-2 px-8 py-4 font-heading text-sm tracking-wider transition-all hover:opacity-80"
              style={{
                borderColor: 'var(--color-border-accent)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'transparent',
              }}
            >
              CONTINUE QUEST
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
        </motion.div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-16 px-4 border-y-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value={12} label="Features" icon={Star} delay={0} />
          <StatCard value={10} label="Themes" icon={Palette} delay={0.1} />
          <StatCard value={8} label="Rank Tiers" icon={Crown} delay={0.2} />
          <StatCard value={5} label="AI Models" icon={Bot} delay={0.3} />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-2xl md:text-4xl tracking-wider mb-4 animate-text-shimmer">
              POWER FEATURES
            </h2>
            <p className="font-body text-sm md:text-base max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Everything you need to transform your life into an RPG adventure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== RANK SYSTEM ===== */}
      <section
        className="py-20 px-4 border-y-2"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-2xl md:text-4xl tracking-wider mb-4 animate-text-shimmer">
              RANK SYSTEM
            </h2>
            <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Level up and climb the ranks. From E-Rank Beginner to SSS-Rank Transcendent.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RANKS.map((r, i) => (
              <RankBadge key={r.rank} {...r} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-2xl md:text-4xl tracking-wider mb-4 animate-text-shimmer">
              HOW IT WORKS
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '01', icon: Users, title: 'CREATE YOUR HUNTER', desc: 'Register and build your character. Choose your path.' },
              { step: '02', icon: Flame, title: 'SET YOUR QUESTS', desc: 'Add categories, habits, and challenges. Define your XP rewards.' },
              { step: '03', icon: Swords, title: 'GRIND DAILY', desc: 'Complete habits, track hours, earn XP. Every action counts.' },
              { step: '04', icon: TrendingUp, title: 'LEVEL UP', desc: 'Watch your stats grow. Unlock ranks. Become the strongest.' },
              { step: '05', icon: Trophy, title: 'CLAIM REWARDS', desc: 'Redeem XP in the shop. Earn artifacts. Celebrate victories.' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 border-2 p-6"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-card)',
                }}
              >
                <div
                  className="shrink-0 w-12 h-12 flex items-center justify-center border-2 font-heading text-xs"
                  style={{
                    borderColor: 'var(--color-accent)',
                    color: 'var(--color-accent)',
                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                  }}
                >
                  {step}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    <h3 className="font-heading text-xs tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                      {title}
                    </h3>
                  </div>
                  <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI POWERS ===== */}
      <section
        className="py-20 px-4 border-y-2"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl md:text-4xl tracking-wider mb-4 animate-text-shimmer">
              AI SUPERPOWERS
            </h2>
            <p className="font-body text-sm mb-12 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Natural language control. Just tell the AI what you want.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {[
              { cmd: '"I ran 5km and studied 2 hours"', desc: 'Auto-completes matching habits' },
              { cmd: '"Create a Health category with Gym, Cardio"', desc: 'Creates categories + subcategories' },
              { cmd: '"Switch to Cyberpunk theme"', desc: 'Changes app theme instantly' },
              { cmd: '"Turn off the music"', desc: 'Toggles audio settings' },
              { cmd: '"Go to settings"', desc: 'Navigates to any page' },
              { cmd: '"Add 50 XP to Health"', desc: 'Logs XP to categories' },
            ].map(({ cmd, desc }, i) => (
              <motion.div
                key={cmd}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-2 p-4"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-card)',
                }}
              >
                <p className="font-mono text-xs mb-1" style={{ color: 'var(--color-accent)' }}>
                  {cmd}
                </p>
                <p className="font-body text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-4 relative">
        <Particles />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Heart className="w-8 h-8 mx-auto mb-6" style={{ color: 'var(--color-accent)' }} />
            <h2 className="font-heading text-2xl md:text-4xl tracking-wider mb-4 animate-text-shimmer">
              YOUR JOURNEY STARTS NOW
            </h2>
            <p className="font-body text-sm mb-10" style={{ color: 'var(--color-text-muted)' }}>
              Stop tracking your life in boring spreadsheets. Turn it into an adventure.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 border-4 px-10 py-5 font-heading text-sm tracking-wider transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
              style={{
                borderColor: 'var(--color-accent)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg-base)',
                boxShadow: '6px 6px 0px 0px var(--color-border-accent)',
              }}
            >
              CREATE YOUR HUNTER
              <Swords className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-8 px-4 border-t-2 text-center"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
          LIFE QUEST v0.2.0 — Solo Leveling meets Notion meets RPG Character Sheet
        </p>
      </footer>
    </div>
  );
}
