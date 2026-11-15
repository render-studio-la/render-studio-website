import { useEffect, useRef } from 'react'

const PHOTO_START = 0.38
const PHOTO_SPAN = 0.62

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1)
}

export default function About() {
  const sectionRef = useRef(null)
  const maskRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    let locked = false
    let frame = 0

    const applyProgress = (progress) => {
      const photoP = clamp01((progress - PHOTO_START) / PHOTO_SPAN)
      const mask = maskRef.current
      if (mask) {
        mask.style.clipPath = `inset(${(1 - photoP) * 100}% 0 0 0)`
      }

    }

    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const startOffset = vh * 0.7
      const denominator = rect.height - vh * 0.35
      let progress =
        denominator > 0 ? (startOffset - rect.top) / denominator : 1
      progress = clamp01(progress)

      if (locked && progress < 1) progress = 1
      if (progress >= 1) locked = true

      applyProgress(progress)
    }

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const lines = [
    'Gabriel Lira, founder of Render Studio, a Los Angeles-based creative company specializing in video production, photography, and drone cinematography.',
    'With a focus on visual storytelling, Render Studio brings ideas to life through creative cinematography and thoughtful, impactful post-production.',
  ]

  return (
    <section ref={sectionRef} className="about" aria-label="About Render Studio">
      <div className="about__inner">
        <figure className="about__media">
          <div ref={maskRef} className="about__photo-mask">
            <img
              className="about__photo"
              src="/images/about-gabriel.jpg"
              alt="Gabriel Lira working with a camera at Dodger Stadium"
              loading="lazy"
            />
          </div>
        </figure>
        <div className="about__text">
          {lines.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
