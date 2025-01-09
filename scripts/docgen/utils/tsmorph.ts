import { Project, ScriptTarget } from 'ts-morph'

export const project = new Project({
  compilerOptions: {
    target: ScriptTarget.ESNext,
  },
})
