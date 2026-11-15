import { useEffect, useRef, useState } from 'react'
import ContourBackground from './components/ContourBackground'

const INTRO_SRC = '/videos/intro.webm'
const HERO_SRC = '/videos/hero.mp4'
const HERO_START_SECONDS = 3
const HERO_OVERLAP_RATIO = 0.88

function canPlayAlphaIntro() {
  const probe = document.createElement('video')
  return probe.canPlayType('video/webm; codecs="vp9"') !== ''
}

export default function App() {
  const introRef = useRef(null)
  const heroRef = useRef(null)
  const heroStartedRef = useRef(false)
  const [introVisible, setIntroVisible] = useState(canPlayAlphaIntro)
  const [heroStarted, setHeroStarted] = useState(false)
  const [heroSrc, setHeroSrc] = useState(HERO_SRC)

  const startHero = () => {
    const hero = heroRef.current
    if (!hero || heroStartedRef.current) return
    heroStartedRef.current = true
    hero.currentTime = 0
    hero.play().catch(() => {})
    setHeroStarted(true)
  }

  useEffect(() => {
    if (!introVisible) startHero()
  }, [introVisible])

  useEffect(() => {
    if (!introVisible) return undefined
    const intro = introRef.current
    let frame = 0
    const watchIntro = () => {
      if (intro.currentTime >= HERO_START_SECONDS) {
        startHero()
        return
      }
      frame = requestAnimationFrame(watchIntro)
    }
    frame = requestAnimationFrame(watchIntro)
    return () => cancelAnimationFrame(frame)
  }, [introVisible])

  const removeIntro = () => {
    setIntroVisible(false)
  }

  useEffect(() => {
    let frame = 0
    const updateClip = () => {
      frame = 0
      const hero = heroRef.current
      if (!hero) return
      const maxInset = window.innerHeight * HERO_OVERLAP_RATIO
      const inset = Math.min(Math.max(window.scrollY - 1, 0), maxInset)
      hero.style.clipPath = inset > 0 ? `inset(0px 0px ${inset}px 0px)` : ''
    }
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateClip)
    }
    updateClip()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <ContourBackground />
      <div className="scroll-stage">
        <main className="stage">
        <video
          ref={heroRef}
          className={`layer layer--hero${heroStarted ? ' is-visible' : ''}`}
          src={heroSrc}
          muted
          loop
          onError={() => setHeroSrc(INTRO_SRC)}
          playsInline
          preload="auto"
          disablePictureInPicture
        />
        {introVisible && (
          <video
            ref={introRef}
            className="layer layer--intro"
            src={INTRO_SRC}
            muted
            autoPlay
            playsInline
            preload="auto"
            disablePictureInPicture
            onEnded={removeIntro}
            onError={removeIntro}
          />
        )}
        </main>
        <section className="background-test" aria-label="Background test">
          <h2>BACKGROUND TEST</h2>
        </section>
      </div>
    </>
  )
}
