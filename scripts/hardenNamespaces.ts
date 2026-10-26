import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

// Rewrites namespace member assignments in the emitted JavaScript that shadow
// an intrinsic prototype property (e.g. `getAllowance.call = call`) into
// `Object.defineProperty`. Under frozen intrinsics (SES `lockdown()`), the
// assignment throws because the inherited property is read-only (the "override
// mistake"). The resulting property descriptor is identical.
//
// Usage: `bun scripts/hardenNamespaces.ts <outDir>`

const intrinsics = new Set([
  ...Object.getOwnPropertyNames(Function.prototype),
  ...Object.getOwnPropertyNames(Object.prototype),
])

const directory = process.argv[2]
if (!directory) throw new Error('Usage: hardenNamespaces.ts <outDir>')

let count = 0
for (const file of readdirSync(directory, { recursive: true })) {
  if (typeof file !== 'string' || !file.endsWith('.js')) continue
  const path = join(directory, file)
  const text = readFileSync(path, 'utf8')
  const source = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  )

  const edits: { end: number; start: number; text: string }[] = []
  const visit = (node: ts.Node): void => {
    const namespace = getNamespace(node)
    if (namespace)
      for (const statement of namespace.body.statements) {
        const member = getMember(statement, namespace.name)
        if (!member || !intrinsics.has(member.name)) continue
        edits.push({
          end: statement.getEnd(),
          start: statement.getStart(source),
          text: `Object.defineProperty(${namespace.name}, ${JSON.stringify(member.name)}, { configurable: true, enumerable: true, value: ${member.value.getText(source)}, writable: true });`,
        })
      }
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (edits.length === 0) continue

  let output = text
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end)
  writeFileSync(path, output)
  count += edits.length
}

console.log(`Hardened ${count} namespace members in ${directory}.`)

/**
 * Returns the namespace of an emitted namespace IIFE:
 * `(function (name) { … })(name || (… = {}))`.
 */
function getNamespace(node: ts.Node) {
  if (!ts.isCallExpression(node) || node.arguments.length !== 1) return
  if (!ts.isParenthesizedExpression(node.expression)) return
  const fn = node.expression.expression
  if (!ts.isFunctionExpression(fn) || fn.parameters.length !== 1) return
  const parameter = fn.parameters[0]!.name
  if (!ts.isIdentifier(parameter)) return
  const argument = node.arguments[0]!
  if (!ts.isBinaryExpression(argument)) return
  if (argument.operatorToken.kind !== ts.SyntaxKind.BarBarToken) return
  if (!ts.isIdentifier(argument.left)) return
  if (argument.left.text !== parameter.text) return
  return { body: fn.body, name: parameter.text }
}

/** Returns the member of a `name.member = value;` statement. */
function getMember(statement: ts.Statement, name: string) {
  if (!ts.isExpressionStatement(statement)) return
  const expression = statement.expression
  if (!ts.isBinaryExpression(expression)) return
  if (expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return
  const target = expression.left
  if (!ts.isPropertyAccessExpression(target)) return
  if (!ts.isIdentifier(target.expression)) return
  if (target.expression.text !== name) return
  return { name: target.name.text, value: expression.right }
}
