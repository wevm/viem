import { readJsonSync, writeJsonSync } from 'fs-extra'
import path from 'path'

restorePackageJson()

function restorePackageJson() {
  const tmpPackageJsonPath = path.join(__dirname, '../package.json.tmp')
  const tmpPackageJson = readJsonSync(tmpPackageJsonPath)
  
  const packageJsonPath = path.join(__dirname, '../package.json')
  writeJsonSync(packageJsonPath, tmpPackageJson, { spaces: 2 })
}
