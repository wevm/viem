/**
 * Validates JSDoc/TSDoc examples in `src/` by extracting every fenced
 * `ts twoslash` (or `ts`/`typescript`) code block from `/** ... *\u002F`
 * comments, writing each block to a temporary file, and typechecking the
 * lot in one go via `tsc --noEmit`.
 *
 * Comment extraction uses the TypeScript parser (no regex over arbitrary
 * source), so fenced code inside string/template literals can't be confused
 * with a real doc comment.
 *
 * Usage: `pnpm examples:check [--fix]`
 */
import * as childProcess from 'node:child_process'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import * as path from 'node:path'
import * as url from 'node:url'
import { format as oxfmtFormat } from 'oxfmt'
import * as ts from 'typescript'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sourceDir = path.resolve(rootDir, 'src')
const examplesDir = path.resolve(rootDir, '.examples')
const checkDir = path.join(examplesDir, 'check')

/**
 * Formatter options for example snippets. Match the project's `fmt`
 * config from `vite.config.ts` so snippets format identically to source,
 * but tighten `printWidth` so wrapped lines fit comfortably inside JSDoc.
 */
const formatOptions = {
  printWidth: 60,
  semi: false,
  singleQuote: true,
  sortImports: false,
  sortPackageJson: false,
  trailingComma: 'none',
} as const

type Block = {
  file: string
  index: number
  /** 1-based line in the source file where the opening fence lives. */
  startLine: number
  /** Code body with the JSDoc `*` prefix stripped. */
  code: string
  /** Absolute file offset of the first character of the opening fence line. */
  openStart: number
  /** Absolute file offset just after the closing fence's backticks. */
  closeEnd: number
  /** Leading indentation of each JSDoc `*` line. */
  indent: string
  /** Fence header (e.g. `ts twoslash`). */
  fence: string
}

/** Matches the opening line of a `ts` / `typescript` fenced block. */
const OPEN_FENCE =
  /^([ \t]*)\*[ \t]?```((?:ts|typescript)(?:[ \t]+twoslash)?[ \t]*)$/
/** Matches the closing ``` line of a fenced block. */
const CLOSE_FENCE = /^([ \t]*)\*[ \t]?```[ \t]*$/

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(entryPath, out)
    else if (
      entry.isFile() &&
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test-d.ts') &&
      !entry.name.endsWith('.snap-d.ts')
    )
      out.push(entryPath)
  }
  return out
}

/**
 * Returns the absolute file offsets of every line start in `source`, so we
 * can map `(comment.pos, lineOffsetWithinComment)` back to a precise file
 * position without re-counting characters.
 */
function lineStarts(source: string): number[] {
  const starts = [0]
  for (let i = 0; i < source.length; i++)
    if (source[i] === '\n') starts.push(i + 1)
  return starts
}

/**
 * Collect every JSDoc `/** ... *\u002F` comment range in the file by walking the
 * AST and asking TypeScript for the leading comments on each top-level node.
 * This is robust against backticks and triple-fences that appear inside real
 * string/template literals.
 */
function collectJsDocRanges(
  source: string,
  sf: ts.SourceFile,
): ts.CommentRange[] {
  const ranges: ts.CommentRange[] = []
  const seen = new Set<number>()
  const visit = (node: ts.Node) => {
    const leading = ts.getLeadingCommentRanges(source, node.pos) ?? []
    for (const range of leading) {
      if (range.kind !== ts.SyntaxKind.MultiLineCommentTrivia) continue
      if (source[range.pos + 2] !== '*') continue // must start with `/**`
      if (seen.has(range.pos)) continue
      seen.add(range.pos)
      ranges.push(range)
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sf, visit)
  return ranges
}

function extractBlocks(file: string, source: string): Block[] {
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS,
  )
  const ranges = collectJsDocRanges(source, sf)
  const starts = lineStarts(source)
  const blocks: Block[] = []

  for (const range of ranges) {
    const commentText = source.slice(range.pos, range.end)
    // 1-based line index of the comment's first character.
    const commentStartLine = computeLineNumber(starts, range.pos)
    const lines = commentText.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.replace(/\r$/, '')
      const open = line.match(OPEN_FENCE)
      if (!open) continue

      // Find the matching closing fence.
      let close = -1
      for (let j = i + 1; j < lines.length; j++) {
        if (CLOSE_FENCE.test(lines[j]!.replace(/\r$/, ''))) {
          close = j
          break
        }
      }
      if (close === -1) break // unterminated; let tsc surface the syntax issue

      const indent = open[1]!
      const fence = open[2]!.trim()

      // Absolute file offsets of the opening and closing fence lines.
      const openLineFileNo = commentStartLine + i // 1-based
      const closeLineFileNo = commentStartLine + close // 1-based
      const openStart = starts[openLineFileNo - 1]!
      const closeStartOffset = starts[closeLineFileNo - 1]!
      const closeLineText = lines[close]!.replace(/\r$/, '')
      const closeEnd = closeStartOffset + closeLineText.length

      // Strip ` * ` from each body line.
      const bodyLines = lines.slice(i + 1, close).map((raw) => {
        const stripped = raw.replace(/\r$/, '').replace(/^[ \t]*\*[ \t]?/, '')
        return stripped
      })

      blocks.push({
        file,
        index: blocks.length,
        startLine: openLineFileNo,
        code: bodyLines.join('\n'),
        openStart,
        closeEnd,
        indent,
        fence,
      })

      i = close
    }
  }

  return blocks
}

function computeLineNumber(starts: number[], offset: number): number {
  // Binary search for the largest start <= offset.
  let lo = 0
  let hi = starts.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1
    if (starts[mid]! <= offset) lo = mid
    else hi = mid - 1
  }
  return lo + 1
}

function writeExamples(blocks: Block[]): Map<string, Block> {
  if (fs.existsSync(examplesDir)) fs.rmSync(examplesDir, { recursive: true })
  fs.mkdirSync(checkDir, { recursive: true })

  const index = new Map<string, Block>()
  for (const block of blocks) {
    const relativeSource = path
      .relative(sourceDir, block.file)
      .replace(/[/.]/g, '_')
    const filename = `${relativeSource}__${block.index}.ts`

    // Type-check copy: hoist imports so they remain module-level, wrap the
    // body in an async function so top-level await and re-declared
    // identifiers do not collide across examples.
    const lines = block.code.split('\n')
    const imports: string[] = []
    const body: string[] = []
    for (const line of lines) {
      if (/^\s*import\s/.test(line)) imports.push(line)
      else body.push(line)
    }
    const wrapped = `${imports.join('\n')}\nasync function __example() {\n${body.join('\n')}\n}\nvoid __example\nexport {}\n`
    fs.writeFileSync(path.join(checkDir, filename), wrapped)

    index.set(filename, block)
  }

  fs.writeFileSync(
    path.join(checkDir, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tsconfig.base.json',
        compilerOptions: {
          types: ['node'],
          customConditions: ['src'],
          noUnusedLocals: false,
          noUnusedParameters: false,
          noEmit: true,
        },
        include: ['./**/*.ts'],
      },
      null,
      2,
    ),
  )

  return index
}

function runTsc(index: Map<string, Block>): number {
  let stdout = ''
  try {
    stdout = childProcess.execSync(
      `node_modules/.bin/tsc -p ${checkDir}/tsconfig.json --pretty false`,
      {
        cwd: rootDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
      },
    )
  } catch (error) {
    stdout = (error as { stdout?: string; stderr?: string }).stdout ?? ''
    stdout += (error as { stderr?: string }).stderr ?? ''
  }

  if (!stdout.trim()) return 0

  const errors = stdout.split('\n').filter((line) => line.includes('error TS'))

  if (errors.length === 0) return 0

  console.log('\nJSDoc example type errors:\n')
  for (const error of errors) {
    const match = error.match(
      /(?:\.examples\/check\/|check\/)?([^(/]+)\((\d+),(\d+)\): (.+)/,
    )
    if (!match) {
      console.log(error)
      continue
    }
    const [, filename, line, col, message] = match
    const block = index.get(filename!)
    if (!block) {
      console.log(error)
      continue
    }
    const rel = path.relative(rootDir, block.file)
    console.log(
      `${rel}:${block.startLine}  example #${block.index + 1}  (snippet line ${line}:${col})`,
    )
    console.log(`  ${message}\n`)
  }
  return errors.length
}

async function runFormat(
  index: Map<string, Block>,
  fix: boolean,
): Promise<{ failures: number; fixes: Map<string, string> }> {
  const fixes = new Map<string, string>()
  for (const [filename, block] of index) {
    const original = `${block.code}\n`
    const transformed = ensureChainMainnet(original)
    const result = await oxfmtFormat(filename, transformed, formatOptions)
    if (result.errors.some((e) => e.severity === 'Error')) continue
    if (result.code !== original) fixes.set(filename, result.code)
  }

  if (fixes.size === 0) return { failures: 0, fixes }

  if (fix) {
    applyFixes(index, fixes)
    return { failures: 0, fixes }
  }

  console.log('\nJSDoc example formatting issues:\n')
  for (const filename of fixes.keys()) {
    const block = index.get(filename)!
    const rel = path.relative(rootDir, block.file)
    console.log(`${rel}:${block.startLine}  example #${block.index + 1}`)
    console.log(
      `  Snippet is not formatted. Run \`pnpm examples:check --fix\` to apply.\n`,
    )
  }
  return { failures: fixes.size, fixes }
}

function applyFixes(
  index: Map<string, Block>,
  fixes: Map<string, string>,
): void {
  // Group fixes by source file so we patch each source in one pass.
  const byFile = new Map<string, { block: Block; formatted: string }[]>()
  for (const [filename, formatted] of fixes) {
    const block = index.get(filename)!
    const list = byFile.get(block.file) ?? []
    list.push({ block, formatted })
    byFile.set(block.file, list)
  }

  for (const [file, entries] of byFile) {
    let source = readFileSyncSafe(file)
    // Replace later blocks first so earlier offsets stay valid.
    entries.sort((a, b) => b.block.openStart - a.block.openStart)

    for (const { block, formatted } of entries) {
      // Sanity-check that the slice we are about to overwrite is still the
      // fence we extracted. Any drift means our offsets are wrong — refuse
      // to write instead of silently corrupting the source.
      const original = source.slice(block.openStart, block.closeEnd)
      const openLine = `${block.indent}* \`\`\`${block.fence}`
      if (
        !original.startsWith(openLine) ||
        !original.trimEnd().endsWith('```')
      ) {
        throw new Error(
          `examples:check --fix refused to write ${file}: ` +
            `block #${block.index + 1} at offset ${block.openStart} no longer matches its fence. ` +
            `Re-run the script.`,
        )
      }

      const formattedBody = formatted.replace(/\n+$/, '')
      const indent = block.indent
      const bodyLines = formattedBody
        .split('\n')
        .map((line) => (line ? `${indent}* ${line}` : `${indent}*`))
        .join('\n')
      const replacement = `${indent}* \`\`\`${block.fence}\n${bodyLines}\n${indent}* \`\`\``
      source =
        source.slice(0, block.openStart) +
        replacement +
        source.slice(block.closeEnd)
    }

    fs.writeFileSync(file, source)
  }
  console.log(
    `Applied formatter to ${fixes.size} JSDoc example${fixes.size === 1 ? '' : 's'}.`,
  )
}

/**
 * Enforces the standard example client convention from AGENTS.md:
 *  - every `Client.create({ ... })` carries a `chain: mainnet` slot
 *  - `mainnet` is imported from `viem/chains`
 *
 * Idempotent: snippets that already follow the convention are returned
 * unchanged so they survive subsequent `--fix` runs without churn.
 */
function ensureChainMainnet(code: string): string {
  if (!/\bClient\.create\(\s*\{/.test(code)) return code

  let next = code.replace(
    /Client\.create\(\s*\{([^}]*)\}/g,
    (match, body: string) => {
      if (/\bchain\s*:/.test(body)) return match
      const trimmed = body.replace(/^\s+/, '').replace(/\s+$/, '')
      const inner =
        trimmed.length === 0 ? 'chain: mainnet' : `chain: mainnet, ${trimmed}`
      return `Client.create({ ${inner} }`
    },
  )

  if (next === code) return code

  // Ensure `mainnet` is imported from `viem/chains`. Merge into an
  // existing `viem/chains` import when one is present; otherwise insert a
  // new import line after the last top-level import.
  if (!/from\s+['"]viem\/chains['"]/.test(next)) {
    const lines = next.split('\n')
    let lastImport = -1
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*import\s/.test(lines[i]!)) lastImport = i
    }
    const importLine = `import { mainnet } from 'viem/chains'`
    if (lastImport === -1) {
      next = `${importLine}\n${next}`
    } else {
      lines.splice(lastImport + 1, 0, importLine)
      next = lines.join('\n')
    }
  } else if (!/\bmainnet\b[^'"\n]*from\s+['"]viem\/chains['"]/.test(next)) {
    next = next.replace(
      /import\s*\{([^}]*)\}\s*from\s*(['"])viem\/chains\2/,
      (_match, names: string, quote: string) => {
        const list = names
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean)
        if (!list.includes('mainnet')) list.unshift('mainnet')
        return `import { ${list.join(', ')} } from ${quote}viem/chains${quote}`
      },
    )
  }

  return next
}

function readFileSyncSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

const fix = process.argv.includes('--fix')

const sources = await walk(sourceDir)
const blocks = (
  await Promise.all(
    sources.map(async (file) => {
      const source = await fsPromises.readFile(file, 'utf8')
      return extractBlocks(file, source)
    }),
  )
).flat()

if (blocks.length === 0) {
  console.log('No JSDoc examples found.')
  process.exit(0)
}

const index = writeExamples(blocks)
console.log(
  `Checking ${blocks.length} JSDoc example${blocks.length === 1 ? '' : 's'} from ${sources.length} files...`,
)
const typeErrors = runTsc(index)
const { failures: formatErrors } = await runFormat(index, fix)

if (typeErrors + formatErrors > 0) {
  if (typeErrors)
    console.log(
      `\n${typeErrors} type error${typeErrors === 1 ? '' : 's'} in JSDoc examples.`,
    )
  if (formatErrors)
    console.log(
      `${formatErrors} formatting issue${formatErrors === 1 ? '' : 's'} in JSDoc examples.`,
    )
  process.exit(1)
}

fs.rmSync(examplesDir, { recursive: true })
console.log(`All ${blocks.length} JSDoc examples typecheck and format cleanly.`)
