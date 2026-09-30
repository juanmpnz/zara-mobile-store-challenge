import { SelectionGroupItem, SelectionGroupRoot } from '@/components/ui/SelectionGroup/SelectionGroup';
import type { ProductStorage } from '@/features/products/model/product';

import styles from './StorageSelector.module.scss';

interface StorageSelectorProps {
  options: readonly ProductStorage[];
  value: string;
  onValueChange: (value: string) => void;
}

export function StorageSelector({ options, value, onValueChange }: StorageSelectorProps) {
  const validOptions = options.filter((option) => option.capacity?.trim());
  if (validOptions.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.label}>STORAGE. HOW MUCH SPACE DO YOU NEED?</h2>
      <SelectionGroupRoot className={styles.group} label="Storage. How much space do you need?" value={value} onValueChange={onValueChange}>
        {validOptions.map((option) => {
          const capacity = option.capacity?.trim() ?? '';
          const disabled = typeof option.price !== 'number' || !Number.isFinite(option.price);
          return (
            <SelectionGroupItem key={capacity} className={styles.option} value={capacity} disabled={disabled}>
              {capacity}
            </SelectionGroupItem>
          );
        })}
      </SelectionGroupRoot>
    </section>
  );
}
