import * as Fs from 'node:fs'
import * as Path from 'node:path'
import * as Abi from 'ox/Abi'
import * as AbiFunction from 'ox/AbiFunction'
import * as AbiItem from 'ox/AbiItem'

const extensions: Record<string, string[]> = {
  ITIP20: ['IRolesAuth'],
}

const out = Path.resolve(import.meta.dirname, '../src/tempo/Abis.ts')
const selectorsOut = Path.resolve(
  import.meta.dirname,
  '../src/tempo/Selectors.ts',
)
const precompilesDir = Path.resolve(
  import.meta.dirname,
  '../test/tempo/crates/contracts/src/precompiles',
)

const compareStrings = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

// Read all .rs files from the precompiles directory
const files = Fs.readdirSync(precompilesDir)
  .filter((file) => file.endsWith('.rs') && file !== 'mod.rs')
  .sort()

// Aggregate content from all precompile files
const content = files
  .map((file) => Fs.readFileSync(Path.join(precompilesDir, file), 'utf-8'))
  .join('\n\n')

interface InterfaceDefinition {
  name: string
  items: string[]
}

interface ProcessedInterface {
  exportName: string
  abi: ReturnType<typeof Abi.from>
}

const interfaces = new Map<string, InterfaceDefinition>()

// Extract all sol! blocks
const solBlockRegex = /sol!\s*\{([\s\S]*?)\n\}/gs

for (const solMatch of content.matchAll(solBlockRegex)) {
  const [, solBlock] = solMatch
  if (!solBlock) continue

  // Extract all interfaces from this sol! block
  // Match interface name and opening brace, then capture everything until
  // we find a closing brace with 4 spaces of indentation (interface-level closing brace)
  const interfaceRegex = /interface\s+(\w+)\s*\{([\s\S]*?)\n {4}\}/g

  for (const interfaceMatch of solBlock.matchAll(interfaceRegex)) {
    const [, name, body] = interfaceMatch
    if (!name || !body) continue

    const items: string[] = []

    // Extract enums and track them to replace with uint8 in function signatures
    const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g
    const enumDefinitions = new Set<string>()
    const enumTypes = new Set<string>()
    for (const enumMatch of body.matchAll(enumRegex)) {
      const [fullMatch, enumName] = enumMatch
      if (!enumName) continue
      enumTypes.add(enumName)
      enumDefinitions.add(fullMatch)
    }

    // Remove enum definitions from body for cleaner processing
    let cleanBody = body
    for (const enumDef of enumDefinitions) {
      cleanBody = cleanBody.replace(enumDef, '')
    }

    // Helper function to replace enum types with uint8
    const replaceEnumTypes = (definition: string): string => {
      let result = definition
      for (const enumType of enumTypes) {
        // Replace enum type with uint8 in function parameters and return types
        result = result.replace(new RegExp(`\\b${enumType}\\b`, 'g'), 'uint8')
      }
      return result
    }

    // Extract structs
    const structRegex = /struct\s+(\w+)\s*\{([^}]+)\}/g
    const structDefinitions = new Set<string>()
    for (const structMatch of cleanBody.matchAll(structRegex)) {
      const [fullMatch, structName, structBody] = structMatch
      if (!structName || !structBody) continue

      // Parse struct fields. Strip comment lines before splitting on `;` so
      // that semicolons inside doc comments aren't treated as field separators.
      const fields = structBody
        .split('\n')
        .filter((line) => !line.trim().startsWith('///'))
        .join('\n')
        .split(';')
        .map((f) => f.replace(/\s+/g, ' ').trim())
        .filter(Boolean)

      if (fields.length > 0) {
        let structDef = `struct ${structName} { ${fields.join('; ')}; }`
        // Replace enum types with uint8
        structDef = replaceEnumTypes(structDef)
        items.push(structDef)
        structDefinitions.add(fullMatch)
      }
    }

    // Remove struct definitions from body for cleaner processing
    for (const structDef of structDefinitions) {
      cleanBody = cleanBody.replace(structDef, '')
    }

    // Now extract functions, events, and errors line by line
    // First, normalize the body to handle multi-line declarations
    const normalizedBody = cleanBody
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('//'))
      .join(' ')

    // Extract all functions (including multi-line ones)
    const functionRegex = /function\s+[^;]+;/g
    for (const functionMatch of normalizedBody.matchAll(functionRegex)) {
      let [functionDef] = functionMatch
      // Clean up the function definition
      functionDef = functionDef
        .replace(/\s+/g, ' ') // normalize whitespace
        .replace(/\s*;\s*$/, '') // remove trailing semicolon
        .trim()
      // Replace enum types with uint8
      functionDef = replaceEnumTypes(functionDef)
      items.push(functionDef)
    }

    // Extract all events
    const eventRegex = /event\s+[^;]+;/g
    for (const eventMatch of normalizedBody.matchAll(eventRegex)) {
      let [eventDef] = eventMatch
      // Clean up the event definition
      eventDef = eventDef
        .replace(/\s+/g, ' ') // normalize whitespace
        .replace(/\s*;\s*$/, '') // remove trailing semicolon
        .trim()
      // Replace enum types with uint8
      eventDef = replaceEnumTypes(eventDef)
      items.push(eventDef)
    }

    // Extract all errors
    const errorRegex = /error\s+\w+\([^)]*\)/g
    for (const errorMatch of normalizedBody.matchAll(errorRegex)) {
      let [errorDef] = errorMatch
      // Clean up the error definition
      errorDef = errorDef.replace(/\s+/g, ' ').trim()
      // Replace enum types with uint8
      errorDef = replaceEnumTypes(errorDef)
      items.push(errorDef)
    }

    if (items.length > 0) {
      interfaces.set(name, { name, items })
    }
  }
}

// Generate the output file
try {
  Fs.rmSync(out)
} catch {}

Fs.writeFileSync(
  out,
  "// Generated with `pnpm gen:abis`. Do not modify manually.\n\nimport * as Abi from 'ox/Abi'\n\n",
)

// Generate ABIs for all interfaces
const processedInterfaces = new Set<string>()
const processedInterfaceData: ProcessedInterface[] = []

for (const [interfaceName, interfaceData] of interfaces.entries()) {
  // Skip if this interface is only used as an extension (not exported standalone)
  const isUsedAsExtension = Object.values(extensions)
    .flat()
    .includes(interfaceName)
  const isExtendedItself = interfaceName in extensions

  if (isUsedAsExtension && !isExtendedItself) {
    // Skip interfaces that are only used to extend others
    continue
  }

  const allItems: string[] = []

  // Add items from the main interface
  allItems.push(...interfaceData.items)

  // Add items from extension interfaces if defined
  const extensionInterfaces = extensions[interfaceName] || []
  for (const extensionName of extensionInterfaces) {
    const extensionInterface = interfaces.get(extensionName)
    if (extensionInterface) {
      allItems.push(...extensionInterface.items)
    }
  }

  if (allItems.length === 0) continue

  // Generate export name: remove 'I' prefix, convert to camelCase, add 'Abi' suffix
  let cleanName = interfaceName.startsWith('I')
    ? interfaceName.slice(1)
    : interfaceName

  // Handle TIP prefix specially (remove it from the export name)
  if (cleanName.startsWith('TIP') && cleanName.length > 3) {
    const charAfterTip = cleanName.charAt(3)
    if (charAfterTip >= 'A' && charAfterTip <= 'Z') {
      cleanName = cleanName.slice(3)
    }
  }

  const exportName = cleanName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[_\-. \s]+/)
    .map((w, i) => (i ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join('')

  // Format items as array of strings
  const items = allItems.map((item) => {
    return item.replace('external bool', 'external returns (bool)')
  })

  const abi = Abi.from(items)

  Fs.appendFileSync(
    out,
    `export const ${exportName} = ${JSON.stringify(abi)} as const\n\n`,
  )

  processedInterfaces.add(interfaceName)
  processedInterfaceData.push({ exportName, abi })
}

// Generate concatenated `abis` export
const exportNames: string[] = []
for (const [interfaceName] of interfaces.entries()) {
  const isUsedAsExtension = Object.values(extensions)
    .flat()
    .includes(interfaceName)
  const isExtendedItself = interfaceName in extensions
  if (isUsedAsExtension && !isExtendedItself) continue
  if (!processedInterfaces.has(interfaceName)) continue

  let cleanName = interfaceName.startsWith('I')
    ? interfaceName.slice(1)
    : interfaceName
  if (cleanName.startsWith('TIP') && cleanName.length > 3) {
    const charAfterTip = cleanName.charAt(3)
    if (charAfterTip >= 'A' && charAfterTip <= 'Z')
      cleanName = cleanName.slice(3)
  }
  const exportName = cleanName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[_\-. \s]+/)
    .map((w, i) => (i ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join('')
  exportNames.push(exportName)
}

Fs.appendFileSync(
  out,
  `export const abis = [\n${exportNames.map((n) => `  ...${n},`).join('\n')}\n] as const\n`,
)

try {
  Fs.rmSync(selectorsOut)
} catch {}

Fs.writeFileSync(
  selectorsOut,
  "// Generated with `pnpm gen:abis`. Do not modify manually.\n\nimport type { Abi, ExtractAbiFunctionNames } from 'abitype'\nimport type { Hex } from '../types/misc.js'\nimport type * as Abis from './Abis.js'\n\n",
)
Fs.appendFileSync(
  selectorsOut,
  'type FunctionSelectors<\n  abi extends Abi,\n  excluded extends string = never,\n> = {\n  readonly [name in Exclude<ExtractAbiFunctionNames<abi>, excluded>]: Hex\n}\n\n',
)
Fs.appendFileSync(
  selectorsOut,
  'type OverloadedFunctionSelectors<names extends string> = {\n  readonly [name in names]: Record<string, Hex>\n}\n\n',
)

for (const { exportName, abi } of processedInterfaceData) {
  const functions = abi
    .filter((item) => item.type === 'function')
    .sort(
      (a, b) =>
        compareStrings(a.name, b.name) ||
        compareStrings(AbiItem.getSignature(a), AbiItem.getSignature(b)),
    )
  if (functions.length === 0) continue

  const functionNames = functions.map((item) => item.name)
  const overloadedNames = Array.from(
    new Set(
      functionNames.filter(
        (name, index) => functionNames.indexOf(name) !== index,
      ),
    ),
  ).sort(compareStrings)

  const selectors: Record<string, string | Record<string, string>> = {}
  for (const item of functions) {
    const selector = AbiFunction.getSelector(item)
    if (overloadedNames.includes(item.name)) {
      selectors[item.name] ??= {}
      const overloadedSelectors = selectors[item.name] as Record<string, string>
      overloadedSelectors[AbiItem.getSignature(item)] = selector
      continue
    }
    selectors[item.name] = selector
  }

  const overloadedNameType = overloadedNames
    .map((name) => `'${name}'`)
    .join(' | ')
  const selectorType =
    overloadedNames.length > 0
      ? `FunctionSelectors<typeof Abis.${exportName}, ${overloadedNameType}> & OverloadedFunctionSelectors<${overloadedNameType}>`
      : `FunctionSelectors<typeof Abis.${exportName}>`

  Fs.appendFileSync(
    selectorsOut,
    `export const ${exportName} = ${JSON.stringify(selectors, null, 2)} as const satisfies ${selectorType}\n\n`,
  )
}

console.log(
  `✓ Generated ${processedInterfaces.size} ABIs from ${files.length} precompile files`,
)
