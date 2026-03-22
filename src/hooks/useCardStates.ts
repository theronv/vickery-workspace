import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'https://workspace-api.vercel.app'

interface CardState {
  status: 'todo' | 'in-progress' | 'done'
  checkedSteps: number[]
}

export function useCardStates(projectId: string | undefined) {
  const { token } = useAuth()
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({})
  const [loading, setLoading] = useState(true)

  const fetchCardStates = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.cardStates) {
          const states: Record<string, CardState> = {}
          for (const cs of data.cardStates) {
            states[cs.cardId] = {
              status: cs.status,
              checkedSteps: JSON.parse(cs.checkedSteps || '[]'),
            }
          }
          setCardStates(states)
        }
      }
    } catch (err) {
      console.error('Failed to fetch card states:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId, token])

  useEffect(() => {
    fetchCardStates()
  }, [fetchCardStates])

  const updateCardState = useCallback(async (
    cardId: string,
    update: Partial<CardState>,
  ) => {
    if (!projectId) return

    // Optimistic update
    setCardStates((prev) => ({
      ...prev,
      [cardId]: {
        status: update.status ?? prev[cardId]?.status ?? 'todo',
        checkedSteps: update.checkedSteps ?? prev[cardId]?.checkedSteps ?? [],
      },
    }))

    try {
      const current = cardStates[cardId] || { status: 'todo', checkedSteps: [] }
      const merged = {
        status: update.status ?? current.status,
        checkedSteps: JSON.stringify(update.checkedSteps ?? current.checkedSteps),
      }

      await fetch(`${API_BASE}/api/projects/${projectId}/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(merged),
      })
    } catch (err) {
      console.error('Failed to update card state:', err)
      // Revert on failure
      fetchCardStates()
    }
  }, [projectId, token, cardStates, fetchCardStates])

  const toggleStep = useCallback((cardId: string, stepIndex: number) => {
    const current = cardStates[cardId] || { status: 'todo', checkedSteps: [] }
    const checked = current.checkedSteps.includes(stepIndex)
      ? current.checkedSteps.filter((i) => i !== stepIndex)
      : [...current.checkedSteps, stepIndex]

    updateCardState(cardId, { checkedSteps: checked })
  }, [cardStates, updateCardState])

  return { cardStates, loading, updateCardState, toggleStep }
}
