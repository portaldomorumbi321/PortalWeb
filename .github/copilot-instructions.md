# Copilot Instructions

## Contexto do repositório

Este workspace usa estrutura de monorepo.

Pastas principais:
- `apps/web`: frontend web em Vite + React
- `apps/mobile`: app mobile em Expo + React Native
- `packages/ui`: componentes compartilháveis
- `packages/types`: tipos compartilhados
- `packages/utils`: utilitários compartilhados
- `api/` e `Backend/`: código legado existente; não assumir que são a fonte principal sem confirmação

## Diretrizes gerais

- Preserve funcionalidades existentes.
- Faça mudanças pequenas e focadas.
- Não refatore áreas não relacionadas ao pedido.
- Não recrie `apps/api` ou outra API nova sem solicitação explícita.
- Antes de alterar arquivos, prefira localizar o ponto exato de uso e mudar apenas a fatia necessária.
- Ao atualizar integrações HTTP no frontend, concentre mudanças na camada `data/` sempre que possível.

## Frontend web

- O app web fica em `apps/web`.
- Use os padrões já existentes em `apps/web/src/app`.
- Para serviços HTTP, siga o estilo dos arquivos em `apps/web/src/app/data`.
- Considere `VITE_API_URL` como fonte da base HTTP.
- Considere `VITE_SOCKET_URL` como fonte da base de tempo real.
- Evite alterar layout quando o pedido for apenas de integração, dados ou infraestrutura.

## Mobile

- O app mobile fica em `apps/mobile`.
- Preserve o template Expo enquanto o app estiver em fase inicial, a menos que o pedido exija estrutura mais avançada.
- Ao integrar com backend, centralize configuração de ambiente e clientes HTTP em arquivos dedicados.

## Código compartilhado

- Se lógica, tipos ou utilitários forem compartilháveis entre web e mobile, prefira `packages/types`, `packages/utils` e `packages/ui` quando isso fizer sentido.
- Não mova código para `packages/*` sem necessidade clara.

## Validação

- Para web, valide com build quando houver mudança relevante.
- Para mobile, valide ao menos estrutura e tipagem dos arquivos tocados.
- Se houver risco de configuração quebrada, documente o impacto de forma objetiva.

## Documentação

- Atualize documentação quando scripts, estrutura, variáveis de ambiente ou fluxo de execução mudarem.
- Mantenha README e instruções alinhados com a estrutura real do monorepo.
