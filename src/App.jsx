import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  beatsPerHour,
  correctedPendulumPeriod,
  pendulumPeriod,
  potentialEnergy,
  secondsPendulumLength,
} from './physics.js'

const ClockScene = lazy(() => import('./components/ClockScene.jsx'))

const chapters = [
  { id: 'overture', label: 'The clock' },
  { id: 'before', label: 'Before clocks' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'pendulum', label: 'The pendulum' },
  { id: 'arc', label: 'The arc' },
  { id: 'case', label: 'Into the case' },
  { id: 'escapement', label: 'Escapement' },
  { id: 'weights', label: 'The weights' },
  { id: 'handoff', label: 'Energy handoff' },
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
  const [weightHeight, setWeightHeight] = useState(1.35)
  const [sound, setSound] = useState(false)

  const period = useMemo(() => pendulumPeriod(length), [length])
  const correctedPeriod = useMemo(
    () => correctedPendulumPeriod(length, amplitude),
    [length, amplitude],
  )
  const dailyArcError = (correctedPeriod / period - 1) * 86400
  const storedEnergy = potentialEnergy(5, weightHeight)
  useTick(sound, period)

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
        <div className="visual-stage" aria-label="Animated three-dimensional grandfather clock model">
          <Suspense fallback={<LoadingModel />}>
            <ClockScene
              active={active}
              length={length}
              amplitude={amplitude}
              weightHeight={weightHeight}
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
              <a className="begin-link" href="#before"><span>Begin with no clocks</span><i>↓</i></a>
            </div>
            <div className="hero-aside" aria-hidden="true">
              <span>Weight</span><i>→</i><span>Gears</span><i>→</i><span>Beat</span>
            </div>
          </section>

          <Chapter
            number="01"
            id="before"
            kicker="First, a human problem"
            title="Time existed before clocks. Appointments did not."
          >
            <p>
              The Sun can divide a day. Flowing water, burning candles, and falling sand
              can divide the dark. But each depends on a rate that weather, temperature,
              materials, or refilling can disturb.
            </p>
            <div className="artifact-list" aria-label="Early timekeepers">
              <span><i>☼</i><b>Sundial</b><small>Earth’s rotation</small></span>
              <span><i>≈</i><b>Water clock</b><small>Fluid flow</small></span>
              <span><i>│</i><b>Candle clock</b><small>Burn rate</small></span>
            </div>
            <p className="margin-note">The breakthrough was not finding time. It was finding a dependable repeat.</p>
          </Chapter>

          <Chapter
            number="02"
            id="frequency"
            kicker="The useful abstraction"
            title="A clock is really a repeat counter."
            side="right"
          >
            <p>
              A regular event gives us a unit. Count heartbeats, quartz vibrations, or
              pendulum swings and elapsed time becomes a number instead of a guess.
            </p>
            <Equation note="frequency = repeats each second">f = 1 / T</Equation>
            <div className="frequency-strip" aria-hidden="true">
              {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
            </div>
            <p>
              We care about frequency because a stable frequency is a reusable ruler for time.
              The ruler can run while the sky is cloudy and while everyone is asleep.
            </p>
          </Chapter>

          <Chapter
            number="03"
            id="pendulum"
            kicker="A ruler made from gravity"
            title="Length chooses the tempo."
          >
            <p>
              Pull a pendulum aside and gravity supplies a restoring force. Inertia carries
              it past the center. For small arcs, the full back-and-forth period depends mainly
              on length <em>L</em> and gravity <em>g</em>—not the bob’s mass.
            </p>
            <Equation note="T is one complete left-and-right cycle">T = 2π √(L / g)</Equation>
            <Range
              label="Pendulum length"
              value={length}
              min={0.35}
              max={1.25}
              step={0.005}
              onChange={setLength}
              valueLabel={`${length.toFixed(3)} m`}
            />
            <div className="stat-pair">
              <span><small>FULL PERIOD</small><b>{period.toFixed(3)} s</b></span>
              <span><small>BEATS / HOUR</small><b>{Math.round(beatsPerHour(length)).toLocaleString()}</b></span>
            </div>
            <button className="text-button" type="button" onClick={() => setLength(secondsPendulumLength())}>
              Set the classic seconds pendulum →
            </button>
          </Chapter>

          <Chapter
            number="04"
            id="arc"
            kicker="Why the swing behaves"
            title="Small arcs are nearly isochronous."
            side="right"
          >
            <p>
              A taller release travels farther, but gravity also pulls harder. Near the bottom,
              those effects nearly cancel, so modest swings take almost the same time.
            </p>
            <div className="amplitude-picker" role="group" aria-label="Choose pendulum amplitude">
              {[2, 8, 20].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setAmplitude(value)}
                  className={amplitude === value ? 'is-active' : ''}
                >
                  {value}°
                </button>
              ))}
            </div>
            <div className="arc-readout">
              <span>Small-angle ideal<b>{period.toFixed(4)} s</b></span>
              <span>{amplitude}° corrected<b>{correctedPeriod.toFixed(4)} s</b></span>
              <span>Unregulated difference<b>+{dailyArcError.toFixed(1)} s/day</b></span>
            </div>
            <p className="margin-note">
              Large arcs expose “circular error.” Real clockmakers keep amplitudes small and regulate the effective length.
            </p>
          </Chapter>

          <Chapter
            number="05"
            id="case"
            kicker="Now add the furniture"
            title="Put the oscillator inside the clock."
          >
            <p>
              A roughly metre-long seconds pendulum needs a tall, stable enclosure. The longcase
              protects it from drafts and curious hands; the heavy case gives the movement a rigid home.
            </p>
            <div className="callout-stack">
              <span><b>Bonnet</b><small>Protects the dial and movement</small></span>
              <span><b>Trunk</b><small>Gives the pendulum room to swing</small></span>
              <span><b>Plinth</b><small>Plants the clock firmly on the floor</small></span>
            </div>
            <p className="margin-note">“Grandfather clock” is the familiar name; clockmakers also say longcase clock.</p>
          </Chapter>

          <Chapter
            number="06"
            id="escapement"
            kicker="The mechanical handshake"
            title="The escapement lets energy through one tooth at a time."
            side="right"
          >
            <p>
              The escape wheel wants to spin freely. The anchor’s two pallets stop it. As the
              pendulum swings, one pallet releases a tooth while the other catches the next.
            </p>
            <div className="two-jobs">
              <span><b>① Count</b><small>Each swing permits a discrete gear step.</small></span>
              <span><b>② Nudge</b><small>Each tooth returns a tiny impulse to the pendulum.</small></span>
            </div>
            <p>
              That <em>tick—tock</em> is the sound of alternating pallets: lock, impulse, release.
            </p>
          </Chapter>

          <Chapter
            number="07"
            id="weights"
            kicker="A very slow fall"
            title="Winding the clock stores height."
          >
            <p>
              Pulling a weight upward stores gravitational potential energy. As it descends,
              a cord turns a drum and the gear train. The pendulum does not make the power—it meters it.
            </p>
            <Equation note="mass × gravity × height">E = mgh</Equation>
            <Range
              label="Raise a 5 kg weight"
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
            <p className="margin-note">Many longcase clocks use separate weights for timekeeping, striking the hours, and playing chimes.</p>
          </Chapter>

          <Chapter
            number="08"
            id="handoff"
            kicker="Follow one packet of energy"
            title="The weight supplies power. The pendulum supplies permission."
            side="right"
          >
            <ol className="energy-path">
              <li><b>Weight falls</b><span>Potential energy turns the winding drum.</span></li>
              <li><b>Gears divide</b><span>The train carries torque toward the escape wheel and hands.</span></li>
              <li><b>Escapement meters</b><span>One tooth advances on each beat.</span></li>
              <li><b>Pendulum receives</b><span>A tiny impulse replaces energy lost to air and friction.</span></li>
            </ol>
            <p className="margin-note">The push is deliberately small: enough to sustain the arc, not enough to dictate its rhythm.</p>
          </Chapter>

          <Chapter
            number="09"
            id="whole"
            kicker="One machine, two tendencies"
            title="Falling steadily would be too fast. Swinging alone would fade."
            className="chapter--final"
          >
            <p>
              Couple them and each corrects the other. The weight keeps the pendulum alive;
              the pendulum refuses to let the weight hurry. Gearing turns those counted beats
              into minutes, hours, chimes—and a moving picture of the day.
            </p>
            <blockquote>
              <span>Gravity provides the energy.</span>
              <span>Length provides the rhythm.</span>
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
