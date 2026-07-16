import { useEffect, useState } from 'react'
import { correctedPendulumPeriod, pendulumPeriod } from '../physics.js'

const teeth = Array.from({ length: 30 }, (_, index) => index * 12)
const books = Array.from({ length: 28 }, (_, index) => ({
  color: ['#173f46', '#9d312d', '#d3a13e', '#eadba6', '#76502d'][index % 5],
  height: 44 + ((index * 7) % 27),
  width: 12 + (index % 3) * 3,
}))

function DialTicks() {
  return Array.from({ length: 60 }, (_, index) => {
    const angle = index * 6 * Math.PI / 180
    const major = index % 5 === 0
    const x1 = 140 + Math.sin(angle) * (major ? 76 : 81)
    const y1 = 150 - Math.cos(angle) * (major ? 76 : 81)
    const x2 = 140 + Math.sin(angle) * 87
    const y2 = 150 - Math.cos(angle) * 87
    return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className={major ? 'dial-tick dial-tick--major' : 'dial-tick'} />
  })
}

function Bookcase() {
  let cursor = 0
  return (
    <g className="room-bookcase" transform="translate(175 160)">
      <rect width="220" height="365" rx="3" fill="#754126" stroke="#173936" strokeWidth="7" />
      <rect x="19" y="23" width="182" height="320" fill="#e1cc8c" stroke="#173936" strokeWidth="5" />
      {[100, 186, 272].map((y) => <rect key={y} x="12" y={y} width="196" height="12" fill="#9c5c34" stroke="#173936" strokeWidth="4" />)}
      {books.map((book, index) => {
        const shelf = Math.floor(index / 7)
        const slot = index % 7
        if (slot === 0) cursor = 0
        const x = 28 + cursor
        const yBase = 98 + shelf * 86
        cursor += book.width + 4
        return (
          <g key={index}>
            <rect x={x} y={yBase - book.height} width={book.width} height={book.height} fill={book.color} stroke="#173936" strokeWidth="2" />
            <line x1={x + 3} y1={yBase - book.height + 8} x2={x + book.width - 3} y2={yBase - book.height + 8} stroke="#f1e5bd" strokeWidth="1.5" opacity=".7" />
          </g>
        )
      })}
      <path d="M19 343h182" stroke="#173936" strokeWidth="5" />
    </g>
  )
}

function RoomPlate() {
  return (
    <g className="room-plate">
      <rect width="1200" height="800" fill="#e9ddb8" />
      <rect x="130" width="1070" height="570" fill="url(#wallPattern)" />
      <path d="M0 0h132v573L0 642Z" fill="#d5bd77" />
      <path d="M0 642 1200 545v255H0Z" fill="url(#floorPattern)" stroke="#173936" strokeWidth="5" />

      <g className="room-window" transform="translate(28 82)">
        <rect width="230" height="285" fill="#795035" stroke="#173936" strokeWidth="7" />
        <rect x="18" y="18" width="194" height="249" fill="url(#windowSky)" stroke="#173936" strokeWidth="4" />
        <path d="M115 18v249M18 143h194" stroke="#795035" strokeWidth="9" />
        <path d="M22 260q36-85 78-48t58-37q24-32 50 21v71H22Z" fill="#315a3e" stroke="#173936" strokeWidth="4" />
      </g>
      <path d="M0 27q51 46 97 8v394q-45 36-97 8Z" fill="url(#curtainPattern)" stroke="#173936" strokeWidth="5" />
      <path d="M243 31q-39 48-70 7v391q37 32 70 4Z" fill="url(#curtainPattern)" stroke="#173936" strokeWidth="5" />

      <Bookcase />

      <g className="room-art" transform="translate(448 90)">
        <rect width="184" height="130" fill="#7c4328" stroke="#173936" strokeWidth="6" />
        <rect x="14" y="14" width="156" height="102" fill="#16434a" stroke="#173936" strokeWidth="3" />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <g key={index} transform={`translate(${33 + index * 23} ${35 + (index % 2) * 35})`}>
            <circle r={14 + (index % 3) * 3} fill="none" stroke={index % 2 ? '#d5a33e' : '#a9322d'} strokeWidth="7" />
          </g>
        ))}
      </g>
      <g className="room-art" transform="translate(1005 155) rotate(3)">
        <rect width="138" height="190" fill="#724027" stroke="#173936" strokeWidth="6" />
        <rect x="13" y="13" width="112" height="164" fill="#96302c" stroke="#173936" strokeWidth="3" />
        <path d="M25 146Q49 25 111 56M21 101q45-31 91 38" fill="none" stroke="#e0b64f" strokeWidth="10" strokeLinecap="round" />
      </g>

      <path d="M282 655 835 589l300 164-659 40Z" fill="url(#rugPattern)" stroke="#173936" strokeWidth="13" />

      <g className="room-chair" transform="translate(948 502)">
        <path d="M15 76h191v129H15Z" fill="url(#chairFabric)" stroke="#173936" strokeWidth="7" />
        <path d="M32 80V0h157v80" fill="url(#chairFabric)" stroke="#173936" strokeWidth="7" />
        <path d="M0 78h38v107H0ZM183 78h38v107h-38Z" fill="#19454b" stroke="#173936" strokeWidth="7" />
        <path d="M24 204v55M197 204v55" stroke="#563326" strokeWidth="10" />
        <path d="M32 25q38 32 77 0t80 0" fill="none" stroke="#d1a03e" strokeWidth="3" opacity=".8" />
      </g>

      <g className="room-lamp" transform="translate(930 194)">
        <path d="M70 0 128 104H12Z" fill="#d6a440" stroke="#173936" strokeWidth="6" />
        <path d="M70 104v300M36 404h68" stroke="#392c24" strokeWidth="8" />
        <circle cx="70" cy="96" r="24" fill="#f7d77d" opacity=".5" />
      </g>

      <g className="room-plant" transform="translate(1080 425)">
        <path d="M6 222h104l-18 102H25Z" fill="#a3312d" stroke="#173936" strokeWidth="6" />
        <path d="M58 228V50" stroke="#36563b" strokeWidth="7" />
        {[
          [-10, 35, -22], [54, 7, 28], [-19, 90, -16], [53, 73, 19], [-14, 144, -9], [49, 133, 12], [5, 191, -4],
        ].map(([x, y, rotation], index) => (
          <ellipse key={index} cx={x + 40} cy={y} rx="53" ry="19" fill={index % 2 ? '#315e40' : '#244e39'} stroke="#173936" strokeWidth="5" transform={`rotate(${rotation} ${x + 40} ${y})`} />
        ))}
      </g>

      <g className="room-table" transform="translate(420 590)">
        <path d="M0 0h205l31 27H20Z" fill="#754126" stroke="#173936" strokeWidth="6" />
        <path d="M29 27v117M210 27v117" stroke="#4a2b20" strokeWidth="10" />
        <rect x="50" y="-23" width="54" height="22" fill="#a5312d" stroke="#173936" strokeWidth="3" />
        <rect x="61" y="-40" width="82" height="18" fill="#d2a13e" stroke="#173936" strokeWidth="3" />
        <path d="M158 0q-7-42 16-51t39 20q12 23-8 31Z" fill="#e7d8a3" stroke="#173936" strokeWidth="4" />
      </g>
    </g>
  )
}

function ClockIllustration({ amplitude, length, weightHeight }) {
  const period = correctedPendulumPeriod(length, amplitude)
  const visualLength = 170 + length * 80
  const bobY = 287 + visualLength
  const weightY = 540 - weightHeight * 100
  const swing = Math.min(11, Math.max(2, amplitude))
  const now = new Date()
  const minuteRotation = (now.getMinutes() + now.getSeconds() / 60) * 6
  const hourRotation = ((now.getHours() % 12) + now.getMinutes() / 60) * 30

  return (
    <g className="clock-position" transform="translate(635 55)">
      <g className="clock-illustration">
      <g className="clock-case">
        <path d="M27 70Q45 9 140 0q95 9 113 70l12 41v541H15V111Z" fill="url(#woodPattern)" stroke="#173936" strokeWidth="8" />
        <path d="M21 78h238l19 31H2Z" fill="#4d281f" stroke="#173936" strokeWidth="7" />
        <rect x="8" y="91" width="264" height="213" rx="8" fill="#834426" stroke="#173936" strokeWidth="7" />
        <circle cx="140" cy="178" r="107" fill="#4b291f" stroke="#173936" strokeWidth="7" />
        <circle cx="140" cy="178" r="94" fill="#f0e3ba" stroke="#c29439" strokeWidth="9" />
        <circle cx="140" cy="178" r="86" fill="url(#dialPaper)" stroke="#173936" strokeWidth="3" />
        <DialTicks />
        <g transform={`rotate(${hourRotation} 140 178)`}><path d="M140 178v-49" className="clock-hand clock-hand--hour" /></g>
        <g transform={`rotate(${minuteRotation} 140 178)`}><path d="M140 178v-70" className="clock-hand clock-hand--minute" /></g>
        <circle cx="140" cy="178" r="11" fill="#d2a13e" stroke="#173936" strokeWidth="5" />

        <rect x="29" y="299" width="222" height="316" rx="3" fill="#70402a" stroke="#173936" strokeWidth="7" />
        <rect x="57" y="326" width="166" height="258" fill="url(#glassPattern)" stroke="#173936" strokeWidth="6" />
        <path d="M29 299h222M29 615h222" stroke="#c07a40" strokeWidth="13" />
        <path d="M15 652h250l17 28H0Z" fill="#4b291f" stroke="#173936" strokeWidth="7" />
        <path d="M34 615h212l14 25H20Z" fill="#9d5c35" stroke="#173936" strokeWidth="6" />
      </g>

      <g className="clock-train">
        {[
          [140, 295, 34, 'clock-gear clock-gear--a'],
          [92, 338, 25, 'clock-gear clock-gear--b'],
          [190, 344, 22, 'clock-gear clock-gear--c'],
        ].map(([x, y, radius, className]) => (
          <g key={className} className={className}>
            <circle cx={x} cy={y} r={radius} fill="#453126" stroke="#c7983b" strokeWidth="9" strokeDasharray="8 5" />
            {Array.from({ length: 8 }, (_, index) => (
              <line key={index} x1={x} y1={y - radius + 8} x2={x} y2={y + radius - 8} stroke="#c7983b" strokeWidth="3" transform={`rotate(${index * 45} ${x} ${y})`} />
            ))}
            <circle cx={x} cy={y} r="7" fill="#d2a13e" stroke="#173936" strokeWidth="4" />
          </g>
        ))}
      </g>

      <g className="clock-weights">
        {[
          [91, weightY + 14], [140, weightY - 22], [189, weightY + 34],
        ].map(([x, y], index) => (
          <g key={index} className="clock-weight">
            <path d={`M${x} 304V${y - 22}`} stroke="#6b5638" strokeWidth="4" />
            <path d={`M${x - 16} ${y - 16}q16-15 32 0`} fill="none" stroke="#173936" strokeWidth="4" />
            <rect x={x - 19} y={y - 5} width="38" height="77" rx="17" fill="url(#brassPattern)" stroke="#173936" strokeWidth="5" />
          </g>
        ))}
      </g>

      <g
        className="clock-pendulum"
        style={{ '--pendulum-period': `${period}s`, '--pendulum-swing': `${swing}deg` }}
      >
        <path d={`M140 287V${bobY}`} stroke="#c69639" strokeWidth="7" />
        <circle cx="140" cy={bobY} r="42" fill="url(#brassPattern)" stroke="#173936" strokeWidth="6" />
        <circle cx="128" cy={bobY - 12} r="9" fill="#f1d581" opacity=".8" />
      </g>
      </g>
    </g>
  )
}

function HistoryObjects() {
  return (
    <g className="history-objects" transform="translate(545 430)">
      <path d="M0 180h444l-28 35H20Z" fill="#714027" stroke="#173936" strokeWidth="7" />
      <path d="M40 215v155M402 215v155" stroke="#4b2a20" strokeWidth="11" />
      <g transform="translate(28 25)">
        <ellipse cx="65" cy="117" rx="64" ry="25" fill="#dcc782" stroke="#173936" strokeWidth="5" />
        <path d="M65 110V20l24 91" fill="#a85b36" stroke="#173936" strokeWidth="5" />
        <path d="M25 117h80M38 103l-18-15M92 103l18-15" stroke="#8c302b" strokeWidth="3" />
      </g>
      <g transform="translate(172 1)">
        <path d="M13 23h98l-16 69H29Z" fill="#d4a276" stroke="#173936" strokeWidth="5" />
        <path d="M29 100h66l14 64H14Z" fill="#bd8a5d" stroke="#173936" strokeWidth="5" />
        <circle cx="62" cy="96" r="8" fill="#4c8591" stroke="#173936" strokeWidth="3" />
      </g>
      <g transform="translate(334 0)">
        <rect x="10" y="45" width="59" height="118" rx="15" fill="#eee1b6" stroke="#173936" strokeWidth="5" />
        {[72, 100, 128].map((y) => <path key={y} d={`M22 ${y}h36`} stroke="#8f512f" strokeWidth="4" />)}
        <path d="M40 45q-19-29 0-46 21 20 0 46Z" fill="#e4a53c" stroke="#173936" strokeWidth="4" />
      </g>
    </g>
  )
}

function FrequencyOverlay() {
  return (
    <g className="frequency-overlay" transform="translate(480 355)">
      {[70, 105, 140, 175].map((radius, index) => (
        <circle key={radius} cx="0" cy="0" r={radius} fill="none" stroke={index % 2 ? '#9a312c' : '#16434a'} strokeWidth="5" opacity={0.8 - index * 0.13} className={`frequency-ring frequency-ring--${index}`} />
      ))}
      <path d="M-215 0h52l18-46 33 92 29-72 36 52 25-26H215" fill="none" stroke="#d2a13e" strokeWidth="8" strokeLinejoin="round" />
    </g>
  )
}

function FrequencySpecimens() {
  const panels = [
    [0, 0, 'HEARTBEAT', 'VARIES'],
    [255, 0, 'WATER DROP', 'FLOW SHIFTS'],
    [0, 205, 'SUNDIAL', 'SKY-DEPENDENT'],
    [255, 205, 'PENDULUM', 'TUNABLE'],
  ]
  return (
    <g className="frequency-specimens" transform="translate(620 158)">
      {panels.map(([x, y, label, note]) => (
        <g key={label} transform={`translate(${x} ${y})`}>
          <rect width="235" height="185" fill="#efe1b5" stroke="#173936" strokeWidth="5" />
          <text x="14" y="165" className="specimen-label">{label}</text>
          <text x="220" y="165" textAnchor="end" className="specimen-note">{note}</text>
        </g>
      ))}
      <text x="117" y="92" textAnchor="middle" className="specimen-heart">♥</text>
      <g transform="translate(372 32)">
        <path className="specimen-drop" d="M0 0q-31 39 0 65 31-26 0-65Z" fill="#5e9194" stroke="#173936" strokeWidth="5" />
        <ellipse className="specimen-ripple" cy="108" rx="62" ry="13" fill="none" stroke="#16434a" strokeWidth="5" />
      </g>
      <g transform="translate(117 284)">
        <ellipse cy="58" rx="87" ry="26" fill="#d9c480" stroke="#173936" strokeWidth="5" />
        <path d="M0 52V-17L18 54Z" fill="#9a312c" stroke="#173936" strokeWidth="4" />
        <path className="specimen-shadow" d="M0 53h64" stroke="#173936" strokeWidth="7" strokeLinecap="round" />
        <circle className="specimen-sun" cx="-70" cy="-26" r="17" fill="#d2a13e" stroke="#173936" strokeWidth="4" />
      </g>
      <g className="specimen-pendulum" transform="translate(373 237)">
        <path d="M0 0v93" stroke="#d2a13e" strokeWidth="6" />
        <circle cy="116" r="28" fill="#d2a13e" stroke="#173936" strokeWidth="5" />
      </g>
    </g>
  )
}

function PendulumStudy({ amplitude, length, mass }) {
  const period = correctedPendulumPeriod(length, amplitude)
  const visualLength = 245 + (length - 0.35) / 0.9 * 135
  const bobRadius = 38 + (mass - 1) / 9 * 11
  return (
    <g className="pendulum-study">
      <path d="M760 105A320 320 0 0 0 760 704" fill="none" stroke="#173936" strokeWidth="3" strokeDasharray="9 8" opacity=".32" />
      <path d="M760 105A320 320 0 0 1 760 704" fill="none" stroke="#173936" strokeWidth="3" strokeDasharray="9 8" opacity=".32" />
      <circle cx="760" cy="112" r="17" fill="#f0e4bf" stroke="#173936" strokeWidth="6" />
      <g
        className="study-pendulum"
        style={{ '--study-period': `${period}s`, '--study-angle': `${amplitude}deg` }}
      >
        <path d={`M760 112V${112 + visualLength}`} stroke="#d2a13e" strokeWidth="8" />
        <circle cx="760" cy={112 + visualLength} r={bobRadius} fill="url(#brassPattern)" stroke="#173936" strokeWidth="7" />
      </g>
      <path d={`M885 122h46v${Math.max(200, visualLength - 16)}h-46`} fill="none" stroke="#9a312c" strokeWidth="4" />
      <text x="910" y={120 + visualLength / 2} className="study-label">L</text>
      <g className="study-wave" transform="translate(590 610)">
        <rect width="520" height="125" fill="#f3e8c3" stroke="#173936" strokeWidth="4" />
        <path d="M18 65C55 10 92 10 129 65s74 55 111 0 74-55 111 0 74 55 111 0" fill="none" stroke="#9a312c" strokeWidth="6" strokeLinecap="round" />
        <path d="M129 17v92M351 17v92M129 102h222" fill="none" stroke="#173936" strokeWidth="2" strokeDasharray="6 5" />
        <text x="232" y="119" className="study-label">ONE PERIOD T</text>
      </g>
    </g>
  )
}

function SwingScene() {
  return (
    <g className="swing-scene">
      <g className="playground-yard">
        <rect width="1200" height="800" fill="#83a5a1" />
        <circle cx="160" cy="145" r="46" fill="#eee3bd" opacity=".72" />
        <ellipse cx="920" cy="125" rx="86" ry="34" fill="#eee3bd" opacity=".55" />
        <path d="M0 520q170-60 345 8t335-4q210-77 520 5v271H0Z" fill="#91a06d" />
        <path d="M0 594q190-68 360 10t346-8q215-79 494 10v194H0Z" fill="#6e8457" stroke="#173936" strokeWidth="5" />
        <path d="M1070 320v390" stroke="#754126" strokeWidth="55" />
        <ellipse cx="1060" cy="294" rx="180" ry="136" fill="#315d40" stroke="#173936" strokeWidth="8" />
      </g>
      <g className="playground-subject" transform="translate(640 430)">
        <path d="M-225 245-165-205M225 245 165-205M-184-205h368" fill="none" stroke="#754126" strokeWidth="14" strokeLinecap="round" />
        <path d="M-191-205h382" stroke="#173936" strokeWidth="5" />
        <g className="playground-rider">
          <path d="M-40-188V47M40-188V47" stroke="#d2a13e" strokeWidth="6" />
          <path d="M-57 45h114" stroke="#173936" strokeWidth="16" />
          <circle cy="-26" r="30" fill="#c67d56" stroke="#173936" strokeWidth="6" />
          <path d="M-32 4h64v78h-64Z" fill="#16434a" stroke="#173936" strokeWidth="6" />
          <path d="M-5 75 58 116M5 75 77 89" stroke="#173936" strokeWidth="10" strokeLinecap="round" />
        </g>
        <g className="playground-pusher" transform="translate(-158 32)">
          <circle cy="-55" r="30" fill="#b96849" stroke="#173936" strokeWidth="6" />
          <rect x="-35" y="-25" width="70" height="96" rx="25" fill="#d2a13e" stroke="#173936" strokeWidth="6" />
          <path d="M28-6 105-25" stroke="#173936" strokeWidth="11" strokeLinecap="round" />
          <path d="M-15 67-32 142M17 67 43 137" stroke="#173936" strokeWidth="11" strokeLinecap="round" />
        </g>
        <g className="playground-push-burst">
          {Array.from({ length: 10 }, (_, index) => (
            <path key={index} d="M-105-10h-38" stroke="#9a312c" strokeWidth="7" transform={`rotate(${index * 36} -105 -10)`} />
          ))}
        </g>
      </g>
      <g className="playground-window">
        <rect x="885" y="92" width="270" height="360" fill="#83a5a1" stroke="#173936" strokeWidth="20" />
        <path d="M1020 92v360M885 272h270" stroke="#754126" strokeWidth="13" />
        <path d="M905 355q82-55 136 0t94-6v84H905Z" fill="#648054" />
        <g transform="translate(1020 270) scale(.34)">
          <path d="M-225 245-165-205M225 245 165-205M-184-205h368" fill="none" stroke="#754126" strokeWidth="18" />
          <path d="M-32-188V48M32-188V48M-55 47h110" stroke="#d2a13e" strokeWidth="10" />
          <circle cy="-12" r="34" fill="#c67d56" stroke="#173936" strokeWidth="8" />
          <path d="M-35 18h70v90h-70Z" fill="#16434a" stroke="#173936" strokeWidth="8" />
        </g>
      </g>
    </g>
  )
}

function DissipationVisual({ angle, energy }) {
  return (
    <g className="dissipation-visual">
      <path d="M655 85h340l45 74v535H610V159Z" fill="#8b4b2b" opacity=".22" stroke="#173936" strokeWidth="8" />
      <path d="M825 190A240 240 0 0 0 825 660M825 190A240 240 0 0 1 825 660" fill="none" stroke="#9a312c" strokeWidth="3" strokeDasharray="10 8" opacity=".3" />
      <circle cx="825" cy="190" r="18" fill="#f0e4bf" stroke="#173936" strokeWidth="6" />
      <g transform={`rotate(${angle} 825 190)`}>
        <path d="M825 190v345" stroke="#d2a13e" strokeWidth="9" />
        <circle cx="825" cy="535" r="52" fill="url(#brassPattern)" stroke="#173936" strokeWidth="8" />
      </g>
      <g transform="translate(650 680)">
        <rect width="350" height="56" fill="#16434a" stroke="#173936" strokeWidth="5" />
        <rect x="18" y="31" width="314" height="10" fill="#263d38" stroke="#f0e4bf" strokeWidth="2" />
        <rect x="20" y="33" width={310 * energy} height="6" fill="#d2a13e" />
        <text x="18" y="20" className="decay-label-svg">ENERGY REMAINING</text>
        <text x="330" y="20" textAnchor="end" className="decay-label-svg">{Math.round(energy * 100)}%</text>
      </g>
    </g>
  )
}

function EscapementOverlay() {
  return (
    <g className="escapement-overlay" transform="translate(385 335)">
      <g className="escape-wheel-large">
        <circle r="126" fill="#e3d294" stroke="#173936" strokeWidth="7" />
        <circle r="91" fill="#f0e4bd" stroke="#c49438" strokeWidth="14" />
        {teeth.map((rotation) => (
          <g key={rotation} transform={`rotate(${rotation})`}>
            <path d="M-7-127 8-154 15-123Z" fill="#c49438" stroke="#173936" strokeWidth="3" />
            <path d="M0-90V-21" stroke="#c49438" strokeWidth="8" />
          </g>
        ))}
        <circle r="23" fill="#d2a13e" stroke="#173936" strokeWidth="7" />
      </g>
      <g className="anchor-large">
        <path d="M-112-95 0-28 112-95" fill="none" stroke="#e9deb9" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0-28V143" stroke="#173936" strokeWidth="14" />
        <path d="M-127-113h41v45h-41ZM86-113h41v45H86Z" fill="#9a312c" stroke="#173936" strokeWidth="6" />
      </g>
      <path d="M-245-132h96" className="annotation-line" />
      <text x="-250" y="-145" className="annotation-label">LOCK</text>
      <path d="M-248 116h124" className="annotation-line" />
      <text x="-250" y="103" className="annotation-label">IMPULSE</text>
    </g>
  )
}

function AssemblyAnnotations() {
  return (
    <g className="assembly-annotations">
      <path d="M910 132h156" className="annotation-line" /><text x="1074" y="137" className="annotation-label">BONNET</text>
      <path d="M897 420h169" className="annotation-line" /><text x="1074" y="425" className="annotation-label">TRUNK</text>
      <path d="M890 702h176" className="annotation-line" /><text x="1074" y="707" className="annotation-label">PLINTH</text>
    </g>
  )
}

function EnergyOverlay() {
  return (
    <g className="energy-overlay">
      <path d="M835 590C900 510 900 420 820 360S710 270 770 214" className="energy-path-svg energy-path-svg--one" />
      <path d="M770 214C650 190 555 245 515 350" className="energy-path-svg energy-path-svg--two" />
      <circle cx="835" cy="590" r="12" fill="#d2a13e" stroke="#173936" strokeWidth="5" />
      <circle cx="515" cy="350" r="12" fill="#d2a13e" stroke="#173936" strokeWidth="5" />
      <text x="880" y="505" className="energy-label">stored height</text>
      <text x="555" y="286" className="energy-label">one small push</text>
    </g>
  )
}

function useDampedMotion(active, runKey) {
  const [motion, setMotion] = useState({ angle: 18, energy: 1 })
  useEffect(() => {
    if (active !== 7) return undefined
    let frame = 0
    const started = performance.now()
    const animate = (now) => {
      const elapsed = (now - started) / 1000
      const envelope = Math.exp(-0.22 * elapsed)
      const energy = Math.exp(-0.44 * elapsed)
      const angle = 18 * envelope * Math.cos(Math.PI * elapsed)
      setMotion({ angle: elapsed < 14 ? angle : 0, energy: elapsed < 14 ? energy : 0 })
      if (elapsed < 14) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [active, runKey])
  return motion
}

export default function IllustratedStage({ active, amplitude, decayRun, length, mass, weightHeight }) {
  const rightCard = [4, 6, 10, 11].includes(active)
  const damped = useDampedMotion(active, decayRun)
  return (
    <div className={`illustrated-stage illustrated-stage--${active} ${rightCard ? 'illustrated-stage--card-right' : 'illustrated-stage--card-left'}`}>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated living room containing an animated grandfather clock">
        <defs>
          <pattern id="wallPattern" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" fill="#eee4c2" />
            <path d="M4 0q5 11 0 22M15 0q-4 11 0 22" fill="none" stroke="#173936" strokeWidth="1" opacity=".24" />
            <path d="M8 8q3-5 6 0-3 7-6 0Z" fill="none" stroke="#a9322d" strokeWidth="1" opacity=".2" />
          </pattern>
          <pattern id="floorPattern" width="90" height="30" patternUnits="userSpaceOnUse">
            <rect width="90" height="30" fill="#a66236" />
            <path d="M0 29h90M9 7q21-8 41 1t40-2" fill="none" stroke="#5e3524" strokeWidth="2" opacity=".66" />
          </pattern>
          <pattern id="rugPattern" width="82" height="82" patternUnits="userSpaceOnUse">
            <rect width="82" height="82" fill="#9b312d" />
            <path d="m41 4 37 37-37 37L4 41Z" fill="#d2a13e" stroke="#16434a" strokeWidth="7" />
            <circle cx="41" cy="41" r="10" fill="#16434a" />
            <circle cx="41" cy="41" r="4" fill="#e9dba5" />
          </pattern>
          <pattern id="curtainPattern" width="34" height="34" patternUnits="userSpaceOnUse">
            <rect width="34" height="34" fill="#8f302c" />
            <path d="M5 0v34M17 0v34M29 0v34" stroke="#d69c3e" strokeWidth="4" opacity=".65" />
          </pattern>
          <pattern id="chairFabric" width="18" height="18" patternUnits="userSpaceOnUse">
            <rect width="18" height="18" fill="#16434a" />
            <path d="M0 18 18 0M-4 4 4-4M14 22 22 14" stroke="#2f6468" strokeWidth="2" />
          </pattern>
          <pattern id="woodPattern" width="28" height="70" patternUnits="userSpaceOnUse">
            <rect width="28" height="70" fill="#854829" />
            <path d="M4 0q8 17 0 35t0 35M17 0q-6 18 1 34t-1 36" fill="none" stroke="#4c291f" strokeWidth="2" opacity=".55" />
            <path d="M10 23q4-8 8 0t-8 0" fill="none" stroke="#c17b42" strokeWidth="1.5" opacity=".6" />
          </pattern>
          <pattern id="glassPattern" width="28" height="28" patternUnits="userSpaceOnUse">
            <rect width="28" height="28" fill="#2d3832" opacity=".78" />
            <path d="M0 28 28 0" stroke="#dfe7d5" strokeWidth="2" opacity=".15" />
          </pattern>
          <pattern id="brassPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#c6973b" />
            <path d="M-3 20 20-3M5 23 23 5" stroke="#f0d47d" strokeWidth="3" opacity=".45" />
          </pattern>
          <pattern id="dialPaper" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#f0e4bf" />
            <path d="M2 0v16M9 0v16" stroke="#8e8163" strokeWidth=".6" opacity=".25" />
          </pattern>
          <linearGradient id="windowSky" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7ba0a0" /><stop offset=".45" stopColor="#e3bd69" /><stop offset="1" stopColor="#40635a" /></linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="10" dy="14" stdDeviation="10" floodColor="#382319" floodOpacity=".24" /></filter>
          <filter id="warmGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16" /></filter>
        </defs>
        <RoomPlate />
        <g className="room-light"><circle cx="1000" cy="300" r="132" fill="#f1c45a" opacity=".14" filter="url(#warmGlow)" /></g>
        <ClockIllustration amplitude={amplitude} length={length} weightHeight={weightHeight} />
        <FrequencySpecimens />
        <PendulumStudy amplitude={amplitude} length={length} mass={mass} />
        <SwingScene />
        <DissipationVisual angle={damped.angle} energy={damped.energy} />
        <EscapementOverlay />
        <EnergyOverlay />
      </svg>
      <div className="illustrated-stage__paper-grain" aria-hidden="true" />
    </div>
  )
}
