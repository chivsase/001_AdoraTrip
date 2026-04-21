'use client'

import { useState, useEffect } from 'react'
import type { ApiDestination, Destination } from '@/types/destinations'
import { apiDestinationToDestination } from '@/types/destinations'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface UseDestinationsResult {
  destinations: Destination[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useDestinations(): UseDestinationsResult {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchDestinations() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/destinations/`, {
          next: { revalidate: 300 },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: ApiDestination[] | { results: ApiDestination[] } = await res.json()
        const raw = Array.isArray(data) ? data : data.results ?? []
        if (!cancelled) setDestinations(raw.map(apiDestinationToDestination))
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load destinations')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchDestinations()
    return () => { cancelled = true }
  }, [tick])

  return { destinations, isLoading, error, refetch: () => setTick(t => t + 1) }
}
