# Farmed

Projeto inicial de e-commerce/recebimento de pedidos online para uma farmácia brasileira, com loja pública, carrinho, checkout sem pagamento online, pedido via WhatsApp e painel administrativo.

## Stack

- Next.js com App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Autenticação administrativa com cookie HTTP-only assinado
- Seed inicial com usuário administrador
- Preparado para deploy no Railway

## Funcionalidades

### Loja Pública

- Home com busca, categorias, produtos em destaque, bloco institucional e WhatsApp.
- Catálogo em `/produtos` com busca por nome, princípio ativo, categoria, marca e descrição.
- Filtros por categoria, marca, preço máximo e disponibilidade.
- Página de produto em `/produtos/[slug]`.
- Carrinho com adicionar, remover, alterar quantidade e subtotal.
- Checkout sem pagamento online.
- Criação de pedido no banco e página `/pedido/[id]`.
- Botão de WhatsApp com cliente, endereço, itens, quantidades, valores, observações e número do pedido.

### Regras Regulatórias

Cada produto possui `regulatoryType`:

- `COMMON_PRODUCT`: permite pedido online.
- `OTC_MEDICINE`: permite pedido online com aviso de uso responsável.
- `PRESCRIPTION_MEDICINE`: aparece no catálogo e informa que a dispensação depende de receita e avaliação farmacêutica.
- `CONTROLLED_MEDICINE`: não permite compra direta. Pode aparecer como consulta ou ser ocultado pelo administrador.

Campos usados nas regras:

- `isPublicVisible`
- `requiresPrescription`
- `allowsOnlineOrder`
- `isControlled`

As regras são validadas no servidor em `src/lib/checkout.ts`; o front-end não é fonte de verdade para preço, estoque ou permissão de compra.

### Painel Administrativo

- Login em `/admin/login`.
- Dashboard em `/admin`.
- CRUD de produtos.
- Importação de produtos em lote por CSV no painel de produtos.
- CRUD de categorias.
- CRUD de marcas.
- Pedidos com filtro por status e detalhe completo.
- Histórico de status.
- Baixa de estoque ao aprovar pelo farmacêutico ou concluir pedido.
- Proteção contra baixa duplicada pelo campo `stockDebitedAt`.
- Configurações da farmácia usadas no rodapé, páginas institucionais e WhatsApp.

## Rotas

Públicas:

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

## Variáveis de Ambiente

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

## Como Rodar Localmente

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

Se `ADMIN_EMAIL` e `ADMIN_PASSWORD` forem definidos no ambiente antes do seed, esses valores serão usados.

## Prisma

Gerar cliente:

```bash
npm run prisma:generate
```

Criar migration em desenvolvimento:

```bash
npm run prisma:migrate
```

Aplicar migrations em produção:

```bash
npm run prisma:deploy
```

Rodar seed:

```bash
npm run seed
```

## Importação de Produtos

No painel administrativo, acesse `/admin/produtos` e use o bloco "Importar produtos em lote".

Fluxo recomendado:

1. Baixe o modelo CSV em `/admin/produtos/modelo-importacao`.
2. Abra no Excel, Google Sheets ou LibreOffice.
3. Preencha uma linha por produto.
4. Exporte ou salve como CSV.
5. Importe o arquivo no painel.

Colunas obrigatórias:

- `commercialName`
- `description`
- `price`

Colunas opcionais:

- `slug`
- `category`
- `brand`
- `activeIngredient`
- `presentation`
- `anvisaRegistration`
- `sku`
- `barcode`
- `regulatoryType`
- `requiresPrescription`
- `isControlled`
- `allowsOnlineOrder`
- `isPublicVisible`
- `promotionalPrice`
- `stock`
- `minimumStock`
- `imageUrl`
- `imageAlt`
- `internalNotes`
- `isActive`
- `isFeatured`

Valores aceitos para `regulatoryType`:

- `COMMON_PRODUCT`
- `OTC_MEDICINE`
- `PRESCRIPTION_MEDICINE`
- `CONTROLLED_MEDICINE`

Booleanos aceitam `sim`, `não`, `true`, `false`, `1` ou `0`.

Produtos com o mesmo `slug` são atualizados. Categoria e marca são criadas automaticamente quando vierem no CSV.

## Railway

1. Crie um projeto no Railway.
2. Adicione um banco PostgreSQL.
3. Configure `DATABASE_URL` usando a variável fornecida pelo Railway.
4. Configure `NEXTAUTH_SECRET` com um segredo longo.
5. Configure `NEXTAUTH_URL` com a URL pública do app.
6. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `PHARMACY_WHATSAPP`.
7. Use os scripts padrão:
   - Build: `npm run build`
   - Start: `npm run start`
8. Antes do primeiro start definitivo, rode:

```bash
npm run prisma:deploy
npm run seed
```

O arquivo `railway.json` já define build e start para Nixpacks.

## Imagens

Arquivos de marca esperados:

- `public/brand/logo.svg`
- `public/brand/logo-horizontal.svg`
- `public/brand/logo-icon.png`
- `public/brand/favicon.ico`
- `public/favicon.png`

O favicon ativo do site usa `public/brand/logo-icon.png`, com cópia em `public/favicon.png` para fallback.

Identidade visual inicial:

- branco
- `#8fbbff`
- `#c7ddff`

Quando não existirem, a interface usa fallback textual com o nome da farmácia.

Produtos usam:

- `imageUrl`
- `imageAlt`

O admin cadastra URL manual. O projeto não salva imagem no banco e não depende do filesystem local do Railway. A troca futura para Cloudinary, Supabase Storage, S3/R2 ou Railway Storage Buckets pode ser feita mantendo `imageUrl`.

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

## Observações de Segurança

- Senhas são armazenadas com hash `bcryptjs`.
- Sessão administrativa usa cookie HTTP-only assinado.
- Rotas administrativas são protegidas por layout server-side.
- Checkout recalcula preço, estoque e regras regulatórias no servidor.
- Variáveis sensíveis não são expostas ao cliente.
- Pagamento online não foi implementado nesta primeira versão.
