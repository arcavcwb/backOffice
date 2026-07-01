# Metodologia de Desenvolvimento Orientada a Agentes de IA

## 1. Visão Geral e Filosofia
Esta metodologia foi desenhada para integrar a capacidade de **Inteligência Artificial Autônoma** ao nosso ciclo de desenvolvimento de software, garantindo extrema velocidade de entrega sem sacrificar o controle, a segurança e a rastreabilidade.

Não estamos apenas usando a IA como um "assistente de código", mas sim operando um **Esquadrão de Agentes Especializados**. Cada agente possui um papel específico (Analista, Implementador, Tester e Revisor), replicando uma estrutura de equipe de engenharia sênior. 

A regra fundamental desta metodologia é: **O Product Requirement Document (PRD) é a única fonte da verdade**. Nenhuma funcionalidade é "inventada" ou desenvolvida sem que esteja explicitamente mapeada no backlog e no PRD.

---

## 2. O Ciclo de Vida do Ticket (Workflow)
O fluxo de trabalho foi desenhado para ser transparente para o Product Owner (PO). Cada História de Usuário passa por fases rigorosas, intercaladas por "Gates" (pontos de controle) onde o humano toma a decisão final.

**FASE ZERO: Planejamento e Viabilidade (Discovery)**
Antes de qualquer linha de código ser escrita ou ferramentas instaladas, o projeto inteiro deve ser mapeado no Plane. O objetivo é criar um Backlog robusto, estimar os pontos de toda a iniciativa e avaliar a viabilidade de tempo/custo. Somente após a aprovação formal desta Fase Zero pela diretoria/PO é que a implementação se inicia. Isso evita o desperdício de tokens de IA e esforço humano em projetos não aprovados.

Os estados no nosso painel de tarefas são:

1. **Backlog (Fonte da Verdade)**
   - Onde residem as Histórias de Usuário extraídas do PRD após a validação da Fase Zero. 
   - Ninguém toca no código nesta fase.

2. **Refinada (Atuação do Analista)**
   - O *Agente Analista* pega um ticket do Backlog.
   - Ele escreve um Plano Técnico detalhado de como implementar aquela história (arquitetura, banco de dados, impacto na segurança).
   - **GATE 1:** O PO ou Tech Lead humano aprova este plano técnico.

3. **Em Desenvolvimento (Atuação do Implementador)**
   - Com o plano aprovado, o *Agente Implementador* escreve o código exato que foi planejado. Ele não toma decisões arquiteturais, apenas executa o plano refinado.

4. **Em Testes (Atuação do Tester)**
   - O *Agente Tester* assume e foca 100% na segurança e estabilidade.
   - Ele escreve testes de unidade e testes essenciais de isolamento (garantindo que os dados de diferentes clientes/tenants nunca se misturem).

5. **Em Revisão (Atuação do Reviewer)**
   - O *Agente Reviewer* analisa todo o código gerado em busca de vulnerabilidades, problemas de desempenho e garantia de conformidade com os requisitos iniciais.
   - Ele prepara a entrega (Pull Request) e deixa rastros documentados (comentários) no ticket.
   - **GATE 2:** O PO / Tech Lead revisa o resultado final e autoriza a união do código (Merge).

6. **Feito (Done)**
   - A funcionalidade está aprovada e pronta para produção.

---

## 3. Gestão e Rastreabilidade: Por que Plane? E o Jira?

Nossa metodologia exige que a IA deixe um rastro de auditoria constante (comentários automáticos a cada ação) na nossa ferramenta de gestão. Atualmente, utilizamos o **Plane**, mas é importante entender as diferenças estratégicas entre as opções de mercado e a portabilidade do nosso fluxo.

### Plane (Nossa Ferramenta Atual)
- **Vantagens:** É ágil, leve, de código aberto e possui uma interface minimalista e rápida. Não sofre do excesso de complexidade ("bloatware") que muitas ferramentas corporativas têm.
- **Por que usamos agora:** Permite iterações ultrarrápidas. Para o nosso fluxo guiado por agentes de IA, a simplicidade de listar problemas e mudar estados via API no Plane é excepcionalmente eficiente para manter o foco no produto final.

### Jira (O Padrão Corporativo)
- **Vantagens:** É o gigante da indústria. Possui relatórios de burndown profundos, fluxos de trabalho (workflows) condicionais altamente customizáveis e integra-se com praticamente qualquer sistema corporativo do planeta.
- **O Desafio:** Pode ser pesado e burocrático de configurar no início de um projeto onde a velocidade é prioridade.

### A Flexibilidade da Nossa Metodologia (Migração Futura)
É crucial que o Product Owner saiba que **nossa metodologia é 100% agnóstica de ferramenta**. 

O cérebro operacional reside nas nossas diretrizes de IA (o arquivo `AGENTS.md`) e nas integrações via API. O fluxo de trabalho (*Backlog -> Refinada -> Em Desenvolvimento -> Em Revisão -> Feito*) é um padrão universal de metodologias Ágeis (Scrum/Kanban).

Se, ou quando, a organização escalar a um ponto onde as métricas avançadas do **Jira** sejam obrigatórias para o negócio, **podemos migrar toda a operação perfeitamente**. Basta redirecionarmos as chamadas de API da nossa IA (os scripts de workflow) do Plane para o Jira. Os agentes continuarão lendo os tickets, mudando os status para "In Progress" e comentando suas decisões da exata mesma maneira.

## 4. Estimativas de Tempo no Fluxo Cyborg (IA + Humano)

Para fazer uma estimativa realista em um ambiente onde um desenvolvedor trabalha em conjunto com Inteligência Artificial, precisamos mudar a forma tradicional de medir o tempo (Story Points). A IA implementa código incrivelmente rápido, mas os gargalos se movem para outras áreas:

- **Implementação (Código):** Reduzida em até 70-80%.
- **Análise e Planejamento:** Mantém-se ou aumenta. Criar planos precisos e arquitetura correta requer tempo humano, pois o código será derivado dessas instruções.
- **Revisão e QA:** Mantém-se. O humano deve validar regras de negócios e segurança (ex: RLS).

### Recomendação de Story Points (Escala de Tempo de Ciclo Completo)
Sugerimos mapear os pontos não por esforço de digitação, mas por **Tempo de Ciclo (End-to-End)**:

* **1 Ponto (Ajustes Simples):** ~30 a 60 minutos. A IA faz instantaneamente; o tempo é gasto testando.
* **2 Pontos (Fluxo Padrão / CRUD):** ~2 a 3 horas. Exige que a IA gere a UI, conecte a base de dados, e o humano valide o fluxo (ex: Tela de Login).
* **3 Pontos (Lógica Complexa / Segurança):** ~1 dia de trabalho. A IA precisará de iterações e o humano deve auditar rigorosamente (ex: Políticas Multi-tenant).
* **5 Pontos (Arquitetura Core):** ~2 a 3 dias. Inicialização pesada do projeto e sua estrutura fundamental.

Com essa métrica, o Product Owner pode acompanhar a cadência real da equipe, sabendo que 1 Ponto reflete a entrega completa (incluindo testes humanos) e não apenas a geração bruta de código pela IA.

## 5. Boas Práticas de Otimização de IA (Uso de Tokens)
Para garantir que a Inteligência Artificial não sofra com degradação de contexto ("perdido no meio") e mantenha alta velocidade de execução, aplicamos estas estratégias estruturais:

- **Limpeza de Contexto (Isolamento de Planejamento vs Execução):** Conversas longas de planejamento com o PO acumulam muito peso de tokens. A regra é: ao aprovar um plano, invoca-se um **Sub-agente Implementador** com contexto 100% "limpo". Ele recebe apenas o pacote de instruções técnicas puras, economizando milhões de tokens de leitura ao longo do projeto e evitando distrações.
- **Scripting Nativo vs Geração por LLM (Zero-Token Boilerplate):** O agente tem expressamente proibido gastar preciosos tokens de saída (Output) "teclando" arquivos de configuração padrão (Vite, Tailwind, pastas estruturais). O setup deve ser feito disparando um script Bash consolidado que o servidor execute nativamente. O LLM pensa a arquitetura; a máquina gera o boilerplate.
- **Modularização Extrema:** Componentes de React e funções de servidor devem ser pequenos e de responsabilidade única. Arquivos menores custam menos tokens para serem lidos e alterados em manutenções futuras.
- **Edições Cirúrgicas (Diffs):** Os agentes usam ferramentas de busca e substituição exata ao invés de reescrever arquivos inteiros ao corrigir um erro, economizando drásticamente tokens de saída.
- **Instruções Consolidadas:** Regras de negócio residem unicamente em `AGENTS.md` e `PRD.md`. Prompts curtos ativam regras complexas, sem precisar repeti-las no chat.

## 6. Conclusão para o Negócio
Ao operar dessa forma, garantimos que o Product Owner tenha visibilidade total sobre o que está sendo construído. A IA atua como uma esteira de produção incansável, mas o PO continua no volante da direção estratégica, aprovando os planos antes que qualquer linha de código seja escrita, tudo documentado de forma clara no nosso sistema de gestão (Plane, com futura possibilidade para Jira).
