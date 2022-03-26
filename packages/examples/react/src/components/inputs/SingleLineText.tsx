import clsx from 'clsx';
import { ChangeEventHandler, useCallback, VFC } from 'react';
import { windi } from '../../windi';

interface Props {
  className?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
}
export const SingleLineTextInput: VFC<Props> = ({
  value,
  id,
  onChange: onChangeOrig,
  className,
}) => {
  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (ev) => {
      if (ev.target instanceof HTMLInputElement) {
        onChangeOrig(ev.target.value);
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
      value={value}
      onChange={onChange}
    />
  );
};
