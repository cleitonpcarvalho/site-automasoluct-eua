# Revisão responsiva do blog e atualização do Next.js

Data: 8 de novembro de 2026.

## Versões e compatibilidade

As versões anteriores foram registradas antes de editar as dependências.

| Pacote/ambiente | Antes | Depois |
| --- | --- | --- |
| Next.js | 16.3.8 | 16.4.5 |
| eslint-config-next | 16.3.8 | 16.4.5 |
| React / React DOM | 19.3.0 | 19.3.0 |
| ESLint | 9.39.5 | 9.39.5 |
| TypeScript | 6.0.3 | 6.0.3 |
| Node local | 26.8.1 | 26.8.1 |
| npm local | 11.19.0 | 11.19.0 |
| Node do Docker | 24-alpine | 24-alpine |

Os metadados oficiais do npm para Next.js 16.4.5 aceitam React/React DOM `^19.0.0` e Node `>=20.9.0`. eslint-config-next 16.4.5 aceita ESLint `>=9.0.0` e TypeScript `>=3.3.1`. O projeto mantém seu requisito de Node `>=24.0.0`. Não foi necessário alterar React, configuração do Next.js ou código por incompatibilidade.

O lockfile mudou apenas as versões do Next.js e dos pacotes correspondentes de configuração ESLint, env e SWC. Nenhuma dependência funcional foi adicionada.

- [Advisory GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr): a versão instalada supera a correção 16.4.1.
- [Release estável 16.4.5](https://github.com/vercel/next.js/releases/tag/v16.4.5).
- `npm audit --omit=dev`: zero vulnerabilidades.
- Audit completo: zero críticas; permanecem oito moderadas e uma alta na árvore das ferramentas de desenvolvimento (typescript-eslint/minimatch/zod). Não foi executado `npm audit fix` nem upgrade fora do escopo.

## Correções visuais e de acessibilidade

1. **Sobreposição no formulário do artigo — importante.** A ajuda de “Which systems are involved?” usava posicionamento absoluto do formulário compartilhado. A partir de 640px, ficava sobre a primeira linha de opções; confirmado visualmente e por interseção de retângulos em 768px. O CSS do blog agora mantém a ajuda no fluxo normal.
2. **Campos editáveis de 14px — pequeno ajuste.** Inputs e textarea do formulário incorporado agora usam 16px, mantendo legibilidade e evitando zoom automático em dispositivos que ampliam campos pequenos.
3. **Alvos de toque — pequeno ajuste.** Botões do formulário têm mínimo de 44×44px; “CRM” media aproximadamente 40×44px. Os títulos dos cards passaram de links inline para links em bloco com altura mínima de 44px, inclusive quando o título ocupa uma única linha. Os controles de rádio continuam visualmente ocultos e usam os labels como alvo de interação.

As regras do formulário ficam em um CSS Module restrito ao bloco final do blog. O componente compartilhado, sua lógica, envio e Turnstile não foram alterados nesta revisão. Identidade visual, demais páginas e estrutura editorial foram preservadas.

## Matriz do navegador

Chrome com emulação responsiva, viewport CSS conferido pelo `innerWidth`. Modo touch usado de 320 a 1024px e modo desktop em 1280/1440px; zoom normalizado para a medição desktop. Foram usados cinco posts de teste, incluindo títulos compridos, título curto, uma palavra sem espaços, excerpt e tags longas.

| Largura | /blog | /blog/[slug] | Home após upgrade |
| --- | --- | --- | --- |
| 320px | OK | OK | OK |
| 360px | OK | OK | OK |
| 375px | OK | OK | OK |
| 390px | OK | OK | OK |
| 414px | OK | OK | OK |
| 768px | OK | OK | OK |
| 1024px | OK | OK | OK |
| 1280px | OK | OK | OK |
| 1440px | OK | OK | OK |

Em todas as larguras do blog:

- Sem scroll horizontal, elementos ultrapassando o viewport, textos cortados por seus contêineres ou sobreposição da ajuda do formulário.
- Cards, títulos, resumos e tags preservados; grid de uma coluna no celular, duas em 768px e três a partir de 1024px.
- Imagem destacada e quatro imagens internas carregadas, com `object-fit: contain`, sem deformação/corte. Player com proporção 16:9.
- Seis headings H3, quatro CTAs e formulário final presentes, com os 26 blocos na ordem aprovada. O arquivo central do template permaneceu idêntico.
- CTAs, links dos cards, campos editáveis, botões e labels de rádio com altura mínima de 44px; botões do formulário também com largura mínima de 44px.
- Conteúdo com espaçamento e tamanhos legíveis; título principal de 30px no celular, 36px em 768px e 48px a partir de 1024px. Texto editorial de 16px.

Teclado: Tab percorreu nome, empresa, e-mail, telefone, atividade, orçamento, sistemas e textarea; setas mudaram a seleção de orçamento; Shift+Tab retornou sem aprisionamento. Foco visível confirmado. Retorno para a listagem, abertura de artigo pelo card e CTA para `/contact` foram verificados no navegador.

Contraste calculado para os principais pares: branco sobre azul `#0A4EE4` 6,52:1; azul suave sobre superfície escura 4,87:1; cinza informativo sobre superfície escura 11,64:1. A verificação não cobre o conteúdo interno de iframes de terceiros.

Com `prefers-reduced-motion: reduce`, o artigo manteve todos os blocos, sem overflow, e o scroll computado passou a `auto`. A emulação foi restaurada ao final. A home manteve as 14 seções, resposta HTTP 200 e ausência de scroll horizontal nas nove larguras; não houve edição de seus componentes.

## Validação técnica e limites

- `npm run lint`: passou, sem erros ou warnings do ESLint.
- `npm run build`: passou com Next.js 16.4.5, incluindo TypeScript, geração das páginas e rotas internas.
- `npm test`: 18 de 18 passaram, nenhum teste ignorado. Permanece o aviso existente do Node sobre módulos TypeScript sem `type: module`; não impede os testes.
- `git diff --check`: passou.
- Teste HTTP contra o build de produção: estado vazio, home, listagem/artigos, leitura/listagem protegidas, criação de draft, PATCH válido com avanço de revisão, publicação com credencial específica, isolamento de drafts, permissões 401/403, template protegido e imagens locais passaram. As respostas públicas preservaram os 26 blocos e seis H3.

O banco, credenciais, posts e imagens de QA existiram somente em diretório temporário separado; foram removidos após os testes. Nenhum post real foi criado, atualizado ou publicado. A janela de QA foi fechada e o servidor de desenvolvimento existente não foi reiniciado.

Esta é uma validação em emulação do Chrome, não em aparelhos físicos/Safari. O vídeo da fixture usa um identificador fictício: foram verificados iframe, título e responsividade, não reprodução de um vídeo editorial real. O Turnstile apresentou falha de conexão no ambiente local; foram verificados encaixe e layout do formulário, sem resolver CAPTCHA, enviar formulário ou validar entrega de webhook. Esses comportamentos externos não foram alterados.

Não foram implementados painel admin, login, MCP ou geração por IA. Não houve commit, push ou deploy.

## Arquivos desta etapa

- Alterados: `package.json`, `package-lock.json`, `components/blog/PostCard.tsx`, `components/blog/BlogBlocks.tsx`, `docs/blog-foundation.md`.
- Criados: `components/blog/BlogBlocks.module.css`, `docs/blog-responsive-upgrade.md`.

As demais modificações locais existentes antes desta revisão foram preservadas.
