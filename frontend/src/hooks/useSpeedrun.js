import { useCallback, useEffect, useState } from 'react'

const SPEEDRUN_API =
  'https://www.speedrun.com/api/v1/runs?max=6&orderby=date&direction=desc&embed=game,players'

function normalizeRun(run) {
  const players = run?.players?.data || []

  const runners = players.map((entry) => {
    if (entry?.rel === 'user') {
      return entry?.names?.international || entry?.name || 'Invitado'
    }
    return entry?.name || 'Invitado'
  })

  return {
    id: run?.id,
    gameId: run?.game?.data?.id || '',
    game:
      run?.game?.data?.names?.international ||
      run?.game?.data?.name ||
      'Juego desconocido',
    categoryId: run?.category?.data?.id || run?.category || '',
    timeSeconds: run?.times?.primary_t ?? 0,
    runners,
    date: run?.date,
    webLink: run?.weblink || '',
  }
}

export default function useSpeedrun() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(SPEEDRUN_API, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('No se pudieron cargar los récords.')
        }

        const payload = await response.json()
        const runs = Array.isArray(payload?.data) ? payload.data : []
        setData(runs.map(normalizeRun))
      } catch (err) {
        if (err?.name === 'AbortError') return
        setError(
          err instanceof Error
            ? err
            : new Error('No se pudieron cargar los récords.'),
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      controller.abort()
    }
  }, [reloadKey])

  return { data, loading, error, reload }
}
