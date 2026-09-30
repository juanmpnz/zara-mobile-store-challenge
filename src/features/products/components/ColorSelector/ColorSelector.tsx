import { SelectionGroupItem, SelectionGroupRoot } from '@/components/ui/SelectionGroup/SelectionGroup';
import type { ProductColor } from '@/features/products/model/product';

import styles from './ColorSelector.module.scss';

interface ColorSelectorProps {
  options: readonly ProductColor[];
  value: string;
  onValueChange: (value: string) => void;
}

export function ColorSelector({ options, value, onValueChange }: ColorSelectorProps) {
  const validOptions = options.filter((option) => option.name?.trim());
  if (validOptions.length === 0) return null;

  const selectedName = validOptions.find((option) => option.name?.trim() === value)?.name?.trim();

  return (
    <section className={styles.section}>
      <h2 className={styles.label}>COLOR. PICK YOUR FAVOURITE.</h2>
      <SelectionGroupRoot label="Color. Pick your favourite." value={value} onValueChange={onValueChange}>
        {validOptions.map((option) => {
          const name = option.name?.trim() ?? '';
          return (
            <SelectionGroupItem key={name} className={styles.option} value={name} label={name}>
              <span className={styles.swatch} style={{ backgroundColor: option.hex?.trim() || 'transparent' }} />
            </SelectionGroupItem>
          );
        })}
      </SelectionGroupRoot>
      {selectedName ? <p className={styles.selected}>{selectedName}</p> : null}
    </section>
  );
}
