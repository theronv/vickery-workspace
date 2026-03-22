import { usePipeline } from '../context/PipelineContext'

export default function Toast() {
  const { toast } = usePipeline()

  if (!toast) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-vd-surface border border-vd-accent rounded-lg px-5 py-3 text-sm font-medium text-vd-text-primary shadow-lg animate-fade-in">
      {toast}
    </div>
  )
}
