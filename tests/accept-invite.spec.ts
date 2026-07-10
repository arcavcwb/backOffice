import { test, expect } from '@playwright/test';

test.describe('Accept Invite Flow', () => {
  test('deve mostrar erro quando token for inválido ou ausente', async ({ page }) => {
    // Acessa a rota sem ter token na URL ou no local storage
    await page.goto('/accept-invite');

    // A página mostra "Validando convite..." e depois falha
    await expect(page.locator('text=O link de convite é inválido ou expirou. Solicite um novo convite.')).toBeVisible({ timeout: 5000 });
    
    // Mostra o botão de voltar ao login
    await expect(page.locator('text=Voltar para o Login')).toBeVisible();
  });

  test('deve permitir definir a senha se houver sessão válida', async ({ page }) => {
    // Mocks do supabase update e getSession
    // Injeta a sessão no localStorage
    await page.addInitScript(() => {
      const sessionData = JSON.stringify({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        user: { id: 'user-1', email: 'convidado@tenant.com' },
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
        body: JSON.stringify({
          id: 'user-1',
          email: 'convidado@tenant.com'
        })
      });
    });

    const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    await page.goto('/accept-invite');

    // Deve mostrar o formulário de Nova Senha
    await expect(page.locator('text=Nova Senha')).toBeVisible();
    await expect(page.locator('text=Confirmar Senha')).toBeVisible();

    // Testa senhas diferentes
    await page.fill('input[type="password"]:nth-of-type(1)', 'senha123');
    // Localizando o segundo input
    const inputs = page.locator('input[type="password"]');
    await inputs.nth(0).fill('senha123');
    await inputs.nth(1).fill('diferente123');
    await page.locator('button:has-text("Salvar Senha e Entrar")').click();

    await expect(page.locator('text=As senhas não coincidem.')).toBeVisible();

    // Testa sucesso
    await inputs.nth(1).fill('senha123');
    await page.locator('button:has-text("Salvar Senha e Entrar")').click();

    // Na lógica, após sucesso ele redireciona para '/'
    await expect(page).toHaveURL(/.*\/$/);
  });
});
