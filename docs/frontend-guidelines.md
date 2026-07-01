# Frontend Guidelines — Loja de Veículos

Guia de padrões do front-end para manter consistência visual e arquitetural entre
as telas (Veículos, Clientes, Leads, Financeiro, Vendas, Dashboard, etc.).
Sempre que criar uma nova página administrativa, siga este documento.

## Stack

- **Next.js (App Router)** — pastas em `src/app`.
- **React + TypeScript** (`"use client"` nas páginas/componentes interativos).
- **Tailwind CSS** para toda a estilização (sem CSS Modules).
- **Framer Motion** para animações (entrada de cards/linhas, hover, modais).
- **lucide-react** para ícones.
- **next-themes** para dark/light mode (`useTheme`).
- **axios** via instância central `@/services/axiosInstance`.

## Estrutura de pastas

```
src/
  app/
    (pages)/
      (internas)/                # área autenticada
        admin/
          veiculos/
            page.tsx             # rota /admin/veiculos
            _components/         # componentes privados da rota (não viram rota)
      (externas)/                # área pública (login, home, institucional...)
  components/                    # componentes GLOBAIS reutilizáveis (Layout, Sidebar)
  services/                      # axiosInstance e chamadas de API
  store/                         # acesso a localStorage (ex: userLocalStorage)
  types/                         # tipos de domínio compartilhados (ex: veiculo.ts)
  config/                        # config.ts (BASE_URL, chaves)
```

Regras:
- **Componentes específicos de uma página** ficam em `_components/` colocado ao lado
  do `page.tsx` (o prefixo `_` impede que virem rota).
- **Componentes globais** (`DefaultLayout`, `Sidebar`) ficam em `src/components` e
  **não devem ser alterados** ao criar uma nova tela.
- **Tipos de domínio** compartilhados vão em `src/types/<entidade>.ts`.

## Convenções de nomenclatura

- Componentes React: `PascalCase` (arquivo e função) — `VeiculoTable.tsx`.
- Hooks: `useAlgumaCoisa` em `camelCase` — `useVeiculoTheme.ts`.
- Utilitários/constantes: `entidade.utils.ts` (funções puras, labels, formatters).
- Tipos/Interfaces: `PascalCase`; enums de status em `UPPER_SNAKE_CASE`
  (alinhado ao backend Java — ex: `DISPONIVEL`, `EM_PREPARACAO`).
- Handlers: `handleX` / `onX`; estados em português quando fizer sentido de domínio
  (`veiculos`, `filtros`, `paginaAtual`).

## Layout de página (padrão)

Toda tela interna segue esta casca:

1. Envolver em `DefaultLayout`.
2. Container raiz com `relative min-h-dvh w-full overflow-hidden` + background do tema.
3. Camadas de efeito de fundo (grid + glow radial) condicionais ao tema.
4. Header local: ícone em "chip" arredondado + título + `ThemeToggle` + usuário.
5. `main` centralizado (`mx-auto max-w-[1400px] px-4 sm:px-6 pb-24`).
6. Footer com copyright.

## Tema e cores (dark/light)

- Nunca hardcode uma única cor. Use o hook `useVeiculoTheme()` (ou replique o padrão)
  que retorna `{ theme, isDark, mounted, colors, inputClass, selectClass }`.
- Sempre trate o estado `mounted` para evitar mismatch de hidratação
  (o `theme` só é confiável após montar).
- Paleta base:
  - Primária/ação: **blue-600 → blue-700** (gradiente nos botões).
  - Superfícies: cards `rounded-2xl border ... backdrop-blur` com sombra sutil.
  - Semântica de status: verde=Disponível, amarelo=Reservado, azul=Em negociação/
    preparação, vermelho=Vendido, cinza=Inativo.

## Componentes (responsabilidade única)

Cada bloco de UI vira um componente pequeno e focado. Exemplo do módulo Veículos:

- `DashboardCards` — cards de métricas do topo.
- `VeiculoFilters` — painel de filtros avançados (draft + Aplicar/Limpar).
- `VeiculoTable` — tabela rica (desktop) + cards (mobile).
- `StatusBadge` / `ValorBadge` — badges de status e valor.
- `VeiculoActions` — ações em ícones com `Tooltip`.
- `Pagination` — paginação + itens por página.
- `ConfirmDeleteModal` / `VeiculoDetailsModal` — modais.
- `EmptyState` — estado vazio ilustrado.
- `LoadingTable` — **skeleton** (nunca spinner de página inteira para listas).

## Padrões de UI

- **Botão primário**:
  ```
  inline-flex items-center justify-center rounded-2xl
  bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
  text-white px-6 py-3 font-medium transition-all
  focus:outline-none focus:ring-2 focus:ring-blue-500/50
  ```
  Sempre com `motion.button` (`whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`).
- **Inputs/Selects**: usar `inputClass` / `selectClass` do hook de tema
  (`rounded-xl border p-3 ... focus:ring-2 focus:ring-blue-500 backdrop-blur`).
- **Cards**: `rounded-2xl border {colors.card.border} {colors.card.background} backdrop-blur`.
- **Animações**: cards/linhas entram com `initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}`
  e `delay` escalonado; modais usam `AnimatePresence` com scale.
- **Tabelas**: linhas densas e ricas (poucas colunas, muita informação por linha).
  No mobile, converter em cards.
- **Loading**: `Skeleton` que imita a densidade real do conteúdo.
- **Empty state**: ilustração/ícone animado + texto + CTA.

## Serviços e API

- Sempre importar `axiosInstance` de `@/services/axiosInstance` (já injeta o token
  do `localStorage` e trata 401/403 automaticamente). Não criar novas instâncias axios.
- `BASE_URL` vem de `@/config/config`.
- Endpoints de veículos: `GET/POST /veiculos`, `GET/PUT/DELETE /veiculos/{id}`,
  `PATCH /veiculos/{id}/status`, e fotos em `/veiculos/{id}/fotos`.
- O `VeiculoResponseDTO` do backend hoje expõe um subconjunto de campos; normalize a
  resposta com um `mapVeiculo` (fallbacks seguros) antes de usar na UI.

## Tipagem

- Toda entidade tem um tipo em `src/types`. Campos que o backend ainda não retorna
  devem ser **opcionais** (`?`) para não quebrar a UI.
- Enums de domínio como union types (`type StatusVeiculo = "DISPONIVEL" | ...`).
- Componentes recebem `props` tipadas via `interface XProps`.

## Formatação (pt-BR)

- Moeda: `Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" })`.
- Datas: `toLocaleDateString("pt-BR")` (dd/mm/aaaa).
- Números/KM: `Intl.NumberFormat("pt-BR")` + sufixo (`42.300 km`).
- Centralizar essas funções em `entidade.utils.ts`.

## Responsividade

- Mobile-first. Breakpoints Tailwind: `sm`, `md`, `lg`, `xl`.
- Grids fluidos (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-5`).
- Tabela densa só em `xl+`; abaixo disso, layout em cards.

## Checklist ao criar uma nova página administrativa

- [ ] Rota em `src/app/(pages)/(internas)/...` usando `DefaultLayout`.
- [ ] Componentes em `_components/`, com responsabilidade única.
- [ ] Tipos em `src/types/<entidade>.ts`.
- [ ] Dark/light via hook de tema + tratamento de `mounted`.
- [ ] Skeleton de loading e Empty State.
- [ ] Paginação + ordenação + filtros com Aplicar/Limpar.
- [ ] Animações Framer Motion (cards, linhas, modais).
- [ ] `axiosInstance` para toda chamada de API.
- [ ] Sem alterar componentes/layout globais.
