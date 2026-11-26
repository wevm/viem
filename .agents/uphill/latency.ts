/**
 * Writes whether each async function in viem's source awaits independent work in sequence, work
 * one `Promise.all` could run at once. TypeScript parses every source file into one Program, and
 * its checker resolves each identifier to its symbol, so a value read under another name or
 * through a destructured binding still counts as a dependency. `latency-rules.ts` holds the rules.
 *
 * Uphill passes the metrics file in `$UPHILL_METRICS`. Without it, the lines print to standard
 * output. `LATENCY_SRC` points the script at another directory, such as `latency-fixtures`.
 *
 * @module
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

import ts from 'typescript'

import { analyzer, isAsync } from './latency-rules.ts'

const start = performance.now()
const dir = path.resolve(process.env.LATENCY_SRC ?? 'src')

// viem's own compiler options, so imports resolve the way they do in its type check.
const config = ts.readConfigFile('src/tsconfig.json', ts.sys.readFile)
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, 'src')
// Build output, tests, benches, and declarations are not source a consumer's calls run.
const files = ts.sys
  .readDirectory(
    dir,
    ['.ts'],
    ['**/_esm', '**/_cjs', '**/_types', '**/node_modules'],
  )
  .filter((file) => !/\.(test|test-d|bench|bench-d|d)\.ts$/.test(file))
  .sort()
if (files.length === 0) throw new Error(`no source files in ${dir}`)

const program = ts.createProgram(files, {
  ...options,
  composite: false,
  incremental: false,
  noEmit: true,
})
const { analyze } = analyzer(program.getTypeChecker())

const lines: string[] = []
const counts = { pass: 0, fail: 0 }
for (const file of files) {
  const source = program.getSourceFile(file)
  if (!source) throw new Error(`${file} is not in the program`)
  const relative = path.relative(process.cwd(), file)
  const seen = new Map<string, number>()
  const visit = (node: ts.Node) => {
    if (isAsync(node)) {
      let item = `${relative}:${nameOf(node)}`
      // Two functions with one name, such as two `<arrow>`s in one function, take an ordinal.
      const count = (seen.get(item) ?? 0) + 1
      seen.set(item, count)
      if (count > 1) item += `#${count}`
      const findings = analyze(node)
      counts[findings.length ? 'fail' : 'pass']++
      const note = findings
        .slice(0, 2)
        .map((finding) => finding.note)
        .concat(findings.length > 2 ? [`${findings.length - 2} more`] : [])
        .join('; ')
      lines.push(
        `waterfalls ${quote(item)} ${findings.length ? `fail note ${quote(note)}` : 'pass'}`,
      )
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

if (process.env.UPHILL_METRICS)
  fs.appendFileSync(process.env.UPHILL_METRICS, `${lines.join('\n')}\n`)
else console.log(lines.join('\n'))
console.error(
  `latency: ${counts.pass + counts.fail} async functions in ${files.length} files, ${counts.pass} pass, ${counts.fail} fail, ${((performance.now() - start) / 1000).toFixed(1)}s`,
)

/**
 * Names a function by the declarations that enclose it, such as `call`, `createClient.request`,
 * or `getLogs.<arrow>`. Line numbers shift with every edit, so they stay out of names.
 */
function nameOf(fn: ts.Node): string {
  const parts: string[] = []
  let named: ts.Node | undefined
  for (let node: ts.Node = fn; !ts.isSourceFile(node); node = node.parent) {
    if (node === named) continue
    if (ts.isFunctionLike(node)) {
      const own = ownName(node)
      parts.unshift(own.name)
      named = own.from
    } else if (ts.isClassLike(node)) parts.unshift(node.name?.text ?? '<class>')
    else if (ts.isModuleDeclaration(node)) parts.unshift(node.name.text)
    else if (
      (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) ||
      ts.isPropertyAssignment(node) ||
      ts.isPropertyDeclaration(node)
    )
      parts.unshift(propertyName(node.name))
  }
  return parts.join('.')
}

/** A function's own name, and the declaration it takes the name from when it has none. */
function ownName(fn: ts.SignatureDeclaration): {
  name: string
  from?: ts.Node
} {
  if (ts.isConstructorDeclaration(fn)) return { name: 'constructor' }
  if (fn.name && !ts.isComputedPropertyName(fn.name))
    return { name: propertyName(fn.name) }
  let parent = fn.parent
  while (
    ts.isParenthesizedExpression(parent) ||
    ts.isAsExpression(parent) ||
    ts.isSatisfiesExpression(parent) ||
    ts.isNonNullExpression(parent)
  )
    parent = parent.parent
  if (
    (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) ||
    ts.isPropertyAssignment(parent) ||
    ts.isPropertyDeclaration(parent)
  )
    return { name: propertyName(parent.name), from: parent }
  if (
    ts.isBinaryExpression(parent) &&
    parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    (ts.isIdentifier(parent.left) || ts.isPropertyAccessExpression(parent.left))
  )
    return {
      name: ts.isIdentifier(parent.left)
        ? parent.left.text
        : parent.left.name.text,
    }
  if (ts.isExportAssignment(parent)) return { name: 'default' }
  return { name: ts.isArrowFunction(fn) ? '<arrow>' : '<function>' }
}

function propertyName(name: ts.Node): string {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text
  if (ts.isStringLiteralLike(name) || ts.isNumericLiteral(name))
    return name.text
  return name.getText()
}

/** Quotes an item or note for a metric line, escaping `"` and `\`. */
function quote(text: string): string {
  return `"${text.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}
