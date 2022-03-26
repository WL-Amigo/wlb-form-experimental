import clsx from 'clsx';
import { useCallback, VFC } from 'react';
import { ErrorDisplay } from '../../../components/ErrorDisplay';
import { NumberInput } from '../../../components/inputs/Number';
import { RadioButton } from '../../../components/inputs/RadioButton';
import { SingleLineTextInput } from '../../../components/inputs/SingleLineText';
import { windi } from '../../../windi';
import { RPGItemType, useField } from '../FormContext';

interface Props {
  className?: string;
  currentIndex: number | null;
}
export const ItemSettings: VFC<Props> = ({ className, currentIndex }) => {
  if (currentIndex === null) {
    return (
      <div
        className={clsx(
          windi`flex flex-row justify-center items-center`,
          className
        )}
      >
        <span className="text-gray-500">Select item to edit</span>
      </div>
    );
  }

  return (
    <div className={clsx(windi`flex flex-col gap-y-4 p-2`, className)}>
      <ItemNameField index={currentIndex} />
      <ItemTypeField index={currentIndex} />
      <ItemDescriptionField index={currentIndex} />
      <div className="grid grid-cols-2 gap-4">
        <ItemPriceField index={currentIndex} />
        <ItemEffectValueField index={currentIndex} />
      </div>
    </div>
  );
};

interface FieldCommonProps {
  index: number;
}
const ItemNameField: VFC<FieldCommonProps> = ({ index }) => {
  const { value, setValue, error } = useField(
    useCallback((values) => values.items[index].name, [index])
  );

  return (
    <div className="flex flex-col">
      <span>Item name</span>
      <SingleLineTextInput value={value} onChange={setValue} />
      <ErrorDisplay error={error} />
    </div>
  );
};

const ItemTypeField: VFC<FieldCommonProps> = ({ index }) => {
  const { value, setValue } = useField(
    useCallback((values) => values.items[index].type, [index])
  );

  return (
    <div className="flex flex-col">
      <span>Item type</span>
      <div className="flex flex-row gap-x-4">
        <label className="space-x-1">
          <RadioButton<RPGItemType>
            value={value}
            selfValue="healing"
            onSelect={setValue}
          />
          <span>Healing</span>
        </label>
        <label className="space-x-1">
          <RadioButton<RPGItemType>
            value={value}
            selfValue="attack"
            onSelect={setValue}
          />
          <span>Attack</span>
        </label>
      </div>
    </div>
  );
};

const ItemPriceField: VFC<FieldCommonProps> = ({ index }) => {
  const { value, setValue, error } = useField(
    useCallback((values) => values.items[index].price, [index])
  );

  return (
    <div className="flex flex-col">
      <span>Price</span>
      <NumberInput value={value} onChange={setValue} />
      <ErrorDisplay error={error} />
    </div>
  );
};

const ItemEffectValueField: VFC<FieldCommonProps> = ({ index }) => {
  const { value, setValue, error } = useField(
    useCallback((values) => values.items[index].effectValue, [index])
  );

  return (
    <div className="flex flex-col">
      <span>Effect value</span>
      <NumberInput value={value} onChange={setValue} />
      <ErrorDisplay error={error} />
    </div>
  );
};

const ItemDescriptionField: VFC<FieldCommonProps> = ({ index }) => {
  const { value, setValue, error } = useField(
    useCallback((values) => values.items[index].description, [index])
  );

  return (
    <div className="flex flex-col">
      <span>Description</span>
      <SingleLineTextInput value={value} onChange={setValue} />
      <ErrorDisplay error={error} />
    </div>
  );
};
