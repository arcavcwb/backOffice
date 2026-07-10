import { test, expect } from '@playwright/test';

test.describe('List Tenants Flow', () => {
  test('deve renderizar a tabela com tenants e seus status', async ({ page }) => {
    // Interceptar a requisição GET para /tenants
    await page.route('**/rest/v1/tenants*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'uuid-1',
            name: 'Empresa Ativa S.A.',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: 'uuid-2',
            name: 'Empresa Suspensa LTDA',
            status: 'suspended',
            created_at: new Date().toISOString()
          }
        ])
      });
    });

    await page.goto('/admin/tenants');

    // Verifica Título e Botão de Criar
    await expect(page.locator('text=Gerenciamento de Tenants')).toBeVisible();
    await expect(page.locator('text=Criar Novo Tenant')).toBeVisible();

    // Verifica dados da tabela
    await expect(page.locator('text=Empresa Ativa S.A.')).toBeVisible();
    await expect(page.locator('text=Ativo')).toBeVisible();

    await expect(page.locator('text=Empresa Suspensa LTDA')).toBeVisible();
    await expect(page.locator('text=Suspenso')).toBeVisible();
  });

  test('deve mostrar mensagem de estado vazio quando não houver tenants', async ({ page }) => {
    await page.route('**/rest/v1/tenants*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/admin/tenants');

    await expect(page.locator('text=Nenhum tenant encontrado')).toBeVisible();
  });

  test('deve permitir suspender e reativar um tenant', async ({ page }) => {
    let isSuspended = false;

    // Intercepta requisições para tenants
    await page.route('**/rest/v1/tenants*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'uuid-toggle',
              name: 'Empresa Teste Toggle',
              status: isSuspended ? 'suspended' : 'active',
              created_at: new Date().toISOString()
            }
          ])
        });
      } else if (route.request().method() === 'PATCH') {
        const postData = JSON.parse(route.request().postData() || '{}');
        if (postData.status === 'suspended') {
          isSuspended = true;
        } else if (postData.status === 'active') {
          isSuspended = false;
        }
        await route.fulfill({ status: 204 }); // Supabase update returns 204 typically or 200 depending on select
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin/tenants');

    // Estado Inicial Ativo
    await expect(page.locator('text=Ativo')).toBeVisible();
    
    // Clica em Suspender
    const btnSuspender = page.locator('button:has-text("Suspender")');
    await expect(btnSuspender).toBeVisible();
    await btnSuspender.click();

    // Deve atualizar a UI para Suspenso e mostrar botão Reativar
    await expect(page.locator('text=Suspenso')).toBeVisible();
    const btnReativar = page.locator('button:has-text("Reativar")');
    await expect(btnReativar).toBeVisible();

    // Clica em Reativar
    await btnReativar.click();

    // Deve atualizar a UI para Ativo novamente
    await expect(page.locator('text=Ativo')).toBeVisible();
  });
});
