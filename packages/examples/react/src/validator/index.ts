export type MaybeErrorMessage = string | undefined;

export const Validator = {
  required: (value: unknown, fieldName: string): MaybeErrorMessage => {
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.length === 0);
    return isEmpty ? fieldName + ' is required' : undefined;
  },
  numberMax: (
    value: number,
    max: number,
    fieldName: string
  ): MaybeErrorMessage => {
    return value > max
      ? fieldName + ' must be equal or less than ' + max.toString()
      : undefined;
  },
  numberMin: (
    value: number,
    min: number,
    fieldName: string
  ): MaybeErrorMessage => {
    return value < min
      ? fieldName + ' must be equal or more than ' + min.toString()
      : undefined;
  },
  numberMinMax: (
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): MaybeErrorMessage =>
    Validator.numberMin(value, min, fieldName) ??
    Validator.numberMax(value, max, fieldName),
  lengthMax: (
    value: Array<unknown> | string,
    max: number,
    fieldName: string
  ): MaybeErrorMessage => {
    return value.length > max
      ? fieldName + ' length must be equal or less than ' + max.toString()
      : undefined;
  },
  lengthMin: (
    value: Array<unknown> | string,
    min: number,
    fieldName: string
  ): MaybeErrorMessage => {
    return value.length < min
      ? fieldName + ' length must be equal or more than ' + min.toString()
      : undefined;
  },
  lengthMinMax: (
    value: Array<unknown> | string,
    min: number,
    max: number,
    fieldName: string
  ): MaybeErrorMessage =>
    Validator.lengthMin(value, min, fieldName) ??
    Validator.lengthMax(value, max, fieldName),
  linesMax: (
    value: string,
    max: number,
    fieldName: string
  ): MaybeErrorMessage => {
    return value.split('\n').length > max
      ? fieldName +
          ' lines must be equal or less than ' +
          max.toString() +
          ' lines'
      : undefined;
  },
} as const;
