import { createFormContext, Selector } from '@wlb-form/react';

export interface BasicExampleFormValues {
  firstName: string;
  lastName: string;
  age: number | null;
  isConfirmed: boolean;
}

const required = (value: unknown, fieldName: string): string | undefined => {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.length === 0);
  return isEmpty ? fieldName + ' is required' : undefined;
};

export const {
  FormStateProvider,
  useFormState,
  useField,
  useChildrenChanged,
  useHasSomeErrors,
} = createFormContext<BasicExampleFormValues>(
  {
    firstName: 'John',
    lastName: 'Doe',
    age: null,
    isConfirmed: false,
  },
  ({ registerValidator }) => {
    registerValidator([(values) => values.firstName], ([firstName]) =>
      required(firstName, 'first name')
    );
    registerValidator([(values) => values.lastName], ([lastName]) =>
      required(lastName, 'last name')
    );
    registerValidator([(values) => values.age], ([age]) =>
      required(age, 'age')
    );
    registerValidator([(values) => values.isConfirmed], ([isConfirmed]) =>
      !isConfirmed
        ? 'You must agree with Terms and Conditions to proceed'
        : undefined
    );
  }
);
