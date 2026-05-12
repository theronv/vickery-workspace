import { useState, useCallback } from 'react'

export const STAGES = ['MVP', 'Beta', 'Alpha', 'Launched'] as const

export interface AppStatus {
  id: string
  name: string
  githubUrl?: string
  currentStage: string
  nextStep: string
  lastSession?: string
}

export interface StatusBarState {
  activeAppId: string | null
  apps: AppStatus[]
}

const STORAGE_KEY = 'vd:status-bar'

function load(): StatusBarState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const def: StatusBarState = { activeAppId: null, apps: [] }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(def))
  return def
}

function save(data: StatusBarState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useStatusBar() {
  const [state, setState] = useState<StatusBarState>(load)

  const update = useCallback((fn: (s: StatusBarState) => StatusBarState) => {
    setState(prev => {
      const next = fn(prev)
      save(next)
      return next
    })
  }, [])

  const setActiveApp = useCallback((id: string | null) => {
    update(s => ({ ...s, activeAppId: id }))
  }, [update])

  const addApp = useCallback((app: Omit<AppStatus, 'id'>) => {
    update(s => {
      const newApp = { ...app, id: crypto.randomUUID().slice(0, 8) }
      return {
        ...s,
        apps: [...s.apps, newApp],
        activeAppId: s.activeAppId ?? newApp.id,
      }
    })
  }, [update])

  const updateApp = useCallback((id: string, patch: Partial<AppStatus>) => {
    update(s => ({ ...s, apps: s.apps.map(a => a.id === id ? { ...a, ...patch } : a) }))
  }, [update])

  const removeApp = useCallback((id: string) => {
    update(s => ({
      ...s,
      apps: s.apps.filter(a => a.id !== id),
      activeAppId: s.activeAppId === id
        ? (s.apps.find(a => a.id !== id)?.id ?? null)
        : s.activeAppId,
    }))
  }, [update])

  const startSession = useCallback((appId?: string) => {
    const targetId = appId ?? state.activeAppId
    if (!targetId) return
    update(s => ({
      ...s,
      apps: s.apps.map(a =>
        a.id === targetId ? { ...a, lastSession: new Date().toISOString() } : a
      ),
    }))
  }, [state.activeAppId, update])

  return {
    state,
    activeApp: state.apps.find(a => a.id === state.activeAppId) ?? null,
    setActiveApp,
    addApp,
    updateApp,
    removeApp,
    startSession,
  }
}
