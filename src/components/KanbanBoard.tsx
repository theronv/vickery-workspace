import { type CardData } from './KanbanCard'
import KanbanColumn from './KanbanColumn'

interface CardState {
  status: 'todo' | 'in-progress' | 'done'
  checkedSteps: number[]
}

interface KanbanBoardProps {
  cardStates: Record<string, CardState>
  onToggleStep: (cardId: string, stepIndex: number) => void
  onStatusChange: (cardId: string, status: 'todo' | 'in-progress' | 'done') => void
}

const columns = [
  {
    title: 'STAGE 1',
    subtitle: 'Scaffold',
    cards: [
      {
        id: 'card-1',
        stepNumber: 1,
        title: 'Vet idea in Idea Analyzer',
        substeps: [
          { label: 'Enter app name and description' },
          { label: 'Score all 4 criteria' },
          { label: 'Review verdict' },
        ],
        columnIndex: 0,
      },
      {
        id: 'card-2',
        stepNumber: 2,
        title: 'Load output into PromptCraft',
        substeps: [
          { label: 'Verify app name pre-filled' },
          { label: 'Select build mode' },
        ],
        columnIndex: 0,
      },
      {
        id: 'card-3',
        stepNumber: 3,
        title: 'Run Lovable P1–P6 → produces PWA + README',
        substeps: [
          { label: 'Generate all 6 prompts' },
          { label: 'Run each prompt in Lovable' },
          { label: 'Verify PWA output' },
        ],
        columnIndex: 0,
      },
      {
        id: 'card-4',
        stepNumber: 4,
        title: 'Connect to GitHub → clone repo locally',
        substeps: [
          { label: 'Create GitHub repo' },
          { label: 'Push Lovable output' },
          { label: 'Clone locally' },
        ],
        columnIndex: 0,
      },
    ] as CardData[],
  },
  {
    title: 'STAGE 2',
    subtitle: 'Audit & Migrate',
    cards: [
      {
        id: 'card-5',
        stepNumber: 5,
        title: 'Run vd audit → generates AUDIT.md + CLAUDE.md skeleton',
        substeps: [
          { label: 'Review AUDIT.md output' },
          { label: 'Note all 🚨 blockers' },
        ],
        command: 'vd audit . --name AppName --bundle com.vickerydigital.appname',
        columnIndex: 1,
      },
      {
        id: 'card-6',
        stepNumber: 6,
        title: 'Fix all 🚨 blockers in AUDIT.md',
        substeps: [
          { label: 'Address each blocker' },
          { label: 'Re-run audit to verify' },
        ],
        columnIndex: 1,
      },
      {
        id: 'card-7',
        stepNumber: 7,
        title: 'Run vd scaffold → generates native monorepo',
        substeps: [
          { label: 'Verify monorepo structure' },
          { label: 'Check iOS project generated' },
        ],
        command: 'vd scaffold AppName --bundle com.vickerydigital.appname',
        columnIndex: 1,
      },
      {
        id: 'card-8',
        stepNumber: 8,
        title: 'Fill in CLAUDE.md [FILL IN] sections (~15 min)',
        substeps: [
          { label: 'Complete all [FILL IN] placeholders' },
          { label: 'Review for accuracy' },
        ],
        columnIndex: 1,
      },
    ] as CardData[],
  },
  {
    title: 'STAGE 3',
    subtitle: 'Build & Test',
    cards: [
      {
        id: 'card-9',
        stepNumber: 9,
        title: 'Install Claude Code in project directory',
        substeps: [
          { label: 'Verify installation' },
        ],
        command: 'npm install -g @anthropic-ai/claude-code',
        columnIndex: 2,
      },
      {
        id: 'card-10',
        stepNumber: 10,
        title: 'Run Claude Code P1–P6 prompts in order',
        substeps: [
          { label: 'P1: Migrate UI to Native' },
          { label: 'P2: Backend & Data Layer' },
          { label: 'P3: Core Features Build' },
          { label: 'P4: UX & Interactions' },
          { label: 'P5: Visual Design, A11y, Performance' },
          { label: 'P6: Hardening & Launch Prep' },
        ],
        columnIndex: 2,
      },
      {
        id: 'card-11',
        stepNumber: 11,
        title: 'Test on simulator via vd-console → BUILD',
        substeps: [
          { label: 'Build succeeds' },
          { label: 'App launches in simulator' },
          { label: 'Core features work' },
        ],
        columnIndex: 2,
      },
      {
        id: 'card-12',
        stepNumber: 12,
        title: 'Add icons via Iconify',
        substeps: [
          { label: 'App icon added' },
          { label: 'All UI icons in place' },
        ],
        columnIndex: 2,
      },
      {
        id: 'card-13',
        stepNumber: 13,
        title: 'Run P6 cleanup prompt (final CLAUDE.md update)',
        substeps: [
          { label: 'CLAUDE.md updated' },
          { label: 'No remaining TODOs' },
        ],
        columnIndex: 2,
      },
    ] as CardData[],
  },
  {
    title: 'STAGE 4',
    subtitle: 'Launch & Learn',
    cards: [
      {
        id: 'card-14',
        stepNumber: 14,
        title: 'Push to TestFlight via vd-console → TESTFLIGHT',
        substeps: [
          { label: 'Archive build' },
          { label: 'Upload to App Store Connect' },
          { label: 'TestFlight build available' },
        ],
        columnIndex: 3,
      },
      {
        id: 'card-15',
        stepNumber: 15,
        title: 'Complete Launch Wrap-Up checklist in vd-console',
        substeps: [
          { label: 'Screenshots captured' },
          { label: 'App listing complete' },
          { label: 'Submit for review' },
        ],
        columnIndex: 3,
      },
      {
        id: 'card-16',
        stepNumber: 16,
        title: 'Run vd retro → RETRO.md committed before next app starts',
        substeps: [
          { label: 'Retrospective written' },
          { label: 'RETRO.md committed' },
          { label: 'Lessons captured' },
        ],
        command: 'vd retro . --cli-dir ~/vd-cli',
        columnIndex: 3,
      },
    ] as CardData[],
  },
]

export { columns }

export default function KanbanBoard({ cardStates, onToggleStep, onStatusChange }: KanbanBoardProps) {
  return (
    <div className="flex h-full overflow-x-auto divide-x divide-vd-border">
      {columns.map((col, i) => (
        <KanbanColumn
          key={i}
          title={col.title}
          subtitle={col.subtitle}
          cards={col.cards}
          cardStates={cardStates}
          onToggleStep={onToggleStep}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
