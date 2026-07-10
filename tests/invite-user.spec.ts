import { test, expect } from '@playwright/test';

test.describe('Invite User Flow', () => {
  test('deve listar usuários e convidar novo usuário com sucesso', async ({ page }) => {
    // Mock do RPC get_tenant_users
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
            email: 'pendente@tenant.com',
            role: 'User',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
      });
    });

    // Mock da Edge Function
    await page.route('**/functions/v1/invite-user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { id: 'u-novo' } })
      });
    });

    await page.goto('/admin/users');

    // Verifica Título e Dados na Tabela
    await expect(page.locator('text=Equipe do Tenant')).toBeVisible();
    await expect(page.locator('text=admin@tenant.com')).toBeVisible();
    await expect(page.locator('text=Ativo').first()).toBeVisible();
    await expect(page.locator('text=pendente@tenant.com')).toBeVisible();
    await expect(page.getByText('Pendente', { exact: true })).toBeVisible();

    // Clica em Convidar
    await page.locator('button:has-text("Convidar Usuário")').click();

    // Modal Aberto
    await expect(page.locator('text=Convidar Novo Usuário')).toBeVisible();

    // Preenche o formulário
    await page.fill('input[type="email"]', 'novo@tenant.com');
    await page.selectOption('select', 'Approver');

    // Envia Convite
    await page.locator('button:has-text("Enviar Convite")').click();

    // Modal deve fechar e a página recarregar a lista silenciosamente (já tratado pela query)
    await expect(page.locator('text=Convidar Novo Usuário')).toBeHidden();
  });

  test('deve mostrar erro ao tentar convidar e-mail já existente', async ({ page }) => {
    await page.route('**/rest/v1/rpc/get_tenant_users*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/functions/v1/invite-user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'E-mail já está cadastrado no sistema.' })
      });
    });

    await page.goto('/admin/users');

    await page.locator('button:has-text("Convidar Usuário")').click();
    await page.fill('input[type="email"]', 'duplicado@tenant.com');
    await page.locator('button:has-text("Enviar Convite")').click();

    // O modal continua aberto e exibe o erro da Edge Function
    await expect(page.locator('text=E-mail já está cadastrado no sistema.')).toBeVisible();
  });
});
