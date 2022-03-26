import { useCallback, VFC } from 'react';
import { useField } from '../FormContext';
import SparkleIcon from '~icons/emojione-v1/sparkle';
import FireIcon from '~icons/emojione-v1/fire';
import WarningIcon from '~icons/emojione-v1/warning';
import clsx from 'clsx';
import { windi } from '../../../windi';

interface Props {
  className?: string;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}
export const ItemList: VFC<Props> = ({
  className,
  selectedIndex,
  onSelect,
}) => {
  const { value: items, setValue } = useField(
    useCallback((values) => values.items, [])
  );
  const onAddItem = useCallback(() => {
    setValue([
      ...items,
      {
        name: '',
        description: '',
        type: 'healing',
        price: 0,
        effectValue: 0,
      },
    ]);
  }, [setValue, items]);

  return (
    <div className={clsx(windi`p-2 h-full flex flex-col gap-y-2`, className)}>
      {items.map((_, index) => (
        <ItemListEntry
          key={index}
          index={index}
          onSelect={onSelect}
          isSelected={selectedIndex === index}
        />
      ))}
      <button
        className="p-2 rounded border border-blue-50 bg-blue-50 hover:border-blue-100 hover:bg-blue-100 text-center block"
        onClick={onAddItem}
      >
        Add item
      </button>
    </div>
  );
};

interface EntryProps {
  index: number;
  onSelect: (index: number) => void;
  isSelected: boolean;
}
const ItemListEntry: VFC<EntryProps> = ({ index, onSelect, isSelected }) => {
  const { value: item, error } = useField(
    useCallback((values) => values.items[index], [index])
  );
  const onClick = useCallback(() => onSelect(index), [onSelect, index]);

  return (
    <button
      className={clsx(
        windi`p-2 rounded border flex flex-row items-center gap-x-4`,
        isSelected
          ? windi`border-blue-500 cursor-default`
          : windi`hover:border-blue-300 cursor-pointer`
      )}
      onClick={onClick}
    >
      {item.type === 'healing' ? (
        <SparkleIcon className="w-4 h-4" />
      ) : (
        <FireIcon className="w-4 h-4" />
      )}
      <span className="flex-1 truncate text-left">{item.name}</span>
      {error !== null && <WarningIcon className="w-4 h-4" />}
    </button>
  );
};
