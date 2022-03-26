import { FormState, Selector, ValidationError } from '@wlb-form/core';
import { VFC, PropsWithChildren } from 'react';

export interface FieldHookReturns<ValueType> {
  value: ValueType;
  error: string | null;
  setValue: (value: ValueType) => void;
}

export interface FormContext<ObjectType extends {}> {
  FormStateProvider: VFC<PropsWithChildren<{}>>;
  useFormState: () => FormState<ObjectType>;
  useField: <ValueType>(
    selector: Selector<ObjectType, ValueType>
  ) => FieldHookReturns<ValueType>;
  useChildrenChanged: <ValueType>(
    selector: Selector<ObjectType, ValueType>,
    handler: (nextValue: ValueType) => void
  ) => void;
  useHasSomeErrors: (selector: Selector<ObjectType, unknown>) => boolean;
}
