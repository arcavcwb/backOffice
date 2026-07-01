import { test, expect } from '@playwright/test';

test.describe('Flujo de Login', () => {
  test('debe permitir ingresar credenciales e intentar iniciar sesión', async ({ page }) => {
    // Si la app no está en '/' se debe ajustar. Asumimos la raíz
    await page.goto('/');

    const emailInput = page.getByPlaceholder('Correo electrónico');
    const passwordInput = page.getByPlaceholder('Contraseña');
    const submitButton = page.getByRole('button', { name: /entrar/i });

    // Verificamos que los inputs existan (si están en una ruta protegida o redirigiendo
    // este test asume que LoginForm se ve por defecto, o debe adaptarse)
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('usuario@test.com');
    await passwordInput.fill('123456');
    await submitButton.click();

    // El botón debería cambiar a estado de carga
    await expect(page.getByRole('button', { name: /iniciando/i })).toBeVisible();
  });
});
