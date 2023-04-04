import { expect, test } from 'vitest'
import { generateMnemonic } from './generateMnemonic'
import { czech } from './wordlists/czech'
import { english } from './wordlists/english'
import { french } from './wordlists/french'
import { italian } from './wordlists/italian'
import { korean } from './wordlists/korean'
import { simplifiedChinese } from './wordlists/simplifiedChinese'
import { spanish } from './wordlists/spanish'
import { traditionalChinese } from './wordlists/traditionalChinese'

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
