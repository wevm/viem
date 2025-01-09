import { Todo } from 'viem'
import { describe, expect, test } from 'vitest'

describe('Todo', () => {
  test('todo', () => {
    expect(Todo.todo()).toBeNull()
  })
})
