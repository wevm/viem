import { outputFileSync, readJsonSync, writeJsonSync } from 'fs-extra'
import path from 'path'

type Exports = {
  [key: string]: string | { types?: string; import: string; default: string }
}

generatePackageJson()

// Generates a package.json to be published to NPM with only the necessary fields.
function generatePackageJson() {
  const packageJsonPath = path.join(__dirname, '../package.json')
  const tmpPackageJson = readJsonSync(packageJsonPath)

  writeJsonSync(`${packageJsonPath}.tmp`, tmpPackageJson, { spaces: 2 })

  const {
    name,
    description,
    dependencies,
    peerDependencies,
    version,
    files,
    exports: exports_,
    // NOTE: We explicitly don't want to publish the type field. We create a separate package.json for `dist/cjs` and `dist/esm` that has the type field.
    // type,
    main,
    module,
    types,
    typings,
    typesVersions,
    sideEffects,
    license,
    repository,
    authors,
    keywords,
  } = tmpPackageJson

  // Generate proxy packages for each export.
  const files_ = [...files]
  for (const [key, value] of Object.entries(exports_ as Exports)) {
    if (typeof value === 'string') continue
    if (key === '.') continue
    if (!value.default || !value.import)
      throw new Error('`default` and `import` are required.')

    outputFileSync(
      `${key}/package.json`,
      `{
  ${Object.entries(value)
    .map(([k, v]) => {
      const key = (() => {
        if (k === 'import') return 'module'
        if (k === 'default') return 'main'
        if (k === 'types') return 'types'
        throw new Error('Invalid key')
      })()
      return `"${key}": "${v.replace('./', '../')}"`
    })
    .join(',\n  ')}
}`,
    )
    files_.push(key.replace('./', ''))
  }

  writeJsonSync(
    packageJsonPath,
    {
      name,
      description,
      dependencies,
      peerDependencies,
      version,
      files: files_,
      exports: exports_,
      // type,
      main,
      module,
      types,
      typings,
      typesVersions,
      sideEffects,
      license,
      repository,
      authors,
      keywords,
    },
    { spaces: 2 },
  )
}
