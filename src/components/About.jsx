import { useEffect, useRef, useState } from 'react'

export default function About() {
  const mediaRef = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.2 },
    )
    observer.observe(media)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="about" aria-label="About Render Studio">
      <div className="about__inner">
        <figure ref={mediaRef} className={`about__media${revealed ? ' is-revealed' : ''}`}>
          <div className="about__photo-mask">
            <img
              className="about__photo"
              src="/images/about-gabriel.jpg"
              alt="Gabriel Lira working with a camera at Dodger Stadium"
              loading="lazy"
            />
          </div>
          <figcaption className="about__caption">
            Gabriel Lira — Founder
          </figcaption>
        </figure>
        <div className="about__text">
          <p>
            Gabriel Lira, founder of Render Studio, a Los Angeles-based creative
            company specializing in video production, photography, and drone
            cinematography.
          </p>
          <p>
            With a focus on visual storytelling, Render Studio brings ideas to
            life through creative cinematography and thoughtful, impactful
            post-production.
          </p>
        </div>
      </div>
    </section>
  )
}
