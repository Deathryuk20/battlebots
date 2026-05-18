import { useEffect, useRef } from 'react'

export default function Cursor() {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const outerPos = useRef({ x: 0, y: 0 })
  const raf = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      inner.style.left = e.clientX + 'px'
      inner.style.top = e.clientY + 'px'
    }

    const onDown = () => {
      outer.classList.add('clicking')
      inner.classList.add('clicking')
    }

    const onUp = () => {
      outer.classList.remove('clicking')
      inner.classList.remove('clicking')
    }

    const onHover = (e) => {
      const el = e.target
      const isClickable = el.closest('a, button, input, select, textarea, [role="button"]')
      if (isClickable) {
        outer.classList.add('hovering')
        inner.classList.add('hovering')
      } else {
        outer.classList.remove('hovering')
        inner.classList.remove('hovering')
      }
    }

    const animate = () => {
      const speed = 0.12
      outerPos.current.x += (pos.current.x - outerPos.current.x) * speed
      outerPos.current.y += (pos.current.y - outerPos.current.y) * speed
      outer.style.left = outerPos.current.x + 'px'
      outer.style.top = outerPos.current.y + 'px'
      raf.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('mouseover', onHover)
    raf.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseover', onHover)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      <div ref={outerRef} className="cursor-outer" />
      <div ref={innerRef} className="cursor-inner" />
    </>
  )
}
