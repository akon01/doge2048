import { useEffect, useRef } from 'react'
import type { TouchEvent } from 'react'
import type { Direction } from '../game/types'

const SWIPE_THRESHOLD = 30

const directionKeys: Record<string, Direction> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
}

export function useDirectionalInput(
  move: (direction: Direction) => void,
  enabled: boolean,
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = directionKeys[event.key]
      if (!direction) return
      event.preventDefault()
      move(direction)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move])

  const onTouchStart = (event: TouchEvent) => {
    if (!enabled) return
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchEnd = (event: TouchEvent) => {
    if (!touchStart.current) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = touch.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD) return

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      move(deltaX > 0 ? 'right' : 'left')
    } else {
      move(deltaY > 0 ? 'down' : 'up')
    }
  }

  return { onTouchStart, onTouchEnd }
}
