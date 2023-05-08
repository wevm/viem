import {
  ExportDeclaration,
  ExportDeclarationStructure,
  ModuleResolutionKind,
  Node,
  OptionalKind,
  SourceFile,
  Structures,
  Symbol as MorphSymbol,
  SyntaxKind,
} from 'ts-morph'
import { Project } from 'ts-morph'

const project = new Project({
  tsConfigFilePath: './tsconfig.build.json',
})

const entrypoints = [
  'src/index.ts',
  'src/abi.ts',
  'src/chains.ts',
  'src/contract.ts',
  'src/ens.ts',
  'src/ethers.ts',
  'src/public.ts',
  'src/test.ts',
  'src/wallet.ts',
  'src/window.ts',
  'src/utils/index.ts',
  'src/accounts/index.ts',
] as const

type Entrypoint = typeof entrypoints[number]

// TODO: Add the other entrypoints here.
const exports: Partial<Record<Entrypoint, string[]>> = {
  'src/index.ts': ['src/**/*.ts', ...excludePaths(entrypoints)],
}

for (const entrypoint of entrypoints) {
  const patterns = exports[entrypoint]
  if (patterns !== undefined) {
    generateEntrypoint(project, entrypoint, patterns)
  }
}

function generateEntrypoint(
  tsProject: Project,
  filePath: string,
  globPatterns: string[],
) {
  const compilerOptions = tsProject.getCompilerOptions()
  const moduleResolution = compilerOptions.moduleResolution

  const entryPointFile = tsProject.createSourceFile(filePath, undefined, {
    overwrite: true,
  })

  const entryPointFullPath = entryPointFile.getFilePath()
  const sourceFiles = tsProject
    .getSourceFiles(globPatterns)
    .filter((sourceFile) => sourceFile.getFilePath() !== entryPointFullPath)

  const collectedExports = new Set<OptionalKind<ExportDeclarationStructure>>()
  for (const sourceFile of sourceFiles) {
    if (isIgnored(sourceFile)) {
      continue
    }

    const exportsForFile: [type: boolean, name: string][] = []
    for (const exportedSymbol of Array.from(sourceFile.getExportSymbols())) {
      const resolvedExport = getExport(exportedSymbol)

      if (resolvedExport !== undefined) {
        exportsForFile.push(resolvedExport)
      }
    }

    if (exportsForFile.length !== 0) {
      const moduleSpecifier = getModuleSpecifer(entryPointFile, sourceFile)
      const isTypeOnly = exportsForFile.every(([type]) => type)

      collectedExports.add({
        moduleSpecifier,
        isTypeOnly,
        namedExports: exportsForFile.map(([type, name]) => ({
          isTypeOnly: type && !isTypeOnly,
          name,
        })),
        leadingTrivia: `// ${moduleSpecifier}`,
        trailingTrivia: '\n',
      })
    }
  }

  const exportDeclarations = Array.from(collectedExports.values())
  entryPointFile.addExportDeclarations(exportDeclarations)
  entryPointFile.saveSync()

  function getModuleSpecifer(from: SourceFile, to: SourceFile) {
    const moduleSpecifier = from.getRelativePathAsModuleSpecifierTo(to)
    if (moduleResolution === ModuleResolutionKind.NodeNext) {
      if (!moduleSpecifier.endsWith('.js')) {
        return `${moduleSpecifier}.js`
      }
    }

    return moduleSpecifier
  }
}

function excludePaths(paths: readonly string[]) {
  return paths.map((path) => `!${path}`)
}

function getLeadingCommentStatements(node: SourceFile) {
  const comments: string[] = []
  for (const statement of node.getStatementsWithComments()) {
    if (Node.isCommentStatement(statement)) {
      comments.push(statement.getText())
    } else {
      break
    }
  }

  return comments
}

function getExport(
  symbol: MorphSymbol,
): [type: boolean, name: string] | undefined {
  const [node] = symbol.getDeclarations() ?? []

  if (node === undefined || isIgnored(node) || isDefaultExport(node)) {
    return undefined
  }

  const parent = node.getParentOrThrow()
  if (parent.isKind(SyntaxKind.NamedExports)) {
    const declaration = parent.getParent()
    const match = getNamedExportForSymbol(declaration, symbol)
    if (match === undefined) {
      return undefined
    }

    if (declaration.isTypeOnly() || match.isTypeOnly()) {
      return [true, symbol.getName()]
    }

    return [false, symbol.getName()]
  }

  if (node.isKind(SyntaxKind.TypeAliasDeclaration)) {
    return [true, symbol.getName()]
  } else if (node.isKind(SyntaxKind.InterfaceDeclaration)) {
    return [true, symbol.getName()]
  } else if (node.isKind(SyntaxKind.ExportDeclaration)) {
    console.log(true)
  }

  return [false, symbol.getName()]
}

function getNamedExportForSymbol(node: ExportDeclaration, symbol: MorphSymbol) {
  const name = symbol.getAliasedSymbol()?.getName() ?? symbol.getName()
  return node.getNamedExports().find((item) => item.getName() === name)
}

function isIgnored(item: Node | Structures | string) {
  if (Node.isNode(item)) {
    if (Node.isSourceFile(item)) {
      const comments = getLeadingCommentStatements(item)
      if (comments.some((item) => item.includes('entrypoint:ignore'))) {
        return true
      }

      return false
    }

    return item.getLeadingCommentRanges().some((comment) => {
      return comment.getText().includes('entrypoint:ignore')
    })
  }

  if (typeof item === 'string') {
    return item.includes('entrypoint:ignore')
  }

  if (typeof item.leadingTrivia === 'string') {
    return item.leadingTrivia.includes('entrypoint:ignore')
  }

  return false
}

function isDefaultExport(node: Node) {
  return Node.isExportGetable(node) && node.hasDefaultKeyword()
}
