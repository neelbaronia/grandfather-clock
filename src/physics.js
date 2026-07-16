export const STANDARD_GRAVITY = 9.80665

const positiveNumber = (value, label) => {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) {
    throw new RangeError(`${label} must be a positive finite number`)
  }
  return number
}

/** Full back-and-forth period of an ideal, small-angle pendulum. */
export function pendulumPeriod(lengthMetres, gravity = STANDARD_GRAVITY) {
  const length = positiveNumber(lengthMetres, 'Pendulum length')
  const g = positiveNumber(gravity, 'Gravity')
  return 2 * Math.PI * Math.sqrt(length / g)
}

/** Pendulum length that produces a chosen full period. */
export function pendulumLengthForPeriod(periodSeconds, gravity = STANDARD_GRAVITY) {
  const period = positiveNumber(periodSeconds, 'Period')
  const g = positiveNumber(gravity, 'Gravity')
  return g * (period / (2 * Math.PI)) ** 2
}

/** A seconds pendulum takes one second per half swing and two per full cycle. */
export function secondsPendulumLength(gravity = STANDARD_GRAVITY) {
  return pendulumLengthForPeriod(2, gravity)
}

/** Clockmakers count each half swing as one beat. */
export function beatsPerHour(lengthMetres, gravity = STANDARD_GRAVITY) {
  return 7200 / pendulumPeriod(lengthMetres, gravity)
}

/** First useful finite-amplitude correction, with amplitude supplied in degrees. */
export function correctedPendulumPeriod(lengthMetres, amplitudeDegrees, gravity = STANDARD_GRAVITY) {
  const theta = Number(amplitudeDegrees) * Math.PI / 180
  if (!Number.isFinite(theta) || theta < 0) {
    throw new RangeError('Amplitude must be a non-negative finite number')
  }
  const ideal = pendulumPeriod(lengthMetres, gravity)
  return ideal * (1 + (theta ** 2) / 16 + (11 * theta ** 4) / 3072)
}

export function potentialEnergy(massKilograms, heightMetres, gravity = STANDARD_GRAVITY) {
  const mass = positiveNumber(massKilograms, 'Mass')
  const height = positiveNumber(heightMetres, 'Height')
  const g = positiveNumber(gravity, 'Gravity')
  return mass * g * height
}
