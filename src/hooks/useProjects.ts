import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'https://workspace-api.vercel.app'

export interface Project {
  id: string
  name: string
  bundleId: string | null
  score: number | null
  verdict: string | null
  stage: number
  createdAt: string
  updatedAt: string
}

export function useProjects() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        setProjects(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(async (data: {
    name: string
    bundleId?: string
    score?: number | null
    verdict?: string | null
  }) => {
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create project')
    const project = await res.json()
    setProjects((prev) => [...prev, project])
    return project as Project
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const deleteProject = useCallback(async (id: string) => {
    const res = await fetch(`${API_BASE}/api/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to delete project')
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [token])

  return { projects, loading, createProject, deleteProject, refetch: fetchProjects }
}
