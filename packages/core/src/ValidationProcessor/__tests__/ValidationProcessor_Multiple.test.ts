import { describe, expect, test } from 'vitest';
import { createInitTestObject, TestObject } from '../../TestSrc/TestObject';
import { ValidationError, ValidationProcessor } from '../ValidationProcessor';
import { produce, Draft } from 'immer';

const createValidationProcessor = () => {
  return new ValidationProcessor<TestObject>();
};

const expectErrorsForPath = (
  processor: ValidationProcessor<TestObject>,
  allExpectedErrors: readonly ValidationError[],
  path: string
) => {
  const actualErrors = processor.getErrorsForPath(path);
  const expectedErrors = allExpectedErrors.filter((e) =>
    e.paths.some((p) => p.startsWith(path))
  );
  expect(actualErrors).toEqual(expect.arrayContaining(expectedErrors));
  expect(expectedErrors).toEqual(expect.arrayContaining(actualErrors));
};

const ValidationErrorMsg = 'validation error';

describe('ValidationProcessor - Validate for multiple values', () => {
  test.each<
    [
      valueModifier: (draft: Draft<TestObject>) => void,
      expectedErrors: ValidationError[]
    ]
  >([
    [
      (draft) => {
        draft.arr[1] = -1;
      },
      [{ paths: ['arr/1'], errors: [ValidationErrorMsg] }],
    ],
  ])(
    'array values should be revalidate on changing other value',
    (valueModifier, expectedErrors) => {
      // Arrange
      const processor = createValidationProcessor();
      processor.register(
        [(obj) => obj.bl, (obj) => obj.arr[0]],
        ([bl, arrVal]) => {
          return bl && arrVal! < 0 ? ValidationErrorMsg : undefined;
        },
        [(obj) => obj.arr[0]]
      );
      const values = produce(createInitTestObject(), (draft) => {
        draft.bl = true;
        valueModifier(draft);
      });

      // Act
      processor.schedule((obj) => obj.bl);
      const needToRevalidatePaths = processor.run(values);

      // Assert
      const expectErrorsForPathLocal = (path: string) =>
        expectErrorsForPath(processor, expectedErrors, path);
      expect([...needToRevalidatePaths].sort()).toStrictEqual([
        'arr',
        'arr/0',
        'arr/1',
        'arr/2',
      ]);
      expectErrorsForPathLocal('arr/0');
      expectErrorsForPathLocal('arr/1');
      expectErrorsForPathLocal('arr/2');
      expectErrorsForPathLocal('arr');
      expectErrorsForPathLocal('');
    }
  );
});
