import { test, expect } from '@playwright/test';

test.describe('Create Tenant Flow', () => {
  test('deve criar um tenant com sucesso sendo Super-Admin', async ({ page }) => {
    // Interceptar a chamada à Edge Function create-tenant
    await page.route('**/functions/v1/create-tenant*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tenant: { id: 'fake-tenant-id', name: 'Nova Empresa LTDA' }
        }),
      });
    });

    // 1. Ir para a página de criação de tenant
    await page.goto('/admin/tenants/new');

    // 2. Preencher o formulário
    await page.fill('input[id="tenantName"]', 'Nova Empresa LTDA');
    await page.fill('input[id="adminEmail"]', 'admin@novaempresa.com');
    await page.click('button[type="submit"]');

    // 3. Verificar a mensagem de sucesso
    await expect(page.locator('text=Tenant criado e convite enviado com sucesso!')).toBeVisible();
  });

  test('deve mostrar erro se a Edge Function retornar erro (ex: não autorizado)', async ({ page }) => {
    // Interceptar a chamada à Edge Function simulando erro de permissão
    await page.route('**/functions/v1/create-tenant*', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Acesso negado: apenas Super-Admins'
        }),
      });
    });

    // 1. Ir para a página de criação de tenant
    await page.goto('/admin/tenants/new');

    // 2. Preencher o formulário
    await page.fill('input[id="tenantName"]', 'Outra Empresa');
    await page.fill('input[id="adminEmail"]', 'hacker@empresa.com');
    await page.click('button[type="submit"]');

    // 3. Verificar a mensagem de erro na UI
    await expect(page.locator('.text-red-500')).toBeVisible();
  });
});
