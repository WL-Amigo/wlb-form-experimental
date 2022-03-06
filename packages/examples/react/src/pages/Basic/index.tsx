import { useCallback, useMemo, useState, VFC } from 'react';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { CheckBoxInput } from '../../components/inputs/CheckBox';
import { SingleLineTextInput } from '../../components/inputs/SingleLineText';
import { RenderCountContainer } from '../../components/RenderCountBadge';
import {
  BasicExampleFormValues,
  FormStateProvider,
  useChildrenChanged,
  useField,
  useHasSomeErrors,
} from './FormContext';

export const BasicExamplePage: VFC = () => {
  return (
    <FormStateProvider>
      <div className="flex-1 overflow-auto p-4 flex flex-row gap-x-4">
        <div className="flex-1">
          <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-4">
            <span className="text-right">First Name:</span>
            <FirstNameField />
            <span className="text-right">Last Name:</span>
            <LastNameField />
            <span className="text-right">Age:</span>
            <AgeField />
            <span></span>
            <IsConfirmedField />
          </div>
          <div className="p-4">
            <HasSomeErrorIndicator />
          </div>
        </div>
        <div className="flex-1">
          <FormValuesViewer />
        </div>
      </div>
    </FormStateProvider>
  );
};

// Basic usage
const FirstNameField: VFC = () => {
  const { value, error, setValue } = useField(
    useCallback((values) => values.firstName, [])
  );
  return (
    <RenderCountContainer>
      <SingleLineTextInput value={value} onChange={setValue} />
      <ErrorDisplay error={error} />
    </RenderCountContainer>
  );
};

// Defining selector outer component
const LastNameSelector = (values: BasicExampleFormValues) => values.lastName;
const LastNameField: VFC = () => {
  const { value, error, setValue } = useField(LastNameSelector);
  return (
    <RenderCountContainer>
      <SingleLineTextInput value={value} onChange={setValue} />
      <ErrorDisplay error={error} />
    </RenderCountContainer>
  );
};

const AgeSelector = (values: BasicExampleFormValues) => values.age;
const AgeField: VFC = () => {
  // TODO: 型変換のサポートをしたい
  const {
    value: rawValue,
    error,
    setValue: setValueRaw,
  } = useField(AgeSelector);
  const localValue = useMemo(
    () => (rawValue === null ? '' : String(rawValue)),
    [rawValue]
  );
  const setValue = useCallback(
    (value: string) => {
      const nextValue = parseInt(value);
      isNaN(nextValue) ? setValueRaw(null) : setValueRaw(nextValue);
    },
    [setValueRaw]
  );

  return (
    <RenderCountContainer>
      <SingleLineTextInput value={localValue} onChange={setValue} />
      <ErrorDisplay error={error} />
    </RenderCountContainer>
  );
};

const IsConfirmedSelector = (values: BasicExampleFormValues) =>
  values.isConfirmed;
const IsConfirmedField: VFC = () => {
  const { value, error, setValue } = useField(IsConfirmedSelector);
  return (
    <RenderCountContainer>
      <label>
        <CheckBoxInput value={value} onChange={setValue} />
        <span className="pl-2">I read terms and conditions.</span>
      </label>
      <ErrorDisplay error={error} />
    </RenderCountContainer>
  );
};

const HasSomeErrorIndicator: VFC = () => {
  const hasSomeError = useHasSomeErrors(useCallback((obj) => obj, []));

  return hasSomeError ? (
    <span className="text-red-400">Form has some errors.</span>
  ) : (
    <span className="text-green-400">Form has no error!</span>
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

  return <pre>{currentValueJson}</pre>;
};
