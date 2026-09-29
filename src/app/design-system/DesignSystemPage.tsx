import { useState } from 'react';
import {
  Button,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/ui/Button/Button';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import {
  SelectionGroupItem,
  SelectionGroupRoot,
} from '@/components/ui/SelectionGroup/SelectionGroup';
import { ProductGrid } from '@/features/products/components/ProductGrid/ProductGrid';
import type { ProductSummary } from '@/features/products/model/product';

import styles from './DesignSystemPage.module.scss';

const BUTTON_CONFIGURATIONS: ReadonlyArray<{
  size: ButtonSize;
  label: string;
}> = [
  { size: 'small', label: 'L–XL / Regular · 40px' },
  { size: 'medium', label: 'L–XL / Extra height · 48px' },
  { size: 'medium', label: 'XS–M / Regular · 48px' },
  { size: 'large', label: 'XS–M / Extra height · 56px' },
];

const BUTTON_FEEDBACK: ReadonlyArray<{
  label: string;
  variant: ButtonVariant;
}> = [
  { label: 'Standard', variant: 'secondary' },
  { label: 'Primary', variant: 'primary' },
];

const BUTTON_STATES = [
  { label: 'Default', previewState: 'default' },
  { label: 'Hover', previewState: 'hover' },
  { label: 'Active', previewState: 'active' },
  { label: 'Disabled', previewState: 'disabled', disabled: true },
];

const SAMSUNG_IMAGE =
  'http://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp';
const XIAOMI_IMAGE =
  'http://prueba-tecnica-api-tienda-moviles.onrender.com/images/XMI-14-negro.webp';

const PRODUCT_FIXTURES = [
  {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    basePrice: 1329,
    image: SAMSUNG_IMAGE,
  },
  {
    id: 'XMI-14',
    brand: 'Xiaomi',
    name: '14',
    basePrice: 899,
    image: XIAOMI_IMAGE,
  },
  {
    id: 'fixture-smg-s24u-compact',
    brand: 'Samsung',
    name: 'Galaxy S24',
    basePrice: 799,
    image: SAMSUNG_IMAGE,
  },
  {
    id: 'fixture-xmi-14-pro',
    brand: 'Xiaomi',
    name: '14 Pro',
    basePrice: 1099,
    image: XIAOMI_IMAGE,
  },
  {
    id: 'fixture-smg-s24u-long-name',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra Enterprise Edition',
    basePrice: 1429,
    image: SAMSUNG_IMAGE,
  },
] satisfies readonly ProductSummary[];

export function DesignSystemPage() {
  const [search, setSearch] = useState('iPhone');
  const [emptySearch, setEmptySearch] = useState('');
  const [storage, setStorage] = useState('256');

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Zara mobile store</p>
        <h1 className={styles.title}>Design system</h1>
        <p className={styles.lede}>
          Visual validation surface for typography, interaction states, and
          shared accessible primitives.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="typography-title">
        <div className={styles.sectionHeading}>
          <p className={styles.index}>01</p>
          <h2 id="typography-title">Typography</h2>
        </div>
        <div className={styles.typographyGrid}>
          <div className={styles.typeSpecimen}>
            <p className={styles.specimenLabel}>Primary typeface</p>
            <p className={styles.specimen}>Helvetica</p>
            <p className={styles.alphabet}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz 0123456789
            </p>
          </div>
          <dl className={styles.typeDetails}>
            <div>
              <dt>Stack</dt>
              <dd>Helvetica, Arial, sans-serif</dd>
            </div>
            <div>
              <dt>Control label</dt>
              <dd>12px / 16px</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>300</dd>
            </div>
            <div>
              <dt>Tracking</dt>
              <dd>8%</dd>
            </div>
            <div>
              <dt>Case</dt>
              <dd>Uppercase</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="buttons-title">
        <div className={styles.sectionHeading}>
          <p className={styles.index}>02</p>
          <h2 id="buttons-title">Button</h2>
        </div>
        <div
          className={styles.buttonTable}
          role="table"
          aria-label="Button variants"
        >
          <div className={styles.buttonRow} role="row">
            <p className={styles.columnLabel} role="columnheader">
              Feedback / state
            </p>
            {BUTTON_CONFIGURATIONS.map(({ label }, index) => (
              <p
                className={styles.columnLabel}
                role="columnheader"
                key={`${label}-${index}`}
              >
                {label}
              </p>
            ))}
          </div>
          {BUTTON_FEEDBACK.map(({ label: feedbackLabel, variant }) => (
            <div className={styles.buttonGroup} role="rowgroup" key={variant}>
              <p className={styles.feedbackLabel}>{feedbackLabel}</p>
              {BUTTON_STATES.map(({ disabled, label, previewState }) => (
                <div className={styles.buttonRow} role="row" key={previewState}>
                  <p className={styles.rowLabel} role="rowheader">
                    {label}
                  </p>
                  {BUTTON_CONFIGURATIONS.map(
                    ({ label: configurationLabel, size }, index) => (
                      <Button
                        aria-label={`${feedbackLabel}, ${label}, ${configurationLabel}`}
                        className={styles.figmaButton}
                        data-feedback={variant}
                        data-preview-state={previewState}
                        disabled={disabled}
                        key={`${configurationLabel}-${index}`}
                        size={size}
                        variant={variant}
                      >
                        Button
                      </Button>
                    ),
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="search-title">
        <div className={styles.sectionHeading}>
          <p className={styles.index}>03</p>
          <h2 id="search-title">Search input</h2>
        </div>
        <div className={styles.componentGrid}>
          <div className={`${styles.example} ${styles.searchReference}`}>
            <p className={styles.rowLabel}>Empty</p>
            <SearchInput
              label="Empty search example"
              value={emptySearch}
              onValueChange={setEmptySearch}
            />
          </div>
          <div className={`${styles.example} ${styles.searchReference}`}>
            <p className={styles.rowLabel}>Filled</p>
            <SearchInput
              label="Filled search example"
              value={search}
              onValueChange={setSearch}
            />
          </div>
          <div className={`${styles.example} ${styles.searchReference}`}>
            <p className={styles.rowLabel}>Disabled</p>
            <SearchInput
              label="Disabled search example"
              value="Samsung"
              disabled
              onValueChange={() => undefined}
            />
          </div>
          <div className={`${styles.example} ${styles.searchReference}`}>
            <p className={styles.rowLabel}>Read only</p>
            <SearchInput
              label="Read-only search example"
              value="Google Pixel"
              readOnly
              onValueChange={() => undefined}
            />
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="selection-title">
        <div className={styles.sectionHeading}>
          <p className={styles.index}>04</p>
          <h2 id="selection-title">Selection group</h2>
        </div>
        <div className={styles.componentGrid}>
          <div className={styles.example}>
            <p className={styles.rowLabel}>Interactive</p>
            <SelectionGroupRoot
              label="Storage size"
              value={storage}
              onValueChange={setStorage}
            >
              <SelectionGroupItem className={styles.storageOption} value="128">
                128 GB
              </SelectionGroupItem>
              <SelectionGroupItem className={styles.storageOption} value="256">
                256 GB
              </SelectionGroupItem>
              <SelectionGroupItem className={styles.storageOption} value="512">
                512 GB
              </SelectionGroupItem>
            </SelectionGroupRoot>
          </div>
          <div className={styles.example}>
            <p className={styles.rowLabel}>Disabled option</p>
            <SelectionGroupRoot
              label="Disabled storage example"
              value="128"
              onValueChange={() => undefined}
            >
              <SelectionGroupItem className={styles.storageOption} value="128">
                128 GB
              </SelectionGroupItem>
              <SelectionGroupItem
                className={styles.storageOption}
                value="256"
                disabled
              >
                256 GB
              </SelectionGroupItem>
            </SelectionGroupRoot>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="products-title">
        <div className={styles.sectionHeading}>
          <p className={styles.index}>05</p>
          <h2 id="products-title">Product cards</h2>
        </div>
        <div className={styles.productGridExample}>
          <ProductGrid
            products={PRODUCT_FIXTURES}
            label="Product card visual examples"
          />
        </div>
      </section>
    </div>
  );
}
