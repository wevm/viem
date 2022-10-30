module.exports = {
  files: [
    {
      path: 'packages/**/dist/*.js',
    },
  ],
  ci: {
    trackBranches: ['main'],
  },
}
