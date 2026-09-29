# Visual contract

This contract records the visual observations supplied with the challenge phase. It guides later UI work; it does not define production components or measured design values.

Evidence labels used throughout:

- **Observed in the supplied specification**: explicitly described from the supplied prototype references.
- **Inferred/proposed**: an implementation direction needed to preserve the observed behavior; it must be verified during UI work.
- **Unmeasured**: a visual value that cannot be recovered from the supplied written observations and remains intentionally undecided.

## 1. Typography

**Observed in the supplied specification**

- The mandatory font family is exactly `Helvetica, Arial, sans-serif`.
- Helvetica is preferred, Arial is the fallback, and `sans-serif` is the final generic fallback.
- No Google Font, custom webfont, font package, or substitute such as Inter, Roboto, or `system-ui` is permitted.
- Secondary controls and labels frequently use uppercase text.

**Inferred/proposed**

- Keep the type hierarchy restrained: page and product headings, body copy, metadata, labels, and controls are sufficient semantic roles.
- Use typography tokens only for repeatable roles that emerge during implementation.

**Unmeasured**

- Exact font sizes, line heights, letter spacing, and weights require visual comparison during implementation.

## 2. Color language

**Observed in the supplied specification**

- Pages use a white background and near-black or black text.
- Muted metadata uses a quieter neutral foreground.
- Borders are thin and neutral.
- The enabled primary action is black with white text.
- The disabled primary action uses a very light gray surface and muted gray text.
- Destructive actions use red text.
- Product imagery supplies most of the visual color; the surrounding interface uses very little color.

**Inferred/proposed**

- Define a small semantic token set: background, foreground, muted foreground, border, disabled surface, disabled text, primary action surface, primary action text, and destructive foreground.
- Validate every foreground/surface pairing for sufficient contrast before implementation is accepted.
- Treat each product color hex value as domain data for its swatch, not as a global design token.

**Unmeasured**

- Exact color values are deferred. The current `#fff` and `#111` global baseline are implementation facts, not proof of every final token value.

## 3. Borders, radius, and shadows

**Observed in the supplied specification**

- The visual language uses thin, visually 1px borders.
- Corners have zero radius.
- Surfaces do not use shadows.
- Product cards visually share borders with adjacent cards rather than appearing as separate floating tiles.

**Inferred/proposed**

- A single semantic border token should serve grids, segmented selectors, specification rows, and other dividers unless implementation comparison proves a second role is necessary.
- Shared grid edges should avoid visibly doubled borders.

**Unmeasured**

- Border color and any selected-state border emphasis remain to be tuned.

## 4. Header

**Observed in the supplied specification**

- The brand or logo is left aligned; the cart icon and count are right aligned.
- The header is minimal, with generous horizontal breathing room and no unnecessary navigation links.
- The displayed cart count comes from actual cart state.

**Inferred/proposed**

- Treat the brand as navigation to the catalog and the cart control as navigation to the cart, using semantic links with accessible names.
- Let the header adapt its spacing without changing its simple two-ended composition.

**Unmeasured**

- Header height, logo dimensions, icon size, and horizontal gutters are deferred.

## 5. Catalog and search

**Observed in the supplied specification**

- Search occupies almost all available width and uses an underline or bottom border instead of a boxed field.
- The placeholder is `Search for a smartphone...`.
- A clear `x` appears when the field contains a value.
- The result count appears below the field and reports the actual returned data length.
- Search results use the same catalog presentation and ProductCard language as the unfiltered catalog.

**Inferred/proposed**

- The clear affordance should be a separately named button associated visually with the native search field.
- Result count updates should be exposed to assistive technology without repeatedly interrupting input.
- Search text is local interaction state; server results remain owned by TanStack Query.

**Unmeasured**

- Search vertical spacing, underline color, clear-icon dimensions, and result-label typography are deferred.

## 6. Product cards

**Observed in the supplied specification**

- Product imagery is large, centered, and dominant.
- Bottom metadata contains a small, muted, uppercase brand; the product name; and a price aligned toward the opposite edge.
- Cards have no radius or shadow and share borders with their neighbors.
- The entire card navigates to product detail; product identity remains URL state.

**Inferred/proposed**

- Use one ProductCard presentation for the catalog, search results, and similar-product rail. Layout context may control width, but must not create a second visual implementation or product model.
- Represent navigation with one router link whose accessible name combines useful product identity and price information without duplicating nested interactive elements.

**Unmeasured**

- Image aspect area, internal padding, metadata gap, and exact price alignment are deferred.

## 7. Product detail

**Observed in the supplied specification**

- Desktop and tablet use a two-column upper section: a large image on the left and name, price, selections, and add action on the right.
- Back navigation sits separately above that section.
- The title is prominent but restrained; price follows directly below it.
- The product image changes with the selected color.
- Mobile orders content as header, back action, image, name, price, storage selector, color selector, add button, specifications, and similar items.

**Inferred/proposed**

- Keep selection state local to the detail feature. Remote product data remains in TanStack Query, product identity remains in the route, and only a complete purchase snapshot is sent to CartContext.
- Preserve the supplied mobile reading order in DOM order so visual reflow does not create a keyboard or screen-reader mismatch.

**Unmeasured**

- Column ratio, image bounds, detail gaps, and section spacing are deferred.

## 8. Variant controls

**Observed in the supplied specification**

- Storage choices are rectangular segmented options with thin borders and zero radius; the selected choice has a stronger or darker border.
- Color choices are small square swatches with thin borders and a visibly distinct selected state.
- The selected color name appears near or below the swatches.
- Both selectors must support keyboard use. Color is not communicated by color alone and each swatch has a textual or ARIA label.
- Add is enabled only after both required selections exist. Enabled is black with white text; disabled is pale neutral with muted text and no false hover or active affordance.

**Inferred/proposed**

- Storage and color are each single-selection, radio-like groups. A project-owned selection primitive backed by Radix Radio Group is justified if its future approved version supplies the required keyboard and focus semantics.
- The Add action uses a native disabled button through the project Button component. It does not need Radix.
- Focus, selected, disabled, hover, and active states must remain distinguishable without changing layout.

**Unmeasured**

- Option dimensions, swatch size, selected border weight/color, control gaps, and button height are deferred. Native radio inputs remain a valid implementation if they meet the same visual, keyboard, focus, and labeling contract without Radix.

## 9. Specifications

**Observed in the supplied specification**

- The section heading is `SPECIFICATIONS`.
- Rows use a two-column, table-like structure with property names on the left, values on the right, and horizontal separators.
- Mobile retains the conceptual two-column row structure in a compressed layout; long values wrap without horizontal overflow.
- The section has no card or shadow treatment.

**Inferred/proposed**

- Use semantic description-list or table markup after checking which best represents the final content relationships; styling must preserve accessible name/value associations.
- Allow text to wrap naturally and avoid fixed widths that force overflow.

**Unmeasured**

- Column proportions, row padding, and separator color are deferred.

## 10. Similar products

**Observed in the supplied specification**

- Similar items form a horizontal product rail that may overflow horizontally.
- It reuses the catalog ProductCard language.
- A subtle bottom progress or scroll indicator appears in the references.
- Similar products come from the product-detail response; they do not introduce another product model or query.

**Inferred/proposed**

- Use native horizontal scrolling with keyboard-reachable product links and visible focus. Add controls only if later evidence requires them.
- Treat the indicator as a visual reflection of real scroll position when feasible, and keep it nonessential to understanding or navigation.

**Unmeasured**

- Visible card count, rail gap, scroll snapping, indicator dimensions, and indicator behavior are deferred.

## 11. Cart

**Observed in the supplied specification**

- The heading is `CART (n)`, where `n` is the derived CartContext count.
- A filled line places the product image left of product name, storage, selected color, and unit price. `Eliminar` is red.
- Filled layouts retain generous whitespace. The bottom action area contains Continue Shopping, Total plus amount, and Pay.
- Mobile keeps product image and information readable in a compact row; bottom actions use the page width, Continue Shopping and Pay remain visually distinct, and Total sits above or beside them according to available width.
- Empty state shows `CART (0)`, large empty whitespace, no fake illustration, and Continue Shopping near the bottom.

**Inferred/proposed**

- Render one CartItem per independent cart line and remove by line ID. Count and total come from CartContext selectors rather than visual assumptions.
- `Eliminar` is a button because it performs an action; Continue Shopping is a router link because it navigates. Payment behavior remains outside this visual contract.
- Bottom actions may reflow when their content can no longer remain readable; this is a semantic layout change rather than a device-specific rule.

**Unmeasured**

- Cart image size, row spacing, bottom-area positioning, currency and numeric formatting semantics, and action dimensions are deferred.

## 12. Responsive behavior

**Observed in the supplied specification**

- The product grid progresses from one mobile column to two tablet columns to five desktop columns.
- Product detail progresses from a stacked mobile flow to a two-column upper section on wider layouts.
- Cart progresses from a compact mobile composition to a wider horizontal layout.
- Mobile content follows the detail order documented in section 7.

**Inferred/proposed**

- Implement mobile first. Introduce semantic breakpoints only when content space requires the grid, detail, header spacing, or cart action composition to change.
- A middle layout supports the observed two-column product grid; a wider layout supports five columns. These are layout states, not named device classes.
- Use flexible gutters and content width behavior so layouts remain usable between observed states.

**Unmeasured**

- No numeric breakpoint, maximum content width, gutter, or section spacing can be justified from the supplied written observations. Choose and verify them against the actual references during implementation rather than deriving them from screenshot pixel dimensions.

## 13. Interaction states

**Observed in the supplied specification**

- Required states include empty and populated search, selected and unselected variants, enabled and disabled Add, filled and empty cart, and destructive removal.
- Disabled Add has actual disabled styling and no false hover or active affordance.

**Inferred/proposed**

- Every interactive element needs default, visible focus, hover where applicable, active where applicable, and disabled where supported.
- Loading, empty, error, and success/content states should reserve stable space where practical and use real API or CartContext data.
- Hover can enhance an interaction but must never be its only signal. Pointer, keyboard, and touch users receive equivalent outcomes.
- Clearing search returns the field and real result count to the unfiltered catalog state.

**Unmeasured**

- Focus outline style, transition timing, loading presentation, and error copy are deferred until feature behavior is implemented.

## 14. Accessibility

**Observed in the supplied specification**

- Variant selectors must be keyboard accessible; color selections need textual or ARIA labels.
- Add uses actual disabled semantics.
- Product images need useful alternative text.
- Result count must be understandable by assistive technology.
- The interface needs sufficient contrast, visible focus, and no hover-only interaction.

**Inferred/proposed**

- Use links for destinations and buttons for actions: ProductCard, brand, cart, back, and Continue Shopping navigate; clear, Add, remove, and Pay act.
- Give icon-only controls explicit accessible names and retain a visible or programmatic relationship between selection groups and their labels.
- Announce result-count changes politely when search results update, avoiding noisy announcements for each keystroke before results settle.
- Expose loading and error feedback with appropriate status or alert semantics when those states are implemented, without moving focus unexpectedly.
- Keep headings ordered, preserve logical DOM order across responsive layouts, and verify zoom, text wrapping, keyboard flow, focus visibility, and touch target usability in a real browser.
- Alternative text should identify the product and, on detail, the selected color when that information changes the image meaningfully.

**Unmeasured**

- Exact accessible names, announcement timing, and focus restoration after asynchronous states require behavior-specific tests during implementation.

## 15. Known prototype inconsistencies

**Observed in the supplied specification**

1. A desktop Samsung search reference shows two products while its label says `20 RESULTS`; a mobile reference says `2 RESULTS`. Production must use the actual API result length.
2. Some prototype cart counts do not match the visible lines. Production must use the CartContext-derived count.
3. Mock product or storage values may be unrealistic. Production must display API data as received through the domain model rather than correcting it to match a mock.

These inconsistencies are reference defects, not business rules. Actual domain data wins for product values, actual query results win for result counts, and actual cart state wins for cart count and total.

## 16. Observed versus inferred decisions

| Topic | Observed in the supplied specification | Inferred/proposed for implementation | Unmeasured / deferred |
| --- | --- | --- | --- |
| Typography | `Helvetica, Arial, sans-serif`; restrained editorial presentation | Small semantic role set | Sizes, weights, line heights, tracking |
| Tokens | White/near-black, muted neutrals, thin borders, black CTA, red destructive | Small semantic categories only | Exact values and spacing measurements |
| Grid | 1 → 2 → 5 columns | Mobile-first layout states triggered by available content space | Numeric breakpoints and gutters |
| Detail | Stacked mobile; two-column upper section when wider | Preserve mobile order in DOM; local selection state | Column ratio and image bounds |
| Cart | Compact mobile; wider horizontal composition | Reflow actions when content requires it | Thresholds and positioning |
| Selection | Rectangular storage options and square color swatches; keyboard accessible | Project-owned radio-like primitive; Radix only if later approved | Dimensions and selected styling values |
| Cards | One bordered, image-led language in catalog, search, and similar items | One shared ProductCard implementation | Image ratio and internal spacing |
| Similar rail | Horizontal overflow and subtle bottom indicator | Native scrolling; indicator reflects real position if implemented | Snapping and indicator mechanics |

Global styles should remain limited to reset/normalization, body/root baseline, the mandatory font family, and truly global tokens. Component-specific selectors belong in colocated SCSS Modules. The intended token categories are typography; semantic colors; content width/gutters/major vertical spacing; a visually 1px border and zero radius; and a short spacing set for small, control, section, and page-level use. Exact values remain deferred until the UI can be compared with the supplied references.
