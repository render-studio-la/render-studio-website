import { useEffect, useRef } from 'react'

const PHOTO_START = 0.5
const PHOTO_SPAN = 0.5

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
      const photoProgress = clamp01((progress - PHOTO_START) / PHOTO_SPAN)
      const photoP = photoProgress ** 2.6
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

  const paragraphs = [
    [
      <>
        <span className="about-highlight">Gabriel Lira</span>, founder of{' '}
        <span className="about-highlight">Render Studio</span>, a{' '}
        <span className="about-highlight">Los Angeles</span>{' '}
      </>,
      <>
        based <span className="about-highlight">creative</span> company specializing in video{' '}
      </>,
      <>production, photography, and drone <span className="about-highlight">cinematography</span>.</>,
    ],
    [
      <>With a focus on visual storytelling, <span className="about-highlight">Render Studio</span>{' '}</>,
      <>brings ideas to life through <span className="about-highlight">creative</span> cinematography{' '}</>,
      <>and thoughtful, <span className="about-highlight">impactful</span> post-production.</>,
    ],
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
          {paragraphs.map((lines, paragraphIndex) => (
            <p key={paragraphIndex}>
              {lines.map((line, lineIndex) => (
                <span className="about-copy-line" key={lineIndex}>
                  {line}
                  {lineIndex < lines.length - 1 && <br className="about-copy-break" />}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
