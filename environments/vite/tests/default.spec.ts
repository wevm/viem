import { expect, test } from '@playwright/test'

test('default', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await expect(page.getByText('success')).toBeVisible()
})
