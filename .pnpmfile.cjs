// Attest needs the classic JS compiler API, absent from the native
// typescript@7 workspace default. The exact pin keeps benched instantiation
// counts stable.
function readPackage(pkg) {
  if (pkg.name === '@ark/attest') {
    delete pkg.peerDependencies.typescript
    pkg.dependencies = { ...pkg.dependencies, typescript: '5.9.3' }
  }
  return pkg
}

module.exports = { hooks: { readPackage } }
