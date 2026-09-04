export default function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden border-r border-ink-100 bg-husk lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-weave" aria-hidden="true" />

      <div className="relative z-10 px-12 pt-12">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-grain-500 font-display text-sm font-bold text-white">
            AG
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
            AcoustiGrain
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center px-12">
        <SignatureIllustration />
      </div>

      <div className="relative z-10 border-t border-ink-100/70 px-12 py-8">
        <p className="font-display text-xl leading-snug text-ink-800">
          Hear the infestation<br />before you see it.
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-400">
          A single non-invasive wedge listens between your rice sacks and
          isolates the 3&ndash;5&nbsp;kHz feeding signature of Sitophilus oryzae
          from warehouse noise &mdash; in real time.
        </p>
      </div>
    </div>
  );
}

function SignatureIllustration() {
  return (
    <svg viewBox="0 0 420 280" className="w-full max-w-sm" role="img" aria-label="Acoustic waveform resolving into an infestation status reading">
      {/* Sacks */}
      <rect x="30" y="120" width="110" height="90" rx="6" fill="#F3E9CE" stroke="#D6B876" strokeWidth="1.5" />
      <rect x="30" y="100" width="110" height="18" rx="4" fill="#E6D3A1" stroke="#D6B876" strokeWidth="1.5" />
      <rect x="150" y="120" width="110" height="90" rx="6" fill="#F3E9CE" stroke="#D6B876" strokeWidth="1.5" />
      <rect x="150" y="100" width="110" height="18" rx="4" fill="#E6D3A1" stroke="#D6B876" strokeWidth="1.5" />

      {/* Wedge inserted between sacks */}
      <polygon points="140,95 168,150 140,205" fill="#AC7F35" stroke="#6B4C1F" strokeWidth="1.5" />
      <circle cx="146" cy="150" r="3" fill="#FBF7ED" />

      {/* Waveform rising from wedge tip */}
      <path
        d="M168 150 C 190 150, 190 110, 210 110 C 230 110, 230 190, 250 190 C 270 190, 270 130, 290 130 C 305 130, 305 150, 320 150"
        fill="none"
        stroke="#AC7F35"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Resolves into a status dot */}
      <circle cx="360" cy="150" r="10" fill="#1E8E5A" className="pulse-dot" />
      <circle cx="360" cy="150" r="18" fill="none" stroke="#1E8E5A" strokeWidth="1" opacity="0.4" />

      <line x1="320" y1="150" x2="342" y2="150" stroke="#736A5E" strokeWidth="1.5" strokeDasharray="3 4" />
    </svg>
  );
}
