# Component inventory

This inventory describes the smallest supported component set for later UI work. Inputs are conceptual and deliberately are not TypeScript interfaces. Repository paths are proposed placements under `src/`; no component exists as a result of this document.

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
| Header | Present brand navigation and the cart destination/count in the minimal two-ended header composition. | Brand destination/label or asset; cart destination; derived cart count. | Use navigation landmarks appropriately; brand and cart are links; the cart icon has an accessible name that includes or is associated with the real count; preserve visible focus. | None. Router links and semantic layout are sufficient. | `src/app/layout/Header/` |
| PageContainer | Apply shared content-width behavior, horizontal gutters, and page-level spacing without feature markup. | Children; optional semantic element or narrow/wide layout intent only if repeated evidence emerges. | Must not disrupt landmarks or heading order; allow zoom, wrapping, and responsive reflow. | None. It is structural styling. | `src/app/layout/PageContainer/` |

## UI primitives

| Component | Responsibility | Conceptual inputs | Accessibility responsibility | Radix justification | Proposed repository placement |
| --- | --- | --- | --- | --- | --- |
| Button | Provide the project action styling for primary, secondary, and destructive needs supported by the references. | Label/content; action; visual emphasis; native button type; disabled state. | Render a native button; expose actual `disabled`; maintain visible focus and sufficient contrast; suppress false disabled hover/active styling. | None for a normal button. | `src/components/ui/Button/` |
| IconButton | Provide a consistently named button for icon-only actions such as clearing search. | Accessible label; icon; action; disabled state where applicable. | Require an accessible name; render a native button; preserve visible focus and a usable pointer/touch target. | None for a normal icon action. | `src/components/ui/IconButton/` |
| SearchInput | Present the underline-style search field and conditional clear action. | Current value; placeholder; change callback; clear callback; field label; optional result relationship. | Use a native search input; retain an accessible label; name the clear button; support keyboard editing/clearing; associate result feedback without noisy announcements. | None. Native input and button semantics are sufficient. | `src/components/ui/SearchInput/` |
| SelectionGroup / radio-like primitive | Supply reusable single-selection semantics for rectangular options or labeled swatches without deciding feature content. | Group label; selected value; options with stable values and accessible labels; change callback; disabled state; rendering style hook. | Own arrow-key behavior, roving focus or native radio semantics, group labeling, selected/checked state, disabled behavior, and visible focus. | Justified candidate for a future project-owned Radix Radio Group wrapper because keyboard and focus behavior are substantive. Installation/version still requires a later decision. | `src/components/ui/SelectionGroup/` |

Do not add further generic primitives until repeated feature usage demonstrates a real shared contract.

Native radio inputs remain a valid implementation for selection groups when they satisfy the required labeling, keyboard, focus, selected, and disabled behavior. Radix is a justified option, not a prerequisite.

## Product components

| Component | Responsibility | Conceptual inputs | Accessibility responsibility | Radix justification | Proposed repository placement |
| --- | --- | --- | --- | --- | --- |
| ProductCard | Render the one image-led, bordered product summary used by catalog, search results, and similar items, and navigate to its detail URL. | Product summary domain data; typed detail destination; layout class or context only if sizing requires it. | Use a router link for navigation; expose a useful product name; provide useful image alt text; avoid nested interactive controls; show keyboard focus. | None. Router Link and semantic content are sufficient. | `src/features/products/components/ProductCard/` |
| ProductGrid | Arrange ProductCards in the observed one-, two-, and five-column layout states with shared borders. | Product summaries; optional accessible label/heading relationship; empty content supplied by the feature. | Preserve meaningful source order and avoid duplicated border semantics that obscure focus; use list semantics when appropriate. | None. It is layout. | `src/features/products/components/ProductGrid/` |
| ProductSearch | Compose SearchInput, actual result count, and ProductGrid for real-time catalog filtering without owning remote cache data. | Search value; change/clear actions; query status; actual returned products; actual result count. | Label search; expose result-count updates politely; announce loading and error feedback with appropriate status semantics; keep empty and results states understandable; maintain focus during updates. | None. Composition of native/project primitives is sufficient. | `src/features/products/components/ProductSearch/` |
| ProductImage | Present the catalog or detail image with consistent fitting and selected-color updates. | Image URL; product name; optional selected color name; display context. | Provide useful alt text or intentionally empty alt only when a nearby duplicate image is truly decorative; avoid layout shift where practical. | None. Native image semantics are sufficient. | `src/features/products/components/ProductImage/` |
| StorageSelector | Present available storage choices as a rectangular single-selection group. | Storage options from the domain model; selected capacity; selection callback; group label; disabled state if required. | Provide a named radio-like group, keyboard navigation, selected state, visible focus, and disabled semantics. | Yes, through the project SelectionGroup wrapper if Radix Radio Group is later approved. Do not import Radix directly here. | `src/features/products/components/StorageSelector/` |
| ColorSelector | Present square color swatches, the selected color name, and single-selection behavior. | Color options with name, optional hex, and image; selected color; selection callback; group label. | Give every swatch a textual accessible label; never rely on color alone; expose checked state, keyboard navigation, and visible focus; render the selected name as text. | Yes, through the same project SelectionGroup wrapper if later approved. | `src/features/products/components/ColorSelector/` |
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
