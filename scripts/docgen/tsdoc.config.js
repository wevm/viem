import jsdoc from 'eslint-plugin-jsdoc'
import tsdoc from 'eslint-plugin-tsdoc'
import tseslint from 'typescript-eslint'

export default {
  files: ['src/**/*.ts'],
  ignores: ['src/_*/**'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { sourceType: 'module' },
  },
  plugins: {
    // Using both jsdoc and tsdoc plugins
    // jsdoc plugin is used to enforce JSDoc comments (since tsdoc plugin does not have a rule for this https://github.com/microsoft/tsdoc/issues/372)
    jsdoc,
    // tsdoc plugin is used to validate TSDoc comments using `tsdoc.json` (had to add `src/tsdoc.json` that extends root because tsdoc plugin cannot read from root directly https://github.com/microsoft/tsdoc/issues/304)
    tsdoc,
  },
  rules: {
    'jsdoc/require-jsdoc': [
      'error',
      {
        publicOnly: true,
      },
    ],
    'jsdoc/require-description': 'error',
    'jsdoc/require-example': 'error',
    'tsdoc/syntax': 'warn',
  },
  settings: {
    jsdoc: {
      ignoreInternal: true,
    },
  },
}
