import { useCallback, VFC } from 'react';
import { NumberInput } from '../../../components/inputs/Number';
import { useField } from '../FormContext';

export const GlobalSettings: VFC = () => {
  return (
    <div className="flex flex-col gap-y-4 items-start">
      <h2 className="text-lg font-bold">Global Settings</h2>
      <div className="grid gap-2 grid-cols-[auto,160px]">
        <MaxPriceValueInput />
        <MaxHealingValueInput />
        <MaxDamageValueInput />
      </div>
    </div>
  );
};

const MaxHealingValueInput: VFC = () => {
  const { value, setValue } = useField(
    useCallback((values) => values.maxHealingValue, [])
  );

  return (
    <>
      <label htmlFor="maxHealingValue">Max healing amount: </label>
      <NumberInput id="maxHealingValue" value={value} onChange={setValue} />
    </>
  );
};

const MaxDamageValueInput: VFC = () => {
  const { value, setValue } = useField(
    useCallback((values) => values.maxDamageValue, [])
  );

  return (
    <>
      <label htmlFor="maxDamageValue">Max damage amount: </label>
      <NumberInput id="maxDamageValue" value={value} onChange={setValue} />
    </>
  );
};

const MaxPriceValueInput: VFC = () => {
  const { value, setValue } = useField(
    useCallback((values) => values.maxPriceValue, [])
  );

  return (
    <>
      <label htmlFor="maxPriceValue">Max price amount: </label>
      <NumberInput id="maxPriceValue" value={value} onChange={setValue} />
    </>
  );
};
