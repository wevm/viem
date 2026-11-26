/**
 * Writes what each public export costs a consumer: the gzipped size of the bundle rolldown builds
 * for `export { name } from '<entry>'`, for every runtime export of every entry point in
 * src/package.json, and for `export * from '<entry>'`. Rolldown tree-shakes and minifies each
 * import for the browser, as a consumer's bundler would. The builds run in a pool of
 * `UPHILL_CONCURRENCY` builds, or one per core.
 *
 * @module
 */

import * as fs from 'node:fs'
import { isBuiltin } from 'node:module'
import * as os from 'node:os'
import * as path from 'node:path'
import { type OutputChunk, rolldown } from 'rolldown'

const metrics = process.env.UPHILL_METRICS
if (!metrics) throw new Error('UPHILL_METRICS is not set')

const started = performance.now()
const root = process.cwd()
const esm = path.join(root, 'src/_esm/')
const pkg = await Bun.file(path.join(root, 'src/package.json')).json()
const concurrency =
  Number(process.env.UPHILL_CONCURRENCY) || os.availableParallelism()

// A consumer's bundler finds viem in its node_modules and resolves each subpath through the exports
// map in src/package.json. Rolldown follows the link to the real src, so viem's dependencies
// resolve from viem's node_modules.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'footprint-'))
fs.mkdirSync(path.join(scratch, 'node_modules'))
fs.symlinkSync(path.join(root, 'src'), path.join(scratch, 'node_modules/viem'))

type Job = { item: string; code: string }
const jobs: Job[] = []
for (const [subpath, target] of Object.entries<{ import: string } | string>(
  pkg.exports,
)) {
  if (typeof target === 'string') continue
  const entry = `viem${subpath.slice(1)}`
  const names = Object.keys(await import(path.join(root, 'src', target.import)))
  // A whole entry is named by its bare specifier, so a target pattern such as `viem/chains:*`
  // matches its exports and not the entry itself.
  jobs.push({ item: entry, code: `export * from '${entry}'\n` })
  for (const name of names)
    jobs.push({
      item: `${entry}:${name}`,
      code: `export { ${name} } from '${entry}'\n`,
    })
}

// Each worker takes the next job until none are left, or until a build fails.
const lines: string[] = []
let next = 0
let failure: string | undefined
await Promise.all(
  Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
    while (failure === undefined && next < jobs.length) {
      const index = next++
      const job = jobs[index]!
      try {
        lines[index] = await measure(index, job)
      } catch (error) {
        failure ??= `${job.item}: ${(error as Error).message}`
      }
    }
  }),
)
fs.rmSync(scratch, { force: true, recursive: true })

if (failure) {
  console.error(`footprint: could not measure ${failure}`)
  process.exit(1)
}

fs.appendFileSync(metrics, `${lines.join('\n')}\n`)
console.log(
  `footprint: measured ${jobs.length} items in ${((performance.now() - started) / 1000).toFixed(1)}s, ${concurrency} builds at a time`,
)

/** Bundles one consumer module, and returns its `entry-size` line. */
async function measure(index: number, job: Job): Promise<string> {
  const input = path.join(scratch, `${index}.js`)
  fs.writeFileSync(input, job.code)
  // Dropping JSDoc and the `// <module path>` comments leaves the minified code unchanged, and keeps
  // comments out of each module's rendered bytes, which rank what the bundle holds. Without them,
  // the ranking would also depend on where the checkout is.
  const bundle = await rolldown({
    input,
    platform: 'browser',
    logLevel: 'silent',
    experimental: { attachDebugInfo: 'none' },
  })
  const output = await bundle
    .generate({ format: 'esm', minify: true, comments: { jsdoc: false } })
    .finally(() => bundle.close())

  // The consumer loads the entry chunk and every chunk it imports statically. Chunks that a dynamic
  // `import()` loads stay out, since they load only when that code runs.
  const chunks = new Map<string, OutputChunk>()
  for (const file of output.output)
    if (file.type === 'chunk') chunks.set(file.fileName, file)
  const loaded = new Set<OutputChunk>()
  const load = (chunk: OutputChunk) => {
    if (loaded.has(chunk)) return
    loaded.add(chunk)
    for (const id of chunk.imports) {
      const imported = chunks.get(id)
      if (imported) load(imported)
      // Node built-ins, which `viem/node` imports, are left to the runtime. Any other import left
      // in the output is a module rolldown could not find.
      else if (!isBuiltin(id)) throw new Error(`could not resolve "${id}"`)
    }
  }
  load(output.output[0])

  let size = 0
  for (const chunk of loaded) size += Bun.gzipSync(chunk.code).length
  const line = `entry-size ${quote(job.item)} ${size}B`
  if (size <= 5000) return line

  // Above 5 kB, name the three packages or viem modules that render the most bytes, so a reader
  // knows what to cut first.
  const bytes = new Map<string, number>()
  let total = 0
  for (const chunk of loaded)
    for (const [id, module] of Object.entries(chunk.modules)) {
      if (module.renderedLength === 0) continue
      const name = owner(id)
      bytes.set(name, (bytes.get(name) ?? 0) + module.renderedLength)
      total += module.renderedLength
    }
  const top = [...bytes]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .map(
      ([name, length]) => [name, Math.round((length / total) * 100)] as const,
    )
    .filter(([, share]) => share > 0)
    .slice(0, 3)
    .map(([name, share]) => `${name} ${share}%`)
  return `${line} note ${quote(`most bytes: ${top.join(', ')}`)}`
}

/** Returns the package a module belongs to, or the path of a viem module inside src/_esm. */
function owner(id: string): string {
  const modules = id.lastIndexOf('/node_modules/')
  if (modules !== -1) {
    const [scope, name] = id.slice(modules + '/node_modules/'.length).split('/')
    return scope!.startsWith('@') ? `${scope}/${name}` : scope!
  }
  if (id.startsWith(esm)) return id.slice(esm.length)
  return id.replace('\0', '')
}

/** Quotes an item or note for a metric line. */
function quote(text: string): string {
  return `"${text.replace(/["\\]/g, '\\$&')}"`
}
