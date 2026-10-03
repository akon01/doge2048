import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getInitialTileMode,
  hasUnlockedUsMode,
  saveTileMode,
  saveUsModeUnlocked,
} from '../game/storage'
import type { TileMode } from '../game/tileImages'

export function useTileMode() {
  const usModeUnlockedRef = useRef(hasUnlockedUsMode())
  const [usModeUnlocked, setUsModeUnlocked] = useState(hasUnlockedUsMode)
  const [justUnlockedUsMode, setJustUnlockedUsMode] = useState(false)
  const [tileMode, setTileModeState] = useState<TileMode>(getInitialTileMode)

  const setTileMode = useCallback((mode: TileMode) => {
    setTileModeState(mode)
    saveTileMode(mode)
  }, [])

  const unlockUsMode = useCallback(() => {
    if (usModeUnlockedRef.current) return
    usModeUnlockedRef.current = true
    saveUsModeUnlocked()
    saveTileMode('us')
    setUsModeUnlocked(true)
    setJustUnlockedUsMode(true)
    setTileModeState('us')
  }, [])

  const url = window.location.toString()
  useEffect(() => {
    console.log(url)
    if (url.includes('admin')) unlockUsMode()
  }, [url, unlockUsMode])

  return {
    tileMode,
    setTileMode,
    usModeUnlocked,
    justUnlockedUsMode,
    setJustUnlockedUsMode,
    unlockUsMode,
  }
}
