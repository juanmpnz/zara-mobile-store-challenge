# Component inventory

This inventory describes the smallest supported component set for UI work. Inputs remain conceptual rather than duplicating production TypeScript interfaces. Repository paths identify implemented foundations and proposed locations for future components under `src/`.

## Implemented foundations

- **Button** is implemented as a ref-forwarding native button with native props, primary/secondary variants, and explicit small/medium/large sizes mapped to the measured `40px`/`48px`/`56px` heights.
- **SearchInput** is implemented as a ref-forwarding controlled native search input with a required accessible label, fluid width, and an accessible custom clear button that restores input focus.
- **SelectionGroup** is implemented as controlled project-owned Root and Item components over Radix RadioGroup. It owns shared radio semantics, keyboard behavior, disabled behavior, focus, and selected-state hooks while remaining feature-neutral.
- **PageContainer** is implemented as the width-fluid structural boundary for shared page gutters and a wide desktop content limit.
- **Header** is implemented with typed home/cart links, the real CartContext item count, an accessible count-aware cart name, an `MBST` text fallback, and a project-owned bag SVG.
- **ProductCard** is implemented as the shared domain-model presentation with typed detail navigation, centralized EUR display, safe optional-field fallbacks, and inverted hover/keyboard-focus treatment.
- **ProductGrid** is implemented as a semantic list with one-, two-, and five-column responsive composition and no data-fetching responsibility.

Future StorageSelector and ColorSelector components compose SelectionGroup rather than importing Radix directly. Feature presentation and dimensions stay in those future components.

## Ownership boundaries

- TanStack Router owns product identity and navigation state.
- TanStack Query owns catalog, search, detail, and similar-product server data.
- CartContext owns cart lines, derived count and total, actions, and persistence.
- Detail selection and search-field interaction stay local to their feature unless a later route contract explicitly promotes them to URL state.
- Components receive domain data and callbacks from their composing feature. They do not fetch, read localStorage, inject credentials, duplicate Query data in Context, or parse external DTOs.
- A single shared ProductCard visual implementation serves catalog, search results, and similar products. Layout containers may size it; they do not fork its markup or product model.
- Feature code consumes project-owned UI primitives. Radix is reserved for behavior that benefits from managed selection, keyboard, and focus semantics.

## Shared and layout components

| Component | Responsibility | Conceptual inputs | Accessibility responsibility | Radix justification | Proposed repository placement |
| --- | --- | --- | --- | --- | --- |
| Header | Implemented minimal two-ended brand/cart header. It reads the derived count directly from CartContext; the temporary text/SVG assets remain replaceable when official assets arrive. | No duplicated count input; destinations and count come from the established router/context boundaries. | Uses a header/nav landmark, typed links, a count-aware cart name, hidden decorative SVG, and visible focus. | None. Router links and semantic layout are sufficient. | `src/app/layout/Header/` |
| PageContainer | Implemented shared content-width behavior and responsive horizontal gutters without feature markup or decoration. | Children and native div props. | Does not introduce a landmark or alter heading order; retains fluid reflow and zoom behavior. | None. It is structural styling. | `src/app/layout/PageContainer/` |

## UI primitives

| Component | Responsibility | Conceptual inputs | Accessibility responsibility | Radix justification | Proposed repository placement |
| --- | --- | --- | --- | --- | --- |
| Button | Implemented foundation for primary and secondary actions using the measured heights and states. Destructive text remains a future feature treatment. | Label/content; action; primary/secondary variant; small/medium/large size; native button props and ref. | Render a native button; expose actual `disabled`; maintain visible focus and sufficient contrast; suppress false disabled hover/active styling. | None for a normal button. | `src/components/ui/Button/` |
| IconButton | Provide a consistently named button for icon-only actions such as clearing search. | Accessible label; icon; action; disabled state where applicable. | Require an accessible name; render a native button; preserve visible focus and a usable pointer/touch target. | None for a normal icon action. | `src/components/ui/IconButton/` |
| SearchInput | Implemented foundation for the underline-style controlled search field and conditional clear action; result behavior remains in ProductSearch. | Current value; value-change callback; placeholder; required accessible label; disabled/native input props and ref. | Use a native search input; retain an accessible label; name the clear button; support keyboard editing/clearing; restore input focus after clearing. | None. Native input and button semantics are sufficient. | `src/components/ui/SearchInput/` |
| SelectionGroup / radio-like primitive | Implemented feature-neutral Root/Item boundary for reusable single-selection semantics. | Group label, controlled value/change, orientation and native form semantics; item value, content or accessible label, and disabled state. | Own arrow-key behavior, managed focus, group labeling, selected/checked state, disabled behavior, and visible focus. | Implemented as the project-owned boundary over Radix RadioGroup. | `src/components/ui/SelectionGroup/` |

Do not add further generic primitives until repeated feature usage demonstrates a real shared contract.

SelectionGroup is now the approved project boundary for shared radio-group behavior. Feature code does not import Radix directly.

## Product components

| Component | Responsibility | Conceptual inputs | Accessibility responsibility | Radix justification | Proposed repository placement |
| --- | --- | --- | --- | --- | --- |
| ProductCard | Implemented single image-led, bordered product summary for catalog, search, and future similar-item reuse. It formats the challenge-required EUR label through one formatter and renders a non-link fallback when stable route identity is absent. | Existing `ProductSummary` domain data and optional layout class. | Uses one typed router link when ID exists, useful image alt/fallback content, no nested controls, and the same inverted state for pointer and keyboard focus. | None. Router Link and semantic content are sufficient. | `src/features/products/components/ProductCard/` |
| ProductGrid | Implemented semantic ProductCard list with shared edges and inferred responsive columns. It filters entries without usable IDs instead of inventing route identity. | Product summaries and optional accessible list label. | Preserves source order for valid stable identities, uses list semantics, and renders an empty list safely. | None. It is layout. | `src/features/products/components/ProductGrid/` |
| ProductSearch | Compose SearchInput, actual result count, and ProductGrid for real-time catalog filtering without owning remote cache data. | Search value; change/clear actions; query status; actual returned products; actual result count. | Label search; expose result-count updates politely; announce loading and error feedback with appropriate status semantics; keep empty and results states understandable; maintain focus during updates. | None. Composition of native/project primitives is sufficient. | `src/features/products/components/ProductSearch/` |
| ProductImage | Present the catalog or detail image with consistent fitting and selected-color updates. | Image URL; product name; optional selected color name; display context. | Provide useful alt text or intentionally empty alt only when a nearby duplicate image is truly decorative; avoid layout shift where practical. | None. Native image semantics are sufficient. | `src/features/products/components/ProductImage/` |
| StorageSelector | Present available storage choices by composing SelectionGroup with the measured storage presentation. | Storage options from the domain model; selected capacity; selection callback; group label; disabled state if required. | Provide a named radio-like group, keyboard navigation, selected state, visible focus, and disabled semantics through SelectionGroup. | Uses the project SelectionGroup wrapper; no direct Radix import. | `src/features/products/components/StorageSelector/` |
| ColorSelector | Present square color swatches and selected color text by composing SelectionGroup. | Color options with name, optional hex, and image; selected color; selection callback; group label. | Give every swatch a textual accessible label; never rely on color alone; use SelectionGroup for checked state, keyboard navigation, and focus. | Uses the project SelectionGroup wrapper; no direct Radix import. | `src/features/products/components/ColorSelector/` |
| SpecificationsTable | Present product specification name/value rows with separators and wrapping. | Ordered specification labels and values from the domain model; section heading. | Preserve explicit name/value relationships using a semantic description list or table chosen during implementation; support long wrapped values and avoid horizontal overflow. | None. Semantic HTML is sufficient. | `src/features/products/components/SpecificationsTable/` |
| SimilarProducts | Present detail-response similar products as a horizontally scrollable rail using ProductCard. | Similar product summaries from ProductDetail; section heading; optional real scroll progress state. | Keep links keyboard reachable with visible focus; provide a meaningful section label; ensure overflow is operable without pointer-only dragging; make any indicator nonessential. | None by default. Native scrolling is sufficient; later evidence must justify extra behavior. | `src/features/products/components/SimilarProducts/` |

Product detail page composition itself belongs in the products feature or route-level page assembly. It owns local storage/color selection and passes the complete selection snapshot to the existing cart action. It does not belong in the generic UI layer.

## Cart components

| Component | Responsibility | Conceptual inputs | Accessibility responsibility | Radix justification | Proposed repository placement |
| --- | --- | --- | --- | --- | --- |
| CartItem | Render one independent cart line with image, name, selected storage/color, unit price, and `Eliminar`. | Cart-line snapshot; remove callback keyed by line ID. | Use useful image alt text; keep the selection text readable; make `Eliminar` a clearly named button associated with the product; preserve focus after removal according to the final list behavior. | None. Semantic content and the project Button are sufficient. | `src/features/cart/components/CartItem/` |
| CartSummary | Present derived total and the bottom Continue Shopping and Pay actions in responsive composition. | Derived total; currency formatting context; catalog destination; pay action/state when defined. | Continue Shopping is a link; Pay is a button; total has a clear label; action order and focus order remain logical across reflow; disabled payment behavior uses native semantics if applicable. | None based on current evidence. | `src/features/cart/components/CartSummary/` |
| CartEmptyState | Present `CART (0)`, deliberate empty space, and a route back to shopping without an invented illustration. | Catalog destination; optional heading relationship. | State plainly that the cart is empty if additional text is later required; Continue Shopping is a descriptive link; maintain landmark and heading structure. | None. Semantic content and a router link are sufficient. | `src/features/cart/components/CartEmptyState/` |

The cart page or feature composition reads lines, count, total, and actions through the public CartContext hooks. Presentational cart components do not access localStorage or calculate competing business state.

## Styling and token use

- Colocate each component's SCSS Module with the component.
- Keep global styles to reset/normalization, body/root baseline, the exact `Helvetica, Arial, sans-serif` font family, and truly global semantic tokens.
- Use the small token categories defined by the visual contract: semantic colors; content width, gutters, and major section spacing; visually 1px borders with zero radius; and small, control, section, and page-level spacing.
- Keep product color hex values in product domain data; do not promote them into global design tokens.
- Defer exact token values, numeric breakpoints, image ratios, and dimensions until implementation can be compared with the supplied references.
- Do not place ProductCard, selector, cart, or other component-specific selectors in `global.scss`.
