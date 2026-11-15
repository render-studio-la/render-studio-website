import { useEffect, useRef } from 'react'

const PHOTO_START = 0.5
const PHOTO_SPAN = 0.5
const PHOTO_DURATION = 1.6
const PHOTO_EASE = 2.6
const TEXT_DELAY = 0.55
const TEXT_DURATION = 1.6
const TEXT_EASE = 3.4
const TEXT_STAGGER = 0.12

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1)
}

function easeIn(power, t) {
  return clamp01(t) ** power
}

export default function About() {
  const sectionRef = useRef(null)
  const maskRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const mask = maskRef.current
    const lineEls = textRef.current
      ? Array.from(textRef.current.querySelectorAll('.about-copy-line'))
      : []

    let photoRaf = 0
    let textRaf = 0
    let photoStarted = false
    let textStarted = false
    let photoTime = 0
    let textTime = 0

    const textTrigger = PHOTO_START + PHOTO_SPAN * TEXT_DELAY

    const photoTick = (now) => {
      if (!photoStarted) return
      const elapsed = (now - photoTime) / 1000
      const photoP = easeIn(PHOTO_EASE, elapsed / PHOTO_DURATION)
      if (mask) {
        mask.style.clipPath = `inset(${(1 - photoP) * 100}% 0 0 0)`
      }
      if (elapsed < PHOTO_DURATION) {
        photoRaf = requestAnimationFrame(photoTick)
      }
    }

    const textTick = (now) => {
      if (!textStarted) return
      const elapsed = (now - textTime) / 1000
      lineEls.forEach((lineEl, index) => {
        const lineStart = index * TEXT_STAGGER
        const lineP = easeIn(TEXT_EASE, (elapsed - lineStart) / TEXT_DURATION)
        lineEl.style.clipPath = `inset(0 ${(1 - lineP) * 100}% 0 0)`
      })
      if (elapsed < (lineEls.length - 1) * TEXT_STAGGER + TEXT_DURATION) {
        textRaf = requestAnimationFrame(textTick)
      }
    }

    const startPhoto = (now) => {
      if (photoStarted) return
      photoStarted = true
      photoTime = now
      photoRaf = requestAnimationFrame(photoTick)
    }

    const startText = (now) => {
      if (textStarted) return
      textStarted = true
      textTime = now
      textRaf = requestAnimationFrame(textTick)
    }

    const checkTrigger = () => {
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const startOffset = vh * 0.7
      const denominator = rect.height - vh * 0.35
      const progress =
        denominator > 0 ? (startOffset - rect.top) / denominator : 1

      if (progress >= PHOTO_START) {
        startPhoto(performance.now())
      }
      if (progress >= textTrigger) {
        startText(performance.now())
      }
    }

    const scheduleCheck = () => {
      if (!photoStarted || !textStarted) checkTrigger()
    }

    checkTrigger()
    window.addEventListener('scroll', scheduleCheck, { passive: true })
    window.addEventListener('resize', scheduleCheck)
    return () => {
      window.removeEventListener('scroll', scheduleCheck)
      window.removeEventListener('resize', scheduleCheck)
      if (photoRaf) cancelAnimationFrame(photoRaf)
      if (textRaf) cancelAnimationFrame(textRaf)
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
        <div ref={textRef} className="about__text">
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
