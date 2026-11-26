/**
 * Checks call sites from viem's tests, one fresh `ts.Program` and checker per measured call, and
 * reports what each call cost the checker. types-calls.ts starts a pool of these in Node and sends
 * one job per line on standard input; each result goes back as one line on standard output.
 *
 * - `entries` walks each public function's name, such as `viem/tempo:Actions.token.transfer`, from
 *   its entry point's source to the declaration it resolves to.
 * - `scan` lists the calls in one test file whose callee resolves, through imports and re-exports,
 *   to a declaration, with what measuring each one needs.
 * - `measure` checks chosen calls of one test file. Each call is copied into a declaration of its
 *   own, `const $uphill = <call>`, just before the statement that holds it, so it is checked
 *   without the context around it, as `const result = readContract(...)` is. A fresh checker first
 *   resolves everything the call references from outside it: the imports, the test's fixtures such
 *   as a large ABI, and the callee's declared signature. Then it checks the call alone and counts
 *   the instantiations that cost, in three parts: resolving the call (inferring its type
 *   arguments and checking its arguments), its return type with any calls chained on it, and
 *   awaiting the result.
 *
 * Programs use test/tsconfig.json, the options viem's type tests and attest benches use, so `viem`
 * and `~test` resolve to the sources.
 *
 * @module
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as readline from 'node:readline'

import ts from 'typescript'

import { benchOptions, createHost, root } from './types-host.ts'

/** Walks public functions' names to the declarations they resolve to. */
export type EntriesJob = {
  kind: 'entries'
  id: number
  /** Each entry point's name and source file, in src/package.json order. */
  entries: { name: string; file: string }[]
  names: string[]
}
export type EntriesResult = {
  id: number
  /** Each name's declaration keys, which `scan` reports for a callee that resolves to it. */
  declarations: Record<string, string[]>
  missing: string[]
}

/** Lists the calls in one test file. */
export type ScanJob = { kind: 'scan'; id: number; file: string }
/** One call in a test file. Positions are offsets in the file's text. */
export type Site = {
  /** The callee's declaration key: its file, relative to the checkout, and position. */
  declaration: string
  /** The test that holds the call, such as `readContract.test.ts > wagmi > default`. */
  test: string
  line: number
  /** The call's span. */
  start: number
  end: number
  /** The span measured: the call, and any calls chained on its result, such as `.extend(...)`. */
  outer: number
  /** Where the copy of the call goes: the full start of the statement that holds it. */
  anchor: number
  /** Why the call cannot be measured, if it cannot. */
  skip?: string | undefined
  /** The callee's text and its chained calls, for notes. */
  callee: string
  chain?: string | undefined
}
/** The sites, and the text they were found in, which `measure` copies calls from. */
export type ScanResult = {
  id: number
  file: string
  text: string
  sites: Site[]
}

/** Measures chosen calls of one test file, each in a fresh checker. */
export type MeasureJob = {
  kind: 'measure'
  id: number
  file: string
  /** The text the scan found the sites in, even if the file has changed on disk since. */
  text: string
  sites: {
    site: number
    start: number
    end: number
    outer: number
    anchor: number
  }[]
  /** Calls that cost at least this many instantiations are checked with their client alone. */
  probeAbove: number
}
export type Measurement = {
  site: number
  instantiations: number
  /** Instantiations of each part: resolving the call, its return type and chain, awaiting it. */
  parts: { call: number; result: number; awaited: number }
  /** Instantiations the warm-up spent on what the call references, which do not count. */
  warm: number
  /** The callee's declared parameters and return type, for notes. */
  signature: { parameters: string[]; returns: string }
  errors: { code: number; message: string }[]
  /** For a costly call that passes a client first: its text, and what the call costs with it alone. */
  client?: { first: string; instantiations: number } | undefined
}
export type MeasureResult = { id: number; measurements: Measurement[] }

export type Job = EntriesJob | ScanJob | MeasureJob

/** The name of the declaration each measured call is copied into. */
const copyName = '$uphill'
/** Diagnostics that the copy causes by itself, such as never reading `$uphill`. */
const ignoredCodes = new Set([6133, 6192, 6196, 6198, 6385, 6387, 80007])
/** A promise's methods, which a chain stops at without resolving the call's type to see. */
const promiseMethods = new Set(['then', 'catch', 'finally'])
/** Calls whose callee is one of these name the test, not a function under test. */
const testFunctions = new Set(['describe', 'test', 'it', 'bench', 'suite'])

const host = createHost(benchOptions)
const templates = new Map<string, ts.Program>()

const lines = readline.createInterface({ input: process.stdin })
for await (const line of lines) {
  const job: Job = JSON.parse(line)
  const result =
    job.kind === 'entries'
      ? entries(job)
      : job.kind === 'scan'
        ? scan(job)
        : measure(job)
  process.stdout.write(`${JSON.stringify(result)}\n`)
}
// The last line reports the worker's peak resident memory.
process.stdout.write(
  `${JSON.stringify({ peak: process.resourceUsage().maxRSS * 1024 })}\n`,
)

function entries(job: EntriesJob): EntriesResult {
  const program = ts.createProgram({
    rootNames: job.entries.map((entry) => entry.file),
    options: benchOptions,
    host,
  })
  const checker = program.getTypeChecker()
  const modules = new Map<string, ts.Symbol>()
  for (const entry of job.entries) {
    const source = program.getSourceFile(entry.file)
    const symbol = source && checker.getSymbolAtLocation(source)
    if (symbol) modules.set(entry.name, symbol)
  }
  const declarations: Record<string, string[]> = {}
  const missing: string[] = []
  for (const name of job.names) {
    const colon = name.indexOf(':')
    let symbol = modules.get(name.slice(0, colon))
    for (const part of name.slice(colon + 1).split('.')) {
      if (!symbol) break
      symbol = member(checker, symbol, part)
    }
    const keys = symbol ? declarationKeys(checker, symbol) : []
    if (keys.length) declarations[name] = keys
    else missing.push(name)
  }
  return { id: job.id, declarations, missing }
}

/** A module's export, a namespace's member, or a value's property, by name. */
function member(checker: ts.TypeChecker, symbol: ts.Symbol, name: string) {
  const target = resolveAlias(checker, symbol)
  if (target.flags & ts.SymbolFlags.Module) {
    const exported = checker
      .getExportsOfModule(target)
      .find((child) => child.name === name)
    if (exported) return exported
  }
  if (!(target.flags & ts.SymbolFlags.Value)) return undefined
  const property = checker.getPropertyOfType(
    checker.getTypeOfSymbol(target),
    name,
  )
  if (property) return property
  // A value declared with a wider type, such as `errorResolvers: Resolvers = { ... }`, still
  // names its literal's properties.
  const declaration = target.valueDeclaration
  if (
    declaration &&
    ts.isVariableDeclaration(declaration) &&
    declaration.initializer &&
    ts.isObjectLiteralExpression(declaration.initializer)
  )
    for (const element of declaration.initializer.properties)
      if (
        element.name &&
        (ts.isIdentifier(element.name) ||
          ts.isStringLiteralLike(element.name)) &&
        element.name.text === name
      )
        return checker.getSymbolAtLocation(element.name)
  return undefined
}

/**
 * The keys of the declarations a symbol resolves to. A property or variable that only names
 * another function, as in `{ transfer }` or `const send = transfer`, resolves to that function too,
 * since a test can call either.
 */
function declarationKeys(checker: ts.TypeChecker, symbol: ts.Symbol): string[] {
  const keys = new Set<string>()
  const seen = new Set<ts.Symbol>()
  const visit = (current: ts.Symbol | undefined) => {
    if (!current || seen.has(current)) return
    seen.add(current)
    const target = resolveAlias(checker, current)
    const declaration = target.valueDeclaration ?? target.declarations?.[0]
    if (!declaration) return
    keys.add(declarationKey(declaration))
    let name: ts.Node | undefined
    if (ts.isShorthandPropertyAssignment(declaration))
      return visit(checker.getShorthandAssignmentValueSymbol(declaration))
    if (
      (ts.isPropertyAssignment(declaration) ||
        ts.isVariableDeclaration(declaration)) &&
      declaration.initializer &&
      (ts.isIdentifier(declaration.initializer) ||
        ts.isPropertyAccessExpression(declaration.initializer))
    )
      name = ts.isIdentifier(declaration.initializer)
        ? declaration.initializer
        : declaration.initializer.name
    if (name) visit(checker.getSymbolAtLocation(name))
  }
  visit(symbol)
  return [...keys]
}

function declarationKey(declaration: ts.Node): string {
  return `${path.relative(root, declaration.getSourceFile().fileName)}:${declaration.pos}`
}

function resolveAlias(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol
}

/**
 * The program for a test file as it is on disk, which each measured program reuses. It never gets a
 * checker of its own.
 */
function template(file: string, text: string): ts.Program {
  let program = templates.get(file)
  templates.delete(file)
  if (program?.getSourceFile(file)?.text === text) {
    templates.set(file, program)
    return program
  }
  host.setFile(file, text)
  program = ts.createProgram({
    rootNames: [file],
    options: benchOptions,
    host,
  })
  templates.set(file, program)
  // A few templates are enough, since jobs come grouped by file.
  for (const key of templates.keys()) {
    if (templates.size <= 4) break
    templates.delete(key)
  }
  return program
}

function scan(job: ScanJob): ScanResult {
  // A program of its own, which goes once the scan is done, since its checker holds every type the
  // scan resolved. The template that `measure` reuses never gets a checker.
  const text = fs.readFileSync(job.file, 'utf8')
  host.setFile(job.file, text)
  const program = ts.createProgram({
    rootNames: [job.file],
    options: benchOptions,
    host,
  })
  const checker = program.getTypeChecker()
  const source = program.getSourceFile(job.file)!
  // Lines under a comment directive, such as `@ts-expect-error`, hold a deliberate type error.
  const covered = new Set<number>()
  for (const directive of (
    source as unknown as { commentDirectives?: { range: ts.TextRange }[] }
  ).commentDirectives ?? [])
    covered.add(
      source.getLineAndCharacterOfPosition(directive.range.end).line + 1,
    )
  const relative = path.relative(root, job.file)
  const sites: Site[] = []

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const site = siteOf(node)
      if (site) sites.push(site)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return { id: job.id, file: job.file, text, sites }

  function siteOf(call: ts.CallExpression): Site | undefined {
    const callee = call.expression
    // A callee is a name, or a property path from a name, such as `actions.token.transfer.call`.
    let rootName: ts.Expression = callee
    while (ts.isPropertyAccessExpression(rootName))
      rootName = rootName.expression
    if (!ts.isIdentifier(rootName)) return
    if (testFunctions.has(rootName.text) || rootName.text === 'expect') return
    const rootSymbol = checker.getSymbolAtLocation(rootName)
    // A property path is followed only from an import, such as a namespace, which needs no
    // checking to resolve. A method of a local value, such as `client.readContract`, is a
    // decorator's, not the function's.
    if (
      rootName !== callee &&
      !(rootSymbol && rootSymbol.flags & ts.SymbolFlags.Alias)
    )
      return
    const symbol = checker.getSymbolAtLocation(
      ts.isPropertyAccessExpression(callee) ? callee.name : callee,
    )
    if (!symbol) return
    const target = resolveAlias(checker, symbol)
    const declaration = target.valueDeclaration ?? target.declarations?.[0]
    if (!declaration) return
    const declared = declaration.getSourceFile().fileName
    if (
      declared === job.file ||
      declared.startsWith(path.join(root, 'test/')) ||
      /\/node_modules\/(?:vitest|@vitest|@types|typescript|bun-types)\//.test(
        declared,
      )
    )
      return

    // Calls chained on the result to methods viem declares, such as
    // `createClient(...).extend(publicActions)` or `getContract(...).read.balanceOf(...)`, use the
    // result's own API, so they count with the call. A promise's `.then` or a string's `.slice`
    // does not.
    let outer: ts.Expression = call
    const chained: string[] = []
    for (;;) {
      let access: ts.Node = outer
      const names: string[] = []
      while (
        ts.isPropertyAccessExpression(access.parent) &&
        access.parent.expression === access
      ) {
        access = access.parent
        names.push((access as ts.PropertyAccessExpression).name.text)
      }
      if (
        access === outer ||
        !ts.isCallExpression(access.parent) ||
        access.parent.expression !== access ||
        promiseMethods.has(names.at(-1)!)
      )
        break
      const method = checker.getSymbolAtLocation(
        (access as ts.PropertyAccessExpression).name,
      )
      const declared = method?.declarations?.[0]?.getSourceFile().fileName
      if (
        !declared?.startsWith(path.join(root, 'src/')) ||
        declared.endsWith('.d.ts')
      )
        break
      outer = access.parent
      chained.push(`.${names.join('.')}(…)`)
    }

    const statement = anchorOf(outer)
    const start = call.getStart(source)
    const line = source.getLineAndCharacterOfPosition(start).line
    const endLine = source.getLineAndCharacterOfPosition(outer.end).line
    let skip: string | undefined
    for (let index = line; index <= endLine && !skip; index++)
      if (covered.has(index)) skip = 'under @ts-expect-error'
    skip ??= statement ? hoistable(outer, statement) : 'outside any statement'
    return {
      declaration: declarationKey(declaration),
      test: [relative, ...testPath(call)].join(' > '),
      line: line + 1,
      start,
      end: call.end,
      outer: outer.end,
      anchor: statement?.pos ?? 0,
      skip,
      callee: callee.getText(source),
      chain: chained.length ? chained.join('') : undefined,
    }
  }

  /** The statement in a statement list that holds a node, before which its copy goes. */
  function anchorOf(node: ts.Node): ts.Statement | undefined {
    for (let current = node.parent; current; current = current.parent)
      if (
        isStatement(current) &&
        (ts.isBlock(current.parent) ||
          ts.isSourceFile(current.parent) ||
          ts.isModuleBlock(current.parent) ||
          ts.isCaseOrDefaultClause(current.parent))
      )
        return current
    return undefined
  }

  /**
   * Why a call cannot be copied before its statement: it names a variable that the statement
   * itself declares, such as a callback's parameter, or uses `this`, `super`, `arguments`, or an
   * `await` that the statement's function does not allow.
   */
  function hoistable(node: ts.Expression, statement: ts.Statement) {
    let reason: string | undefined
    const inside = (target: ts.Node, container: ts.Node) =>
      target.getSourceFile() === source &&
      target.pos >= container.pos &&
      target.end <= container.end
    // Modules allow `await` at their top level.
    let container: ts.Node | undefined = statement.parent
    while (container && !ts.isFunctionLike(container))
      container = container.parent
    const asyncAllowed =
      !container ||
      !!ts
        .getModifiers(container as ts.HasModifiers)
        ?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)
    const visit = (child: ts.Node, nested: boolean) => {
      if (reason) return
      if (
        child.kind === ts.SyntaxKind.ThisKeyword ||
        child.kind === ts.SyntaxKind.SuperKeyword
      ) {
        reason = 'using this or super'
        return
      }
      if (ts.isAwaitExpression(child) && !nested && !asyncAllowed) {
        reason = 'awaiting outside an async function'
        return
      }
      if (ts.isIdentifier(child) && isReference(child)) {
        const symbol = ts.isShorthandPropertyAssignment(child.parent)
          ? checker.getShorthandAssignmentValueSymbol(child.parent)
          : checker.getSymbolAtLocation(child)
        if (child.text === 'arguments' && !symbol) reason = 'using arguments'
        for (const declaration of symbol?.declarations ?? [])
          if (inside(declaration, statement) && !inside(declaration, node))
            reason = `naming ${child.text}, which its own statement declares`
      }
      const deeper = nested || ts.isFunctionLike(child)
      ts.forEachChild(child, (grandchild) => visit(grandchild, deeper))
    }
    visit(node, false)
    return reason
  }

  /** The names of the `describe` and `test` calls around a node, outermost first. */
  function testPath(node: ts.Node): string[] {
    const names: string[] = []
    for (let current = node.parent; current; current = current.parent) {
      if (!ts.isCallExpression(current)) continue
      let callee: ts.Expression = current.expression
      // `test.each(cases)('name', ...)` and `describe.skip('name', ...)` name tests too.
      if (ts.isCallExpression(callee)) callee = callee.expression
      while (ts.isPropertyAccessExpression(callee)) callee = callee.expression
      if (!ts.isIdentifier(callee) || !testFunctions.has(callee.text)) continue
      const name = current.arguments[0]
      if (name && ts.isStringLiteralLike(name)) names.unshift(name.text)
      else if (name) names.unshift(name.getText(source))
    }
    return names
  }

  function isReference(node: ts.Identifier) {
    const parent = node.parent
    if (ts.isPropertyAccessExpression(parent) && parent.name === node)
      return false
    if (ts.isPropertyAssignment(parent) && parent.name === node) return false
    if (ts.isQualifiedName(parent) && parent.right === node) return false
    if (
      (ts.isParameter(parent) ||
        ts.isVariableDeclaration(parent) ||
        ts.isBindingElement(parent) ||
        ts.isFunctionDeclaration(parent) ||
        ts.isMethodDeclaration(parent) ||
        ts.isPropertySignature(parent) ||
        ts.isTypeParameterDeclaration(parent)) &&
      parent.name === node
    )
      return false
    if (ts.isBindingElement(parent) && parent.propertyName === node)
      return false
    return true
  }
}

function isStatement(node: ts.Node): node is ts.Statement {
  return (
    ts.isExpressionStatement(node) ||
    ts.isVariableStatement(node) ||
    ts.isReturnStatement(node) ||
    ts.isIfStatement(node) ||
    ts.isForStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isWhileStatement(node) ||
    ts.isDoStatement(node) ||
    ts.isThrowStatement(node) ||
    ts.isTryStatement(node) ||
    ts.isSwitchStatement(node) ||
    ts.isBlock(node) ||
    ts.isLabeledStatement(node) ||
    ts.isExportAssignment(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isClassDeclaration(node)
  )
}

function measure(job: MeasureJob): MeasureResult {
  const base = template(job.file, job.text)
  // A tree with parent pointers to copy calls from, which the template's unbound file lacks.
  const source = ts.createSourceFile(
    job.file,
    job.text,
    ts.ScriptTarget.Latest,
    true,
  )
  const measurements: Measurement[] = []
  for (const site of job.sites) {
    const call = findCall(source, site.start, site.end)
    if (!call) throw new Error(`no call at ${site.start} in ${job.file}`)
    let outer: ts.Node = call
    while (outer.end < site.outer) outer = outer.parent
    const measured = check(base, site, copy(source, call, outer))
    const { instantiations, signature, errors } = measured
    let client: Measurement['client']
    // A costly call whose callee takes a client first, as viem's actions do, is checked again with
    // only that argument, the others replaced by `undefined!`, which says how much of its cost
    // the client accounts for alone.
    const [first, ...rest] = call.arguments
    if (
      instantiations >= job.probeAbove &&
      !errors.length &&
      /^client\b/.test(signature.parameters[0] ?? '') &&
      first &&
      !ts.isSpreadElement(first)
    )
      client = {
        first: first.getText(source),
        instantiations: rest.length
          ? check(base, site, copy(source, call, call, rest)).instantiations
          : instantiations,
      }
    measurements.push({ site: site.site, ...measured, client })
  }
  host.setFile(job.file, source.text)
  return { id: job.id, measurements }
}

/** The text of a measured call, and the declarations of the calls in its arguments. */
type Copy = { hoisted: string[]; text: string; callLength: number }

/**
 * Copies a call, with any calls chained on it up to `outer`. A call in its arguments, such as
 * `parseAbi([...])` or `privateKeyToAccount(key)`, is a fixture written inline, so it moves into a
 * declaration of its own, `const $uphill0 = parseAbi([...])`, which the warm-up resolves like any
 * other fixture. A call inside a callback stays, since it may name the callback's parameters.
 * `omit` lists arguments the copy replaces with `undefined!`.
 */
function copy(
  source: ts.SourceFile,
  call: ts.CallExpression,
  outer: ts.Node,
  omit: readonly ts.Expression[] = [],
): Copy {
  const replacements: { start: number; end: number; text: string }[] = []
  const hoisted: string[] = []
  // The spine: the call, and the calls chained on it, whose callees stay as written.
  const spine = new Set<ts.Node>()
  for (let node: ts.Node = call; node !== outer.parent; node = node.parent)
    spine.add(node)
  const visit = (node: ts.Node) => {
    if (omit.includes(node as ts.Expression)) {
      replacements.push({
        start: node.getStart(source),
        end: node.end,
        text: 'undefined!',
      })
      return
    }
    if (ts.isFunctionLike(node) || ts.isClassLike(node)) return
    const nested =
      !spine.has(node) &&
      (ts.isCallExpression(node) || ts.isNewExpression(node))
    if (nested) {
      const target = ts.isAwaitExpression(node.parent) ? node.parent : node
      const name = `${copyName}${hoisted.length}`
      hoisted.push(`const ${name} = ${target.getText(source)};`)
      replacements.push({
        start: target.getStart(source),
        end: target.end,
        text: name,
      })
      return
    }
    ts.forEachChild(node, visit)
  }
  for (const node of spine)
    if (ts.isCallExpression(node))
      for (const argument of node.arguments) visit(argument)
  const render = (start: number, end: number) => {
    let text = ''
    let at = start
    for (const replacement of replacements.toSorted(
      (a, b) => a.start - b.start,
    )) {
      if (replacement.start < start || replacement.end > end) continue
      text += source.text.slice(at, replacement.start) + replacement.text
      at = replacement.end
    }
    return text + source.text.slice(at, end)
  }
  const start = call.getStart(source)
  return {
    hoisted,
    text: render(start, outer.end),
    callLength: render(start, call.end).length,
  }
}

/**
 * Puts a copied call in `const $uphill = <call>` at its statement's full start, on a line of its
 * own so a comment directive above the statement still applies to the statement, after the
 * declarations of the calls in its arguments, and checks the copy in a fresh checker: first what it
 * references, then the call alone.
 */
function check(
  base: ts.Program,
  site: MeasureJob['sites'][number],
  copied: Copy,
): Omit<Measurement, 'site' | 'client'> {
  const file = base.getRootFileNames()[0]!
  const original = base.getSourceFile(file)!.text
  const before = copied.hoisted.map((line) => `\n${line}`).join('')
  const prefix = `${before}\nconst ${copyName} = `
  host.setFile(
    file,
    `${original.slice(0, site.anchor)}${prefix}${copied.text};${original.slice(site.anchor)}`,
  )
  const program = ts.createProgram({
    rootNames: [file],
    options: benchOptions,
    host,
    oldProgram: base,
  })
  const source = program.getSourceFile(file)!
  const checker = program.getTypeChecker()
  const callStart = site.anchor + prefix.length
  const statement = findStatement(source, site.anchor + before.length + 1)
  const declaration = statement.declarationList.declarations[0]!
  const outer = declaration.initializer!
  const call = findCall(outer, callStart, callStart + copied.callLength)
  if (!call) throw new Error(`no copy of the call at ${callStart} in ${file}`)

  // Warm up: what the call references from outside it, and the callee's declared signature.
  const warmStart = program.getInstantiationCount()
  warm(checker, outer)
  warmCallee(checker, call)
  const warmCount = program.getInstantiationCount() - warmStart

  const c0 = program.getInstantiationCount()
  checker.getResolvedSignature(call)
  const c1 = program.getInstantiationCount()
  const type = checker.getTypeOfSymbol(
    checker.getSymbolAtLocation(declaration.name)!,
  )
  const c2 = program.getInstantiationCount()
  checker.getAwaitedType(type)
  const c3 = program.getInstantiationCount()

  // Diagnostics for the copy alone, after the measurement, so a call with a type error, or one
  // that its copy breaks, is not reported as if it were checked as written.
  // `getSemanticDiagnostics` takes the nodes to check as an internal third argument, which checks
  // them and nothing else in the file, as editors do for the visible range.
  const errors = (
    program.getSemanticDiagnostics as (
      file: ts.SourceFile,
      token: undefined,
      nodes: ts.Node[],
    ) => readonly ts.Diagnostic[]
  )(source, undefined, [statement])
    .filter(
      (diagnostic) =>
        diagnostic.category === ts.DiagnosticCategory.Error &&
        !ignoredCodes.has(diagnostic.code) &&
        diagnostic.start !== undefined &&
        diagnostic.start >= statement.pos &&
        diagnostic.start < statement.end,
    )
    .map((diagnostic) => ({
      code: diagnostic.code,
      message: ts
        .flattenDiagnosticMessageText(diagnostic.messageText, ' ')
        .slice(0, 300),
    }))
  return {
    instantiations: c3 - c0,
    parts: { call: c1 - c0, result: c2 - c1, awaited: c3 - c2 },
    warm: warmCount,
    signature: describe(checker.getResolvedSignature(call)),
    errors,
  }
}

function findStatement(source: ts.SourceFile, position: number) {
  let found: ts.VariableStatement | undefined
  const visit = (node: ts.Node) => {
    if (found || node.end < position || node.pos > position) return
    if (
      ts.isVariableStatement(node) &&
      node.getStart(source) === position &&
      node.declarationList.declarations[0]?.name.getText(source) === copyName
    )
      found = node
    else ts.forEachChild(node, visit)
  }
  visit(source)
  if (!found) throw new Error(`no copy of the call at ${position}`)
  return found
}

function findCall(node: ts.Node, start: number, end: number) {
  let found: ts.CallExpression | undefined
  const visit = (child: ts.Node) => {
    if (found || child.end < end || child.pos > start) return
    if (
      ts.isCallExpression(child) &&
      child.getStart() === start &&
      child.end === end
    )
      found = child
    else ts.forEachChild(child, visit)
  }
  visit(node)
  return found
}

/**
 * Resolves the declared type of every symbol that a node references from outside it: imports,
 * fixtures such as an ABI or a client, and type aliases its type arguments name. Each one's type is
 * what checking the call would read, so the call's own count leaves it out.
 */
function warm(checker: ts.TypeChecker, node: ts.Node) {
  const seen = new Set<ts.Symbol>()
  const visit = (child: ts.Node) => {
    if (ts.isIdentifier(child)) {
      const parent = child.parent
      const skip =
        (ts.isPropertyAccessExpression(parent) && parent.name === child) ||
        (ts.isPropertyAssignment(parent) && parent.name === child) ||
        (ts.isQualifiedName(parent) && parent.right === child)
      const symbol = skip
        ? undefined
        : ts.isShorthandPropertyAssignment(parent)
          ? checker.getShorthandAssignmentValueSymbol(parent)
          : checker.getSymbolAtLocation(child)
      if (symbol && !seen.has(symbol)) {
        seen.add(symbol)
        const target = resolveAlias(checker, symbol)
        const declarations = target.declarations ?? []
        const local = declarations.some(
          (declaration) =>
            declaration.getSourceFile() === node.getSourceFile() &&
            declaration.pos >= node.pos &&
            declaration.end <= node.end,
        )
        if (!local && declarations.length) {
          if (target.flags & ts.SymbolFlags.Value)
            checker.getTypeOfSymbol(target)
          if (
            target.flags &
            (ts.SymbolFlags.TypeAlias |
              ts.SymbolFlags.Interface |
              ts.SymbolFlags.Class |
              ts.SymbolFlags.Enum)
          )
            checker.getDeclaredTypeOfSymbol(target)
        }
      }
    }
    ts.forEachChild(child, visit)
  }
  visit(node)
}

/**
 * Resolves the callee's declared type and each of its signatures: parameter types, return type,
 * and type parameters' constraints and defaults, as importing and naming it would.
 */
function warmCallee(checker: ts.TypeChecker, call: ts.CallExpression) {
  const type = checker.getTypeAtLocation(call.expression)
  for (const signature of checker.getSignaturesOfType(
    type,
    ts.SignatureKind.Call,
  )) {
    for (const parameter of signature.getParameters())
      checker.getTypeOfSymbol(parameter)
    checker.getReturnTypeOfSignature(signature)
    for (const parameter of signature.getTypeParameters() ?? []) {
      checker.getBaseConstraintOfType(parameter)
      parameter.getDefault()
    }
  }
}

/** The declared parameters and return type of the signature a call resolved to, for notes. */
function describe(
  signature: ts.Signature | undefined,
): Measurement['signature'] {
  const declaration = signature?.getDeclaration()
  if (!declaration) return { parameters: [], returns: '' }
  return {
    parameters: declaration.parameters.map((parameter) => parameter.getText()),
    returns: declaration.type?.getText() ?? '',
  }
}
