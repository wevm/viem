import dedent from 'dedent'
import { execa } from 'execa'
import { default as fs } from 'fs-extra'
import type { Options } from 'tsup'

import path from 'path'

type GetConfig = Omit<
  Options,
  'bundle' | 'clean' | 'dts' | 'entry' | 'format'
> & {
  entry?: string[]
  dev?: boolean
}

export function getConfig({ dev, ...options }: GetConfig): Options {
  if (!options.entry?.length) throw new Error('entry is required')
  const entry: string[] = options.entry ?? []

  // Hacks tsup to create Preconstruct-like linked packages for development
  // https://github.com/preconstruct/preconstruct
  if (dev)
    return {
      clean: true,
      // Only need to generate one file with tsup for development since we will create links in `onSuccess`
      entry: [entry[0] as string],
      format: ['esm', 'cjs'],
      silent: true,
      async onSuccess() {
        // remove all files in dist
        await fs.emptyDir('dist')
        // symlink files and type definitions
        for (const file of entry) {
          const filePath = path.resolve(file)
          const distSourceFile = filePath
            .replace(file, file.replace('src/', 'dist/'))
            .replace(/\.ts$/, '.js')
          // Make sure directory exists
          await fs.ensureDir(path.dirname(distSourceFile))
          // Create symlink between source and dist file
          await fs.symlink(filePath, distSourceFile, 'file')
          // Create file linking up type definitions
          const srcTypesFile = path
            .relative(path.dirname(distSourceFile), filePath)
            .replace(/\.ts$/, '')
          await fs.outputFile(
            distSourceFile.replace(/\.js$/, '.d.ts'),
            `export * from '${srcTypesFile}'`,
          )
          fs.copyFileSync(distSourceFile, distSourceFile.replace('.js', '.mjs'))
        }
        const exports = await generateExports(entry)
        await generateProxyPackages(exports)
      },
    }

  return {
    bundle: true,
    clean: true,
    dts: true,
    format: ['esm', 'cjs'],
    sourcemap: true,
    splitting: true,
    target: 'es2021',
    async onSuccess() {
      if (typeof options.onSuccess === 'function') await options.onSuccess()
      else if (typeof options.onSuccess === 'string') execa(options.onSuccess)

      const exports = await generateExports(entry)
      await generateProxyPackages(exports)
    },
    ...options,
  }
}

type Exports = {
  [key: string]: string | { types?: string; module: string; default: string }
}

/**
 * Generate exports from entry files
 */
async function generateExports(entry: string[]) {
  const exports: Exports = {}
  for (const file of entry) {
    const extension = path.extname(file)
    const fileWithoutExtension = file.replace(extension, '')
    const name = fileWithoutExtension
      .replace(/^src\//g, './')
      .replace(/\/index$/, '')
    const distCjsFile = `${fileWithoutExtension.replace(
      /^src\//g,
      './dist/',
    )}.js`
    const distEsmFile = `${fileWithoutExtension.replace(
      /^src\//g,
      './dist/',
    )}.mjs`
    const distTypesFile = `${fileWithoutExtension.replace(
      /^src\//g,
      './dist/',
    )}.d.ts`
    exports[name] = {
      types: distTypesFile,
      module: distEsmFile,
      default: distCjsFile,
    }
  }

  exports['./package.json'] = './package.json'

  const packageJson = await fs.readJSON('package.json')
  packageJson.exports = exports
  await fs.writeFile(
    'package.json',
    JSON.stringify(packageJson, null, 2) + '\n',
  )

  return exports
}

/**
 * Generate proxy packages files for each export
 */
async function generateProxyPackages(exports: Exports) {
  for (const [key, value] of Object.entries(exports)) {
    if (typeof value === 'string') continue
    if (key === '.') continue
    if (!value.default) continue
    await fs.ensureDir(key)
    const entrypoint = path.relative(key, value.default)
    const fileExists = await fs.pathExists(value.default)
    if (!fileExists)
      throw new Error(
        `Proxy package "${key}" entrypoint "${entrypoint}" does not exist.`,
      )

    await fs.outputFile(
      `${key}/package.json`,
      dedent`{
        "module": "${entrypoint.replace('.js', '.mts')}",
        "main": "${entrypoint}"
      }`,
    )
  }
}
