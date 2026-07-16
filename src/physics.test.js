import test from 'node:test'
import assert from 'node:assert/strict'
import {
  STANDARD_GRAVITY,
  beatsPerHour,
  correctedPendulumPeriod,
  pendulumLengthForPeriod,
  pendulumPeriod,
  potentialEnergy,
  secondsPendulumLength,
} from './physics.js'

test('a seconds pendulum is just under one metre long', () => {
  const length = secondsPendulumLength()
  assert.ok(Math.abs(length - 0.99362) < 0.00001)
  assert.ok(Math.abs(pendulumPeriod(length) - 2) < 1e-12)
  assert.ok(Math.abs(beatsPerHour(length) - 3600) < 1e-9)
})

test('period scales with the square root of length', () => {
  const base = pendulumPeriod(0.5)
  assert.ok(Math.abs(pendulumPeriod(2) - base * 2) < 1e-12)
  assert.ok(Math.abs(pendulumLengthForPeriod(base) - 0.5) < 1e-12)
})

test('larger arcs take slightly longer than the small-angle ideal', () => {
  const ideal = pendulumPeriod(1)
  assert.equal(correctedPendulumPeriod(1, 0), ideal)
  assert.ok(correctedPendulumPeriod(1, 20) > correctedPendulumPeriod(1, 5))
})

test('a raised mass stores gravitational potential energy', () => {
  assert.ok(Math.abs(potentialEnergy(5, 1) - 5 * STANDARD_GRAVITY) < 1e-12)
  assert.throws(() => potentialEnergy(0, 1), /positive/)
})
