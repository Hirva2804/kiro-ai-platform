type Range = { min: number; max: number; decimals?: number }

function hashStringToUint32(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function getSessionSeed(): number {
  if (typeof window === 'undefined') return 0
  const key = '__leadiq_session_seed__'
  const existing = window.sessionStorage.getItem(key)
  if (existing) return Number(existing) >>> 0
  const seed = (Math.random() * 2 ** 32) >>> 0
  window.sessionStorage.setItem(key, String(seed))
  return seed
}

export function sessionRandomNumber(stableKey: string, range: Range): number {
  const { min, max, decimals = 0 } = range
  const seed = getSessionSeed() ^ hashStringToUint32(stableKey)
  const rand = mulberry32(seed)()
  const value = min + rand * (max - min)
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

