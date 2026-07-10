import { test, expect } from '@playwright/test';

test.describe('Edit Tenant Flow', () => {
  test('deve carregar o nome do tenant, permitir alteração e mostrar sucesso', async ({ page }) => {
    // Interceptar requisições da API Supabase (PostgREST)
    await page.route('**/rest/v1/tenants*', async (route) => {
      const request = route.request();
      const method = request.method();
      const url = new URL(request.url());

      if (method === 'GET') {
        // Mock do select('name').eq('id', tenantId)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ name: 'Empresa Velha' })
        });
      } else if (method === 'PATCH') {
        // Mock do update({ name: ... })
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]) // O update retorna vazio ou a linha atualizada, o status 200 basta
        });
      } else {
        await route.continue();
      }
    });

    // 1. Ir para a página de edição (simulando um ID de tenant existente)
    await page.goto('/admin/tenants/fake-uuid-123/edit');

    // 2. Verificar se o nome inicial foi carregado corretamente
    const inputLocator = page.locator('input[id="tenantName"]');
    await expect(inputLocator).toHaveValue('Empresa Velha');

    // 3. Modificar o nome
    await inputLocator.fill('Empresa Nova Atualizada');
    await page.click('button[type="submit"]');

    // 4. Verificar a mensagem de sucesso
    await expect(page.locator('text=Tenant atualizado com sucesso!')).toBeVisible();
  });

  test('deve mostrar erro se o tenant não puder ser carregado (ex: sem permissão)', async ({ page }) => {
    await page.route('**/rest/v1/tenants*', async (route) => {
      if (route.request().method() === 'GET') {
        // Simulamos que RLS bloqueou a leitura (retorna array vazio para .single() causa erro)
        // Ou simulamos um erro 403 / 406 do PostgREST
        await route.fulfill({
          status: 406,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'JSON object requested, multiple (or no) rows returned' })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin/tenants/fake-uuid-123/edit');

    // Verifica que mostrou a mensagem de erro de carregamento e não o formulário
    await expect(page.locator('text=Não foi possível carregar o tenant')).toBeVisible();
  });
});
