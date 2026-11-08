# Painel administrativo do blog

Implementação local em 8 de novembro de 2026. Nenhum commit, push ou deploy foi executado. MCP e geração por IA não foram implementados. A etapa posterior de upload e biblioteca está documentada em [blog-media.md](blog-media.md).

## Autenticação humana

O painel usa um administrador configurado por ambiente e as primitivas nativas do Node, sem instalar dependências.

- Senha com salt aleatório de 16 bytes e scrypt `N=131072, r=8, p=1`, chave de 64 bytes. O formato armazenado é `scrypt:131072:8:1:<salt-hex>:<hash-hex>`. O gerador exige pelo menos 14 caracteres e no máximo 1024 bytes. A implementação segue a opção scrypt da [orientação da OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- Sessão opaca de 256 bits, aleatória a cada login. Apenas seu SHA-256 fica no SQLite. Expiração absoluta de oito horas, revogação no logout, limite de dez sessões ativas e invalidação das sessões quando o usuário ou hash configurado muda.
- Cookie `__Host-blog_admin` com `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`, sem Domain. Em HTTP de loopback, usa `blog_admin` sem Secure exclusivamente para desenvolvimento/testes. HTTP em outros hosts é recusado na configuração.
- Todas as páginas protegidas verificam a sessão no servidor antes de buscar conteúdo, além da checagem no layout. As rotas JSON fazem sua própria autorização; esconder a interface não é o controle de acesso. Esse desenho considera as [restrições de autenticação em layouts do Next.js](https://nextjs.org/docs/app/guides/authentication#layouts-and-auth-checks).
- Toda escrita autenticada exige Origin igual à origem configurada e token CSRF aleatório da sessão em `X-CSRF-Token`. Login exige Origin e JSON; logout também é protegido. Não há CORS permissivo nem confiança em Host/X-Forwarded-Host fornecidos pelo cliente. Referência: [defesa CSRF da OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
- Limite persistente de dez tentativas de login por janela de 15 minutos, global para esse único administrador; uma derivação scrypt por vez em cada processo limita consumo de memória. O limite não usa IP encaminhado que possa ser falsificado.
- Páginas e respostas administrativas são privadas, sem cache e sem indexação; `frame-ancestors 'none'` / `X-Frame-Options: DENY` protegem contra enquadramento. Segredos nunca são enviados em props/client bundles/respostas JSON.

O token CSRF aparece somente nas páginas autenticadas e não autentica uma requisição sem o cookie. A API interna de serviço continua separada: cookies humanos não substituem Bearer tokens, e Bearer tokens não autenticam o painel.

## Configuração

Defina no ambiente do processo do Next.js, usando `.env.local` no desenvolvimento ou o ambiente do contêiner na VPS:

```dotenv
BLOG_ADMIN_LOGIN=seu-usuario-ou-email
BLOG_ADMIN_PASSWORD_HASH=cole-somente-o-hash-gerado
BLOG_ADMIN_ORIGIN=http://localhost:3000
```

`BLOG_ADMIN_ORIGIN` deve ser exatamente a origem aberta no navegador, incluindo host e porta. Na VPS, use a origem HTTPS real, por exemplo `https://seu-dominio.example`. Não use `NEXT_PUBLIC_*` para essas variáveis. O painel permanece fechado enquanto a configuração estiver ausente ou inválida.

Gere o hash sem passar a senha como argumento de linha de comando ou escrevê-la em um arquivo:

```sh
npm run --silent admin:hash-password
```

O prompt não ecoa a senha; somente o hash é impresso. Copie a linha iniciada por `scrypt:` para `BLOG_ADMIN_PASSWORD_HASH`. A senha em texto puro não deve ir para o ambiente ou repositório. O utilitário também aceita stdin para uso controlado em automação local.

Não é necessário um segredo de assinatura de sessão: as sessões são aleatórias, persistidas e revogáveis no banco. `BLOG_DATA_DIR` e `BLOG_UPLOAD_DIR` continuam sendo os diretórios persistentes da fundação. As três variáveis novas foram preparadas no Compose, sem executar o Compose ou alterar credenciais reais. Reinicie o processo de desenvolvimento manualmente depois de configurar seu ambiente.

## Rotas e API humana

| Rota | Acesso / finalidade |
| --- | --- |
| `/admin/login` | Formulário público; quem já tem sessão vai ao dashboard |
| `/admin` | Exige sessão e redireciona para `/admin/blog` |
| `/admin/blog` | Dashboard privado, busca título/slug, filtro, paginação e atualização recente |
| `/admin/blog/[id]` | Editor privado dos campos gerais e 26 posições fixas |
| `/admin/blog/[id]/preview?revision=N` | Prévia privada da revisão salva exata, com o renderer público |

| Método | Endpoint | Ação |
| --- | --- | --- |
| POST | `/api/admin/login` | Verifica credenciais e cria sessão |
| POST | `/api/admin/logout` | Revoga sessão e limpa cookie |
| GET / POST | `/api/admin/blog/posts` | Lista / cria draft com 26 blocos |
| GET / PATCH / DELETE | `/api/admin/blog/posts/[id]` | Abre / salva / exclui com revisão e confirmação |
| POST | `/api/admin/blog/posts/[id]/publish` | Publicação separada e validada |
| POST | `/api/admin/blog/posts/[id]/draft` | Retirada explícita de post publicado |

PATCH recebe `{ expectedRevision, fields }`. `fields` é o modelo do editor: campos gerais, `tagsText` separado por vírgulas, `videoUrl`, `videoTitle`, imagem destacada com URL/alt e os 26 blocos fixos. O servidor deriva id/type das imagens de suas referências locais, normaliza vídeo YouTube/Vimeo e usa os validadores da fundação.

Publicar, retirar e excluir recebem `{ expectedRevision, confirmation: "slug-exato" }`. O servidor compara revisão e slug atuais; o cliente não pode alterar status através de PATCH. Não existe DELETE na API interna de serviço.

## Persistência e edição

A migração 2 adiciona somente:

```text
blog_admin_sessions
  token_hash TEXT PRIMARY KEY
  credential_version TEXT
  csrf_token TEXT
  created_at INTEGER (ms)
  expires_at INTEGER (ms)

blog_admin_login_limits
  bucket TEXT PRIMARY KEY
  attempts INTEGER
  window_start INTEGER (ms)
```

A migração é transacional e preserva os posts existentes. O template central não mudou. Os blocos do editor são derivados dele e não têm controles de remoção/reordenação/troca de tipo. O servidor também recusa mudanças na ordem, ids, tipos, H3 e formulário `assessment`.

Imagens internas podem ter `image: null` enquanto o draft está incompleto; isso permite salvar trabalho parcial. Publicação recusa qualquer imagem pendente e verifica as cinco referências existentes, distintas e válidas com a mesma validação de mídia da fundação. Posts publicados continuam tendo imagens completas. Drafts legados com blocos desconhecidos são bloqueados para edição, em vez de descartar conteúdo silenciosamente.

O editor preserva parágrafos, mostra prévias de imagens e botões e aceita a referência `/uploads/blog/<uuid>.<ext>`. Não carrega imagens de URLs externas. Agora também oferece upload validado e seleção pela biblioteca paginada de metadata; o dropdown de até 500 arquivos locais permanece como fallback para arquivos legados. Consulte [blog-media.md](blog-media.md).

Salvar incrementa a revisão com compare-and-swap. Conflito retorna 409 e mantém o texto no editor; o usuário pode abrir a versão atual em outra aba antes de decidir o que reaplicar. A prévia declara qual revisão salva mostra; alterações não salvas não aparecem nela. Uma URL de revisão antiga mostra aviso de prévia desatualizada.

Publicar é separado de salvar, exige confirmação visual e valida template, metadados/SEO obrigatórios, slug, texto, vídeo, cinco imagens e revisão. Post publicado tem editor bloqueado. Devolver para draft exige confirmação, retira a página pública e libera a edição. Não há publicação automática.

A exclusão é **permanente**, sem soft delete, e exige digitar o slug exato. A query também confere `expectedRevision`. Não apaga arquivos de mídia. Recuperação só por backup; não há lixeira ou histórico completo de versões nesta etapa.

## Validação

- `npm run lint`: sem erros ou warnings do ESLint.
- `npm run build`: passou com Next.js 16.4.5, incluindo TypeScript e as novas rotas dinâmicas.
- `npm test`: 38 testes passaram — 18 existentes e 20 novos, incluindo migração de banco v1, scrypt real, sessão/cookie, credenciais inválidas, logout, expiração, rate limit, CSRF/Origin, listagem, editor, salvamento, conflitos, template, preview, publicação, retirada e exclusão.
- `npm run test:admin:http`: teste real contra `next start` com banco e credenciais descartáveis. Verifica redirecionamentos server-side antes de conteúdo, ausência de segredos, ciclo CRUD, preview privado/exato, permissões, manutenção da API interna e páginas públicas.
- `git diff --check`: passou. O aviso já existente do Node sobre arquivos TS sem `type: module` permanece informativo; não impede testes/scripts.

O teste HTTP precisa de um build prévio e usa exclusivamente a porta local 3104 e um diretório temporário. Para mantê-lo aberto para inspeção visual:

```sh
npm run build
npm run test:admin:http -- --keep-alive
```

A saída indica um arquivo temporário de conexão para o teste local; ele tem permissão 0600 e contém apenas credenciais descartáveis. Ctrl+C encerra o servidor e remove banco, posts, credenciais e imagens temporários. Não use esse comando para preparar conteúdo real.

| Largura | Login | Dashboard | Editor | Prévia privada |
| --- | --- | --- | --- | --- |
| 320px | OK | OK | OK | OK |
| 360px | OK | OK | OK | OK |
| 375px | OK | OK | OK | OK |
| 390px | OK | OK | OK | OK |
| 414px | OK | OK | OK | OK |
| 768px | OK | OK | OK | OK |
| 1024px | OK | OK | OK | OK |
| 1280px | OK | OK | OK | OK |
| 1440px | OK | OK | OK | OK |

Chrome com emulação touch até 1024px e desktop em 1280/1440px; largura CSS conferida. Sem overflow horizontal, conteúdo sobreposto/cortado ou controles menores que 44×44px. Campos editáveis com 16px. A prévia mantém os 26 blocos, seis H3, quatro CTAs e cinco imagens. Os radios visualmente ocultos do formulário público usam seus labels como alvo de toque.

Foram verificados visualmente os campos gerais, textos, CTAs, imagens, vídeo, referência de formulário e diálogos. Diálogos foram centralizados após encontrar interferência do reset CSS; são limitados à altura da tela e rolam quando há muitos erros. Confirmar publicação permanece desabilitado até confirmação; excluir permanece desabilitado com slug vazio/incorreto. Foco visível, Tab/Shift+Tab, Escape e retorno ao acionador foram verificados. Ações da interface de salvar, conflito com texto preservado, dois parágrafos na prévia, publicar, bloquear edição, retirar, criar draft, recusar publicação incompleta, excluir e sair passaram usando apenas posts descartáveis.

## Limitações e próximo passo

- Um administrador, sem MFA, recuperação de senha, gestão de usuários ou trilha de auditoria por usuário. O rate limit global pode exigir espera de 15 minutos após tentativas indevidas.
- Editar um post publicado requer retirá-lo do ar; não há rascunho paralelo da versão publicada nem histórico restaurável.
- Upload e biblioteca foram acrescentados na etapa [blog-media.md](blog-media.md); a rota pública continua acessível quando a URL é conhecida.
- Preview inclui o formulário existente; não foi enviado formulário nem resolvido CAPTCHA durante os testes. O vídeo da fixture é fictício, portanto a validação cobre layout/iframe, não reprodução editorial. Testes visuais em emulação Chrome, sem aparelho físico/Safari.
- Credenciais reais não foram preenchidas e o servidor de desenvolvimento existente não foi reiniciado. O login permanece fechado até configurar o ambiente.

Próximo passo: conferir um post editorial completo e os backups dos dois volumes. Login local e upload validado foram concluídos em etapas posteriores; MCP continua separado e não foi iniciado.

## Manifesto desta etapa

Criados (34):

- `app/admin/(protected)/blog/[id]/page.tsx`
- `app/admin/(protected)/blog/[id]/preview/page.tsx`
- `app/admin/(protected)/blog/page.tsx`
- `app/admin/(protected)/layout.tsx`
- `app/admin/layout.tsx`
- `app/admin/login/page.tsx`
- `app/admin/page.tsx`
- `app/api/admin/blog/posts/[id]/draft/route.ts`
- `app/api/admin/blog/posts/[id]/publish/route.ts`
- `app/api/admin/blog/posts/[id]/route.ts`
- `app/api/admin/blog/posts/route.ts`
- `app/api/admin/login/route.ts`
- `app/api/admin/logout/route.ts`
- `components/blog/BlogArticle.tsx`
- `components/blog/admin/Admin.module.css`
- `components/blog/admin/Dialog.tsx`
- `components/blog/admin/Feedback.tsx`
- `components/blog/admin/ImageField.tsx`
- `components/blog/admin/LoginForm.tsx`
- `components/blog/admin/LogoutButton.tsx`
- `components/blog/admin/NewPostButton.tsx`
- `components/blog/admin/PostActions.tsx`
- `components/blog/admin/PostEditor.tsx`
- `components/blog/admin/request.ts`
- `docs/blog-admin.md`
- `lib/blog/admin/access.ts`
- `lib/blog/admin/auth.ts`
- `lib/blog/admin/editor.ts`
- `lib/blog/admin/handlers.ts`
- `lib/blog/admin/images.ts`
- `lib/blog/admin/password.ts`
- `scripts/blog/hash-admin-password.ts`
- `tests/blog/admin-http-smoke.ts`
- `tests/blog/admin.test.ts`

Alterados (15):

- `.env.example`
- `app/blog/[slug]/page.tsx`
- `components/blog/BlogBlocks.tsx`
- `docker-compose.yml`
- `docs/blog-foundation.md`
- `lib/blog/auth.ts`
- `lib/blog/migrations.ts`
- `lib/blog/publication.ts`
- `lib/blog/repository.ts`
- `lib/blog/service.ts`
- `lib/blog/types.ts`
- `lib/blog/validation.ts`
- `next.config.ts`
- `package.json`
- `tests/blog/foundation.test.ts`
