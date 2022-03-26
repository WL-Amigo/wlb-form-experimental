import { useCallback, useState, VFC } from 'react';
import { FormStateProvider, useChildrenChanged } from './FormContext';
import { GlobalSettings } from './partials/GlobalSettings';
import { ItemList } from './partials/ItemList';
import { ItemSettings } from './partials/ItemSettings';

export const RPGItemEditorExamplePage: VFC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <FormStateProvider>
      <div className="flex-1 overflow-auto flex flex-row gap-x-4">
        <div className="p-4 flex-[3] flex flex-col gap-x-8">
          <GlobalSettings />
          <hr className="mt-4" />
          <div className="flex-1 w-full flex flex-row pt-4">
            <ItemList
              className="flex-1"
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
            <ItemSettings className="flex-[3]" currentIndex={selectedIndex} />
          </div>
        </div>
        <div className="flex-[2] overflow-y-scroll">
          <FormValuesViewer />
        </div>
      </div>
    </FormStateProvider>
  );
};

// Form content spy
const FormValuesViewer: VFC = () => {
  const [currentValueJson, setCurrentValueJson] = useState('');
  useChildrenChanged(
    useCallback((values) => values, []),
    useCallback(
      (nextValue) =>
        setCurrentValueJson(JSON.stringify(nextValue, undefined, 2)),
      []
    )
  );

  return <pre className="p-4">{currentValueJson}</pre>;
};
