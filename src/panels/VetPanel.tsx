import { useState } from 'react'
import { usePipeline } from '../context/PipelineContext'
import { useAuth } from '../context/AuthContext'
import InstructionBanner from '../components/InstructionBanner'

const API_BASE = import.meta.env.VITE_API_URL || 'https://workspace-api.vercel.app'

const SYSTEM_PROMPT = `You are an expert app idea analyst for Vickery Digital, an iOS app factory.
Evaluate the app idea and return a JSON response with this exact structure:

{
  "score": <number 1-12>,
  "verdict": "<SHIP IT|WATCH|LATER>",
  "analysis": {
    "problemClarity": { "score": <1-3>, "note": "<one sentence>" },
    "feasibility": { "score": <1-3>, "note": "<one sentence>" },
    "marketSignal": { "score": <1-3>, "note": "<one sentence>" },
    "monetization": { "score": <1-3>, "note": "<one sentence>" }
  },
  "summary": "<2-3 sentence overall assessment>",
  "mvpPrompt": "<A detailed prompt that describes the MVP version of this app for a Lovable AI build. Include: app name, core purpose, target user, key screens, primary features (max 5), tech stack preferences (React PWA), and design direction. Write it as a direct instruction to an AI code generator.>"
}

Scoring: each criterion 1-3. Total 10+ = SHIP IT, 7-9 = WATCH, ≤6 = LATER.
The mvpPrompt should be actionable and specific enough to scaffold a working PWA.
Return ONLY valid JSON, no markdown fences.`

export default function VetPanel() {
  const { setActiveProject, setActivePanel, showToast } = usePipeline()
  const { token } = useAuth()
  const [appName, setAppName] = useState('')
  const [appDescription, setAppDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appName.trim() || !appDescription.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/api/claude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `App Name: ${appName.trim()}\n\nApp Description: ${appDescription.trim()}`,
            },
          ],
        }),
      })

      const data = await res.json()

      // Handle Anthropic API errors
      if (data.type === 'error' || data.error) {
        throw new Error(data.error?.message || `API error: ${res.status}`)
      }

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      let text = data.content?.[0]?.text || ''
      // Strip markdown code fences if Claude wraps the JSON
      text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      const parsed = JSON.parse(text)
      setResult(parsed)

      // Set active project with the MVP prompt
      setActiveProject({
        name: appName.trim(),
        description: appDescription.trim(),
        score: parsed.score,
        verdict: parsed.verdict,
        mvpPrompt: parsed.mvpPrompt,
      })

      if (parsed.verdict === 'SHIP IT') {
        showToast('SHIP IT — moving to PromptCraft')
        setTimeout(() => setActivePanel('build'), 2000)
      } else if (parsed.verdict === 'WATCH') {
        showToast(`WATCH (${parsed.score}/12) — review before proceeding`)
      } else {
        showToast(`LATER (${parsed.score}/12) — idea needs more work`)
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to analyze idea. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdvance = () => {
    setActivePanel('build')
  }

  const verdictColor = (v: string) =>
    v === 'SHIP IT' ? 'text-vd-success' : v === 'WATCH' ? 'text-vd-warning' : 'text-vd-error'

  const verdictBg = (v: string) =>
    v === 'SHIP IT' ? 'bg-vd-success/20 border-vd-success' : v === 'WATCH' ? 'bg-vd-warning/20 border-vd-warning' : 'bg-vd-error/20 border-vd-error'

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <InstructionBanner
        step={1}
        title="VET THE IDEA"
        subtitle="Describe your app idea. Claude will score it and generate an MVP prompt for PromptCraft."
        details={[
          'Problem Clarity · Feasibility · Market Signal · Monetization (1–3 each)',
          'SHIP IT ≥10 auto-advances to BUILD · WATCH 7–9 · LATER ≤6',
          'Claude generates an actionable MVP prompt for Lovable',
        ]}
      />

      <div className="flex-1 px-6 py-4 max-w-3xl mx-auto w-full">
        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-vd-text-dim mb-1.5 tracking-wide">
              APP NAME
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. FocusFlow"
              disabled={loading}
              className="w-full bg-vd-surface border border-vd-border rounded-lg px-4 py-3 text-vd-text-primary text-sm outline-none transition-colors focus:border-vd-accent disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-vd-text-dim mb-1.5 tracking-wide">
              DESCRIPTION
            </label>
            <textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="What does this app do? Who is it for? What problem does it solve?"
              rows={4}
              disabled={loading}
              className="w-full bg-vd-surface border border-vd-border rounded-lg px-4 py-3 text-vd-text-primary text-sm outline-none transition-colors focus:border-vd-accent resize-none disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !appName.trim() || !appDescription.trim()}
            className="w-full bg-vd-accent text-white font-semibold py-3 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Claude...
              </span>
            ) : (
              'Score Idea'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-vd-error/10 border border-vd-error/30 rounded-lg text-sm text-vd-error">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4 animate-fade-in">
            {/* Verdict banner */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${verdictBg(result.verdict)}`}>
              <div>
                <span className={`text-2xl font-display font-bold ${verdictColor(result.verdict)}`}>
                  {result.verdict}
                </span>
                <span className="ml-3 text-sm text-vd-text-secondary">
                  {result.score}/12
                </span>
              </div>
              {result.verdict !== 'SHIP IT' && (
                <button
                  onClick={handleAdvance}
                  className="px-4 py-1.5 text-xs font-medium border border-vd-border rounded-md text-vd-text-secondary hover:text-white hover:border-vd-text-dim transition-colors"
                >
                  Proceed anyway →
                </button>
              )}
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {result.analysis && Object.entries(result.analysis).map(([key, val]: [string, any]) => (
                <div key={key} className="bg-vd-surface border border-vd-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-vd-text-dim">
                      {key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-vd-accent">{val.score}/3</span>
                  </div>
                  <p className="text-xs text-vd-text-secondary">{val.note}</p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-vd-surface border border-vd-border rounded-lg p-4">
              <h4 className="text-xs font-mono text-vd-text-dim mb-2">SUMMARY</h4>
              <p className="text-sm text-vd-text-secondary leading-relaxed">{result.summary}</p>
            </div>

            {/* MVP Prompt preview */}
            <div className="bg-vd-surface border border-vd-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono text-vd-text-dim">MVP PROMPT (for PromptCraft)</h4>
                <span className="text-[10px] text-vd-accent font-mono">
                  {result.verdict === 'SHIP IT' ? 'Auto-advancing...' : 'Click proceed to use'}
                </span>
              </div>
              <p className="text-xs text-vd-text-secondary leading-relaxed font-mono bg-vd-bg rounded p-3 max-h-32 overflow-y-auto">
                {result.mvpPrompt}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
