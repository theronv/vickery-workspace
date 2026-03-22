import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [key, setKey] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)
    const ok = await login(key.trim())
    setLoading(false)
    if (!ok) setError(true)
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-vd-bg z-[1000] gap-8">
      <div className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-vd-accent">
        Vickery Digital
      </div>
      <h1 className="font-display text-[28px] font-extrabold text-vd-text-primary text-center leading-tight">
        Workspace
      </h1>
      <p className="text-sm text-vd-text-secondary text-center">
        Enter your access key to continue
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-[300px]">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Access key"
          className="bg-vd-surface border border-vd-border rounded-lg px-4 py-3 text-vd-text-primary text-sm outline-none transition-colors focus:border-vd-accent"
          autoFocus
        />
        {error && (
          <p className="text-vd-error text-xs">Invalid access key</p>
        )}
        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="bg-vd-accent border-none rounded-lg py-3 text-white font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
