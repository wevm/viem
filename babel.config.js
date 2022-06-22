module.exports = {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: 'defaults, not ie 11' }],
  ],
}
