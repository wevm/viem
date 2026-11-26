/**
 * Finds sequential await waterfalls in one async function: independent awaits in sequence in one
 * block, and awaits in a loop whose iterations do not depend on each other. Every rule leans
 * toward precision: when the analysis cannot show two awaits are independent, it treats them as
 * dependent, so each finding is one a maintainer can fold into a `Promise.all`.
 *
 * @module
 */

import ts from 'typescript'

/** One waterfall in a function, with the line it starts on. */
export type Finding = { line: number; note: string }

/** One await in a block, in evaluation order. */
type Site = {
  await: ts.AwaitExpression
  /** The conditions it runs under, from `&&`, `||`, `??` or `?:`. */
  guards: ts.Expression[]
}

/** A site that may fold with others, with every variable derived from its result. */
type Member = {
  /** Missing for an `if` statement. */
  site?: Site
  callee: string
  line: number
  taint: Set<ts.Symbol>
  /** Set once later code branches, returns, or throws on this result. */
  control: boolean
  /**
   * A read that only runs on some condition, or an `if` whose awaits only read. It cannot fold,
   * but reads commute with reads, so later reads may move across it unless they use its result.
   */
  fixed: boolean
}

type Ref = { symbol: ts.Symbol; node: ts.Node; read: boolean; write: boolean }

/** `none` is a value that starts no work, such as a promise created earlier or `undefined`. */
type Effect = 'read' | 'none' | 'other'

type FunctionLike =
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.MethodDeclaration

/** Methods that change their receiver, so a call writes the receiver instead of only reading it. */
const mutators = new Set([
  'push',
  'unshift',
  'splice',
  'set',
  'add',
  'delete',
  'clear',
  'fill',
  'sort',
  'reverse',
  'pop',
  'shift',
])

/**
 * Callees that only read: viem's public actions (`getBlock`, `call`, `estimateGas`, `readContract`,
 * `multicall`, ...) and read-only RPC methods. Everything else counts as a possible side effect,
 * because a write, a signature, a nonce, a user prompt, or a callback has an order its caller
 * relies on, and moving a read across it can change what the read sees.
 */
const readCallee =
  /^(get[A-Z_]\w*|read\w*|call|estimate\w*|simulate\w*|multicall|fetch[A-Z]\w*|(is|has)[A-Z]\w*|verify\w*|lookup\w*|query\w*|json|text|arrayBuffer|eth_(get\w+|call|estimateGas|chainId|blockNumber|gasPrice|feeHistory|maxPriorityFeePerGas|blobBaseFee|createAccessList|simulateV1|accounts)|net_\w+|web3_\w+|txpool_\w+|wallet_get\w+)$/

/**
 * Calls that change state when a helper makes them without awaiting, such as a cache `set` or a
 * `store.write`. A helper that makes one is not a pure read, even when everything it awaits is.
 */
const writeCallee =
  /^(send|write|sign|set|put|save|store|delete|remove|update|insert|submit|execute|deploy|consume|increment|compareAndSet|emit|dispatch|notify|mine|approve|transfer|mint|burn)/

/** Wrappers that run the function they are given, so they cost what that function costs. */
const wrappers = new Set([
  'withCache',
  'withRetry',
  'withTimeout',
  'withDedupe',
])

/** Callees that pause on purpose. A loop that calls one polls, and polling is sequential by design. */
const waits = /^(wait|sleep|delay|setTimeout|setInterval|poll)\w*$/

export function isAsync(node: ts.Node): node is FunctionLike {
  return (
    (ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)) &&
    !!node.body &&
    !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)
  )
}

function isScope(node: ts.Node): boolean {
  return ts.isFunctionLike(node) || ts.isClassLike(node)
}

export function analyzer(checker: ts.TypeChecker) {
  const refCache = new WeakMap<ts.Node, Ref[]>()
  const symbolCache = new WeakMap<ts.Node, ts.Symbol | undefined>()

  function symbolOf(node: ts.Identifier): ts.Symbol | undefined {
    if (symbolCache.has(node)) return symbolCache.get(node)
    const symbol = ts.isShorthandPropertyAssignment(node.parent)
      ? checker.getShorthandAssignmentValueSymbol(node.parent)
      : checker.getSymbolAtLocation(node)
    symbolCache.set(node, symbol)
    return symbol
  }

  /** Whether a symbol is a variable or parameter, the only things a result can flow into. */
  function isVariable(symbol: ts.Symbol): boolean {
    return (
      (symbol.flags & ts.SymbolFlags.Variable) !== 0 &&
      (symbol.flags & ts.SymbolFlags.Alias) === 0
    )
  }

  /**
   * Every variable a node reads or writes, nested functions included, since a closure reads what
   * it captures. Property names and types are skipped: they name no variable, and resolving them
   * would make the checker infer types.
   */
  function refs(root: ts.Node): Ref[] {
    const cached = refCache.get(root)
    if (cached) return cached
    const out: Ref[] = []
    const visit = (node: ts.Node) => {
      if (ts.isTypeNode(node) && !ts.isExpressionWithTypeArguments(node)) return
      if (
        ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeParameterDeclaration(node)
      )
        return
      if (ts.isIdentifier(node)) {
        const ref = classify(node)
        if (ref) out.push(ref)
        return
      }
      ts.forEachChild(node, visit)
    }
    visit(root)
    refCache.set(root, out)
    return out
  }

  function classify(node: ts.Identifier): Ref | undefined {
    const parent = node.parent
    if (
      (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
      ts.isQualifiedName(parent) ||
      ((ts.isPropertyAssignment(parent) ||
        ts.isPropertyDeclaration(parent) ||
        ts.isMethodDeclaration(parent) ||
        ts.isGetAccessor(parent) ||
        ts.isSetAccessor(parent) ||
        ts.isPropertySignature(parent) ||
        ts.isMethodSignature(parent) ||
        ts.isEnumMember(parent)) &&
        parent.name === node) ||
      (ts.isBindingElement(parent) && parent.propertyName === node) ||
      ts.isLabeledStatement(parent) ||
      ts.isBreakOrContinueStatement(parent) ||
      ts.isMetaProperty(parent) ||
      ts.isImportSpecifier(parent) ||
      ts.isExportSpecifier(parent)
    )
      return undefined
    const symbol = symbolOf(node)
    if (!symbol || !isVariable(symbol)) return undefined
    if (
      ((ts.isVariableDeclaration(parent) ||
        ts.isBindingElement(parent) ||
        ts.isParameter(parent)) &&
        parent.name === node) ||
      ts.isFunctionDeclaration(parent)
    )
      return { symbol, node, read: false, write: true }
    const target = assignment(node)
    if (target === 'assign') return { symbol, node, read: false, write: true }
    if (target === 'compound') return { symbol, node, read: true, write: true }
    if (mutated(node)) return { symbol, node, read: false, write: true }
    return { symbol, node, read: true, write: false }
  }

  /** Whether an identifier is assigned (`x = …`, `[x] = …`) or updated (`x += …`, `x++`). */
  function assignment(node: ts.Node): 'assign' | 'compound' | undefined {
    let child = node
    let parent = node.parent
    let pattern = false
    while (
      ts.isParenthesizedExpression(parent) ||
      ts.isNonNullExpression(parent) ||
      ts.isArrayLiteralExpression(parent) ||
      ts.isObjectLiteralExpression(parent) ||
      ts.isSpreadElement(parent) ||
      ts.isSpreadAssignment(parent) ||
      ts.isShorthandPropertyAssignment(parent) ||
      (ts.isPropertyAssignment(parent) && parent.initializer === child)
    ) {
      if (
        !ts.isParenthesizedExpression(parent) &&
        !ts.isNonNullExpression(parent)
      )
        pattern = true
      child = parent
      parent = parent.parent
    }
    if (ts.isBinaryExpression(parent) && parent.left === child) {
      const op = parent.operatorToken.kind
      if (op === ts.SyntaxKind.EqualsToken) return 'assign'
      if (
        !pattern &&
        op >= ts.SyntaxKind.FirstCompoundAssignment &&
        op <= ts.SyntaxKind.LastCompoundAssignment
      )
        return 'compound'
    }
    if (
      !pattern &&
      (ts.isPrefixUnaryExpression(parent) ||
        ts.isPostfixUnaryExpression(parent)) &&
      (parent.operator === ts.SyntaxKind.PlusPlusToken ||
        parent.operator === ts.SyntaxKind.MinusMinusToken)
    )
      return 'compound'
    if (
      (ts.isForOfStatement(parent) || ts.isForInStatement(parent)) &&
      parent.initializer === child
    )
      return 'assign'
    return undefined
  }

  /**
   * Whether an identifier is the object a statement changes: `obj.x = …`, `obj[k] = …`,
   * `list.push(…)`, or `Object.assign(obj, …)`.
   */
  function mutated(node: ts.Node): boolean {
    let top = node
    while (
      (ts.isPropertyAccessExpression(top.parent) ||
        ts.isElementAccessExpression(top.parent)) &&
      top.parent.expression === top
    )
      top = top.parent
    if (top !== node && assignment(top)) return true
    const call = top.parent
    if (
      top !== node &&
      ts.isCallExpression(call) &&
      call.expression === top &&
      ts.isPropertyAccessExpression(top) &&
      mutators.has(top.name.text)
    )
      return true
    return (
      ts.isCallExpression(call) &&
      call.arguments[0] === top &&
      call.expression.getText() === 'Object.assign'
    )
  }

  const readsOf = (node: ts.Node) =>
    new Set(
      refs(node)
        .filter((r) => r.read)
        .map((r) => r.symbol),
    )
  const writesOf = (node: ts.Node) =>
    new Set(
      refs(node)
        .filter((r) => r.write)
        .map((r) => r.symbol),
    )
  const touchesOf = (node: ts.Node) => new Set(refs(node).map((r) => r.symbol))

  function intersects(a: Set<ts.Symbol>, b: Set<ts.Symbol>): boolean {
    for (const x of a) if (b.has(x)) return true
    return false
  }

  function unwrap(node: ts.Expression): ts.Expression {
    while (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isNonNullExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isTypeAssertionExpression(node)
    )
      node = node.expression
    return node
  }

  /** The name a note shows for an awaited call, such as `getBlock` or `eth_chainId`. */
  function calleeName(expr: ts.Expression): string | undefined {
    const call = unwrap(expr)
    if (!ts.isCallExpression(call)) return undefined
    const callee = unwrap(call.expression)
    // `getAction(client, getBlock, 'getBlock')(…)` runs the action named by its last arguments.
    if (ts.isCallExpression(callee)) {
      const inner = unwrap(callee.expression)
      if (ts.isIdentifier(inner) && inner.text === 'getAction') {
        const [, fn, name] = callee.arguments
        if (name && ts.isStringLiteralLike(name)) return name.text
        if (fn) return lastName(fn)
      }
      // `withExecutionError(readContract)(…)` runs the function it wraps.
      const wrapper = lastName(inner)
      const [fn] = callee.arguments
      if (wrapper && /^with[A-Z]/.test(wrapper) && fn) return lastName(fn)
      return undefined
    }
    if (ts.isFunctionExpression(callee) || ts.isArrowFunction(callee))
      return '<async iife>'
    const name = lastName(callee)
    // `client.request({ method: 'eth_chainId' })` is named by its RPC method.
    if (name === 'request' || name === 'requestAsync') {
      const [arg] = call.arguments
      if (arg && ts.isObjectLiteralExpression(arg))
        for (const property of arg.properties)
          if (
            ts.isPropertyAssignment(property) &&
            property.name.getText() === 'method' &&
            ts.isStringLiteralLike(property.initializer)
          )
            return property.initializer.text
    }
    if (
      ts.isPropertyAccessExpression(callee) &&
      ts.isIdentifier(callee.expression)
    ) {
      const receiver = callee.expression.text
      if (receiver === 'Promise') return `Promise.${name}`
    }
    return name
  }

  /**
   * The callee as a note shows it. A contract call adds its function, as in
   * `readContract(balanceOf)`, since one function often reads several.
   */
  function label(expr: ts.Expression): string {
    const name = calleeName(expr)!
    const call = unwrap(expr) as ts.CallExpression
    for (const arg of call.arguments)
      if (ts.isObjectLiteralExpression(arg))
        for (const property of arg.properties)
          if (
            ts.isPropertyAssignment(property) &&
            property.name.getText() === 'functionName' &&
            ts.isStringLiteralLike(property.initializer)
          )
            return `${name}(${property.initializer.text})`
    return name
  }

  function lastName(node: ts.Expression): string | undefined {
    node = unwrap(node)
    if (ts.isIdentifier(node)) return node.text
    if (ts.isPropertyAccessExpression(node)) return node.name.text
    return undefined
  }

  /**
   * Whether an awaited expression starts work that only reads. `'none'` marks a value that starts
   * no work, such as a promise created earlier or `undefined`, which may sit in a `Promise.all`.
   */
  function effect(expr: ts.Expression): Effect {
    const node = unwrap(expr)
    if (ts.isAwaitExpression(node)) return effect(node.expression)
    if (
      ts.isIdentifier(node) ||
      ts.isPropertyAccessExpression(node) ||
      ts.isElementAccessExpression(node) ||
      ts.isLiteralExpression(node) ||
      ts.isObjectLiteralExpression(node) ||
      node.kind === ts.SyntaxKind.NullKeyword ||
      node.kind === ts.SyntaxKind.UndefinedKeyword ||
      node.kind === ts.SyntaxKind.TrueKeyword ||
      node.kind === ts.SyntaxKind.FalseKeyword
    )
      return 'none'
    if (ts.isConditionalExpression(node))
      return combine([effect(node.whenTrue), effect(node.whenFalse)])
    // `declared ?? readContract(…)` reads only when the left side is missing.
    if (
      ts.isBinaryExpression(node) &&
      [
        ts.SyntaxKind.QuestionQuestionToken,
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.AmpersandAmpersandToken,
      ].includes(node.operatorToken.kind)
    )
      return combine([effect(node.left), effect(node.right)])
    if (ts.isSpreadElement(node)) return effect(node.expression)
    if (!ts.isCallExpression(node)) return 'other'
    // An optional call, such as `options.getFeeToken?.(…)`, runs a hook the caller supplied.
    // Its name says nothing about what it does, and its place may be part of the contract.
    if (node.questionDotToken) return 'other'
    const callee = unwrap(node.expression)
    // An async IIFE costs what it awaits.
    if (ts.isFunctionExpression(callee) || ts.isArrowFunction(callee))
      return body(callee)
    if (ts.isPropertyAccessExpression(callee)) {
      const name = callee.name.text
      const receiver = callee.expression.getText()
      if (receiver === 'Promise') {
        if (name === 'resolve') return 'none'
        if (!['all', 'allSettled', 'race', 'any'].includes(name)) return 'other'
        const [arg] = node.arguments
        if (!arg) return 'other'
        const list = unwrap(arg)
        if (ts.isArrayLiteralExpression(list))
          return combine(list.elements.map((element) => effect(element)))
        return effect(list)
      }
      // `items.map(fn)` and `Array.from(items, fn)` cost what `fn` returns, as a `Promise.all`
      // argument.
      if (
        name === 'map' ||
        name === 'flatMap' ||
        (receiver === 'Array' && name === 'from')
      ) {
        const fn = node.arguments.at(-1)
        return fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))
          ? body(fn)
          : 'other'
      }
      // `promise.then(fn)` costs its receiver and the handler. A `catch` handler runs only on
      // failure, so a named one such as `catchRevert` adds nothing to the read.
      if (name === 'catch' || name === 'then' || name === 'finally') {
        const fns = node.arguments.map((fn) =>
          ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)
            ? body(fn)
            : name === 'catch'
              ? 'none'
              : 'other',
        )
        return combine([effect(callee.expression), ...fns])
      }
      // `contract.read.balanceOf(…)` and `contract.simulate.transfer(…)` on a contract instance.
      if (
        ts.isPropertyAccessExpression(callee.expression) &&
        ['read', 'simulate', 'estimateGas', 'getEvents'].includes(
          callee.expression.name.text,
        )
      )
        return 'read'
    }
    const name = calleeName(node)
    if (!name) return 'other'
    if (wrappers.has(name)) {
      const [fn] = node.arguments
      return fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))
        ? body(fn)
        : 'other'
    }
    if (readCallee.test(name.replace(/^internal_/, ''))) return 'read'
    return declared(node) ?? 'other'
  }

  /** What a function's body costs: every value it awaits or returns must only read. */
  function body(fn: ts.SignatureDeclaration): Effect {
    if (!('body' in fn) || !fn.body) return 'other'
    if (!ts.isBlock(fn.body)) return effect(fn.body as ts.Expression)
    const parts: Effect[] = []
    const visit = (node: ts.Node) => {
      if (ts.isAwaitExpression(node)) parts.push(effect(node.expression))
      // A returned call may hand back a promise the caller awaits. Any other returned value,
      // such as `a * b` or an object, is data, and the awaits inside it count on their own.
      else if (
        ts.isReturnStatement(node) &&
        node.expression &&
        returnsWork(node.expression)
      )
        parts.push(effect(node.expression))
      // A write the body starts without awaiting still changes state, even in a callback.
      else if (ts.isCallExpression(node)) {
        const name = lastName(node.expression)
        if (name && writeCallee.test(name)) parts.push('other')
      }
      if (!isScope(node)) ts.forEachChild(node, visit)
    }
    ts.forEachChild(fn.body, visit)
    // A body that awaits nothing reads nothing over the network either.
    return combine(parts)
  }

  function returnsWork(expr: ts.Expression): boolean {
    const node = unwrap(expr)
    if (ts.isConditionalExpression(node))
      return returnsWork(node.whenTrue) || returnsWork(node.whenFalse)
    if (ts.isBinaryExpression(node))
      return returnsWork(node.left) || returnsWork(node.right)
    return ts.isCallExpression(node) || ts.isAwaitExpression(node)
  }

  const declaredCache = new Map<ts.Node, Effect>()

  /**
   * What a call to one of viem's own functions costs, from the body it declares, such as a
   * `resolveTokenWithDecimals` helper that only reads contracts. The checker resolves the callee
   * through imports. A receiver must be a namespace or function, such as `Actions.token.getBalance`
   * or `transfer.inner`, because members of a client or other value need the checker to infer
   * that value's type, which is slow and not needed for a name.
   */
  function declared(call: ts.CallExpression): Effect | undefined {
    let callee: ts.Expression | undefined = unwrap(call.expression)
    if (ts.isCallExpression(callee)) {
      const inner = lastName(callee.expression)
      if (inner === 'getAction') callee = callee.arguments[1]
      else if (inner && /^with[A-Z]/.test(inner)) callee = callee.arguments[0]
      else return undefined
      if (!callee) return undefined
      callee = unwrap(callee)
    }
    const symbol = resolve(callee)
    const declaration = symbol?.declarations?.find(
      (d) =>
        (ts.isFunctionDeclaration(d) && d.body) ||
        (ts.isVariableDeclaration(d) &&
          d.initializer &&
          (ts.isArrowFunction(d.initializer) ||
            ts.isFunctionExpression(d.initializer))),
    )
    // A library function declared without a body, such as one of ox's, is synchronous when its
    // declared return type is not a promise.
    if (!declaration) {
      const signature = symbol?.declarations?.find(ts.isFunctionDeclaration)
      return signature?.type && !/\bPromise\b/.test(signature.type.getText())
        ? 'none'
        : undefined
    }
    const fn = ts.isVariableDeclaration(declaration)
      ? (declaration.initializer as ts.ArrowFunction)
      : (declaration as ts.FunctionDeclaration)
    const cached = declaredCache.get(fn)
    if (cached) return cached
    // A recursive call resolves to `other` until its body is known.
    declaredCache.set(fn, 'other')
    const result = body(fn)
    declaredCache.set(fn, result)
    return result
  }

  function resolve(node: ts.Expression): ts.Symbol | undefined {
    let symbol: ts.Symbol | undefined
    if (ts.isIdentifier(node)) symbol = checker.getSymbolAtLocation(node)
    else if (ts.isPropertyAccessExpression(node)) {
      let root: ts.Expression = node.expression
      while (ts.isPropertyAccessExpression(root)) root = root.expression
      if (!ts.isIdentifier(root)) return undefined
      const base = checker.getSymbolAtLocation(root)
      if (
        !base ||
        !(
          base.flags &
          (ts.SymbolFlags.Alias |
            ts.SymbolFlags.Function |
            ts.SymbolFlags.ValueModule |
            ts.SymbolFlags.NamespaceModule)
        )
      )
        return undefined
      symbol = checker.getSymbolAtLocation(node.name)
    }
    if (symbol && symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol)
    return symbol
  }

  function combine(parts: Effect[]): Effect {
    if (parts.includes('other')) return 'other'
    return parts.includes('read') ? 'read' : 'none'
  }

  /** Awaits in a statement or expression, in evaluation order, nested functions excluded. */
  function sites(node: ts.Node): Site[] {
    const out: Site[] = []
    const visit = (node: ts.Node, guards: ts.Expression[]) => {
      if (isScope(node)) return
      if (ts.isAwaitExpression(node)) {
        // The operand runs first, so an await inside it comes before this one.
        visit(node.expression, guards)
        out.push({ await: node, guards })
        return
      }
      if (
        ts.isBinaryExpression(node) &&
        [
          ts.SyntaxKind.AmpersandAmpersandToken,
          ts.SyntaxKind.BarBarToken,
          ts.SyntaxKind.QuestionQuestionToken,
          ts.SyntaxKind.AmpersandAmpersandEqualsToken,
          ts.SyntaxKind.BarBarEqualsToken,
          ts.SyntaxKind.QuestionQuestionEqualsToken,
        ].includes(node.operatorToken.kind)
      ) {
        visit(node.left, guards)
        visit(node.right, [...guards, node.left])
        return
      }
      if (ts.isConditionalExpression(node)) {
        visit(node.condition, guards)
        visit(node.whenTrue, [...guards, node.condition])
        visit(node.whenFalse, [...guards, node.condition])
        return
      }
      ts.forEachChild(node, (child) => visit(child, guards))
    }
    visit(node, [])
    return out
  }

  function contains(node: ts.Node, test: (node: ts.Node) => boolean): boolean {
    let found = false
    const visit = (child: ts.Node) => {
      if (found || isScope(child)) return
      if (test(child)) found = true
      else ts.forEachChild(child, visit)
    }
    visit(node)
    return found
  }

  const isAwaitLike = (node: ts.Node) =>
    ts.isAwaitExpression(node) ||
    ts.isYieldExpression(node) ||
    (ts.isForOfStatement(node) && !!node.awaitModifier)

  /**
   * Whether a statement can leave the code that follows it: `return`, `throw`, or a `break` or
   * `continue` that jumps past it.
   */
  function exits(statement: ts.Node, iteration = false): boolean {
    let found = false
    const visit = (node: ts.Node, loops: number, switches: number) => {
      if (found || isScope(node)) return
      if (ts.isReturnStatement(node) || ts.isThrowStatement(node)) found = true
      else if (ts.isBreakStatement(node))
        found = !!node.label || (loops === 0 && switches === 0)
      // In a loop body, `continue` only ends the current iteration.
      else if (ts.isContinueStatement(node))
        found = !!node.label || (loops === 0 && !iteration)
      else if (ts.isIterationStatement(node, false))
        ts.forEachChild(node, (child) => visit(child, loops + 1, switches))
      else if (ts.isSwitchStatement(node))
        ts.forEachChild(node, (child) => visit(child, loops, switches + 1))
      else ts.forEachChild(node, (child) => visit(child, loops, switches))
    }
    visit(statement, 0, 0)
    return found
  }

  /**
   * Whether a statement is a bare call whose result is dropped, such as
   * `assertCurrentChain({ chainId })`. Such a call runs for its effect, often to throw, so the code
   * after it depends on the values it reads. A mutator such as `list.push(x)` only moves data.
   */
  function isBareCall(statement: ts.Node): boolean {
    if (!ts.isExpressionStatement(statement)) return false
    const expr = unwrap(statement.expression)
    if (!ts.isCallExpression(expr)) return false
    const callee = unwrap(expr.expression)
    if (ts.isPropertyAccessExpression(callee) && mutators.has(callee.name.text))
      return false
    return callee.getText() !== 'Object.assign'
  }

  function line(node: ts.Node): number {
    const source = node.getSourceFile()
    return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
  }

  /** Every function-level read, by symbol, to tell whether a result is ever used. */
  function readIndex(fn: FunctionLike): Map<ts.Symbol, number[]> {
    const index = new Map<ts.Symbol, number[]>()
    for (const ref of refs(fn.body!))
      if (ref.read) {
        const list = index.get(ref.symbol) ?? []
        list.push(ref.node.pos)
        index.set(ref.symbol, list)
      }
    return index
  }

  function analyze(fn: FunctionLike): Finding[] {
    const findings: Finding[] = []
    const index = readIndex(fn)

    const usedAfter = (symbols: Set<ts.Symbol>, pos: number) => {
      for (const symbol of symbols)
        if (index.get(symbol)?.some((p) => p >= pos)) return true
      return false
    }

    /**
     * Whether an await's value is used. A dropped value (`await a()`) or a variable nobody reads
     * means the await runs for its effect or to throw, and effects keep their order.
     */
    const used = (statement: ts.Node, site: Site, bound: Set<ts.Symbol>) => {
      let node: ts.Node = site.await
      while (
        ts.isParenthesizedExpression(node.parent) ||
        ts.isAsExpression(node.parent) ||
        ts.isNonNullExpression(node.parent) ||
        ts.isVoidExpression(node.parent)
      )
        node = node.parent
      if (ts.isExpressionStatement(node.parent)) return false
      if (bound.size === 0) return true
      return usedAfter(bound, statement.end)
    }

    /** Whether an await may fold: a call that only reads, whose value is used. */
    const foldable = (statement: ts.Node, site: Site) => {
      const operand = site.await.expression
      // Only a call starts work. Awaiting a promise created earlier waits on work already running.
      return (
        !!calleeName(operand) &&
        effect(operand) === 'read' &&
        used(statement, site, writesOf(statement))
      )
    }

    /**
     * Whether a read under `&&`, `||`, `??` or `?:` must stay where it is. It may fold like any
     * other read, as `l2GasLimit ?? estimateGasL1ToL2(…)` inside a `Promise.all`, when it is the
     * only await in its statement and its conditions read no result of the run. A second await in
     * the statement may be the other arm of the same `?:`, or the value a fallback tests.
     */
    const pinned = (
      statement: ts.Node,
      site: Site,
      usesRun: (node: ts.Node) => boolean,
    ) =>
      site.guards.length > 0 &&
      (sites(statement).length > 1 ||
        site.guards.some((guard) => usesRun(guard)))

    const member = (
      statement: ts.Node,
      site: Site,
      fixed: boolean,
    ): Member => ({
      site,
      callee: label(site.await.expression),
      line: line(site.await),
      taint: new Set(writesOf(statement)),
      control: false,
      fixed,
    })

    const isSimple = (statement: ts.Node) =>
      ts.isVariableStatement(statement) ||
      ts.isExpressionStatement(statement) ||
      ts.isReturnStatement(statement) ||
      ts.isThrowStatement(statement) ||
      ts.isExpression(statement)

    const sequence = (statements: readonly ts.Node[]) => {
      let run: Member[] = []
      const flush = () => {
        const members = run.filter((m) => !m.fixed)
        if (members.length >= 2) findings.push(group(members))
        run = []
      }
      /** Whether a node uses a run member's result, or runs after code that branched on one. */
      const dependent = (node: ts.Node) => {
        const touched = touchesOf(node)
        return run.some(
          (m) =>
            m.control ||
            intersects(touched, m.taint) ||
            // An await inside the operand runs first, and the operand takes its value.
            (!!m.site &&
              m.site.await.pos >= node.pos &&
              m.site.await.end <= node.end),
        )
      }

      /**
       * The first await in a branch of an `if` that does not test a run member's result may fold
       * with the run before the `if`: start the run's work first, and await it with the branch's.
       */
      const branch = (statement: ts.IfStatement) => {
        const members = run.filter((m) => !m.fixed)
        if (members.length === 0 || run.some((m) => m.control)) return
        if (
          contains(statement.expression, isAwaitLike) ||
          dependent(statement.expression)
        )
          return
        for (const arm of [statement.thenStatement, statement.elseStatement]) {
          if (!arm) continue
          const taint = new Set(run.flatMap((m) => [...m.taint]))
          for (const inner of ts.isBlock(arm) ? arm.statements : [arm]) {
            const reads = readsOf(inner)
            const site = isSimple(inner) ? sites(inner)[0] : undefined
            if (site) {
              if (
                !pinned(inner, site, (node) =>
                  intersects(touchesOf(node), taint),
                ) &&
                foldable(inner, site) &&
                !intersects(touchesOf(site.await.expression), taint)
              ) {
                findings.push(group([...members, member(inner, site, false)]))
                // The finding holds the whole run, so the run does not report again.
                run = []
                return
              }
              break
            }
            if (contains(inner, isAwaitLike)) break
            if (intersects(reads, taint)) {
              if (exits(inner) || isBareCall(inner)) break
              for (const symbol of writesOf(inner)) taint.add(symbol)
            }
          }
        }
      }

      for (const statement of statements) {
        if (
          ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement) ||
          ts.isInterfaceDeclaration(statement) ||
          ts.isEmptyStatement(statement)
        )
          continue
        if (contains(statement, (node) => ts.isYieldExpression(node))) {
          flush()
          continue
        }
        if (!isSimple(statement) && contains(statement, isAwaitLike)) {
          if (ts.isIfStatement(statement)) branch(statement)
          // An `if` whose awaits all read and whose branches fall through is one conditional
          // read. A loop, a `try`, or a branch that returns, throws, writes, or drops a value
          // orders its awaits on its own terms, so no await moves across it. Inner blocks are
          // checked on their own.
          const reads =
            ts.isIfStatement(statement) &&
            !exits(statement) &&
            !contains(statement.expression, isAwaitLike) &&
            !contains(
              statement,
              (node) =>
                ts.isIterationStatement(node, false) ||
                ts.isTryStatement(node) ||
                (ts.isAwaitExpression(node) &&
                  (effect(node.expression) !== 'read' ||
                    ts.isExpressionStatement(node.parent))),
            )
          if (!reads) {
            flush()
            continue
          }
          run.push({
            callee: '',
            line: line(statement),
            taint: new Set(writesOf(statement)),
            control: false,
            fixed: true,
          })
        }
        if (isSimple(statement))
          for (const site of sites(statement)) {
            // A write, a signature, a callback, or a dropped value keeps its place, so nothing
            // moves across it.
            if (!foldable(statement, site)) {
              flush()
              continue
            }
            // A read that runs only when a result of the run allows it stays where it is, but
            // later reads may still move across it.
            const fixed = pinned(statement, site, dependent)
            if (!fixed && dependent(site.await.expression)) flush()
            run.push(member(statement, site, fixed))
          }
        // Values computed from a result carry its taint. Code that reads a result and can return,
        // throw, break, or assert makes everything after it wait for that result.
        if (run.length === 0) continue
        const reads = readsOf(statement)
        const writes = writesOf(statement)
        const control = exits(statement) || isBareCall(statement)
        for (const m of run) {
          if (!intersects(reads, m.taint)) continue
          for (const symbol of writes) m.taint.add(symbol)
          if (control) m.control = true
        }
      }
      flush()
    }

    const group = (members: Member[]): Finding => {
      const lines = [...new Set(members.map((m) => m.line))]
      const callees = members.map((m) => m.callee)
      return {
        line: lines[0]!,
        note: `${lines.length === 1 ? 'line' : 'lines'} ${list(lines.map(String))} await ${list(callees)} independently`,
      }
    }

    // Every block, `case` clause, and concise arrow body, except `finally`: cleanup runs in the
    // order it is written, whatever happened before it.
    const blocks = (node: ts.Node) => {
      if (node !== fn && isScope(node)) return
      if (ts.isTryStatement(node)) {
        blocks(node.tryBlock)
        if (node.catchClause) blocks(node.catchClause)
        return
      }
      if (ts.isBlock(node) || ts.isCaseClause(node) || ts.isDefaultClause(node))
        sequence(node.statements)
      ts.forEachChild(node, blocks)
    }
    if (ts.isBlock(fn.body!)) blocks(fn.body!)
    else {
      sequence([fn.body!])
      ts.forEachChild(fn.body!, blocks)
    }

    const loops = (node: ts.Node) => {
      if (node !== fn && isScope(node)) return
      if (ts.isTryStatement(node)) {
        loops(node.tryBlock)
        if (node.catchClause) loops(node.catchClause)
        return
      }
      if (ts.isIterationStatement(node, false)) {
        const finding = loop(node)
        if (finding) {
          findings.push(finding)
          return
        }
      }
      ts.forEachChild(node, loops)
    }
    loops(fn.body!)

    return findings.sort((a, b) => a.line - b.line)
  }

  /**
   * Whether a loop awaits work whose iterations do not depend on each other, so it could become
   * `Promise.all(items.map(…))`.
   */
  function loop(node: ts.IterationStatement): Finding | undefined {
    const body = node.statement
    const awaits = sites(body).map((site) => site.await)
    if (awaits.length === 0) return undefined
    // `while` and `do` loops in viem poll, retry, or page through results, which are sequential
    // on purpose, and `for await` consumes a stream one item at a time.
    if (ts.isWhileStatement(node) || ts.isDoStatement(node)) return undefined
    if (ts.isForOfStatement(node) && node.awaitModifier) return undefined
    if (ts.isForStatement(node) && !counted(node)) return undefined
    // An early `return`, `throw`, or `break` stops at the first hit, such as the first gateway
    // that answers, and saves the requests after it.
    if (exits(body, true)) return undefined
    // A `try` around an await handles each item's failure on its own, often as a fallback.
    if (
      contains(
        body,
        (child) =>
          ts.isTryStatement(child) && contains(child.tryBlock, isAwaitLike),
      )
    )
      return undefined
    if (contains(body, (child) => ts.isYieldExpression(child))) return undefined
    // A loop that sleeps polls on purpose.
    if (
      contains(body, (child) => {
        if (!ts.isCallExpression(child)) return false
        const name = lastName(child.expression)
        return !!name && waits.test(name)
      })
    )
      return undefined
    for (const site of awaits) {
      const operand = unwrap(site.expression)
      // A loop that awaits a `Promise.all` per iteration runs bounded batches on purpose, to cap
      // concurrent requests.
      if (
        ts.isCallExpression(operand) &&
        calleeName(operand)?.startsWith('Promise.')
      )
        return undefined
      if (!calleeName(operand) || effect(operand) !== 'read') return undefined
    }
    // A variable from outside the loop that the body writes carries state from one iteration to
    // the next: a cursor, an offset, a seen set, or a running total. An await or branch that reads
    // it depends on earlier iterations. Collections only appended to (`list.push(await f(x))`)
    // are not read, so they stay independent.
    const outer = new Set(
      refs(body)
        .filter(
          (ref) =>
            ref.write &&
            !ref.symbol.declarations?.some(
              (d) => d.pos >= node.pos && d.end <= node.end,
            ),
        )
        .map((ref) => ref.symbol),
    )
    if (outer.size > 0) {
      for (const site of awaits)
        if (intersects(touchesOf(site.expression), outer)) return undefined
      const last = Math.max(...awaits.map((a) => a.pos))
      if (
        refs(body).some(
          (ref) => ref.read && outer.has(ref.symbol) && ref.node.pos < last,
        )
      )
        return undefined
      const header =
        ts.isForOfStatement(node) || ts.isForInStatement(node)
          ? node.expression
          : (node as ts.ForStatement).condition
      if (header && intersects(touchesOf(header), outer)) return undefined
    }
    const callees = [...new Set(awaits.map((a) => label(a.expression)))]
    const lines = [...new Set(awaits.map(line))]
    return {
      line: line(node),
      note: `loop on line ${line(node)} awaits ${list(callees)} (${lines.length === 1 ? 'line' : 'lines'} ${list(lines.map(String))}) one iteration at a time`,
    }
  }

  /**
   * Whether a `for` loop counts through a fixed range: `let i = …; i < n; i++`, with `i` left
   * alone in the body. Any other `for` may stop on a value the body computes.
   */
  function counted(node: ts.ForStatement): boolean {
    const init = node.initializer
    if (
      !init ||
      !ts.isVariableDeclarationList(init) ||
      init.declarations.length !== 1
    )
      return false
    const name = init.declarations[0]!.name
    if (!ts.isIdentifier(name)) return false
    const cond = node.condition
    if (
      !cond ||
      !ts.isBinaryExpression(cond) ||
      ![
        ts.SyntaxKind.LessThanToken,
        ts.SyntaxKind.LessThanEqualsToken,
        ts.SyntaxKind.GreaterThanToken,
        ts.SyntaxKind.GreaterThanEqualsToken,
      ].includes(cond.operatorToken.kind)
    )
      return false
    const inc = node.incrementor
    if (
      !inc ||
      !(
        ((ts.isPostfixUnaryExpression(inc) ||
          ts.isPrefixUnaryExpression(inc)) &&
          ts.isIdentifier(inc.operand) &&
          inc.operand.text === name.text) ||
        (ts.isBinaryExpression(inc) &&
          ts.isIdentifier(inc.left) &&
          inc.left.text === name.text)
      )
    )
      return false
    const symbol = symbolOf(name)
    return !refs(node.statement).some(
      (ref) => ref.write && ref.symbol === symbol,
    )
  }

  return { analyze }
}

/** Joins words as `a`, `a and b`, or `a, b and c`. */
function list(words: string[]): string {
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`
}
