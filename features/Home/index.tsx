'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Backdrop from '@/components/Backdrop';

const MOVES = [
  { emoji: '🪨', label: 'Pierre', rot: '-8deg' },
  { emoji: '📄', label: 'Papier', rot: '4deg' },
  { emoji: '✂️', label: 'Ciseaux', rot: '-3deg' },
];

const Home = () => {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-12">
      <Backdrop glyphs />

      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        {/* Kicker */}
        <span
          className="hero-fade mb-7 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[var(--primary)] bg-[var(--background)]/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--secondary)]/80 shadow-[0_0_0_4px_#eaddca]"
          style={{ animationDelay: '0.05s' }}
        >
          Pierre · Papier · Ciseaux
        </span>

        {/* Logo */}
        <div
          className="hero-fade hero-float mb-2"
          style={{ animationDelay: '0.15s', ['--rot' as string]: '0deg' }}
        >
          <Image
            src="/assets/logo.png"
            alt="Logo Shifumi"
            width={512}
            height={512}
            sizes="(max-width: 640px) 8rem, 11rem"
            className="h-32 w-32 object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.28)] sm:h-44 sm:w-44"
            priority
          />
        </div>

        {/* Titre */}
        <h1
          className="hero-fade font-display text-7xl font-black leading-[0.9] tracking-tight text-[var(--secondary)] sm:text-8xl"
          style={{
            animationDelay: '0.25s',
            textShadow: '3px 3px 0 rgba(218,160,109,0.55)',
          }}
        >
          SHIFUMI
        </h1>

        {/* Tagline */}
        <p
          className="hero-fade font-display mt-5 max-w-md text-lg italic text-[var(--secondary)]/75 sm:text-xl"
          style={{ animationDelay: '0.35s' }}
        >
          Le pierre-papier-ciseaux en temps réel. Défie un autre joueur, manche
          après manche.
        </p>

        {/* Chips des coups */}
        <div
          className="hero-fade mt-9 flex items-center justify-center gap-3 sm:gap-4"
          style={{ animationDelay: '0.45s' }}
        >
          {MOVES.map((move) => (
            <div
              key={move.label}
              className="flex w-24 flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[var(--primary)] bg-white px-3 py-3 shadow-[0_0_0_4px_#eaddca,2px_2px_4px_2px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-0 sm:w-28"
              style={{ rotate: move.rot }}
            >
              <span className="text-3xl sm:text-4xl">{move.emoji}</span>
              <span className="text-xs font-semibold text-[var(--secondary)]/80">
                {move.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/game')}
          className="button hero-fade font-display mt-11 text-xl tracking-wide"
          style={{ animationDelay: '0.55s' }}
        >
          Jouer maintenant
        </button>

        <p
          className="hero-fade mt-5 text-xs text-[var(--secondary)]/55"
          style={{ animationDelay: '0.65s' }}
        >
          Crée une salle ou rejoins une partie en attente — à deux, en direct.
        </p>
      </div>
    </main>
  )
}

export default Home
