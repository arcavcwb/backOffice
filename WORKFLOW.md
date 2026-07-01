# Workflow: Metodologia Cyborg (IA + Humano)

Este diagrama representa o fluxo de vida completo de uma funcionalidade, desde a ideação (Fase Zero) até o código em produção, destacando os "Gates" de aprovação humana e as estratégias de otimização de contexto para a IA.

```mermaid
graph TD
    %% Estilos
    classDef humano fill:#f9d0c4,stroke:#333,stroke-width:2px;
    classDef agente fill:#d4e6f1,stroke:#333,stroke-width:2px;
    classDef decisao fill:#fcf3cf,stroke:#333,stroke-width:2px;

    %% Atores
    PO([Product Owner / Tech Lead]):::humano
    
    %% Fase Zero
    subgraph FaseZero [Fase Zero: Discovery & Viabilidade]
        PRD[PRD & Regras] --> Est[Estimativa de Pontos]
        Est --> Viab{É Viável?}:::decisao
    end
    
    PO -->|Analisa| Viab
    Viab -->|Não| Descarte[Descarte do Projeto]
    Viab -->|Sim| Backlog[(Plane Backlog)]
    
    %% Ciclo Cyborg
    subgraph Sprints [Ciclo Cyborg de Desenvolvimento]
        Backlog -->|Puxa Ticket| Ana[Agente Analista]:::agente
        Ana -->|Plano Técnico| G1{Gate 1}:::decisao
        PO -->|Aprova Plano| G1
        
        G1 -->|Reprova| Ana
        G1 -->|Aprova| Imp[Agente Implementador]:::agente
        
        %% Otimização de Tokens
        Imp -.->|Contexto Limpo| Sub[Sub-agente Isolado]:::agente
        Sub -.->|Zero-Token| Script[Scripts Bash / Boilerplate]
        
        Sub --> Test[Agente Tester]:::agente
        Test -->|Verifica RLS & E2E| Rev[Agente Reviewer]:::agente
        
        Rev -->|Prepara Code/PR| G2{Gate 2}:::decisao
        PO -->|Aprova PR| G2
    end
    
    G2 -->|Reprova| Imp
    G2 -->|Aprova & Merge| Done([Produção / Feito])
```
