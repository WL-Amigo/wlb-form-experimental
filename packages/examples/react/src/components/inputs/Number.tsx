import clsx from 'clsx';
import { ChangeEventHandler, useCallback, VFC } from 'react';
import { windi } from '../../windi';

interface Props {
  className?: string;
  id?: string;
  value: number;
  onChange: (value: number) => void;
}
export const NumberInput: VFC<Props> = ({
  className,
  id,
  value,
  onChange: onChangeOrig,
}) => {
  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (ev) => {
      if (ev.target instanceof HTMLInputElement) {
        const raw = ev.target.value;
        const value = parseInt(raw);
        if (!isNaN(value)) {
          onChangeOrig(value);
        }
      }
    },
    [onChangeOrig]
  );

  return (
    <input
      type="text"
      id={id}
      className={clsx(
        windi`border border-gray-400 rounded-sm p-1 min-w-[200px]`,
        className
      )}
      value={value.toString()}
      onChange={onChange}
    />
  );
};
