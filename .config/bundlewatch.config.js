module.exports = {
  files: [
    {
      path: 'packages/**/dist/*.cjs.prod.js',
    },
    {
      path: 'packages/**/dist/*.esm.js',
    },
  ],
  ci: {
    trackBranches: ['main'],
  },
}
