import { FormState, Selector, RegisterValidatorFuncType } from '@wlb-form/core';
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

export type SetupFormFuncType<ObjectType extends {}> = (setup: {
  registerValidator: RegisterValidatorFuncType<ObjectType>;
}) => void;

export const createFormContext = <ObjectType extends {}>(
  initialValues: ObjectType,
  setup?: SetupFormFuncType<ObjectType>
): FormContext<ObjectType> => {
  const context = createContext<FormState<ObjectType> | undefined>(undefined);
  const RawProvider = context.Provider;

  const FormStateProvider: VFC<PropsWithChildren<{}>> = ({ children }) => {
    const [formState] = useState(() => {
      const formState = new FormState(initialValues);
      if (setup !== undefined) {
        setup({
          registerValidator: (selectors, validator, relatedPathSelectors) =>
            formState.registerValidator(
              selectors,
              validator,
              relatedPathSelectors
            ),
        });
        formState.runAllValidation();
      }

      return formState;
    });
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
      return formState.subscribeChildrenChanged(selector, (nextValue) => {
        setValueRaw(nextValue);
      });
    }, [formState, selector]);
    const setValue = useCallback(
      (value: ValueType) => {
        formState.changeValue(selector, value);
      },
      [formState, selector]
    );

    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
      return formState.subscribeErrorChanged(selector, (errors) =>
        setError(errors[0]?.errors[0] ?? null)
      );
    }, [formState, selector]);

    return {
      value,
      error,
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

  const useHasSomeErrors = (
    selector: Selector<ObjectType, unknown>
  ): boolean => {
    const formState = useFormState();
    const [hasErrors, setHasErrors] = useState<boolean>(false);
    useEffect(() => {
      return formState.subscribeErrorChanged(selector, (e) =>
        setHasErrors(e.length > 0)
      );
    });

    return hasErrors;
  };

  return {
    FormStateProvider,
    useField,
    useFormState,
    useChildrenChanged,
    useHasSomeErrors,
  };
};
