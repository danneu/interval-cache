const Cache = require('../src')
const lol = require('lolex')
const test = require('ava')

const timeout = (clock, ms) => {
  return new Promise(resolve => clock.setTimeout(resolve, ms))
}

test('initial value', t => {
  const cache = new Cache().every('key', 1000, async () => 42, 0)
  t.is(cache.get('key'), 0)
})

test('updates on tick', async t => {
  const clock = lol.createClock()
  const cache = new Cache(clock).every('key', 1000, async n => n + 1, 0)
  t.is(cache.get('key'), 0)
  clock.tick(1000)
  await cache.tick()
  t.is(cache.get('key'), 1)
  clock.tick(1000)
  await cache.tick()
  t.is(cache.get('key'), 2)
})

test('set() updates value', async t => {
  const clock = lol.createClock()
  const cache = new Cache(clock).every('key', 1000, async n => n + 1, 0)
  t.is(cache.get('key'), 0)
  clock.tick(1000)
  await cache.tick()
  cache.set('key', 100)
  t.is(cache.get('key'), 100)
  clock.tick(1000)
  await cache.tick()
  t.is(cache.get('key'), 101)
})

test('updated() updates value', async t => {
  const clock = lol.createClock()
  const cache = new Cache(clock).every('key', 1000, async n => n + 1, 0)
  t.is(cache.get('key'), 0)
  clock.tick(1000)
  await cache.tick()
  t.is(cache.get('key'), 1)
  cache.update('key', n => n - 1)
  t.is(cache.get('key'), 0)
  clock.tick(1000)
  await cache.tick()
  t.is(cache.get('key'), 1)
})
