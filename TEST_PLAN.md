# Mini Checkout and Browser Test Suite — Test Plan & Execution Results

## 1. Prioritised Risk Matrix

| Priority | Risk Area | Customer Impact | Control & Verification |
| :--- | :--- | :--- | :--- |
| **P0 — Critical** | **Duplicate orders on rapid double-click** | Customer receives multiple order references or duplicate saved history entries | Synchronous ref guard (`orderSubmittedLockRef`) checked before state updates, plus immediate replacement of the submit form with the receipt view. Verified with both synchronous DOM double-click and Playwright `dblclick()`. |
| **P0 — Critical** | **Incorrect line total or order total math** | Wrong charge displayed or floating-point rounding drift (`$103.4999`) | Integer-cent arithmetic (`priceCents * quantity`) formatted via `Intl.NumberFormat`. Verified across add, stepper increment, direct input edit, and item removal. |
| **P1 — High** | **Blank or whitespace-only required field** | Incomplete order submitted or entered form values wiped on error | Custom `noValidate` validation trims `customerName`, blocks submission, shows `role="alert"` message, and preserves all entered fields and bag items. |
| **P1 — High** | **Submitting an empty bag** | `$0.00` confirmation produced with zero items | Cart non-empty guard blocks submission, displays clear empty-bag error message, and preserves entered customer fields. |
| **P1 — High** | **Corrupted or restricted `localStorage`** | App crashes on load or fails to save confirmations in private mode | Defensive `try/catch` + runtime schema check in `src/utils/orderStorage.ts` ignores invalid entries and storage quota errors gracefully. |
| **P2 — Medium** | **Invalid/empty intermediate input while typing quantity** | Row vanishes mid-keystroke or computes `NaN` | Draft quantity state clamps and restores valid positive integers (`1–99`) on blur. |

---

## 2. Automated Browser Checks (`tests/checkout.spec.ts`)

**Command executed**: `npx playwright test --reporter=list`  
**Result**: **4 passed (7.9s)** — zero retries, clean browser state per test.

| # | Test Case | Key Assertions | Status |
| :--- | :--- | :--- | :--- |
| 1 | Successful checkout produces a single confirmation with order reference | `order-confirmation` count is `1`; heading `Order Confirmed` visible; `order-reference` matches `/^KST-\d{6}$/`; customer name, note, and `$48.00` total match. | **PASS (1.3s)** |
| 2 | Missing required field blocks checkout and preserves entered values | `role="alert"` displays `"Please enter your full name to place your order."`; `order-confirmation` count is `0`; `"   "`, `"Ring bell once"`, bag item, and `$34.50` remain preserved. | **PASS (1.2s)** |
| 3 | Quantity changes and item removal update exact line totals and order total | Initial `$82.50` -> dripper qty `2` (`$96.00` line / `$130.50` total) -> walnut tray qty `3` (`$103.50` line / `$199.50` total) -> remove dripper (`$103.50` total). | **PASS (1.3s)** |
| 4 | Order confirmations persist in `localStorage` and can be revisited in Recent Orders | Order appears in `recent-orders-section`; survives `page.reload()` while bag resets cleanly; **View receipt** restores confirmation; **Reorder** restores `$82.50` bag & name; **Clear history** persists across reload. | **PASS (2.8s)** |

---

## 3. Manual Browser Test Record

Executed against the live Vite dev server (`http://localhost:3000`) in headless Chromium (`1440×900` desktop and `390×844` mobile viewports) after the final code changes.

### Manual Test A — Empty Cart Submission
- **Steps**:
  1. Open `http://localhost:3000` with an empty bag (`0 items`, `$0.00`).
  2. Type `"Jordan Reyes"` into **Full name** and `"Hold at front desk"` into **Delivery note**.
  3. Click **Place Order**.
- **Expected Result**: Checkout is blocked; a clear validation message indicates the bag is empty; no confirmation renders; typed customer inputs remain intact.
- **Actual Result**: **PASS**
  - Validation alert displayed: `"Unable to place order — Your bag is empty. Add at least one item before placing your order."`
  - `order-confirmation` count: `0`
  - Preserved **Full name**: `"Jordan Reyes"`
  - Preserved **Delivery note**: `"Hold at front desk"`
  - Order total remained: `"$0.00"`

### Manual Test B — Rapid Double-Click on Place Order
- **Steps**:
  1. **Run 1 (Synchronous double-click)**: Add both items (`$82.50`), keep `"Jordan Reyes"` in **Full name**, and invoke `btn.click(); btn.click()` in the same JavaScript event loop turn.
  2. **Run 2 (Browser `dblclick`)**: Click **Start a new order**, add *Speckled Stoneware Dripper* (`$48.00`), fill `"Jordan Reyes"`, and trigger Playwright `dblclick()` on **Place Order**.
- **Expected Result**: Each submission attempt creates exactly one confirmation, one order reference, and increments **Recent Orders** by exactly `1`.
- **Actual Result**: **PASS**
  - **Run 1**: `confirmationCount = 1`, `reference = "KST-502194"`, `confirmedTotal = "$82.50"`, `recentOrdersCountText = "1 order"`.
  - **Run 2**: `confirmationCount = 1`, `reference = "KST-661920"`, `confirmedTotal = "$48.00"`, `recentOrdersCountText = "2 orders"`.
  - **Console / Page Errors**: `consoleErrors = []`, `pageErrors = []`.

---

## 4. Defects Observed & Resolution

- **App Defects**: **0 open defects** found in the checkout application during automated or manual testing.
- **Test Script Issue Found & Fixed During Development**:
  - *Location*: `tests/checkout.spec.ts` (Check #3)
  - *Steps*: Queried the numeric quantity field using `page.getByLabel('Quantity of Solid Walnut Valet Tray')`.
  - *Expected vs. Actual*: Expected the single numeric input; Playwright strict mode matched 3 elements (`Decrease quantity of Solid Walnut Valet Tray`, `Quantity of Solid Walnut Valet Tray`, and `Increase quantity of Solid Walnut Valet Tray`) because `getByLabel` performs substring matching by default.
  - *Resolution*: Updated the selector to `page.getByRole('spinbutton', { name: 'Quantity of Solid Walnut Valet Tray' })`, which uniquely targets the numeric input by ARIA role and exact accessible name.
