import json
import requests

API_KEY = "plane_api_af971fdc54404723aed105c6ad14f07a"
WORKSPACE = "capsula"
PROJECT_ID = "6308445e-8b0b-4eee-bf27-07c14b2a6331"
BASE_URL = f"https://api.plane.so/api/v1/workspaces/{WORKSPACE}/projects/{PROJECT_ID}"
HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

data = {
  "CAPSU-1": {
    "name": "HU-001 (Épica: EP-01) - Como qualquer usuário, quero fazer login com meu e-mail e senha para acessar o sistema de forma segura.",
    "description_html": "<p><strong>História:</strong> Como qualquer usuário, quero fazer login com meu e-mail e senha para acessar o sistema de forma segura.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO um usuário registrado e ativo QUANDO insere e-mail e senha válidos ENTÃO acessa e uma sessão é criada com JWT.</li><li>DADO credenciais inválidas QUANDO tenta entrar ENTÃO vê uma mensagem de erro e NÃO acessa.</li><li>DADO um usuário de um tenant suspenso QUANDO tenta entrar ENTÃO o acesso é negado com mensagem clara.</li><li>DADO um login bem-sucedido ENTÃO o JWT contém seu tenant_id e sua função (role) como claims.</li></ul><p><strong>Notas técnicas:</strong> Via Supabase Auth. Os claims (tenant_id, role) são injetados no JWT mediante Auth hooks.</p>"
  },
  "CAPSU-2": {
    "name": "HU-002 (Épica: EP-01) - Como usuário autenticado, quero fazer logout para proteger minha conta.",
    "description_html": "<p><strong>História:</strong> Como usuário autenticado, quero fazer logout para proteger minha conta.</p><p><strong>Estimativa:</strong> 1 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO um usuário com sessão ativa QUANDO clica em \"Sair\" ENTÃO a sessão é invalidada e ele é redirecionado para o login.</li></ul>"
  },
  "CAPSU-3": {
    "name": "HU-003 (Épica: EP-01) - Como usuário, quero recuperar minha senha por e-mail para recuperar o acesso caso a esqueça.",
    "description_html": "<p><strong>História:</strong> Como usuário, quero recuperar minha senha por e-mail para recuperar o acesso caso a esqueça.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO um e-mail registrado QUANDO solicita recuperação ENTÃO recebe um e-mail com link de redefinição.</li><li>DADO um link válido QUANDO define uma nova senha ENTÃO pode entrar com ela.</li><li>DADO um link expirado ou já usado QUANDO tenta usá-lo ENTÃO vê um erro e deve solicitar um novo.</li></ul>"
  },
  "CAPSU-4": {
    "name": "HU-004 (Épica: EP-02) - Como Super-Admin, quero criar um novo tenant e designar seu primeiro Admin para cadastrar um cliente.",
    "description_html": "<p><strong>História:</strong> Como Super-Admin, quero criar um novo tenant e designar seu primeiro Admin para cadastrar um cliente.</p><p><strong>Estimativa:</strong> 5 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Super-Admin QUANDO crio um tenant com nome e e-mail do admin inicial ENTÃO o tenant é criado e um convite é enviado ao admin.</li><li>DADO um tenant recém-criado ENTÃO ele fica isolado: seus dados não são visíveis para outros tenants (RLS).</li><li>DADO que NÃO sou Super-Admin QUANDO tento acessar a criação de tenants ENTÃO o acesso é negado.</li></ul><p><strong>Notas técnicas:</strong> A criação de tenant + convite do admin é operação administrativa (Edge Function com service_role, nunca a partir do cliente).</p>"
  },
  "CAPSU-5": {
    "name": "HU-005 (Épica: EP-02) - Como Super-Admin, quero editar as configurações de um tenant para manter seus dados atualizados.",
    "description_html": "<p><strong>História:</strong> Como Super-Admin, quero editar as configurações de um tenant para manter seus dados atualizados.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO um tenant existente QUANDO edito seu nome ou configurações ENTÃO as alterações são salvas e registradas na auditoria.</li></ul>"
  },
  "CAPSU-6": {
    "name": "HU-006 (Épica: EP-02) - Como Super-Admin, quero suspender ou reativar um tenant para controlar o acesso de um cliente.",
    "description_html": "<p><strong>História:</strong> Como Super-Admin, quero suspender ou reativar um tenant para controlar o acesso de um cliente.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO um tenant ativo QUANDO o suspendo ENTÃO seus usuários não podem fazer login.</li><li>DADO um tenant suspenso QUANDO o reativo ENTÃO seus usuários podem entrar novamente.</li><li>DADO uma suspensão/reativação ENTÃO fica registrada na auditoria.</li></ul><p><strong>Dependências:</strong> HU-001 (o bloqueio de login é validado na autenticação).</p>"
  },
  "CAPSU-7": {
    "name": "HU-007 (Épica: EP-02) - Como Super-Admin, quero ver a lista de todos os tenants para gerenciá-los.",
    "description_html": "<p><strong>História:</strong> Como Super-Admin, quero ver a lista de todos os tenants para gerenciá-los.</p><p><strong>Estimativa:</strong> 2 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Super-Admin QUANDO abro o gerenciamento de tenants ENTÃO vejo todos os tenants com seu status (ativo/suspenso).</li></ul>"
  },
  "CAPSU-8": {
    "name": "HU-008 (Épica: EP-03) - Como Admin de tenant, quero convidar um usuário por e-mail e atribuir uma função para integrar à minha equipe.",
    "description_html": "<p><strong>História:</strong> Como Admin de tenant, quero convidar um usuário por e-mail e atribuir uma função para integrar à minha equipe.</p><p><strong>Estimativa:</strong> 5 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Admin QUANDO convido um e-mail e escolho uma função (Admin/Aprovador/Usuário) ENTÃO um token é gerado e um e-mail de convite é enviado.</li><li>DADO um e-mail já pertencente ao meu tenant QUANDO tento convidá-lo ENTÃO sou avisado que já existe.</li><li>DADO um convite enviado ENTÃO aparece como \"pendente\" até ser aceito.</li></ul><p><strong>Notas técnicas:</strong> Usar inviteUserByEmail do Supabase Auth. O convite deve associar tenant_id e função ao token.</p>"
  },
  "CAPSU-9": {
    "name": "HU-009 (Épica: EP-03) - Como pessoa convidada, quero aceitar o convite e criar minha senha para acessar o tenant correto.",
    "description_html": "<p><strong>História:</strong> Como pessoa convidada, quero aceitar o convite e criar minha senha para acessar o tenant correto.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO um token de convite válido QUANDO crio minha senha ENTÃO fico registrado no tenant correto com a função atribuída.</li><li>DADO um token expirado QUANDO tento aceitá-lo ENTÃO vejo um erro e devo pedir um novo convite.</li><li>DADO um convite já aceito QUANDO tento reutilizar o link ENTÃO sou redirecionado para o login.</li></ul><p><strong>Dependências:</strong> HU-008.</p>"
  },
  "CAPSU-10": {
    "name": "HU-010 (Épica: EP-03) - Como Admin de tenant, quero ver, alterar a função ou desativar usuários do meu tenant para administrar minha equipe.",
    "description_html": "<p><strong>História:</strong> Como Admin de tenant, quero ver, alterar a função ou desativar usuários do meu tenant para administrar minha equipe.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Admin QUANDO abro o gerenciamento de usuários ENTÃO vejo apenas os usuários do MEU tenant.</li><li>DADO um usuário do meu tenant QUANDO altero sua função ENTÃO a alteração é aplicada e fica na auditoria.</li><li>DADO um usuário ativo QUANDO o desativo ENTÃO não pode fazer login.</li></ul>"
  },
  "CAPSU-11": {
    "name": "HU-011 (Épica: EP-03) - Como sistema, quero garantir que cada função acesse apenas o permitido e nunca outro tenant para proteger os dados.",
    "description_html": "<p><strong>História:</strong> Como sistema, quero garantir que cada função acesse apenas o permitido e nunca outro tenant para proteger os dados.</p><p><strong>Estimativa:</strong> 5 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO um usuário do tenant A QUANDO tenta acessar dados do tenant B (por API ou URL) ENTÃO o acesso é negado (RLS).</li><li>DADO um Usuário (função básica) QUANDO tenta uma ação de Admin ENTÃO o acesso é negado.</li><li>DADO qualquer acesso ENTÃO as políticas são aplicadas em nível de banco de dados, não apenas no frontend.</li></ul><p><strong>Notas técnicas:</strong> Transversal. Cobrir com testes de isolamento cross-tenant. Relacionada a RNF-01, RNF-03.</p>"
  },
  "CAPSU-12": {
    "name": "HU-012 (Épica: EP-04) - Como Usuário de tenant, quero criar uma solicitação de um determinado tipo para que seja revisada e aprovada.",
    "description_html": "<p><strong>História:</strong> Como Usuário de tenant, quero criar uma solicitação de um determinado tipo para que seja revisada e aprovada.</p><p><strong>Estimativa:</strong> 5 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Usuário QUANDO crio uma solicitação com um tipo e os dados necessários ENTÃO fica registrada com status \"pendente\" dentro do meu tenant.</li><li>DADO uma solicitação criada ENTÃO é registrado quem a criou e quando (auditoria).</li><li>DADO o design extensível ENTÃO o campo type permite que cada projeto defina seus próprios tipos sem alterar o esquema base.</li></ul>"
  },
  "CAPSU-13": {
    "name": "HU-013 (Épica: EP-04) - Como Aprovador de tenant, quero aprovar ou rejeitar uma solicitação pendente para resolver o pedido.",
    "description_html": "<p><strong>História:</strong> Como Aprovador de tenant, quero aprovar ou rejeitar uma solicitação pendente para resolver o pedido.</p><p><strong>Estimativa:</strong> 5 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Aprovador QUANDO vejo uma solicitação pendente do meu tenant ENTÃO posso aprová-la ou rejeitá-la.</li><li>DADO uma aprovação/rejeição QUANDO é executada ENTÃO a solicitação muda de status e é registrado quem decidiu, quando e um comentário opcional.</li><li>DADO que NÃO sou Aprovador (nem Admin) QUANDO tento decidir sobre uma solicitação ENTÃO o acesso é negado.</li><li>DADO uma solicitação já resolvida QUANDO tento decidir novamente ENTÃO sou impedido (não é reprocessada).</li></ul><p><strong>Dependências:</strong> HU-012.</p>"
  },
  "CAPSU-14": {
    "name": "HU-014 (Épica: EP-04) - Como Usuário de tenant, quero ver o status das solicitações que criei para fazer acompanhamento.",
    "description_html": "<p><strong>História:</strong> Como Usuário de tenant, quero ver o status das solicitações que criei para fazer acompanhamento.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Usuário QUANDO abro minhas solicitações ENTÃO vejo apenas as minhas com seu status atual (pendente/aprovada/rejeitada).</li><li>DADO uma solicitação rejeitada ENTÃO posso ver o comentário do aprovador, se existir.</li></ul>"
  },
  "CAPSU-15": {
    "name": "HU-015 (Épica: EP-04) - Como Aprovador de tenant, quero uma caixa de entrada com as solicitações pendentes para gerenciá-las de forma eficiente.",
    "description_html": "<p><strong>História:</strong> Como Aprovador de tenant, quero uma caixa de entrada com as solicitações pendentes para gerenciá-las de forma eficiente.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Aprovador QUANDO abro a caixa de entrada ENTÃO vejo todas as solicitações pendentes do MEU tenant, ordenadas por data.</li><li>DADO a caixa de entrada QUANDO filtro por type ou status ENTÃO a lista é filtrada corretamente.</li></ul>"
  },
  "CAPSU-16": {
    "name": "HU-016 (Épica: EP-05) - Como sistema, quero registrar automaticamente as ações relevantes para garantir a rastreabilidade.",
    "description_html": "<p><strong>História:</strong> Como sistema, quero registrar automaticamente as ações relevantes para garantir a rastreabilidade.</p><p><strong>Estimativa:</strong> 5 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO qualquer ação relevante (login, mudança de função, CRUD de tenant/usuário, decisão de aprovação) QUANDO ocorre ENTÃO é criado um registro com: quem, qual ação, sobre qual entidade, quando e tenant_id.</li><li>DADO um registro de auditoria ENTÃO ele é imutável (não editável nem apagável a partir do aplicativo).</li><li>DADO o isolamento ENTÃO cada registro fica associado ao seu tenant.</li></ul><p><strong>Notas técnicas:</strong> Relacionada a RNF-05 (imutabilidade).</p>"
  },
  "CAPSU-17": {
    "name": "HU-017 (Épica: EP-05) - Como Admin de tenant, quero um visualizador dos logs do meu tenant com filtros para investigar o que aconteceu.",
    "description_html": "<p><strong>História:</strong> Como Admin de tenant, quero um visualizador dos logs do meu tenant com filtros para investigar o que aconteceu.</p><p><strong>Estimativa:</strong> 5 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Admin QUANDO abro o visualizador de auditoria ENTÃO vejo apenas os registros do MEU tenant.</li><li>DADO o visualizador QUANDO filtro por usuário, tipo de ação ou intervalo de datas ENTÃO a lista é filtrada corretamente.</li><li>DADO muitos registros ENTÃO a lista é paginada e se mantém fluida.</li></ul><p><strong>Dependências:</strong> HU-016.</p>"
  },
  "CAPSU-18": {
    "name": "HU-018 (Épica: EP-05) - Como Super-Admin, quero ver a auditoria em nível de plataforma para supervisionar ações sobre os tenants.",
    "description_html": "<p><strong>História:</strong> Como Super-Admin, quero ver a auditoria em nível de plataforma para supervisionar ações sobre os tenants.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Super-Admin QUANDO abro a auditoria global ENTÃO vejo os registros de ações de plataforma (criação/suspensão de tenants, etc.).</li><li>DADO o visualizador global QUANDO filtro por tenant, ação ou data ENTÃO a lista é filtrada corretamente.</li></ul><p><strong>Dependências:</strong> HU-016.</p>"
  },
  "CAPSU-19": {
    "name": "HU-019 (Épica: EP-06) - Como Admin de tenant, quero configurar o logotipo, a cor principal e o nome do meu tenant para que o painel reflita minha marca.",
    "description_html": "<p><strong>História:</strong> Como Admin de tenant, quero configurar o logotipo, a cor principal e o nome do meu tenant para que o painel reflita minha marca.</p><p><strong>Estimativa:</strong> 3 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que sou Admin QUANDO envio um logotipo, escolho uma cor principal e defino o nome ENTÃO eles são salvos nas configurações do tenant.</li><li>DADO um tenant com marca configurada QUANDO seus usuários entram ENTÃO o painel exibe esse logotipo, cor e nome.</li><li>DADO um tenant sem marca configurada ENTÃO é usada uma marca padrão.</li></ul>"
  },
  "CAPSU-20": {
    "name": "HU-020 (Épica: EP-06) - Como usuário autenticado, quero um painel com navegação adaptada à minha função para acessar apenas o que me corresponde.",
    "description_html": "<p><strong>História:</strong> Como usuário autenticado, quero um painel com navegação adaptada à minha função para acessar apenas o que me corresponde.</p><p><strong>Estimativa:</strong> 5 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO um usuário autenticado QUANDO entra no painel ENTÃO vê um layout com navegação e suas informações de sessão.</li><li>DADO minha função QUANDO a navegação é renderizada ENTÃO vejo apenas as seções permitidas (ex: um Usuário não vê \"Gerenciamento de tenants\").</li><li>DADO o design extensível ENTÃO há um ponto claro onde cada projeto adiciona suas seções de menu e páginas.</li></ul>"
  },
  "CAPSU-21": {
    "name": "HU-021 (Épica: EP-06) - Como desenvolvedor que usa o modelo, quero um ponto de extensão claro e documentado para adicionar a funcionalidade específica de cada projeto rapidamente.",
    "description_html": "<p><strong>História:</strong> Como desenvolvedor que usa o modelo, quero um ponto de extensão claro e documentado para adicionar a funcionalidade específica de cada projeto rapidamente.</p><p><strong>Estimativa:</strong> 2 pontos</p><p><strong>Critérios de aceitação:</strong></p><ul><li>DADO que clono o modelo QUANDO leio a documentação ENTÃO sei exatamente onde e como adicionar uma seção (rota + página + entrada de menu + permissões).</li><li>DADO um exemplo incluído ENTÃO há pelo menos uma seção de amostra que serve de modelo para as novas.</li></ul><p><strong>Notas técnicas:</strong> Relacionada a O-03 e RNF-09.</p>"
  }
}

# Fetch all issues to get their UUIDs mapping to sequence
resp = requests.get(f"{BASE_URL}/issues/", headers=HEADERS)
resp.raise_for_status()
issues = resp.json().get('results', [])

uuid_map = {}
for i in issues:
    seq_id = f"CAPSU-{i['sequence_id']}"
    uuid_map[seq_id] = i['id']

for seq_id, update_data in data.items():
    issue_id = uuid_map.get(seq_id)
    if not issue_id:
        print(f"Skipping {seq_id}, not found")
        continue
        
    print(f"Updating {seq_id} to pt-BR...")
    url = f"{BASE_URL}/issues/{issue_id}/"
    resp = requests.patch(url, headers=HEADERS, json=update_data)
    if resp.status_code in (200, 201):
        print(f"Success for {seq_id}")
    else:
        print(f"Failed for {seq_id}: {resp.text}")
