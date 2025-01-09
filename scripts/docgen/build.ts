import { relative, resolve } from 'node:path'
import * as model from '@microsoft/api-extractor-model'
import fs from 'fs-extra'
import type { SidebarItem, TopNav } from 'vocs'

import { getExports } from '../utils/exports.js'
import { renderApiFunction } from './render/apiFunction.js'
import {
  type ModuleItem,
  renderNamespace,
  renderNamespaceErrors,
  renderNamespaceTypes,
} from './render/apiNamespace.js'
import { createDataLookup, getId, getPath } from './utils/model.js'
import { namespaceRegex } from './utils/regex.js'
import {
  extractNamespaceDocComments,
  type processDocComment,
} from './utils/tsdoc.js'

// biome-ignore lint/suspicious/noConsoleLog:
console.log('Generating API docs.')

////////////////////////////////////////////////////////////
/// Load API Model
////////////////////////////////////////////////////////////

const fileName = './scripts/docgen/viem.api.json'
const apiPackage = new model.ApiModel().loadPackage(fileName)

////////////////////////////////////////////////////////////
/// Get namespace doc comments
////////////////////////////////////////////////////////////

const exports = getExports()

export let namespaceDocComments: ReturnType<
  typeof extractNamespaceDocComments
> = {}
for (const path of Object.values(exports.src)) {
  if (!path.endsWith('index.ts')) continue
  const comments = extractNamespaceDocComments(
    resolve(import.meta.dirname, '../../src', path),
    apiPackage,
  )
  if (!comments) continue
  namespaceDocComments = { ...namespaceDocComments, ...comments }
}

////////////////////////////////////////////////////////////
/// Construct lookup
////////////////////////////////////////////////////////////

const dataLookup = createDataLookup(apiPackage)

fs.writeFileSync(
  './scripts/docgen/lookup.json',
  JSON.stringify(dataLookup, null, 2),
)

////////////////////////////////////////////////////////////
/// Get API entrypoints and namespaces
////////////////////////////////////////////////////////////

const apiEntryPoint = apiPackage.members.find(
  (x) =>
    x.kind === model.ApiItemKind.EntryPoint &&
    x.canonicalReference.toString() === 'viem!',
) as model.ApiEntryPoint
if (!apiEntryPoint) throw new Error('Could not find api entrypoint')

const testNamespaces: string[] = []
const excludeNamespaces = ['Caches', 'Errors', 'Solidity', 'Types']
const namespaces = []
for (const member of apiEntryPoint.members) {
  if (member.kind !== model.ApiItemKind.Namespace) continue
  if (!namespaceRegex.test(getId(member))) continue
  if (excludeNamespaces.includes(member.displayName)) continue
  if (testNamespaces.length && !testNamespaces.includes(member.displayName))
    continue
  namespaces.push(member)
}

////////////////////////////////////////////////////////////
/// Build markdown files
////////////////////////////////////////////////////////////

type EntrypointCategory = string
type NamespaceCategory = string
type NamespaceItem = {
  docComment: ReturnType<typeof processDocComment>
  name: string
  sidebarItem: SidebarItem
}[]

const pagesDir = './site/pages'
const namespaceMap: Record<
  EntrypointCategory,
  Record<NamespaceCategory, NamespaceItem>
> = {}

for (const namespace of namespaces) {
  const name = namespace.displayName
  const docComment = namespaceDocComments[name]
  const basePath = docComment ? getPath(docComment) : '/'
  const baseLink = `${basePath}/${name}`
  const dir = `${pagesDir}${baseLink}`
  fs.ensureDirSync(dir)

  const data = dataLookup[getId(namespace)]
  const filePath = data?.file.path ?? ''
  const entrypoint = relative(
    resolve(import.meta.dirname, '../../src'),
    filePath,
  ).replace(/\/?index\.ts?$/, '')

  const items = []
  const errors: ModuleItem[] = []
  const functions: ModuleItem[] = []
  const types: ModuleItem[] = []

  for (const member of namespace.members) {
    const id = getId(member)
    const data = dataLookup[id]
    if (!data) throw new Error(`Could not find data for ${id}`)

    const { description, displayName } = data
    const displayNameWithNamespace = `${name}.${displayName}`

    if (member.kind === model.ApiItemKind.Function) {
      // Resolve overloads for function
      const overloads = member
        .getMergedSiblings()
        .map(getId)
        .filter((x) => !x.endsWith('namespace'))
      // Skip overloads without TSDoc attached
      if (
        overloads.length > 1 &&
        overloads.find((x) => dataLookup[x]?.comment?.summary) !== id
      )
        continue

      const link = `${baseLink}/${displayName}`
      items.push({ text: `.${displayName}`, link })
      functions.push({ apiItem: member, description, link })

      const content = renderApiFunction({
        apiItem: apiPackage,
        basePath,
        data,
        dataLookup,
        entrypoint,
        overloads,
      })
      fs.writeFileSync(`${dir}/${displayName}.md`, content)
    } else if (member.kind === model.ApiItemKind.Class) {
      if (displayName.endsWith('Error'))
        errors.push({
          apiItem: member,
          description,
          link: `${baseLink}/errors#${displayNameWithNamespace.toLowerCase().replace('.', '')}`,
        })
      else throw new Error(`Unsupported class: ${displayName}`)
    } else if (member.kind === model.ApiItemKind.TypeAlias) {
      types.push({
        apiItem: member,
        description,
        link: `${baseLink}/types#${displayNameWithNamespace.toLowerCase().replace('.', '')}`,
      })
    }
  }

  if (errors.length) {
    items.push({ text: 'Errors', link: `${baseLink}/errors` })
    const content = renderNamespaceErrors({ dataLookup, errors, name })
    fs.writeFileSync(`${dir}/errors.md`, content)
  }

  if (types.length) {
    items.push({ text: 'Types', link: `${baseLink}/types` })
    const content = renderNamespaceTypes({ dataLookup, types, name })
    fs.writeFileSync(`${dir}/types.md`, content)
  }

  const category = namespaceDocComments[name]?.category
  if (!category)
    throw new Error(
      `Could not find category for namespace: ${name}. Please add a TSDoc \`@category\` tag.`,
    )

  const entrypointCategory = namespaceDocComments[name]?.entrypointCategory
  if (!entrypointCategory)
    throw new Error(
      `Could not find entrypoint for namespace: ${name}. Please add a TSDoc \`@entrypointCategory\` tag.`,
    )

  namespaceMap[entrypointCategory] ??= {}
  namespaceMap[entrypointCategory][category] ??= []
  namespaceMap[entrypointCategory][category].push({
    docComment,
    name,
    sidebarItem: {
      collapsed: true,
      items,
      link: baseLink,
      text: name,
    },
  })

  const content = renderNamespace({
    apiItem: namespace,
    docComment,
    errors,
    functions,
    types,
  })
  fs.writeFileSync(`${dir}/index.md`, content)
}

////////////////////////////////////////////////////////////
/// Build sidebar & top nav
////////////////////////////////////////////////////////////

const namespaceEntries: {
  entrypointCategory: EntrypointCategory
  categories: {
    category: NamespaceCategory
    items: NamespaceItem
  }[]
}[] = []

for (const [entrypointCategory, categories] of Object.entries(namespaceMap)) {
  let alphabetized = []
  for (const [category, items] of Object.entries(categories)) {
    alphabetized.push({ category, items })
  }
  alphabetized = alphabetized.toSorted((a, b) =>
    a.category.localeCompare(b.category),
  )
  namespaceEntries.push({ entrypointCategory, categories: alphabetized })
}

const sidebar: Record<string, { backLink: true; items: SidebarItem[] }> = {}
for (const { entrypointCategory, categories } of namespaceEntries) {
  const path = getPath({ entrypointCategory })
  sidebar[path] = {
    backLink: true,
    items: [
      {
        text: 'Overview',
        link: path,
      },
      ...categories.map(({ category, items }) => ({
        text: category,
        items: items.map(({ sidebarItem }) => sidebarItem),
      })),
    ],
  }
}

const topNav: TopNav = namespaceEntries.map(({ entrypointCategory }) => ({
  text: entrypointCategory,
  link: getPath({ entrypointCategory }),
})) satisfies TopNav

fs.writeFileSync(
  './site/config-generated.ts',
  `export const sidebar = ${JSON.stringify(sidebar, null, 2)}\n` +
    `export const topNav = ${JSON.stringify(topNav, null, 2)}`,
)

////////////////////////////////////////////////////////////
/// Generate "API Reference" pages
////////////////////////////////////////////////////////////

for (const namespace of namespaceEntries) {
  let content = '# API Reference\n\n'

  content += '<table className="vocs_Table">\n'
  content += '<tbody>\n'

  for (const { category, items } of namespace.categories) {
    content += `<tr><td className="vocs_TableCell" colSpan="2" style={{ backgroundColor: 'var(--vocs-color_background2)' }}>**${category}**</td></tr>\n`
    for (const item of items) {
      const description = item.docComment?.summary
        .split('\n\n')[0]
        ?.replace('\n', ' ')
      content += `<tr><td className="vocs_TableCell"><a className="vocs_Anchor vocs_Link vocs_Link_accent_underlined" href="${item.sidebarItem.link}">${item.name}</a></td><td className="vocs_TableCell">${description}</td></tr>\n`
    }
  }
  content += '</tbody>\n'
  content += '</table>\n'

  const path = `${pagesDir}${getPath(namespace)}`
  fs.writeFileSync(`${path}/index.mdx`, content)
}

// biome-ignore lint/suspicious/noConsoleLog:
console.log('Done.')
