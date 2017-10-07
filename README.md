# interval-cache

[![NPM version](https://badge.fury.io/js/interval-cache.svg)](http://badge.fury.io/js/interval-cache)
[![Dependency Status](https://david-dm.org/danneu/interval-cache.svg)](https://david-dm.org/danneu/interval-cache)

[![NPM](https://nodei.co/npm/interval-cache.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/interval-cache/)

A simple cache for Node that updates its keys in a concurrent background loop.

- Each key of the cache has its own refresh interval and a async function that fetches the latest value (e.g. runs an expensive database query).
- At each key's interval, their async function is run which returns a promise.
  - On success, the key's value is updated.
  - On error, it logs to stderr, the key's value is unchanged, and it will try again next time.
- Fetching values is always instant.

## Quickstart

``` javascript
// cache.js
const Cache = require('interval-cache')

module.exports = new Cache()
  // Recount database users every 30 seconds
  .every('user-count', 1000 * 30, () => {
    return db.query('select count(*) from users')
  }, 0)
  // Update sitemap every 5 minutes
  .every('all-urls', 1000 * 60 * 5, () => listUrls(), [])
  // Start the tick loop
  .start()
```

The idea is that requests should never have to wait on cache access.

``` javascript
const cache = require('./cache')

router.get('/', async (ctx) => {
  ctx.type = 'html'
  ctx.body = `<p>User count: ${cache.get('user-count')}</p>`
})

router.get('/sitemap.txt', async (ctx) => {
  ctx.type = 'text'
  ctx.body = cache.get('all-urls').join('\n')
})
```

## API

An IntervalCache instance has these methods:

### `.get(key) -> any`

Get the current cached value for the given key.

### `.set(key, value) -> Cache`

Updates a key and resets the interval.

If `.set()` is called while a key is calculating its next value,
the calculated value will be discarded once it's finished since `.set()`
is fresher.

### `.update(key, (oldValue) => newValue) -> Cache`

A convenience function for updating a cache key based on its previous value.

### `.every(key, milliseconds, stepAsync, initValue) -> Cache`

Register a task that updates the cache value at the given millisecond interval.

- `stepAsync` is an async function `stepAsync(prevValue) -> Promise<nextValue>`.
- If `stepAsync` returns a rejected promise, the cache value is not updated,
  and it will run wait the full interval before trying again.
- `initValue` is the initial key value until `stepAsync` resolves.

### `.once(key, stepAsync, initValue) -> Cache`

Register a key that updates just one time when the cache
is started.

Useful for values that you want to refresh yourself with
`Cache#refresh(key)`.

### `.refresh(key) -> Promise<nextValue>`

Triggers an asynchronous update. Useful when you know a key is stale and
you want it to update now instead of waiting for the next interval.

**Example:** If you regenerate your homepage cache every 60 seconds, yet a
spambot's posts are showing up on your homepage's 'Latest 10 posts' list,
you'd want to force a `.refresh()` any time you nuke a spambot instead of
leaving your homepage defaced until 60 seconds rolls around again.

### `.start() -> Cache`

Starts the concurrent loop that schedules the `.every()` tasks to be run.

### `.stop() -> Cache`

Stops the loop. The cache will be frozen until it is started again.

## License

MIT
