import { expect, test } from '@playwright/test';

test.describe('Kestrel Goods Single-Page Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Studio Objects & Checkout' }),
    ).toBeVisible();
    await expect(page.getByTestId('empty-bag-state')).toBeVisible();
  });

  test('1. Successful checkout produces a single confirmation with order reference', async ({
    page,
  }) => {
    await page.getByTestId('add-to-cart-ceramic-dripper').click();
    await expect(page.getByTestId('cart-item-ceramic-dripper')).toBeVisible();
    await expect(page.getByTestId('order-total')).toHaveText('$48.00');

    await page.getByLabel(/Full name/i).fill('Maya Lin');
    await page.getByLabel(/Delivery note/i).fill('Leave on covered porch');
    await page.getByRole('button', { name: 'Place Order' }).click();

    const confirmation = page.getByTestId('order-confirmation');
    await expect(confirmation).toHaveCount(1);
    await expect(confirmation).toBeVisible();
    await expect(
      confirmation.getByRole('heading', { name: 'Order Confirmed' }),
    ).toBeVisible();
    await expect(confirmation).toContainText('Maya Lin');
    await expect(confirmation).toContainText('Leave on covered porch');
    await expect(page.getByTestId('order-reference')).toHaveText(/^KST-\d{6}$/);
    await expect(page.getByTestId('confirmed-total')).toHaveText('$48.00');
  });

  test('2. Missing required field blocks checkout and preserves entered values', async ({
    page,
  }) => {
    await page.getByTestId('add-to-cart-walnut-tray').click();
    await expect(page.getByTestId('cart-item-walnut-tray')).toBeVisible();

    const nameInput = page.getByLabel(/Full name/i);
    const noteInput = page.getByLabel(/Delivery note/i);

    await nameInput.fill('   ');
    await noteInput.fill('Ring bell once');
    await page.getByRole('button', { name: 'Place Order' }).click();

    const validationAlert = page.getByRole('alert');
    await expect(validationAlert).toBeVisible();
    await expect(validationAlert).toContainText(
      'Please enter your full name to place your order.',
    );
    await expect(page.getByTestId('order-confirmation')).toHaveCount(0);

    // Preserve customer input and bag contents
    await expect(nameInput).toHaveValue('   ');
    await expect(noteInput).toHaveValue('Ring bell once');
    await expect(page.getByTestId('cart-item-walnut-tray')).toBeVisible();
    await expect(page.getByTestId('order-total')).toHaveText('$34.50');
  });

  test('3. Quantity changes and item removal update exact line totals and order total', async ({
    page,
  }) => {
    await page.getByTestId('add-to-cart-ceramic-dripper').click();
    await page.getByTestId('add-to-cart-walnut-tray').click();

    await expect(page.getByTestId('line-total-ceramic-dripper')).toHaveText(
      '$48.00',
    );
    await expect(page.getByTestId('line-total-walnut-tray')).toHaveText(
      '$34.50',
    );
    await expect(page.getByTestId('order-total')).toHaveText('$82.50');

    // Increase Ceramic Dripper to quantity 2 ($48.00 * 2 = $96.00; total = $130.50)
    await page
      .getByRole('button', {
        name: 'Increase quantity of Speckled Stoneware Dripper',
      })
      .click();

    await expect(page.getByTestId('line-total-ceramic-dripper')).toHaveText(
      '$96.00',
    );
    await expect(page.getByTestId('order-total')).toHaveText('$130.50');

    // Set Walnut Tray quantity directly to 3 ($34.50 * 3 = $103.50; total = $199.50)
    const walnutQtyInput = page.getByRole('spinbutton', {
      name: 'Quantity of Solid Walnut Valet Tray',
    });
    await walnutQtyInput.fill('3');
    await walnutQtyInput.blur();

    await expect(page.getByTestId('line-total-walnut-tray')).toHaveText(
      '$103.50',
    );
    await expect(page.getByTestId('order-total')).toHaveText('$199.50');

    // Remove Ceramic Dripper; total updates to $103.50
    await page
      .getByRole('button', { name: 'Remove Speckled Stoneware Dripper' })
      .click();
    await expect(page.getByTestId('cart-item-ceramic-dripper')).toHaveCount(0);
    await expect(page.getByTestId('order-total')).toHaveText('$103.50');
  });

  test('4. Order confirmations persist in localStorage and can be revisited in Recent Orders', async ({
    page,
  }) => {
    await expect(page.getByTestId('recent-orders-empty')).toBeVisible();

    await page.getByTestId('add-to-cart-ceramic-dripper').click();
    await page.getByTestId('add-to-cart-walnut-tray').click();
    await page.getByLabel(/Full name/i).fill('Elena Vance');
    await page.getByLabel(/Delivery note/i).fill('Front desk');
    await page.getByRole('button', { name: 'Place Order' }).click();

    const reference = (
      await page.getByTestId('order-reference').innerText()
    ).trim();

    const recentSection = page.getByTestId('recent-orders-section');
    await expect(recentSection).toContainText(reference);
    await expect(recentSection).toContainText('Elena Vance');
    await expect(recentSection).toContainText('$82.50');

    // Reload page to verify persistence via localStorage
    await page.reload();
    await expect(page.getByTestId('empty-bag-state')).toBeVisible();
    await expect(page.getByTestId(`recent-order-${reference}`)).toBeVisible();
    await expect(page.getByTestId(`recent-order-${reference}`)).toContainText(
      'Elena Vance',
    );

    // Revisit saved receipt
    await page.getByTestId(`view-receipt-${reference}`).click();
    await expect(page.getByTestId('order-confirmation')).toBeVisible();
    await expect(page.getByTestId('order-reference')).toHaveText(reference);
    await expect(page.getByTestId('confirmed-total')).toHaveText('$82.50');

    // Reorder populates bag and customer fields
    await page.getByTestId(`reorder-${reference}`).click();
    await expect(page.getByTestId('order-confirmation')).toHaveCount(0);
    await expect(page.getByTestId('order-total')).toHaveText('$82.50');
    await expect(page.getByLabel(/Full name/i)).toHaveValue('Elena Vance');

    // Clear history removes saved orders across reload
    await page.getByTestId('clear-order-history').click();
    await expect(page.getByTestId('recent-orders-empty')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('recent-orders-empty')).toBeVisible();
  });
});
