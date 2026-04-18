import { expect, test } from '@playwright/test';

const patrolBaseUrl = 'https://patrol.leancode.co';

const topMenuLinks = [
  { name: 'Overview', path: '/' },
  { name: 'Documentation', path: '/documentation' },
  { name: 'CLI commands', path: '/cli-commands' },
  { name: 'Patrol Feature Guide', path: '/feature-guide' },
  { name: 'Articles & Resources', path: '/articles' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact us', path: '/contact' }
];

async function acceptCookiesIfVisible(page: import('@playwright/test').Page) {
  const cookieWrapper = page.locator('#cookiescript_injected_wrapper');
  if (!(await cookieWrapper.count())) {
    return;
  }

  const acceptCandidates = [
    page.getByRole('button', { name: /accept all cookies/i }),
    page.locator('#cookiescript_injected_wrapper').getByRole('button', { name: /accept all cookies/i }),
    page.locator('button:has-text("ACCEPT ALL COOKIES")')
  ];

  for (const button of acceptCandidates) {
    try {
      await button.click({ timeout: 2000, force: true });
      break;
    } catch {
      // Try the next candidate if current one is not actionable.
    }
  }

  try {
    await expect(cookieWrapper).toBeHidden({ timeout: 5000 });
  } catch {
    // Some pages keep the wrapper mounted and intercept pointer events.
  }

  await page.evaluate(() => {
    document.querySelector('#cookiescript_injected_wrapper')?.remove();
  });
}

test.describe('Check if Patrol website contains Overview section', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Open Patrol homepage', async () => {
      await page.goto(patrolBaseUrl);
      await acceptCookiesIfVisible(page);
      await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    });
  });

  test('Top menu links are present and navigate to expected pages', async ({ page }) => {
    await test.step('Verify top tabs are visible', async () => {
      await expect(page).toHaveURL(/patrol\.leancode\.co\/?$/);
      await expect(page.locator('[data-header-tabs]')).toBeVisible();
    });

    const headerTabs = page.locator('[data-header-tabs]');

    for (const item of topMenuLinks) {
      await test.step(`Navigate via ${item.name}`, async () => {
        const menuLink = headerTabs.getByRole('link', { name: item.name });
        await expect(menuLink).toHaveAttribute('href', item.path);

        await page.evaluate(() => {
          document.querySelector('#cookiescript_injected_wrapper')?.remove();
        });
        await menuLink.click();
        await expect(page).toHaveURL(new RegExp(`^https://patrol\\.leancode\\.co${item.path === '/' ? '/?$' : `${item.path}$`}`));
      });
    }
  });

  test('Contains GitHub repository link and the repository page is available', async ({ page }) => {
    await test.step('Verify GitHub link metadata', async () => {
      const repoLink = page.getByRole('link', { name: /leancodepl\/patrol/i }).first();
      await expect(repoLink).toBeVisible();
      await expect(repoLink).toHaveAttribute('href', 'https://github.com/leancodepl/patrol');
      await expect(repoLink).toHaveAttribute('target', '_blank');
    });

    await test.step('Verify GitHub page responds', async () => {
      const repoResponse = await page.request.get('https://github.com/leancodepl/patrol');
      expect(repoResponse.ok()).toBeTruthy();
    });
  });

  test('Contains patrol API reference link and the page is available', async ({ page }) => {
    await test.step('Verify patrol API link metadata', async () => {
      const patrolApiLink = page.getByRole('link', { name: 'patrol API reference' }).first();
      await expect(patrolApiLink).toBeVisible();
      await expect(patrolApiLink).toHaveAttribute('href', 'https://pub.dev/documentation/patrol/latest/index.html');
      await expect(patrolApiLink).toHaveAttribute('target', '_blank');
    });

    await test.step('Verify patrol API page responds', async () => {
      const patrolApiResponse = await page.request.get('https://pub.dev/documentation/patrol/latest/index.html');
      expect(patrolApiResponse.ok()).toBeTruthy();
    });
  });

  test('Contains patrol_finders API reference link and the page is available', async ({ page }) => {
    await test.step('Verify patrol_finders API link metadata', async () => {
      const patrolFindersApiLink = page.getByRole('link', { name: 'patrol_finders API reference' }).first();
      await expect(patrolFindersApiLink).toBeVisible();
      await expect(patrolFindersApiLink).toHaveAttribute('href', 'https://pub.dev/documentation/patrol_finders/latest/index.html');
      await expect(patrolFindersApiLink).toHaveAttribute('target', '_blank');
    });

    await test.step('Verify patrol_finders API page responds', async () => {
      const patrolFindersApiResponse = await page.request.get('https://pub.dev/documentation/patrol_finders/latest/index.html');
      expect(patrolFindersApiResponse.ok()).toBeTruthy();
    });
  });
});