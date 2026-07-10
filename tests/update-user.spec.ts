import { test, expect } from '@playwright/test';

test.describe('Update User Role and Status Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Injeta a sessão no localStorage
    await page.addInitScript(() => {
      const sessionData = JSON.stringify({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        user: { id: 'u-1', email: 'admin@tenant.com' },
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });
      window.localStorage.setItem('sb-localhost-auth-token', sessionData);
      window.localStorage.setItem('sb-fake-key-auth-token', sessionData);
    });

    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'u-1', email: 'admin@tenant.com' })
      });
    });
  });

  test('deve listar usuários e permitir alterar status para suspenso', async ({ page }) => {
    // Mock get_tenant_users
    await page.route('**/rest/v1/rpc/get_tenant_users*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'u-1', // admin (eu)
            email: 'admin@tenant.com',
            role: 'Tenant-Admin',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: 'u-2', // outro usuário
            email: 'outro@tenant.com',
            role: 'User',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ])
      });
    });

    // Mock update_tenant_user
    let updateCalled = false;
    await page.route('**/rest/v1/rpc/update_tenant_user', async (route) => {
      updateCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null)
      });
    });

    await page.goto('/admin/users');

    // Encontra a linha do usuário u-2
    const u2Row = page.locator('tr').filter({ hasText: 'outro@tenant.com' });

    // Verifica que existe o botão "Suspender" para o outro usuário
    const suspenderBtn = u2Row.locator('button:has-text("Suspender")');
    await expect(suspenderBtn).toBeVisible();

    // Clica no botão Suspender
    await suspenderBtn.click();

    // Verifica se a RPC foi chamada
    expect(updateCalled).toBeTruthy();
  });

  test('deve alterar a função do usuário', async ({ page }) => {
    await page.route('**/rest/v1/rpc/get_tenant_users*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'u-1',
            email: 'admin@tenant.com',
            role: 'Tenant-Admin',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: 'u-2',
            email: 'outro@tenant.com',
            role: 'User',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ])
      });
    });

    let rpcPayload: any = null;
    await page.route('**/rest/v1/rpc/update_tenant_user', async (route) => {
      rpcPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null)
      });
    });

    await page.goto('/admin/users');

    // Encontra a linha do usuário u-2
    const u2Row = page.locator('tr').filter({ hasText: 'outro@tenant.com' });

    // Altera o combo box de "User" para "Approver"
    const select = u2Row.locator('select');
    await select.selectOption('Approver');

    // Espera até o request ser capturado
    await page.waitForTimeout(500);

    // Verifica se a RPC enviou os dados corretos
    expect(rpcPayload).toBeTruthy();
    expect(rpcPayload.p_role).toBe('Approver');
    expect(rpcPayload.p_user_id).toBe('u-2');
  });
});
