import { expect, test, type Page } from '@playwright/test';

async function acceptCookiesIfVisible(page: Page) {
  const cookieWrapper = page.locator('#cookiescript_injected_wrapper');
  if (!(await cookieWrapper.count())) {
    return;
  }

  let acceptedByClick = false;

  const candidates = [
    page.getByRole('button', { name: /accept all cookies/i }),
    page.locator('#cookiescript_injected_wrapper').getByRole('button', { name: /accept all cookies/i }),
    page.locator('button:has-text("ACCEPT ALL COOKIES")')
  ];

  for (const button of candidates) {
    try {
      await button.click({ timeout: 2000, force: true });
      acceptedByClick = true;
      break;
    } catch {
      // Try the next candidate if this one is not clickable.
    }
  }

  try {
    await expect(cookieWrapper).toBeHidden({ timeout: 5000 });
    if (acceptedByClick) {
      console.log('[cookies] accepted successfully');
    }
  } catch {
    await page.evaluate(() => {
      document.querySelector('#cookiescript_injected_wrapper')?.remove();
    });
  }
}

test.describe('LeanCode website', () => {
  test('homepage loads and shows Contact button', async ({ page }) => {
    await page.goto('/');
    await acceptCookiesIfVisible(page);

    await test.step('Verify Contact link', async () => {
      const contactButton = page.locator('a[href="/get-estimate"]').first();
      await expect(contactButton).toBeVisible();
      await expect(contactButton).toHaveAttribute('href', '/get-estimate');
    });
  });

  test('Contact page opens with a form, submit button, and privacy policy link', async ({ page }) => {
    await page.goto('/');
    await acceptCookiesIfVisible(page);
    await page.locator('a[href="/get-estimate"]').first().click();
    await expect(page).toHaveURL('https://leancode.co/get-estimate');

    await test.step('Verify contact form elements', async () => {
      const estimateForm = page.locator('form').first();
      const submitButton = page.getByRole('button', { name: 'Submit' });
      const privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });

      await expect(estimateForm).toBeVisible();
      await expect(submitButton).toBeVisible();
      await expect(privacyPolicyLink).toBeVisible();
    });
  });

  test('privacy policy opens as a pdf in a separate tab', async ({ page }) => {
    await page.goto('/get-estimate');
    await acceptCookiesIfVisible(page);

    await test.step('Validate privacy link metadata', async () => {
      const privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });
      const pdfUrlPattern = /Data( |%20)Protection( |%20)and( |%20)Privacy( |%20)Policy\.pdf/i;
      await expect(privacyPolicyLink).toHaveAttribute('href', pdfUrlPattern);
      await expect(privacyPolicyLink).toHaveAttribute('target', '_blank');
    });

    await test.step('Validate privacy PDF response', async () => {
      const privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });
      const rawHref = await privacyPolicyLink.getAttribute('href');
      expect(rawHref).toBeTruthy();
      const pdfUrl = new URL(rawHref!, page.url()).toString();
      const directPdfResponse = await page.request.get(pdfUrl);
      const directPdfContentType = (directPdfResponse.headers()['content-type'] || '').toLowerCase();

      console.log(`[privacy] href=${rawHref}`);
      console.log(`[privacy] resolvedPdfUrl=${pdfUrl}`);
      console.log(`[privacy] directStatus=${directPdfResponse.status()} directContentType=${directPdfContentType}`);

      expect(directPdfResponse.ok()).toBeTruthy();
      expect(directPdfContentType).toContain('pdf');
    });

    await test.step('Open privacy policy in new context', async () => {
      const privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });
      const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
      const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
      await privacyPolicyLink.click();
      const [popup, download] = await Promise.all([popupPromise, downloadPromise]);

      if (popup) {
        console.log(`[privacy] popupUrl=${popup.url()}`);
      }

      if (download) {
        console.log(`[privacy] downloadFilename=${download.suggestedFilename()}`);
      }

      expect(popup || download).toBeTruthy();
    });
  });

  test('CEO contact details are visible on the Contact page', async ({ page }) => {
    await page.goto('/get-estimate');
    await acceptCookiesIfVisible(page);

    await test.step('Verify CEO section and social links', async () => {
      const linkedinLink = page.locator('a[aria-label="linkedin"]').filter({ visible: true }).first();
      const twitterLink = page.locator('a[aria-label="twitter"]').filter({ visible: true }).first();

      await expect(page.getByText('CEO at LeanCode').filter({ visible: true }).first()).toBeVisible();
      await expect(linkedinLink).toBeVisible();
      await expect(linkedinLink).toHaveAttribute('href', /linkedin\.com/i);
      await expect(linkedinLink).toHaveAttribute('target', '_blank');

      await expect(twitterLink).toBeVisible();
      await expect(twitterLink).toHaveAttribute('href', /twitter\.com/i);
      await expect(twitterLink).toHaveAttribute('target', '_blank');
    });
  });

  test('The Header displays the free ebook button', async ({ page }) => {
    await page.goto('/');
    await acceptCookiesIfVisible(page);

    await test.step('Verify free ebook button', async () => {
      const ebookButton = page.getByRole('link', { name: 'Get the free ebook' }).first();
      await expect(ebookButton).toBeVisible();
      await expect(ebookButton).toHaveAttribute('href', '/ebook/migration-to-flutter');
    });
  });
});