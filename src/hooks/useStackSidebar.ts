import { useState, useCallback } from 'react'
import type { StackSidebarData, StackLink, StackCategory } from '../components/StackSidebar/types'
import { DEFAULT_SIDEBAR_DATA } from '../components/StackSidebar/types'

const STORAGE_KEY = 'vd:stack-links'

function load(): StackSidebarData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SIDEBAR_DATA))
  return DEFAULT_SIDEBAR_DATA
}

function save(data: StackSidebarData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useStackSidebar() {
  const [data, setData] = useState<StackSidebarData>(load)

  const update = useCallback((fn: (d: StackSidebarData) => StackSidebarData) => {
    setData(prev => {
      const next = fn(prev)
      save(next)
      return next
    })
  }, [])

  const toggleSidebar = useCallback(() => {
    update(d => ({ ...d, sidebarOpen: !d.sidebarOpen }))
  }, [update])

  const toggleCategory = useCallback((categoryId: string) => {
    update(d => ({
      ...d,
      categories: d.categories.map(c =>
        c.id === categoryId ? { ...c, collapsed: !c.collapsed } : c
      ),
    }))
  }, [update])

  const addLink = useCallback((link: Omit<StackLink, 'id'>) => {
    update(d => ({
      ...d,
      links: [...d.links, { ...link, id: crypto.randomUUID().slice(0, 8) }],
    }))
  }, [update])

  const updateLink = useCallback((id: string, patch: Partial<StackLink>) => {
    update(d => ({
      ...d,
      links: d.links.map(l => l.id === id ? { ...l, ...patch } : l),
    }))
  }, [update])

  const removeLink = useCallback((id: string) => {
    update(d => ({ ...d, links: d.links.filter(l => l.id !== id) }))
  }, [update])

  const reorderLinks = useCallback((categoryId: string, fromIndex: number, toIndex: number) => {
    update(d => {
      const catLinks = d.links
        .filter(l => l.categoryId === categoryId)
        .sort((a, b) => a.order - b.order)
      const others = d.links.filter(l => l.categoryId !== categoryId)
      const [moved] = catLinks.splice(fromIndex, 1)
      catLinks.splice(toIndex, 0, moved)
      const reordered = catLinks.map((l, i) => ({ ...l, order: i }))
      return { ...d, links: [...others, ...reordered] }
    })
  }, [update])

  const addCategory = useCallback((label: string) => {
    update(d => {
      const maxOrder = d.categories.reduce((m, c) => Math.max(m, c.order), -1)
      return {
        ...d,
        categories: [...d.categories, {
          id: crypto.randomUUID().slice(0, 8),
          label,
          order: maxOrder + 1,
          collapsed: false,
        }],
      }
    })
  }, [update])

  const updateCategory = useCallback((id: string, patch: Partial<StackCategory>) => {
    update(d => ({
      ...d,
      categories: d.categories.map(c => c.id === id ? { ...c, ...patch } : c),
    }))
  }, [update])

  const removeCategory = useCallback((id: string) => {
    update(d => ({
      ...d,
      categories: d.categories.filter(c => c.id !== id),
      links: d.links.filter(l => l.categoryId !== id),
    }))
  }, [update])

  const reorderCategories = useCallback((fromIndex: number, toIndex: number) => {
    update(d => {
      const sorted = [...d.categories].sort((a, b) => a.order - b.order)
      const [moved] = sorted.splice(fromIndex, 1)
      sorted.splice(toIndex, 0, moved)
      return {
        ...d,
        categories: sorted.map((c, i) => ({ ...c, order: i })),
      }
    })
  }, [update])

  return {
    data,
    toggleSidebar,
    toggleCategory,
    addLink,
    updateLink,
    removeLink,
    reorderLinks,
    addCategory,
    updateCategory,
    removeCategory,
    reorderCategories,
  }
}
