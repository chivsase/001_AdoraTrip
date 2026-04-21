'use client'

import { useState, useEffect } from 'react'
import type { ApiDeal, Deal } from '@/types/deals'
import { apiDealToDeal } from '@/types/deals'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface UseDealsOptions {
  limit?: number
  active?: boolean
}

interface UseDealsResult {
  deals: Deal[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useDeals({ limit = 6, active = true }: UseDealsOptions = {}): UseDealsResult {
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchDeals() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          limit: String(limit),
          active: active ? 'true' : 'false',
        })
        const res = await fetch(`${API_BASE}/deals/?${params}`, {
          next: { revalidate: 60 },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: ApiDeal[] | { results: ApiDeal[] } = await res.json()
        const raw = Array.isArray(data) ? data : data.results ?? []
        if (!cancelled) setDeals(raw.map(apiDealToDeal))
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load deals')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchDeals()
    return () => { cancelled = true }
  }, [limit, active, tick])

  return { deals, isLoading, error, refetch: () => setTick(t => t + 1) }
}
