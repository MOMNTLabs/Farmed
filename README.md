# Farmed

Projeto inicial de e-commerce/recebimento de pedidos online para uma farmacia brasileira, com loja publica, carrinho, checkout sem pagamento online, pedido via WhatsApp e painel administrativo.

## Stack

- Next.js com App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Autenticacao administrativa com cookie HTTP-only assinado
- Seed inicial com usuario administrador
- Preparado para deploy no Railway

## Funcionalidades

### Loja publica

- Home com busca, categorias, produtos em destaque, bloco institucional e WhatsApp.
- Catalogo em `/produtos` com busca por nome, principio ativo, categoria, marca e descricao.
- Filtros por categoria, marca, preco maximo e disponibilidade.
- Pagina de produto em `/produtos/[slug]`.
- Carrinho com adicionar, remover, alterar quantidade e subtotal.
- Checkout sem pagamento online.
- Criacao de pedido no banco e pagina `/pedido/[id]`.
- Botao de WhatsApp com cliente, endereco, itens, quantidades, valores, observacoes e numero do pedido.

### Regras regulatorias

Cada produto possui `regulatoryType`:

- `COMMON_PRODUCT`: permite pedido online.
- `OTC_MEDICINE`: permite pedido online com aviso de uso responsavel.
- `PRESCRIPTION_MEDICINE`: aparece no catalogo e informa que a dispensacao depende de receita e avaliacao farmaceutica.
- `CONTROLLED_MEDICINE`: nao permite compra direta. Pode aparecer como consulta ou ser ocultado pelo administrador.

Campos usados nas regras:

- `isPublicVisible`
- `requiresPrescription`
- `allowsOnlineOrder`
- `isControlled`

As regras sao validadas no servidor em `src/lib/checkout.ts`; o front-end nao e fonte de verdade para preco, estoque ou permissao de compra.

### Painel administrativo

- Login em `/admin/login`.
- Dashboard em `/admin`.
- CRUD de produtos.
- CRUD de categorias.
- CRUD de marcas.
- Pedidos com filtro por status e detalhe completo.
- Historico de status.
- Baixa de estoque ao aprovar pelo farmaceutico ou concluir pedido.
- Protecao contra baixa duplicada pelo campo `stockDebitedAt`.
- Configuracoes da farmacia usadas no rodape, paginas institucionais e WhatsApp.

## Rotas

Publicas:

- `/`
- `/produtos`
- `/produtos/[slug]`
- `/carrinho`
- `/checkout`
- `/pedido/[id]`
- `/sobre`
- `/contato`

Administrativas:

- `/admin/login`
- `/admin`
- `/admin/produtos`
- `/admin/produtos/novo`
- `/admin/produtos/[id]/editar`
- `/admin/categorias`
- `/admin/marcas`
- `/admin/pedidos`
- `/admin/pedidos/[id]`
- `/admin/estoque`
- `/admin/configuracoes`

## Variaveis de ambiente

Copie `.env.example` para `.env` no ambiente local.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmed?schema=public"
NEXTAUTH_SECRET="troque-por-um-segredo-longo-com-32-caracteres-ou-mais"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@farmed.local"
ADMIN_PASSWORD="Admin@123456"
PHARMACY_WHATSAPP="5511999999999"
```

Nunca commite `.env` real.

## Como rodar localmente

```bash
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

Abra `http://localhost:3000`.

Login inicial do admin criado pelo seed:

- E-mail: `admin@farmed.local`
- Senha: `Admin@123456`

Se `ADMIN_EMAIL` e `ADMIN_PASSWORD` forem definidos no ambiente antes do seed, esses valores serao usados.

## Prisma

Gerar cliente:

```bash
npm run prisma:generate
```

Criar migration em desenvolvimento:

```bash
npm run prisma:migrate
```

Aplicar migrations em producao:

```bash
npm run prisma:deploy
```

Rodar seed:

```bash
npm run seed
```

## Railway

1. Crie um projeto no Railway.
2. Adicione um banco PostgreSQL.
3. Configure `DATABASE_URL` usando a variavel fornecida pelo Railway.
4. Configure `NEXTAUTH_SECRET` com um segredo longo.
5. Configure `NEXTAUTH_URL` com a URL publica do app.
6. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `PHARMACY_WHATSAPP`.
7. Use os scripts padrao:
   - Build: `npm run build`
   - Start: `npm run start`
8. Antes do primeiro start definitivo, rode:

```bash
npm run prisma:deploy
npm run seed
```

O arquivo `railway.json` ja define build e start para Nixpacks.

## Imagens

Arquivos de marca esperados:

- `public/brand/logo.svg`
- `public/brand/logo-horizontal.png`
- `public/brand/logo-icon.png`
- `public/brand/favicon.ico`

Quando nao existirem, a interface usa fallback textual com o nome da farmacia.

Produtos usam:

- `imageUrl`
- `imageAlt`

O admin cadastra URL manual. O projeto nao salva imagem no banco e nao depende do filesystem local do Railway. A troca futura para Cloudinary, Supabase Storage, S3/R2 ou Railway Storage Buckets pode ser feita mantendo `imageUrl`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run prisma:migrate
npm run prisma:deploy
npm run seed
```

## Observacoes de seguranca

- Senhas sao armazenadas com hash `bcryptjs`.
- Sessao administrativa usa cookie HTTP-only assinado.
- Rotas administrativas sao protegidas por layout server-side.
- Checkout recalcula preco, estoque e regras regulatorias no servidor.
- Variaveis sensiveis nao sao expostas ao cliente.
- Pagamento online nao foi implementado nesta primeira versao.
