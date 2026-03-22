interface ProcessSidebarProps {
  open: boolean
  onClose: () => void
}

const stages = [
  {
    title: 'STAGE 1 — SCAFFOLD',
    steps: [
      '1. Vet idea in Idea Analyzer',
      '2. Load output into PromptCraft',
      '3. Run Lovable P1–P6',
      '4. Connect to GitHub → clone',
    ],
  },
  {
    title: 'STAGE 2 — AUDIT & MIGRATE',
    steps: [
      '5. vd audit → AUDIT.md',
      '6. Fix all blockers',
      '7. vd scaffold → native repo',
      '8. Fill in CLAUDE.md',
    ],
  },
  {
    title: 'STAGE 3 — BUILD & TEST',
    steps: [
      '9. Install Claude Code',
      '10. Run P1–P6 in order',
      '11. Test via simulator',
      '12. Add icons (Iconify)',
      '13. Run P6 cleanup prompt',
    ],
  },
  {
    title: 'STAGE 4 — LAUNCH & LEARN',
    steps: [
      '14. Push to TestFlight',
      '15. Launch Wrap-Up checklist',
      '16. vd retro → RETRO.md',
    ],
  },
]

export default function ProcessSidebar({ open, onClose }: ProcessSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[320px] bg-vd-surface border-l border-vd-border z-50 transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-vd-border">
          <h2 className="font-display text-sm font-bold text-vd-text-primary tracking-wide">
            THE VD BUILD PIPELINE
          </h2>
          <button
            onClick={onClose}
            className="text-vd-text-dim hover:text-white text-lg bg-transparent border-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="p-5 overflow-y-auto h-[calc(100%-57px)]">
          {stages.map((stage, i) => (
            <div key={i} className="mb-6">
              <h3 className="text-xs font-mono font-medium text-vd-accent mb-2 tracking-wide">
                {stage.title}
              </h3>
              <ul className="space-y-1.5">
                {stage.steps.map((step, j) => (
                  <li key={j} className="text-sm text-vd-text-secondary font-body">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
