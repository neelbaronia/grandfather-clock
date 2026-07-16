import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  correctedPendulumPeriod,
  pendulumPeriod,
  potentialEnergy,
  secondsPendulumLength,
} from './physics.js'

const IllustratedStage = lazy(() => import('./components/IllustratedStage.jsx'))

const chapters = [
  { id: 'overture', label: 'The clock' },
  { id: 'repeat', label: 'Find a repeat' },
  { id: 'pendulum', label: 'The pendulum' },
  { id: 'window', label: 'The window' },
  { id: 'fade', label: 'The fading swing' },
  { id: 'push', label: 'A timed push' },
  { id: 'return', label: 'Back to the clock' },
  { id: 'dissipation', label: 'Friction' },
  { id: 'source', label: 'Energy source' },
  { id: 'weights', label: 'Stored height' },
  { id: 'train', label: 'Gear train' },
  { id: 'escapement', label: 'Escapement' },
  { id: 'impulse', label: 'One impulse' },
  { id: 'whole', label: 'The whole clock' },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function useStoryPosition() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const sections = [...document.querySelectorAll('[data-chapter]')]
      const focus = window.innerHeight * 0.52
      let nearest = 0
      let distance = Infinity
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        const sectionDistance = Math.abs((rect.top + rect.bottom) / 2 - focus)
        if (sectionDistance < distance) {
          distance = sectionDistance
          nearest = index
        }
      })
      setActive(nearest)
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0)
    }
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return { active, progress }
}

function useTick(enabled, period) {
  const contextRef = useRef(null)
  useEffect(() => {
    if (!enabled) return undefined
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return undefined
    const context = contextRef.current || new AudioContext()
    contextRef.current = context
    void context.resume()
    let alternate = false

    const sound = () => {
      if (context.state !== 'running') return
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.value = alternate ? 1120 : 940
      alternate = !alternate
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.045)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.05)
    }

    sound()
    const timer = window.setInterval(sound, Math.max(180, period * 500))
    return () => window.clearInterval(timer)
  }, [enabled, period])

  useEffect(() => () => {
    void contextRef.current?.close()
    contextRef.current = null
  }, [])
}

function Chapter({ number, id, kicker, title, children, side = 'left', className = '' }) {
  return (
    <section id={id} data-chapter className={`chapter chapter--${side} ${className}`}>
      <article className="chapter-card">
        <span className="chapter-number">{number}</span>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        {children}
      </article>
    </section>
  )
}

function Equation({ children, note }) {
  return (
    <div className="equation">
      <strong>{children}</strong>
      {note && <span>{note}</span>}
    </div>
  )
}

function Range({ label, value, min, max, step, onChange, valueLabel }) {
  const progress = (value - min) / (max - min) * 100
  return (
    <label className="range-control">
      <span><b>{label}</b><output>{valueLabel}</output></span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ '--range-progress': `${progress}%` }}
      />
    </label>
  )
}

function IconSound({ enabled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4h4l5 4V6L8 10H4Z" />
      {enabled && <path d="M16 9c1.6 1.7 1.6 4.3 0 6M18.8 6.5c3 3.1 3 7.9 0 11" />}
    </svg>
  )
}

function LoadingModel() {
  return (
    <div className="model-loading" role="status">
      <span />
      Winding the clock…
    </div>
  )
}

export default function App() {
  const { active, progress } = useStoryPosition()
  const [length, setLength] = useState(() => secondsPendulumLength())
  const [amplitude, setAmplitude] = useState(4)
  const [mass, setMass] = useState(5)
  const [weightHeight, setWeightHeight] = useState(1.35)
  const [decayRun, setDecayRun] = useState(0)
  const [sound, setSound] = useState(false)

  const period = useMemo(() => pendulumPeriod(length), [length])
  const correctedPeriod = useMemo(
    () => correctedPendulumPeriod(length, amplitude),
    [length, amplitude],
  )
  const dailyArcError = (correctedPeriod / period - 1) * 86400
  const storedEnergy = potentialEnergy(mass, weightHeight)
  useTick(sound, correctedPeriod)

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#overture" aria-label="How a Grandfather Clock Works, back to top">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <span><b>How a Grandfather Clock Works</b><small>Gravity, divided into seconds</small></span>
        </a>
        <div className="header-actions">
          <button
            className={`sound-button ${sound ? 'is-on' : ''}`}
            type="button"
            onClick={() => setSound((value) => !value)}
            aria-pressed={sound}
          >
            <IconSound enabled={sound} />
            <span>{sound ? 'Ticking' : 'Hear it tick'}</span>
          </button>
          <a href="https://github.com/neelbaronia/grandfather-clock" target="_blank" rel="noreferrer">Source</a>
        </div>
        <span className="reading-progress" style={{ transform: `scaleX(${progress})` }} />
      </header>

      <aside className="chapter-rail" aria-label="Story chapters">
        <span className="rail-line"><i style={{ transform: `scaleY(${progress})` }} /></span>
        {chapters.map((chapter, index) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className={index === active ? 'is-active' : ''}
            aria-label={`${index + 1}. ${chapter.label}`}
            aria-current={index === active ? 'step' : undefined}
          >
            <i />
            <span>{chapter.label}</span>
          </a>
        ))}
      </aside>

      <main className="story">
        <div className="visual-stage" aria-label="Animated illustrated grandfather clock and living room">
          <Suspense fallback={<LoadingModel />}>
            <IllustratedStage
              active={active}
              length={length}
              amplitude={amplitude}
              mass={mass}
              weightHeight={weightHeight}
              decayRun={decayRun}
            />
          </Suspense>
          <div className="stage-vignette" />
          <p className="stage-caption" aria-live="polite">
            <span>{String(active + 1).padStart(2, '0')}</span>
            {chapters[active].label}
          </p>
        </div>

        <div className="chapters">
          <section id="overture" data-chapter className="chapter chapter--hero">
            <div className="hero-copy">
              <p className="eyebrow">An illustrated mechanical story</p>
              <h1>How do you<br />turn <em>gravity</em><br />into time?</h1>
              <p className="hero-deck">
                A grandfather clock is a negotiation between something that wants to fall
                and something that insists on swinging at its own pace.
              </p>
              <a className="begin-link" href="#repeat"><span>Begin with a repeat</span><i>↓</i></a>
            </div>
            <div className="hero-aside" aria-hidden="true">
              <span>Weight</span><i>→</i><span>Gears</span><i>→</i><span>Beat</span>
            </div>
          </section>

          <Chapter
            number="01"
            id="repeat"
            kicker="The useful abstraction"
            title="A clock begins with a repeat."
          >
            <p>
              Choose an event that comes back after the same interval. One return is a
              <em> period</em>. Count those returns over one second and you have its
              <em> frequency</em>.
            </p>
            <Equation note="frequency is the number of repeats per second">f = 1 / T</Equation>
            <div className="repeat-grid" aria-label="Examples of repeating events">
              <span><i>♥</i><b>Heartbeat</b><small>Repeats, but varies</small></span>
              <span><i>≈</i><b>Water drop</b><small>Flow rate shifts</small></span>
              <span><i>☼</i><b>Sundial</b><small>Depends on the sky</small></span>
              <span><i>↕</i><b>Pendulum</b><small>Regular and tunable</small></span>
            </div>
            <p className="margin-note">Regularity is what turns a recurring event into a ruler for time.</p>
          </Chapter>

          <Chapter
            number="02"
            id="pendulum"
            kicker="A repeat you can build almost anywhere"
            title="Gravity provides the rhythm."
            className="chapter--lab"
          >
            <p>
              A pendulum needs no sunlight and consumes no water, wax, or sand. Give it
              gravity and a stable support, then its length sets a repeatable tempo.
            </p>
            <Equation note="one complete left-and-right cycle">T ≈ 2π √(L / g)</Equation>
            <Range
              label="Pendulum length"
              value={length}
              min={0.35}
              max={1.25}
              step={0.005}
              onChange={setLength}
              valueLabel={`${length.toFixed(3)} m`}
            />
            <Range
              label="Bob mass"
              value={mass}
              min={1}
              max={10}
              step={0.1}
              onChange={setMass}
              valueLabel={`${mass.toFixed(1)} kg`}
            />
            <Range
              label="Release angle"
              value={amplitude}
              min={2}
              max={20}
              step={1}
              onChange={setAmplitude}
              valueLabel={`${amplitude}°`}
            />
            <div className="stat-pair">
              <span><small>PERIOD T</small><b>{correctedPeriod.toFixed(3)} s</b></span>
              <span><small>FREQUENCY f</small><b>{(1 / correctedPeriod).toFixed(3)} Hz</b></span>
            </div>
            <div className="formula-list">
              <span><b>Angular frequency</b><code>ω = 2πf = √(g/L)</code></span>
              <span><b>Position</b><code>θ(t) ≈ θ₀ cos(ωt)</code></span>
              <span><b>Mass cancels</b><code>mL²θ̈ = −mgL sin θ</code></span>
            </div>
            <p className="margin-note">
              A lone pendulum has a <em>period</em>, not a spatial wavelength. Its bob travels an arc
              length <b>s = Lθ</b>. At {amplitude}°, circular error would add about {dailyArcError.toFixed(1)} s/day if unregulated.
            </p>
            <button className="text-button" type="button" onClick={() => setLength(secondsPendulumLength())}>
              Set the classic seconds pendulum →
            </button>
          </Chapter>

          <Chapter
            number="03"
            id="window"
            kicker="A view from the room"
            title="But a pendulum cannot swing forever."
          >
            <p>
              Look through the window. A playground swing is just another pendulum: a rider
              and seat moving beneath a fixed support. Its length gives it a natural period.
            </p>
            <div className="analogy-pair">
              <span><b>Clock</b><small>rod + brass bob</small></span>
              <i>↔</i>
              <span><b>Playground</b><small>chains + child</small></span>
            </div>
            <p className="margin-note">Same gravity. Same restoring force. Same problem: every real swing loses energy.</p>
          </Chapter>

          <Chapter
            number="04"
            id="fade"
            kicker="Step outside"
            title="Leave it alone and the arc shrinks."
            side="right"
          >
            <p>
              Air pushes against the rider. The bearings resist at the top. The seat and chains
              flex. Each pass converts a little organized motion into scattered heat and sound.
            </p>
            <div className="equation equation--quiet">
              <strong>A(t) = A₀e<sup>−γt</sup></strong>
              <span>the amplitude envelope decays</span>
            </div>
            <p className="margin-note">The rhythm survives for a while, but the visible motion cannot.</p>
          </Chapter>

          <Chapter
            number="05"
            id="push"
            kicker="The useful intervention"
            title="A small push restores what friction took."
          >
            <p>
              The second child does not invent a new tempo. They wait for the right part of the
              swing and add a little energy in the direction the rider is already moving.
            </p>
            <div className="two-jobs">
              <span><b>Length sets period</b><small>The swing chooses when to return.</small></span>
              <span><b>Push sustains arc</b><small>The helper replaces lost energy.</small></span>
            </div>
            <p className="margin-note">Push at the wrong moment and you disturb the motion. Timing matters as much as force.</p>
          </Chapter>

          <Chapter
            number="06"
            id="return"
            kicker="Back through the window"
            title="A clock needs its own patient pusher."
            side="right"
          >
            <p>
              Inside the longcase, there is no child waiting beside the pendulum. Instead,
              a mechanism must notice each swing and deliver one tiny, repeatable nudge.
            </p>
            <blockquote className="bridge-quote">The escapement is a pusher small enough to fit between two gear teeth.</blockquote>
            <p className="margin-note">Now we can ask the mechanical question: where does that push get its energy?</p>
          </Chapter>

          <Chapter
            number="07"
            id="dissipation"
            kicker="A thought experiment"
            title="What is stealing the swing?"
          >
            <p>
              Watch the unpowered pendulum slow. Its period stays nearly steady at first,
              while its amplitude and mechanical energy collapse toward rest.
            </p>
            <div className="loss-grid">
              <span><b>Air drag</b><small>the bob pushes air aside</small></span>
              <span><b>Pivot friction</b><small>contact resists rotation</small></span>
              <span><b>Flexing</b><small>materials warm microscopically</small></span>
              <span><b>Clock load</b><small>the mechanism takes work</small></span>
            </div>
            <button className="replay-button" type="button" onClick={() => setDecayRun((value) => value + 1)}>
              Replay the unpowered swing ↻
            </button>
          </Chapter>

          <Chapter
            number="08"
            id="source"
            kicker="X-ray the clock"
            title="We need an energy source, a path, and a gate."
          >
            <p>
              The tall case hides a compact energy system. Raised weights supply stored energy.
              The gear train carries it upward. The escapement releases it in pendulum-sized portions.
            </p>
            <ol className="energy-path energy-path--compact">
              <li><b>Store</b><span>raise a weight</span></li>
              <li><b>Transmit</b><span>turn the gear train</span></li>
              <li><b>Meter</b><span>release one tooth</span></li>
              <li><b>Restore</b><span>nudge the pendulum</span></li>
            </ol>
          </Chapter>

          <Chapter
            number="09"
            id="weights"
            kicker="First: stored height"
            title="A weight is a very slow battery."
          >
            <p>
              Winding lifts the mass. As it descends, a cord turns a drum. The available
              gravitational potential energy depends on mass, gravity, and height.
            </p>
            <Equation note="mass × gravity × height">Eₚ = mgh</Equation>
            <Range
              label={`Raise the ${mass.toFixed(1)} kg weight`}
              value={weightHeight}
              min={0.2}
              max={1.65}
              step={0.01}
              onChange={setWeightHeight}
              valueLabel={`${weightHeight.toFixed(2)} m`}
            />
            <div className="energy-meter">
              <span style={{ width: `${weightHeight / 1.65 * 100}%` }} />
              <b>{storedEnergy.toFixed(1)} joules stored</b>
            </div>
            <p className="margin-note">The weight falls continuously; the pendulum will decide how quickly it is allowed to fall.</p>
          </Chapter>

          <Chapter
            number="10"
            id="train"
            kicker="Second: carry the torque"
            title="The gear train brings the fall to the escapement."
            side="right"
          >
            <p>
              Tension in the cord twists the winding drum. Meshing wheels transmit that torque,
              change speed, and drive both the clock hands and the escape wheel.
            </p>
            <Equation note="drum radius × weight force">τ ≈ rmg</Equation>
            <div className="callout-stack">
              <span><b>Drum</b><small>turns as the cord unwinds</small></span>
              <span><b>Wheel train</b><small>trades torque for speed</small></span>
              <span><b>Escape wheel</b><small>waits at the final gate</small></span>
            </div>
          </Chapter>

          <Chapter
            number="11"
            id="escapement"
            kicker="Third: open the gate"
            title="The escapement counts and nudges."
            side="right"
          >
            <p>
              The escape wheel wants to spin. The anchor’s pallets alternately lock and release
              its teeth. Every release advances the train and presses briefly on the pendulum.
            </p>
            <div className="two-jobs">
              <span><b>① Count</b><small>one gear step per beat</small></span>
              <span><b>② Nudge</b><small>one small impulse per beat</small></span>
            </div>
            <p className="margin-note"><em>Tick—tock</em> is the sound of lock, impulse, and release changing sides.</p>
          </Chapter>

          <Chapter
            number="12"
            id="impulse"
            kicker="One packet of energy"
            title="The push is brief, small, and well timed."
          >
            <p>
              During contact, the escapement applies a short force. Its impulse replaces the
              momentum lost since the previous beat without becoming the pendulum’s timekeeper.
            </p>
            <Equation note="force accumulated over a short contact">J = ∫F dt = Δp</Equation>
            <div className="handoff-summary">
              <span><b>Weight</b><small>supplies energy</small></span>
              <i>→</i><span><b>Gears</b><small>carry torque</small></span>
              <i>→</i><span><b>Escapement</b><small>meters impulse</small></span>
              <i>→</i><span><b>Pendulum</b><small>sets the rhythm</small></span>
            </div>
          </Chapter>

          <Chapter
            number="13"
            id="whole"
            kicker="One machine, two tendencies"
            title="Falling alone is too fast. Swinging alone fades."
            className="chapter--final"
          >
            <p>
              Couple them and each corrects the other. The weight keeps the pendulum alive;
              the pendulum refuses to let the weight hurry. Gearing turns those counted beats
              into minutes, hours, and chimes.
            </p>
            <blockquote>
              <span>Gravity supplies the energy.</span>
              <span>Length supplies the rhythm.</span>
              <span>The escapement introduces them.</span>
            </blockquote>
            <a className="restart-link" href="#overture">Rewind the story ↑</a>
          </Chapter>

          <footer className="site-footer">
            <div>
              <span className="footer-mark" aria-hidden="true"><i /><i /></span>
              <p><b>How a Grandfather Clock Works</b><small>An illustrative teaching model—not a restoration or regulation guide.</small></p>
            </div>
            <nav aria-label="Footer links">
              <a href="https://github.com/neelbaronia/grandfather-clock" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.nbaronia.com" target="_blank" rel="noreferrer">nbaronia.com</a>
            </nav>
          </footer>
        </div>
      </main>
    </div>
  )
}
