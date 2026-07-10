import { test, expect } from '@playwright/test';

test.describe('Password Recovery Flow', () => {
  test('deve navegar do login para a recuperação de senha e enviar o formulário', async ({ page }) => {
    // Interceptar a chamada à API do Supabase para resetPasswordForEmail
    await page.route('**/auth/v1/recover*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    // 1. Ir para a página de login
    await page.goto('/login');

    // 2. Clicar no link de "Esqueceu sua senha?"
    await page.click('text=Esqueceu sua senha?');

    // 3. Verificar se a URL mudou
    await expect(page).toHaveURL(/.*\/forgot-password/);

    // 4. Preencher o formulário
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // 5. Verificar a mensagem de sucesso
    await expect(page.locator('text=Um e-mail de redefinição de senha foi enviado')).toBeVisible();
  });

  test('deve mostrar erro de validação ao tentar senhas diferentes no reset', async ({ page }) => {
    // 1. Ir para a página de reset password
    await page.goto('/reset-password');

    // 2. Tentar preencher com senhas diferentes
    await page.fill('input[name="password"]', 'nova-senha123');
    await page.fill('input[name="confirmPassword"]', 'outra-senha');
    await page.click('button[type="submit"]');

    // 3. Verificar erro de validação
    await expect(page.locator('text=As senhas não coincidem.')).toBeVisible();
  });
});
