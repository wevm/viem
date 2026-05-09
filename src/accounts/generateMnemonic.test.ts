import { expect, test } from 'vitest'

import { generateMnemonic } from './generateMnemonic.js'
import {
  czech,
  english,
  french,
  italian,
  korean,
  simplifiedChinese,
  spanish,
  traditionalChinese,
} from './index.js'

test('english', () => {
  const phrase = generateMnemonic(english)
  expect(phrase.split(' ').length).toBe(12)
})

test('czech', () => {
  const phrase = generateMnemonic(czech)
  expect(phrase.split(' ').length).toBe(12)
})

test('french', () => {
  const phrase = generateMnemonic(french)
  expect(phrase.split(' ').length).toBe(12)
})

test('italian', () => {
  const phrase = generateMnemonic(italian)
  expect(phrase.split(' ').length).toBe(12)
})

test('korean', () => {
  const phrase = generateMnemonic(korean)
  expect(phrase.split(' ').length).toBe(12)
})

test('simplifiedChinese', () => {
  const phrase = generateMnemonic(simplifiedChinese)
  expect(phrase.split(' ').length).toBe(12)
})

test('spanish', () => {
  const phrase = generateMnemonic(spanish)
  expect(phrase.split(' ').length).toBe(12)
})

test('traditionalChinese', () => {
  const phrase = generateMnemonic(traditionalChinese)
  expect(phrase.split(' ').length).toBe(12)
})

test('english 256 bits strength', () => {
  const phrase = generateMnemonic(english, 256)
  expect(phrase.split(' ').length).toBe(24)
})
