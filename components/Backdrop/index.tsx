const GLYPHS = [
  { emoji: '✊', className: 'left-[6%] top-[14%] text-[8rem] sm:text-[12rem]', rot: '-12deg', delay: '0s' },
  { emoji: '✋', className: 'bottom-[10%] left-[10%] text-[7rem] sm:text-[10rem]', rot: '10deg', delay: '1.6s' },
  { emoji: '✌️', className: 'right-[7%] top-[22%] text-[8rem] sm:text-[12rem]', rot: '14deg', delay: '0.8s' },
];

const Backdrop = ({ glyphs = false }: { glyphs?: boolean }) => (
  <>
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(circle at 50% 20%, rgba(218,160,109,0.40), transparent 60%)',
      }}
    />
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-50"
      style={{
        backgroundImage:
          'radial-gradient(rgba(28,28,28,0.10) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 80%)',
        WebkitMaskImage:
          'radial-gradient(circle at 50% 40%, black, transparent 80%)',
      }}
    />
    {glyphs &&
      GLYPHS.map((g) => (
        <span
          key={g.emoji}
          aria-hidden
          className={`hero-float pointer-events-none fixed -z-10 select-none opacity-[0.07] ${g.className}`}
          style={{ ['--rot' as string]: g.rot, animationDelay: g.delay }}
        >
          {g.emoji}
        </span>
      ))}
  </>
);

export default Backdrop;
