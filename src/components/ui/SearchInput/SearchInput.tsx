import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
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

function assignRef(ref: ForwardedRef<HTMLInputElement>, node: HTMLInputElement | null): void {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    className,
    disabled = false,
    onBlur,
    onFocus,
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
  const keyboardTabRef = useRef(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      keyboardTabRef.current = event.key === 'Tab';
    };
    const handlePointerDown = (): void => {
      keyboardTabRef.current = false;
      setHasKeyboardFocus(false);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onValueChange(event.currentTarget.value);
  };

  const handleClear = (): void => {
    onValueChange('');
    inputRef.current?.focus();
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
    setHasKeyboardFocus(keyboardTabRef.current);
    keyboardTabRef.current = false;
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    setHasKeyboardFocus(false);
    onBlur?.(event);
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
        data-keyboard-focus={hasKeyboardFocus || undefined}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {value.length > 0 && !readOnly ? (
        <button type="button" className={styles.clear} aria-label="Clear search" disabled={disabled} onClick={handleClear}>
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
    </div>
  );
});
