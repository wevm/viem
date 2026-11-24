/**
 * Vitest configuration that records what viem's own tests call each exported function with. It
 * reuses `test/vitest.config.ts`'s aliases, setup files, and global setups, which start anvil, the
 * bundler, and Tempo (in Docker), and adds a transform that wraps every export of `src/**` (test
 * files excluded) with `globalThis.__uphillWrap`, which `speed-record-setup.ts` installs.
 *
 * Its `core` project also runs the account-abstraction, celo, linea, and op-stack tests, which
 * viem's configuration leaves out, because they call those entry points' functions. Without
 * anvil (Foundry) or Docker, the tests that need them fail at once and record less. Its `calls`
 * project runs `speed-calls.test.ts`, which calls the public functions no test calls.
 *
 * `speed.ts` runs it with `UPHILL_SPEED_RECORD_DIR` set; no test file changes.
 *
 * @module
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

import * as acorn from 'acorn'
import MagicString from 'magic-string'
import { defineConfig, type Plugin } from 'vitest/config'

import base from '../../test/vitest.config.ts'

// Tempo's dev node logs every block, and the recording's main process reads the logs of every
// Tempo container; viem's CI cadence makes that 25 times fewer lines than the local 2ms default.
process.env.VITE_TEMPO_BLOCK_TIME ??= '50ms'

const root = path.resolve(import.meta.dirname, '../..')
const setup = path.join(import.meta.dirname, 'speed-record-setup.ts')
const workers = Number(process.env.UPHILL_SPEED_RECORD_WORKERS) || 2
// Fuzz tests draw new inputs every run, so they would change what is benched each time the source
// is recorded.
const exclude = [
  ...(base.test?.exclude ?? []),
  '**/*.fuzz.test.ts',
  '**/*.node-fuzz.test.ts',
]
const projects = (base.test?.projects ?? []) as {
  test?: {
    name?: string
    exclude?: string[]
    setupFiles?: string[]
    globalSetup?: string[]
    hookTimeout?: number
    testTimeout?: number
    sequence?: { groupOrder?: number }
  }
}[]
const viem = (name: string) => {
  const project = projects.find((project) => project.test?.name === name)?.test
  if (!project) throw new Error(`test/vitest.config.ts has no ${name} project.`)
  const { exclude = [], ...rest } = project
  return { ...rest, exclude: exclude.filter(Boolean) }
}
const core = viem('core')
const tempo = viem('tempo')
// `viem/<entry>` resolves through src/<entry>/package.json to the build in src/_esm, which the
// transform does not wrap, so the 47 test files that import entry points would record nothing
// through them. Each entry point resolves to its source instead.
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, 'src/package.json'), 'utf8'),
) as { exports: Record<string, { import?: string }> }
const entries = Object.entries(pkg.exports).flatMap(([entry, target]) =>
  entry.startsWith('./') && target.import
    ? [
        {
          find: new RegExp(
            `^viem/${entry.slice(2).replace(/[/.-]/g, '\\$&')}$`,
          ),
          replacement: path.join(
            root,
            'src',
            target.import.replace(/^\.\/_esm\//, '').replace(/\.js$/, '.ts'),
          ),
        },
      ]
    : [],
)

// viem re-exports some ox modules, such as `Bytes` and `TokenId` from viem/tempo, whose functions
// are viem's public functions too. ox is inlined, so the transform sees its modules, and the
// modules viem's source re-exports are wrapped like viem's own, keyed `ox:<file in the
// package>#<export>`; their calls are the ones viem's code and tests make. A name re-exported from
// an index, such as `TokenId` from `ox/tempo`, is that module; one from a module, such as
// `randomPrivateKey` from `ox/P256`, wraps the module.
const oxRoot = fs.realpathSync(
  path.join(
    root,
    fs.existsSync(path.join(root, 'src/node_modules/ox'))
      ? 'src/node_modules/ox'
      : 'node_modules/ox',
  ),
)
const oxModules = (() => {
  const ox = JSON.parse(
    fs.readFileSync(path.join(oxRoot, 'package.json'), 'utf8'),
  ) as { exports: Record<string, { import?: string }> }
  const modules = new Set<string>()
  const sources = fs
    .globSync('src/**/*.ts', { cwd: root })
    .filter(
      (file) =>
        !/(^|\/)_(esm|cjs|types)\/|\.(test|test-d|bench|bench-d)\.ts$/.test(
          file,
        ),
    )
  for (const source of sources) {
    const text = fs
      .readFileSync(path.join(root, source), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
    for (const [, all, names, subpath] of text.matchAll(
      /export\s+(?:(\*\s+as\s+\w+)|\{([^}]*)\})\s+from\s+'ox\/([\w/]+)'/g,
    )) {
      const target = ox.exports[`./${subpath}`]?.import
      if (!target) continue
      if (all || path.basename(target) !== 'index.js')
        modules.add(path.normalize(target))
      else
        for (const name of names!.split(',')) {
          const local = name
            .replace(/\/\/.*$/gm, '')
            .trim()
            .split(/\s+as\s+/)[0]!
          if (/^\w+$/.test(local))
            modules.add(path.join(path.dirname(target), `${local}.js`))
        }
    }
  }
  return modules
})()

export default defineConfig({
  root,
  plugins: [record()],
  test: {
    server: { deps: { inline: [/[\\/]ox[\\/]_esm[\\/]/] } },
    alias: [
      ...entries,
      ...((base.test?.alias ?? []) as { find: RegExp; replacement: string }[]),
    ],
    exclude,
    // A failing test records the calls it made before failing; retrying it only wastes time.
    retry: 0,
    pool: 'forks',
    maxWorkers: workers,
    // The machine is shared, and a worker whose heap grows unchecked can get the whole run killed
    // for memory; a capped heap collects sooner. Logs of passing tests are not kept either.
    execArgv: ['--max-old-space-size=1280'],
    silent: 'passed-only',
    // Every test file runs in a fresh process. With anvil and Tempo up, sharing a worker across
    // files saves little (7% on src/actions/public) and lets watchers and fixtures that one file
    // leaves behind fill the worker's heap and fail later files.
    isolate: true,
    projects: [
      {
        extends: true,
        test: {
          ...core,
          include: ['src/**/*.test.ts'],
          exclude: [
            ...exclude,
            // viem runs this one only with TEST_RLP=true; it is slow.
            '**/utils/encoding/toRlp.test.ts',
            'src/tempo/**',
          ],
          setupFiles: [setup, ...(core.setupFiles ?? [])],
        },
      },
      {
        extends: true,
        test: {
          ...tempo,
          include: ['src/tempo/**/*.test.ts'],
          exclude: [...exclude, ...tempo.exclude],
          setupFiles: [setup, ...(tempo.setupFiles ?? [])],
          // Each file's setup boots a Tempo container and mints liquidity, which takes longer than
          // viem's 20s when the recording shares the machine.
          hookTimeout: Math.max(tempo.hookTimeout ?? 0, 60_000),
          testTimeout: Math.max(tempo.testTimeout ?? 0, 30_000),
        },
      },
      {
        extends: true,
        test: {
          name: 'calls',
          include: ['.agents/uphill/speed-calls.test.ts'],
          setupFiles: [setup],
        },
      },
    ],
  },
})

/** Wraps each export of a `src/**` module once the module has run. */
function record(): Plugin {
  return {
    name: 'uphill-speed-record',
    enforce: 'post',
    transform(code, id) {
      const file = (() => {
        if (id.startsWith(`${oxRoot}/`)) {
          const module = path.relative(oxRoot, id)
          return oxModules.has(module) ? `ox:${module}` : undefined
        }
        if (!id.startsWith(`${root}/src/`) || !id.endsWith('.ts')) return
        if (/\/_(esm|cjs|types)\/|\.(test|test-d|bench|bench-d)\.ts$/.test(id))
          return
        return path.relative(root, id)
      })()
      if (!file) return
      const program = acorn.parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'module',
      }) as unknown as { body: Node[] }
      const output = new MagicString(code)
      const consts = new Map<string, Node>()
      const imports = new Set<string>()
      const exports: [local: string, exported: string][] = []
      const relet = new Set<Node>()
      let reexports = 0

      for (const node of program.body) {
        if (node.type === 'ImportDeclaration')
          for (const specifier of node.specifiers!)
            imports.add(specifier.local!.name!)
        else if (node.type === 'VariableDeclaration' && node.kind === 'const')
          for (const declarator of node.declarations!)
            if (declarator.id!.type === 'Identifier')
              consts.set(declarator.id!.name!, node)
        if (node.type !== 'ExportNamedDeclaration') continue
        const declaration = node.declaration
        if (
          declaration?.type === 'FunctionDeclaration' ||
          declaration?.type === 'ClassDeclaration'
        )
          exports.push([declaration.id!.name!, declaration.id!.name!])
        else if (declaration?.type === 'VariableDeclaration') {
          for (const declarator of declaration.declarations!)
            if (declarator.id!.type === 'Identifier')
              exports.push([declarator.id!.name!, declarator.id!.name!])
          if (declaration.kind === 'const') relet.add(declaration)
        } else if (node.source) {
          // A re-export from a dependency, such as `export { parseAbi } from 'abitype'`, becomes a
          // local binding so calls through viem's entry points record under this module.
          const source = String(node.source.value)
          if (source.startsWith('.') || source.startsWith('/')) continue
          const locals: string[] = []
          const specifiers = node.specifiers!.filter(
            (specifier) =>
              specifier.local!.type === 'Identifier' &&
              specifier.exported!.type === 'Identifier',
          )
          if (specifiers.length !== node.specifiers!.length) continue
          const imported = specifiers.map((specifier) => {
            const local = `__uphill_reexport_${reexports++}`
            locals.push(`${specifier.exported!.name} = ${local}`)
            exports.push([specifier.exported!.name!, specifier.exported!.name!])
            return `${specifier.local!.name} as ${local}`
          })
          output.overwrite(
            node.start,
            node.end,
            `import { ${imported.join(', ')} } from ${JSON.stringify(source)};\nexport let ${locals.join(', ')};`,
          )
        } else
          for (const specifier of node.specifiers!) {
            if (specifier.local!.type !== 'Identifier') continue
            exports.push([
              specifier.local!.name!,
              specifier.exported!.name ?? String(specifier.exported!.value),
            ])
          }
      }

      const wraps: string[] = []
      for (const [local, exported] of exports) {
        if (imports.has(local)) continue
        const declaration = consts.get(local)
        if (declaration) relet.add(declaration)
        wraps.push(
          `${local} = __w(${local}, ${JSON.stringify(file)}, ${JSON.stringify(exported)});`,
        )
      }
      if (!wraps.length) return
      for (const declaration of relet)
        output.overwrite(declaration.start, declaration.start + 5, 'let  ')
      output.append(
        `\n;{ const __w = globalThis.__uphillWrap; if (__w) { ${wraps.join(' ')} } }\n`,
      )
      return {
        code: output.toString(),
        // Line-level maps: the transform appends to modules and changes nothing in place but
        // `const` to `let`, and fine-grained maps of every module cost the main process memory.
        map: output.generateMap({ source: id }),
      }
    },
  }
}

type Node = {
  type: string
  start: number
  end: number
  kind?: string
  name?: string
  value?: unknown
  id?: Node
  local?: Node
  exported?: Node
  source?: Node
  declaration?: Node | null
  declarations?: Node[]
  specifiers?: Node[]
}
