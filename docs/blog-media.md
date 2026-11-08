# Storage e uploads de imagens do blog

Implementação local em 8 de novembro de 2026. Não implementa MCP, IA ou publicação automática. O template editorial continua com os mesmos 26 blocos.

## Arquitetura

- `lib/blog/media-service.ts`: `storeBlogImage({ bytes, mimeType, alt, type, originalName? })` recebe bytes, sem depender de navegador ou FormData. O serviço também lista, busca, atualiza alt e exclui imagens não utilizadas.
- `lib/blog/media-repository.ts`: metadados e consulta de associações em SQLite.
- `lib/blog/media-handlers.ts`: adaptador HTTP multipart/JSON com autorização antes de ler o corpo ou abrir o storage. Admin e API interna usam os mesmos handlers e serviço.
- Arquivos fora de `public/` e da imagem Docker, em `BLOG_UPLOAD_DIR`. Não precisam de rebuild para ficarem disponíveis.
- URLs relativas e persistentes `/uploads/blog/<uuid>.<png|jpg|webp>` funcionam no domínio atual. Em produção, por exemplo, `https://automasoluct.com/uploads/blog/<uuid>.webp`. Não são geradas URLs baseadas em Host enviado pelo cliente.
- O nome original é apenas metadata de apresentação/busca. Diretórios, controles e excesso de comprimento são removidos desse nome. O nome físico é sempre um UUID novo com extensão escolhida pelo servidor.

## Variáveis

| Variável | Desenvolvimento | Docker/VPS |
| --- | --- | --- |
| `BLOG_UPLOAD_DIR` | `./uploads/blog` por padrão; aceita caminho configurável | `/app/uploads/blog` |
| `BLOG_UPLOAD_MAX_BYTES` | `10485760` (10 MiB) | Mesmo padrão; máximo permitido 26214400 (25 MiB) |
| `BLOG_DATA_DIR` | `./data/blog` | `/app/data/blog` |

Não é necessário alterar as credenciais humanas existentes. `BLOG_ADMIN_LOGIN`, `BLOG_ADMIN_PASSWORD_HASH` e `BLOG_ADMIN_ORIGIN` continuam protegendo o admin. A API interna usa os tokens de leitura/escrita já existentes.

Dimensões: até 24 milhões de pixels e 12000 px por lado. Até dois requests de upload e um único decode por processo limitam buffers e decodes grandes simultâneos. Excesso de concorrência retorna 429; o cliente pode tentar novamente. O limite em bytes é aplicado ao stream multipart antes do parsing, com até 64 KiB adicionais para headers/campos, e novamente ao arquivo/serviço. Não depende de Content-Length.

## Schema (migração 3)

`blog_media`, tabela STRICT:

| Campo SQLite | Campo API | Tipo |
| --- | --- | --- |
| `id` | `id` | TEXT, chave primária UUID |
| `file_name` | `fileName` | TEXT UNIQUE |
| `original_name` | `originalName` | TEXT |
| `url` | `url` | TEXT UNIQUE |
| `alt` | `alt` | TEXT, até 300 caracteres |
| `type` | `type` | featured / internal / other |
| `mime_type` | `mimeType` | image/png / image/jpeg / image/webp |
| `size` | `size` | INTEGER, bytes |
| `width`, `height` | `width`, `height` | INTEGER, dimensões de apresentação com EXIF Orientation |
| `created_at` | `createdAt` | TEXT, ISO 8601 UTC |
| `deleted_at` | não exposto | TEXT ou NULL, proteção de referências removidas |

Índice em `deleted_at, created_at DESC, id`. Migração automática, transacional e incremental; não reescreve posts ou sessões existentes.

O `type` da biblioteca registra o uso inicial. Uma imagem pode ser selecionada em outro contexto: o editor gera uma referência com o tipo correto para aquela posição. Alt da biblioteca funciona como padrão ao selecionar; cada referência do post preserva seu próprio alt e revision. Editar o alt da biblioteca não modifica silenciosamente posts publicados.

## Endpoints

| Método | Admin | API interna | Ação |
| --- | --- | --- | --- |
| GET | `/api/admin/blog/media` | `/api/internal/blog/media` | Listar: `q`, `page`, `pageSize` (padrão 12; máximo 48) |
| POST | mesmos caminhos | mesmos caminhos | Upload multipart: `file`, `alt`, `type` |
| GET | `/api/admin/blog/media/[id]` | `/api/internal/blog/media/[id]` | Metadata e `usedBy` com posts associados |
| PATCH | mesmos caminhos `[id]` | mesmos caminhos `[id]` | JSON `{ "alt": "..." }` |
| DELETE | mesmos caminhos `[id]` | mesmos caminhos `[id]` | JSON `{ "confirmation": "<fileName exato>" }` |
| GET | `/uploads/blog/[filename]` | público | Bytes da imagem com MIME fixo e proteção de filesystem |

Admin: sessão HttpOnly existente; POST/PATCH/DELETE exigem Origin exata e `X-CSRF-Token`. GET continua privado e exige sessão. API interna: bearer existente, `posts:read` para GET e `posts:write` para escritas; cookie admin não substitui bearer. Não há cliente MCP nesta etapa. Respostas administrativas não são cacheadas.

Erros relevantes: 400 input/multipart/confirmação inválidos; 401 sem sessão/token; 403 CSRF/origem/escopo; 404 mídia inexistente; 409 mídia em uso ou referência previamente removida; 413 limite em bytes; 415 MIME/assinatura incompatíveis; 422 decode/dimensões inválidos; 429 processamento ocupado; 503 configuração inválida. Erros não incluem caminhos físicos, SQL ou segredos.

## Segurança e exclusão

- Upload aceita apenas PNG, JPEG e WebP. SVG, AVIF, GIF, documentos e executáveis são recusados nesta etapa.
- Validação de assinatura, MIME e formato detectado, seguida de decode completo com Sharp `failOn: warning` e limite de pixels. Nenhuma conversão destrutiva: os bytes originais são preservados. O Sharp 0.35.5, já presente via Next.js, foi declarado como dependência direta. Referência: [construtor oficial do Sharp](https://sharp.pixelplumbing.com/api-constructor/).
- Nomes UUID, escrita exclusiva `wx`, permissões 0640 e fsync antes de registrar metadata. Falha de inserção SQLite remove o arquivo recém-criado.
- Leitura pública aceita exclusivamente filenames conhecidos pelo padrão UUID/extensão; o diretório base é configurado no servidor. `O_NOFOLLOW` impede seguir symlinks no arquivo final. Respostas têm MIME controlado, `nosniff` e CSP sandbox. A rota mantém suporte a arquivos AVIF legados; não aceita upload novo desse formato.
- DELETE consulta tanto imagem destacada quanto blocos internos, em drafts e publicados, por id **ou URL**. Não existe parâmetro force. Um post associado impede excluir o arquivo (409).
- Exclusão exige confirmação do filename e ocorre sob transação `BEGIN IMMEDIATE`, sem awaits entre a consulta e a remoção. A API revalida o uso no momento da exclusão, mesmo que a tela tenha mostrado a imagem como livre antes.
- O arquivo é removido permanentemente. O registro da mídia removida permanece no banco, fora da biblioteca. Triggers impedem que um editor desatualizado volte a salvar o id/URL removido; retorna `media_deleted`, sem sobrescrever o draft. Não é uma lixeira nem oferece recuperação; restauração depende de backup.
- Os arquivos enviados têm URL pública, mesmo antes de associar a um post. Excluir um arquivo pode não remover cópias que um navegador já tenha cacheado por até uma hora.

## Painel

- `/admin/blog/media`: upload, grid paginado, busca por filename/nome original/alt, detalhes, edição de alt, associações e exclusão confirmada de imagens livres.
- Editor `/admin/blog/[id]`: upload e modal de seleção na imagem destacada e nas quatro posições internas. Upload seleciona automaticamente a imagem; é necessário salvar o draft para persistir a associação. URL manual e arquivos legados continuam como fallback.
- Upload em andamento bloqueia salvamento/edição concorrente na mesma tela. Botões com alvo mínimo de 44px, labels, foco visível, mensagens acessíveis e dialogs nativos com Escape/retorno de foco.
- Alterar o alt no post não altera o alt global. “Remover seleção” remove a referência do draft após salvar; não exclui o arquivo.

## Docker / VPS

O Compose preserva dois volumes nomeados:

```yaml
volumes:
  - blog-data:/app/data/blog
  - blog-uploads:/app/uploads/blog
```

O usuário `nextjs` (UID/GID 1001) precisa ler e escrever os dois diretórios. O Dockerfile cria os diretórios com owner 1001:1001 e modo 0750. Novos arquivos têm modo 0640. Em bind mounts ou volumes já criados com outro proprietário, o operador deve ajustar o owner para 1001:1001 antes de subir o contêiner. Não usar permissões 0777.

Rebuild e recriação do contêiner preservam os volumes. Não executar `docker compose down -v` como parte de deploy. O diretório de uploads está ignorado pelo Git e excluído do contexto Docker; backups devem incluir SQLite e uploads como conjunto. Use backup online do SQLite ou pause o writer para uma cópia consistente, incluindo WAL quando aplicável. A exclusão de mídia é permanente; SQLite e filesystem não oferecem uma transação distribuída em caso de falha física do disco, portanto mantenha backups dos dois volumes.

Se houver Nginx/proxy, configure o limite do request para ser maior que `BLOG_UPLOAD_MAX_BYTES` + 64 KiB (por exemplo, 11 MiB para o padrão de 10 MiB). Esse limite não substitui a validação da aplicação. Disco cheio/falta de permissão falham sem criar metadata válida para um arquivo incompleto.

## Validação e limites atuais

`npm test` inclui testes de formatos reais, decode inválido/truncado, limites de bytes/pixels, nomes maliciosos, persistência de metadata, migração, autenticação/CSRF, busca, atualização de alt, bloqueio de exclusão em uso, editor desatualizado, URL pública e path traversal/symlinks. O smoke HTTP existente também testa upload multipart real, biblioteca, associação, exclusão e API interna em banco/volume temporários.

Validação concluída nesta etapa:

- `npm run lint`: passou.
- `npm run build`: passou, incluindo TypeScript e empacotamento do Sharp no standalone.
- `npm test`: 54 testes passaram, incluindo os 38 anteriores e 16 novos de mídia.
- `npm run test:admin:http -- --keep-alive`: passou com banco/uploads temporários; verificou também home, blog público, preview, publicação explícita, retirada e APIs existentes.
- `git diff --check` e `docker compose config --quiet`: passaram.
- Chrome em viewport responsiva: biblioteca, editor e diálogos testados em 320, 360, 375, 390, 414, 768, 1024, 1280 e 1440 px. Sem overflow horizontal, sobreposição de cards ou controles visíveis abaixo de 44px. Inputs mantêm 16px, previews usam object-fit contain e títulos/nomes longos quebram linhas.
- Upload pelo seletor nativo do Chrome no catálogo, na imagem destacada e em bloco interno; edição de alt; seleção da biblioteca; salvamento com revision; associação correta e preservação dos 26 blocos/quatro imagens internas confirmados na API.
- Corrigidos durante QA: colunas do modal seguindo a largura disponível (container queries e modal amplo), em vez de três cards estreitos; link ao post associado com display inline-flex para respeitar o alvo mínimo de 44px.
- Diálogo nativo: navegação de foco, Escape e retorno ao acionador verificados. Exclusão de imagem em uso aparece bloqueada na UI e é revalidada no servidor. Testes usaram dados descartáveis; nenhum post/imagem de QA foi persistido no banco real.

Não foi executado build ou deploy de contêiner na VPS; foram validados o Compose e o build standalone local. A revisão foi em emulação responsiva do Chrome, sem teste em hardware iOS/Android.

Sem conversão automática, compressão, recorte, AVIF novo, editor de imagem, importação de metadata de arquivos legados, cotas de disco por conta, CDN, múltiplas VPS ou coleta automática de uploads sem associação. Arquivos antigos continuam servidos e selecionáveis por URL/dropdown; apenas uploads novos entram automaticamente no catálogo com metadata completa. Originais podem conter metadata EXIF; ela não é removida nesta etapa que preserva bytes.

Próximo passo recomendado: validar o fluxo editorial com imagens reais e configurar backup/monitoramento do volume na VPS. Um futuro MCP poderá consumir os endpoints internos acima ou a mesma função `storeBlogImage`, sem criar outro storage.
