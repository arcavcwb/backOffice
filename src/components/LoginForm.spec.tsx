import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';

// Mock dependencies
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn()
}));

import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('renderiza correctamente', () => {
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoggingIn: false,
      loginError: null
    });
    
    render(<LoginForm />);
    
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('muestra estado de carga y deshabilita el botón durante el login', () => {
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoggingIn: true,
      loginError: null
    });
    
    render(<LoginForm />);
    
    const button = screen.getByRole('button', { name: /iniciando/i });
    expect(button).toBeDisabled();
  });

  it('llama a login y navega en caso de éxito', async () => {
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoggingIn: false,
      loginError: null
    });
    mockLogin.mockResolvedValueOnce({});
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@ejemplo.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@ejemplo.com', password: 'password123' });
    });
    
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('muestra error si el login falla', async () => {
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoggingIn: false,
      loginError: { message: 'Credenciales inválidas' }
    });
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    
    render(<LoginForm />);
    
    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });
});
