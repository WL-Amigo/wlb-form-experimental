import { ReactElement, useCallback } from 'react';

interface Props<ValueType> {
  value: ValueType;
  selfValue: ValueType;
  onSelect: (nextValue: ValueType) => void;
}
export const RadioButton = <ValueType extends unknown>({
  value,
  selfValue,
  onSelect,
}: Props<ValueType>): ReactElement => {
  const onInput = useCallback(() => {
    onSelect(selfValue);
  }, [onSelect, selfValue]);

  return (
    <input type="radio" checked={value === selfValue} onChange={onInput} />
  );
};
