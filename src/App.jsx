import { useEffect, useRef, useState } from 'react'

const INTRO_SRC = '/videos/intro.webm'
const HERO_SRC = '/videos/hero.mp4'
const HERO_START_SECONDS = 3

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

  return (
    <main className="stage">
      <video
        ref={heroRef}
        className={`layer layer--hero${heroStarted ? ' is-visible' : ''}`}
        src={HERO_SRC}
        muted
        loop
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
  )
}
