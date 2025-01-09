import * as model from '@microsoft/api-extractor-model'

import { type Data, getId } from '../utils/model.js'
import type { processDocComment } from '../utils/tsdoc.js'

export type ModuleItem = {
  apiItem: model.ApiItem
  description: string
  link: string
}

export function renderNamespace(options: {
  apiItem: model.ApiItem
  docComment: ReturnType<typeof processDocComment>
  errors: ModuleItem[]
  functions: ModuleItem[]
  types: ModuleItem[]
}) {
  const {
    apiItem,
    docComment = { examples: [], summary: '' },
    errors,
    functions,
    types,
  } = options
  const { examples, summary } = docComment

  const headings = [...examples]
    .map((x) => {
      if (!x.includes('###')) return
      const header = x.split('\n')[0]!.replaceAll('#', '').trim()
      return { header, slug: header.toLowerCase().replaceAll(' ', '-') }
    })
    .filter(Boolean)

  const content = [`# ${apiItem.displayName}`, summary]
  if (examples.length)
    content.push(
      '## Examples',
      ...(examples.length > 1
        ? [
            `Below are some examples demonstrating common usages of the \`${apiItem.displayName}\` module:`,
            ...headings.map((x) => `- [${x!.header}](#${x!.slug})`),
            ...examples,
          ]
        : [...examples]),
    )

  const tableHeader = [
    '| Name                | Description                         |',
    '| ------------------- | ----------------------------------- |',
  ]

  if (functions.length)
    content.push(
      '## Functions',
      [...tableHeader, renderRows(apiItem, functions)].join('\n'),
    )

  if (errors.length)
    content.push(
      '## Errors',
      [...tableHeader, renderRows(apiItem, errors)].join('\n'),
    )

  if (types.length)
    content.push(
      '## Types',
      [...tableHeader, renderRows(apiItem, types)].join('\n'),
    )

  return content.join('\n\n')
}

function renderRows(item: model.ApiItem, items: ModuleItem[]) {
  return items
    .map(
      (x) =>
        `| [\`${item.displayName}.${x.apiItem.displayName}\`](${x.link}) | ${x.description} |`,
    )
    .join('\n')
}

export function renderNamespaceErrors(options: {
  dataLookup: Record<string, Data>
  errors: ModuleItem[]
  name: string
}) {
  const { dataLookup, errors, name } = options
  const content = ['---\nshowOutline: 1\n---', `# ${name} Errors`]

  for (const error of errors) {
    const { apiItem } = error
    const id = getId(apiItem)
    const data = dataLookup[id]
    if (!data) throw new Error(`Could not find error data for ${id}`)

    const name = apiItem.parent?.displayName
      ? `${apiItem.parent.displayName}.${data.displayName}`
      : data.displayName
    content.push(`## \`${name}\``)
    content.push(data.comment?.summary ?? '')
    if (data.comment?.examples?.length) {
      content.push('### Examples')
      for (const example of data.comment?.examples ?? []) {
        content.push(example)
      }
    }
    content.push(
      `**Source:** [${data.file.path}](${data.file.url}${data.file.lineNumber ? `#L${data.file.lineNumber}` : ''})`,
    )
  }

  return content.join('\n\n')
}

export function renderNamespaceTypes(options: {
  dataLookup: Record<string, Data>
  types: ModuleItem[]
  name: string
}) {
  const { dataLookup, name, types } = options
  const content = ['---\nshowOutline: 1\n---', `# ${name} Types`]

  for (const type of types) {
    const { apiItem } = type
    const id = getId(apiItem)
    const data = dataLookup[id]
    if (!data) throw new Error(`Could not find type data for ${id}`)

    const name = apiItem.parent?.displayName
      ? `${apiItem.parent.displayName}.${data.displayName}`
      : data.displayName

    content.push(`## \`${name}\``)
    content.push(data.comment?.summary ?? '')
    if (data.comment?.examples?.length) {
      content.push('### Examples')
      for (const example of data.comment?.examples ?? []) {
        content.push(example)
      }
    }
    content.push(
      `**Source:** [${data.file.path}](${data.file.url}${data.file.lineNumber ? `#L${data.file.lineNumber}` : ''})`,
    )
  }

  return content.join('\n\n')
}

export function renderNamespaceGlossary(options: {
  apiItem: model.ApiItem
  dataLookup: Record<string, Data>
  type: 'Errors' | 'Types'
}) {
  const { apiItem, dataLookup, type } = options

  const description = (() => {
    switch (type) {
      case 'Errors':
        return 'Glossary of Errors in Viem.'
      case 'Types':
        return 'Glossary of Types in Viem.'
      default:
        return undefined
    }
  })()
  const content = [
    '---\nshowOutline: 1\n---',
    `# ${apiItem.displayName}${description ? ` [${description}]` : ''}`,
  ]
  const members = apiItem.members.toSorted((a, b) =>
    a.displayName > b.displayName ? 1 : -1,
  )
  for (const member of members) {
    if (type === 'Errors') {
      if (member.kind !== model.ApiItemKind.Class) continue
      if (!member.displayName.endsWith('Error')) continue
    } else if (type === 'Types') {
      if (member.kind !== model.ApiItemKind.TypeAlias) continue
    }

    const id = getId(member)
    const data = dataLookup[id]
    if (!data) throw new Error(`Could not find glossary data for ${id}`)

    content.push(`## \`${data.displayName.replaceAll('_', '.')}\``)
    content.push(data.comment?.summary ?? '')
    if (data.comment?.examples?.length) {
      content.push('### Examples')
      for (const example of data.comment?.examples ?? []) {
        content.push(example)
      }
    }
  }

  return content.join('\n\n')
}
