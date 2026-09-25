import { test, expect } from '@playwright/test';

test('production paper mock loads and navigates under the repository path', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => errors.push(request.url()));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    expect(new URL(response.url()).pathname).toMatch(/^\/persona-lab\//);
  });

  await page.goto('./');
  await expect(page).toHaveURL(/\/persona-lab\/workshop\/mock\/index\.html$/);
  for (const name of ['Landing', 'Workspace', 'Results']) {
    await page.getByRole('link', { name, exact: true }).click();
    const sketch = page.locator('main img');
    await expect(sketch).toHaveAttribute('src', `${name.toLowerCase()}.png`);
    await expect.poll(() => sketch.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await page.goto('./#results');
  await expect(page).toHaveURL(/\/mock\/index\.html#results$/);
  await expect(page.locator('main img')).toHaveAttribute('src', 'results.png');
  await page.getByRole('link', { name: 'Prepared assets + new brand logo' }).click();
  await expect(page).toHaveURL(/\/persona-lab\/workshop\/index\.html$/);
  await expect.poll(() => page.locator('img').evaluateAll(images => images.length > 0 && images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  expect(errors).toEqual([]);
});
