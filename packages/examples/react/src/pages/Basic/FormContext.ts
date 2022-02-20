import { createFormContext, Selector } from '@wlb-form/react';

export interface BasicExampleFormValues {
  firstName: string;
  lastName: string;
  age: number | null;
  isConfirmed: boolean;
}

export const { FormStateProvider, useFormState, useField, useChildrenChanged } =
  createFormContext<BasicExampleFormValues>({
    firstName: 'John',
    lastName: 'Doe',
    age: null,
    isConfirmed: false,
  });
