import { expect, test } from '@playwright/test'

test('default', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await expect(page.getByText('server: success')).toBeVisible()
  await expect(page.getByText('client: success')).toBeVisible()
})
