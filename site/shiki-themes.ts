// Earthy syntax palette with olive keywords and distinct semantic hues.

const dark = {
  bg: '#14110c', // --bg
  fg: '#f1ebde', // --fg
  dim: '#a39a85', // --fg-dim
  mute: '#6e665a', // --fg-mute
  accent: '#bfd655', // --accent
  amber: '#d6b36a',
  accentSoft: '#d7e98d',
  teal: '#86c8bd',
}

const light = {
  bg: '#f3ecdb',
  fg: '#1d1a14',
  dim: '#5e564a',
  mute: '#8e8678',
  accent: '#51741f',
  amber: '#8c611f',
  accentSoft: '#55751f',
  teal: '#23756b',
}

type Palette = typeof dark

function buildTokenColors(p: Palette) {
  return [
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: p.mute, fontStyle: 'italic' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'keyword.operator.logical',
      ],
      settings: { foreground: p.accent },
    },
    {
      scope: ['string', 'string.quoted', 'string.template'],
      settings: { foreground: p.amber },
    },
    {
      scope: [
        'entity.name.function',
        'meta.function-call entity.name.function',
        'support.function',
        'variable.function',
      ],
      settings: { foreground: p.accentSoft },
    },
    {
      scope: [
        'variable.other.property',
        'meta.property.object',
        'meta.object-literal.key',
        'entity.name.tag',
        'support.type.property-name',
      ],
      settings: { foreground: p.amber },
    },
    {
      scope: ['variable', 'variable.other', 'variable.parameter'],
      settings: { foreground: p.fg },
    },
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.character',
        'constant.other',
      ],
      settings: { foreground: p.accent },
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.name.namespace',
        'entity.name.module',
        'support.type',
        'support.class',
        'support.module',
        'support.namespace',
      ],
      settings: { foreground: p.teal },
    },
    {
      scope: ['string.regexp', 'string.regexp.character-class'],
      settings: { foreground: p.accent },
    },
    {
      scope: [
        'punctuation',
        'meta.brace',
        'meta.delimiter',
        'punctuation.separator',
      ],
      settings: { foreground: p.mute },
    },
  ]
}

export const shikiDark = {
  name: 'viem-dark',
  type: 'dark',
  colors: {
    'editor.background': dark.bg,
    // Unstyled tokens use a dim tone so highlighted tokens (functions,
    // keywords, etc.) stand out against them.
    'editor.foreground': dark.dim,
  },
  tokenColors: buildTokenColors(dark),
} as const

export const shikiLight = {
  name: 'viem-light',
  type: 'light',
  colors: {
    'editor.background': light.bg,
    'editor.foreground': light.dim,
  },
  tokenColors: buildTokenColors(light),
} as const
