import { test, expect } from '@playwright/test';

test.describe('Flujo de Logout', () => {
  test('debe invalidar la sesión y redirigir al login al hacer clic en Sair', async ({ page }) => {
    // Navegamos a la ruta principal donde está el botón de Sair
    await page.goto('/');

    // Localizamos el botón de Sair
    const logoutButton = page.getByRole('button', { name: /sair/i });
    
    // Verificamos que el botón Sair esté visible
    await expect(logoutButton).toBeVisible();

    // Hacemos click en el botón
    await logoutButton.click();

    // El componente IndexComponent intentará hacer logout y luego redirigirá.
    // Incluso si falla la red (porque no hay un backend Supabase real levantado en el CI/local de prueba sin setup),
    // el código actual requiere que logout() se resuelva para redirigir.
    // En el futuro, podríamos necesitar mockear supabase.auth, pero por ahora esperamos la navegación.
    
    // Nota: Como este es un entorno de boilerplate y la función supabase.auth.signOut() 
    // no falla estrepitosamente si no hay sesión, la redirección a /login debería ocurrir.
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {
        // En caso de que falle por falta de backend (timeout), forzamos un log para revisar.
        console.log("No se pudo redirigir, probablemente la mutación falló por falta de backend Supabase");
    });

    // Verificamos que estemos en la ruta de login 
    expect(page.url()).toContain('/login');
  });
});
