import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import remapping from '@jridgewell/remapping'
import * as acorn from 'acorn'
import MagicString from 'magic-string'

// Rewrites namespace member assignments in the emitted JavaScript that shadow
// an intrinsic prototype property (e.g. `getAllowance.call = call`) into
// `Object.defineProperty`. Under frozen intrinsics (SES `lockdown()`), the
// assignment throws because the inherited property is read-only (the "override
// mistake"). The resulting property descriptor is identical. The adjacent
// `.js.map` is remapped through the edits, so it still resolves to the source.
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
  const program = acorn.parse(text, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })

  const output = new MagicString(text)
  let edits = 0
  const visit = (node: acorn.Node): void => {
    const namespace = getNamespace(node)
    if (namespace)
      for (const statement of namespace.body) {
        const member = getMember(statement, namespace.name)
        if (!member || !intrinsics.has(member.name)) continue
        // Only the text around the value changes, so the value and the
        // trailing `;` keep their original source map segments.
        output.overwrite(
          statement.start,
          member.value.start,
          `Object.defineProperty(${namespace.name}, ${JSON.stringify(member.name)}, { configurable: true, enumerable: true, value: `,
        )
        output.appendLeft(member.value.end, ', writable: true })')
        edits++
      }
    for (const value of Object.values(node) as unknown[])
      for (const child of Array.isArray(value) ? value : [value])
        if (isNode(child)) visit(child)
  }
  visit(program)
  if (edits === 0) continue

  writeFileSync(path, output.toString())
  count += edits

  const mapPath = `${path}.map`
  if (!existsSync(mapPath)) continue
  const map = JSON.parse(readFileSync(mapPath, 'utf8'))
  const edit = output.generateMap({
    file: map.file,
    hires: true,
    source: basename(path),
  })
  writeFileSync(
    mapPath,
    remapping([edit.toString(), map], () => null).toString(),
  )
}

console.log(`Hardened ${count} namespace members in ${directory}.`)

/**
 * Returns the namespace of an emitted namespace IIFE:
 * `(function (name) { … })(name || (… = {}))`.
 */
function getNamespace(node: acorn.Node) {
  if (!is(node, 'CallExpression') || node.arguments.length !== 1) return
  const fn = node.callee
  if (!is(fn, 'FunctionExpression') || fn.params.length !== 1) return
  const parameter = fn.params[0]!
  if (!is(parameter, 'Identifier')) return
  const argument = node.arguments[0]!
  if (!is(argument, 'LogicalExpression') || argument.operator !== '||') return
  if (!is(argument.left, 'Identifier')) return
  if (argument.left.name !== parameter.name) return
  return { body: fn.body.body, name: parameter.name }
}

/** Returns the member of a `name.member = value;` statement. */
function getMember(
  statement: acorn.Statement | acorn.ModuleDeclaration,
  name: string,
) {
  if (!is(statement, 'ExpressionStatement')) return
  const expression = statement.expression
  if (!is(expression, 'AssignmentExpression') || expression.operator !== '=')
    return
  const target = expression.left
  if (!is(target, 'MemberExpression') || target.computed) return
  if (!is(target.object, 'Identifier') || target.object.name !== name) return
  if (!is(target.property, 'Identifier')) return
  return { name: target.property.name, value: expression.right }
}

/** Narrows a node to the node type `type`. */
function is<type extends acorn.AnyNode['type']>(
  node: acorn.Node,
  type: type,
): node is Extract<acorn.AnyNode, { type: type }> {
  return node.type === type
}

/** Returns whether a property value of a node is a child node. */
function isNode(value: unknown): value is acorn.Node {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { type?: unknown }).type === 'string'
  )
}
