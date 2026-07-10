# 🚀 Backoffice Multi-Tenant (Template)

![Status: Em Desenvolvimento](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)
![Tech: React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Tech: Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase)

Uma base de projeto robusta e reutilizável desenhada para acelerar o desenvolvimento de aplicações B2B Multi-Tenant. Este repositório resolve problemas comuns como Autenticação, Controle de Acesso Baseado em Funções (RBAC), Isolamento de Dados e Auditoria.

---

## 🎯 Visão do Projeto

O objetivo deste projeto é reduzir o tempo de "setup" inicial de **várias semanas para apenas 1 semana** em novos projetos. Ele atua como um Boilerplate (esqueleto) contendo todo o núcleo operacional de um Backoffice, deixando o desenvolvedor livre para focar apenas na lógica de negócios específica de cada cliente.

## 🏗️ Arquitetura e Stack Tecnológico

Seguimos um stack estrito para garantir estabilidade, segurança e manutenibilidade:

### Backend (Data Layer & Servidor)
* **Supabase:** PostgreSQL como banco principal.
* **Autenticação:** Supabase Auth (E-mail/Senha, JWT).
* **Segurança:** Isolamento nativo de tenants via **RLS (Row-Level Security)** no banco de dados.
* **Lógica Administrativa:** Supabase Edge Functions (Deno / TypeScript).

### Frontend (UI Layer)
* **Framework:** React + Vite (TypeScript).
* **Estado e Fetching:** TanStack Query.
* **Roteamento:** TanStack Router (Type-safe).
* **Estilização:** Tailwind CSS (Sem bibliotecas de componentes acopladas).
* **Traduções (i18n):** react-i18next (Idioma base: pt-BR).

### Qualidade e Testes
* **Testes Unitários:** Vitest.
* **Testes E2E (Foco em Segurança RLS):** Playwright.

---

## 🔒 Princípios de Segurança (Inquebráveis)

1. **Acesso aos Dados:** O isolamento de dados entre clientes (Tenants) é garantido no banco de dados através do Row-Level Security (`tenant_id`). Nunca confiamos exclusivamente em filtros na UI.
2. **Operações Críticas:** A chave `service_role` (que ignora o RLS) nunca é exposta no cliente. Apenas as Edge Functions a utilizam para operações administrativas (como criar um novo tenant).
3. **Regras de Permissão (RBAC):** Os níveis de permissão (`Super-Admin`, `Admin`, `Aprovador`, `Usuário`) são injetados diretamente nas *claims* do JWT no momento do login.

---

## 🤖 Metodologia de Desenvolvimento (Cyborg)

Este projeto é pioneiro na utilização de uma **Metodologia Orientada a Agentes de Inteligência Artificial**. 
O código é implementado por um esquadrão de agentes especializados (Analista, Implementador, Tester, Reviewer) sob o comando estratégico de um Product Owner humano, seguindo as diretrizes mapeadas na ferramenta de gestão (Plane).

* Toda decisão arquitetural está documentada na pasta `/docs/adrs/`.
* Todo o contexto de negócios está centralizado em Plane Pages.

---

## 📁 Estrutura de Documentação

Para desenvolvedores e para o futuro assistente de IA, a documentação está dividida assim:
* `/docs/architecture`: Fluxos e diagramas gerais.
* `/docs/adrs`: Architecture Decision Records (Histórico de decisões técnicas).
* `/docs/auth` & `/docs/tenants`: Regras específicas de permissões e isolamento.

---

## 🚀 Como Iniciar (Setup)

*(Em breve: Instruções detalhadas sobre como subir o container do Supabase Local e iniciar o servidor Vite).*
