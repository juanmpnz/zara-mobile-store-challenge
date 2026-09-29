import {
  forwardRef,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type ForwardedRef,
} from 'react';

import styles from './SearchInput.module.scss';

const DEFAULT_PLACEHOLDER = 'Search for a smartphone...';

export interface SearchInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'aria-label' | 'defaultValue' | 'onChange' | 'placeholder' | 'type' | 'value'
> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

function assignRef(
  ref: ForwardedRef<HTMLInputElement>,
  node: HTMLInputElement | null,
): void {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      className,
      disabled = false,
      onValueChange,
      placeholder = DEFAULT_PLACEHOLDER,
      readOnly = false,
      value,
      label,
      ...inputProps
    },
    forwardedRef,
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      onValueChange(event.currentTarget.value);
    };

    const handleClear = (): void => {
      onValueChange('');
      inputRef.current?.focus();
    };

    return (
      <div className={styles.search} data-disabled={disabled || undefined}>
        <input
          {...inputProps}
          ref={(node) => {
            inputRef.current = node;
            assignRef(forwardedRef, node);
          }}
          type="search"
          className={[styles.input, className].filter(Boolean).join(' ')}
          aria-label={label}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={handleChange}
        />
        {value.length > 0 && !readOnly ? (
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear search"
            disabled={disabled}
            onClick={handleClear}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </div>
    );
  },
);
