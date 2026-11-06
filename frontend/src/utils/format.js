export function formatDuration(seconds) {
  const total = Number(seconds)
  if (!Number.isFinite(total) || total < 0) return '—'

  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const secsText = secs.toFixed(2).padStart(5, '0')

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${secsText}`
  }
  if (minutes > 0) {
    return `${minutes}:${secsText}`
  }
  return secs.toFixed(2)
}

export function formatDate(iso) {
  if (!iso) return '—'

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(date)
}
