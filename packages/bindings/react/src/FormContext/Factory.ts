import { FormState, Selector } from '@wlb-form/core';
import {
  createContext,
  PropsWithChildren,
  VFC,
  memo as reactMemo,
  useRef,
  useState,
  Context,
  useContext,
  useEffect,
  useCallback,
  createElement,
} from 'react';
import { FieldHookReturns, FormContext } from './Types';

export const createFormContext = <ObjectType extends {}>(
  initialValues: ObjectType
): FormContext<ObjectType> => {
  const context = createContext<FormState<ObjectType> | undefined>(undefined);
  const RawProvider = context.Provider;

  const FormStateProvider: VFC<PropsWithChildren<{}>> = ({ children }) => {
    const [formState] = useState(() => new FormState(initialValues));
    return createElement(RawProvider, { value: formState }, children);
  };

  const useFormState = (): FormState<ObjectType> => {
    const formState = useContext(context);
    if (formState === undefined) {
      throw new Error(
        'useFormState: cannot be used outside of FormStateProvider'
      );
    }
    return formState;
  };

  const useField = <ValueType extends unknown>(
    selector: Selector<ObjectType, ValueType>
  ): FieldHookReturns<ValueType> => {
    const formState = useFormState();
    const [value, setValueRaw] = useState<ValueType>(
      selector(formState.getCurrentValues())
    );
    useEffect(() => {
      return formState.subscribeValue(selector, (nextValue) => {
        setValueRaw(nextValue);
      });
    }, [formState, selector]);
    const setValue = useCallback(
      (value: ValueType) => {
        formState.changeValue(selector, value);
      },
      [formState, selector]
    );

    return {
      value,
      setValue,
    };
  };

  const useChildrenChanged = <ValueType extends unknown>(
    selector: Selector<ObjectType, ValueType>,
    handler: (nextValue: ValueType) => void
  ): void => {
    const formState = useFormState();
    useEffect(() => {
      return formState.subscribeChildrenChanged(selector, handler);
    }, [formState, selector, handler]);
  };

  return {
    FormStateProvider,
    useField,
    useFormState,
    useChildrenChanged,
  };
};
