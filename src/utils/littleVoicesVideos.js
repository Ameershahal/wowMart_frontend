/**
 * Reliable public sample MP4s (Google GTV samples — widely used for demos).
 * Old defaults used drftkgc3tvidp.cloudfront.net which now fails → blank <video> players.
 */
export const LITTLE_VOICES_FALLBACK_VIDEOS = [
  { id: 1, src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: 2, src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: 3, src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
  { id: 4, src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { id: 5, src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
  { id: 6, src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
]

/** Host that used to serve Review01–06.mp4; CDN now errors — treat as broken. */
const LEGACY_BROKEN_HOST = 'drftkgc3tvidp.cloudfront.net'

/**
 * Ensure each slot has a direct .mp4 (or similar) URL; remap known-dead defaults.
 */
export function normalizeLittleVoicesVideos(videos) {
  const fallbacks = LITTLE_VOICES_FALLBACK_VIDEOS
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return fallbacks
  }
  return videos.map((v, i) => {
    const raw = (v?.src || '').trim()
    const useFallback =
      !raw ||
      raw.includes(LEGACY_BROKEN_HOST) ||
      (!/^https?:\/\//i.test(raw) && !raw.startsWith('/'))
    const src = useFallback ? fallbacks[i % fallbacks.length].src : raw
    return { id: v.id ?? i + 1, src }
  })
}
