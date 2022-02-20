import { ChangeEventHandler, useCallback, VFC } from 'react';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}
export const CheckBoxInput: VFC<Props> = ({
  value,
  onChange: onChangeOrig,
}) => {
  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (ev) => {
      if (ev.target instanceof HTMLInputElement) {
        onChangeOrig(ev.target.checked);
      }
    },
    [onChangeOrig]
  );

  return <input type="checkbox" checked={value} onChange={onChange} />;
};
