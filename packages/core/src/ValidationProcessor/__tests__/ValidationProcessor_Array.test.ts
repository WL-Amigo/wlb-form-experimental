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

const StrValidationErrorMsg = 'str is not "success"';
const strValidator = (str: string | undefined) =>
  str === undefined
    ? undefined
    : str !== 'success'
    ? StrValidationErrorMsg
    : undefined;
const BoolValidationErrorMsg = 'bl is not true';
const boolValidator = (bl: boolean | undefined) =>
  bl === undefined ? undefined : !bl ? BoolValidationErrorMsg : undefined;
const NumValidationErrorMsg = 'num must be 0 or positive';
const numValidator = (num: number) =>
  num < 0 ? NumValidationErrorMsg : undefined;

describe('ValidationProcessor - Array Validation', () => {
  const FlatArrayTestCases: [
    (draft: Draft<TestObject>) => void,
    ValidationError[]
  ][] = [
    [() => {}, []],
    [
      (draft) => {
        draft.arr[1] = -1;
      },
      [{ paths: ['arr/1'], errors: [NumValidationErrorMsg] }],
    ],
    [
      (draft) => {
        draft.arr[0] = -1;
        draft.arr[2] = -100;
      },
      [
        { paths: ['arr/0'], errors: [NumValidationErrorMsg] },
        { paths: ['arr/2'], errors: [NumValidationErrorMsg] },
      ],
    ],
    [
      (draft) => {
        draft.arr[0] = -1;
        draft.arr[1] = -2;
        draft.arr[2] = -3;
      },
      [
        { paths: ['arr/0'], errors: [NumValidationErrorMsg] },
        { paths: ['arr/1'], errors: [NumValidationErrorMsg] },
        { paths: ['arr/2'], errors: [NumValidationErrorMsg] },
      ],
    ],
  ];
  test.each(FlatArrayTestCases)(
    'validation for flat array - direct validation',
    (valueModifier, expectedErrors) => {
      // Arrange
      const processor = createValidationProcessor();
      processor.register([(obj) => obj.arr[0]], ([num]) =>
        num !== undefined ? numValidator(num) : undefined
      );
      const values = produce(createInitTestObject(), valueModifier);

      // Act
      processor.schedule((obj) => obj.arr[0]);
      processor.schedule((obj) => obj.arr[1]);
      processor.schedule((obj) => obj.arr[2]);
      const needToRevalidatePaths = processor.run(values);

      // Assert
      const expectErrorsForPathLocal = (path: string) =>
        expectErrorsForPath(processor, expectedErrors, path);
      expect([...needToRevalidatePaths]).toStrictEqual(
        ['arr', 'arr/0', 'arr/1', 'arr/2'].sort()
      );
      expectErrorsForPathLocal('arr/0');
      expectErrorsForPathLocal('arr/1');
      expectErrorsForPathLocal('arr/2');
      expectErrorsForPathLocal('arr');
      expectErrorsForPathLocal('');
    }
  );

  test.each(FlatArrayTestCases)(
    'validation for flat array - validation for parent',
    (valueModifier, expectedErrors) => {
      // Arrange
      const processor = createValidationProcessor();
      processor.register([(obj) => obj.arr[0]], ([num]) =>
        num !== undefined ? numValidator(num) : undefined
      );
      const values = produce(createInitTestObject(), valueModifier);

      // Act
      processor.schedule((obj) => obj.arr);
      const needToRevalidatePaths = processor.run(values);

      // Assert
      const expectErrorsForPathLocal = (path: string) =>
        expectErrorsForPath(processor, expectedErrors, path);
      expect([...needToRevalidatePaths]).toStrictEqual(
        ['arr', 'arr/0', 'arr/1', 'arr/2'].sort()
      );
      expectErrorsForPathLocal('arr/0');
      expectErrorsForPathLocal('arr/1');
      expectErrorsForPathLocal('arr/2');
      expectErrorsForPathLocal('arr');
      expectErrorsForPathLocal('');
    }
  );

  const NestedArrayTestCases: [
    (draft: Draft<TestObject>) => void,
    ValidationError[]
  ][] = [
    [() => {}, []],
    [
      (draft) => {
        draft.objArr[0]!.nestBool = false;
      },
      [{ paths: ['objArr/0/nestBool'], errors: [BoolValidationErrorMsg] }],
    ],
    [
      (draft) => {
        draft.objArr[1]!.nestObjArr[1]!.listInListStr = 'not success';
      },
      [
        {
          paths: ['objArr/1/nestObjArr/1/listInListStr'],
          errors: [StrValidationErrorMsg],
        },
      ],
    ],
    [
      (draft) => {
        draft.objArr[0]!.nestBool = false;
        draft.objArr[1]!.nestBool = false;
        draft.objArr[0]!.nestObjArr[2]!.listInListStr = 'not success';
        draft.objArr[1]!.nestObjArr[0]!.listInListStr = 'not success';
      },
      [
        { paths: ['objArr/0/nestBool'], errors: [BoolValidationErrorMsg] },
        { paths: ['objArr/1/nestBool'], errors: [BoolValidationErrorMsg] },
        {
          paths: ['objArr/0/nestObjArr/2/listInListStr'],
          errors: [StrValidationErrorMsg],
        },
        {
          paths: ['objArr/1/nestObjArr/0/listInListStr'],
          errors: [StrValidationErrorMsg],
        },
      ],
    ],
  ];
  test.each(NestedArrayTestCases)(
    'validation for nested object array - direct validation',
    (valueModifier, expectedErrors) => {
      // Arrange
      const processor = createValidationProcessor();
      processor.register([(obj) => obj.objArr[0]?.nestBool], ([bl]) =>
        boolValidator(bl)
      );
      processor.register(
        [(obj) => obj.objArr[0]?.nestObjArr[0]?.listInListStr],
        ([str]) => strValidator(str)
      );
      const values = produce(
        produce(createInitTestObject(), (draft) => {
          draft.objArr[0]!.nestObjArr = [...Array(3)].map(() => ({
            listInListStr: 'success',
          }));
          (draft.objArr[1]!.nestBool = true),
            (draft.objArr[1]!.nestObjArr = [...Array(2)].map(() => ({
              listInListStr: 'success',
            })));
        }),
        valueModifier
      );

      // Act
      processor.schedule((obj) => obj.objArr[0]?.nestBool);
      processor.schedule((obj) => obj.objArr[1]?.nestBool);
      processor.schedule((obj) => obj.objArr[0]?.nestObjArr[0]?.listInListStr);
      processor.schedule((obj) => obj.objArr[0]?.nestObjArr[1]?.listInListStr);
      processor.schedule((obj) => obj.objArr[0]?.nestObjArr[2]?.listInListStr);
      processor.schedule((obj) => obj.objArr[1]?.nestObjArr[0]?.listInListStr);
      processor.schedule((obj) => obj.objArr[1]?.nestObjArr[1]?.listInListStr);
      const needToRevalidatePaths = processor.run(values);

      // Assert
      const expectErrorsForPathLocal = (path: string) =>
        expectErrorsForPath(processor, expectedErrors, path);
      expect([...needToRevalidatePaths].sort()).toStrictEqual(
        [
          'objArr',
          'objArr/0',
          'objArr/1',
          'objArr/0/nestBool',
          'objArr/1/nestBool',
          'objArr/0/nestObjArr',
          'objArr/1/nestObjArr',
          'objArr/0/nestObjArr/0',
          'objArr/0/nestObjArr/1',
          'objArr/0/nestObjArr/2',
          'objArr/1/nestObjArr/0',
          'objArr/1/nestObjArr/1',
          'objArr/0/nestObjArr/0/listInListStr',
          'objArr/0/nestObjArr/1/listInListStr',
          'objArr/0/nestObjArr/2/listInListStr',
          'objArr/1/nestObjArr/0/listInListStr',
          'objArr/1/nestObjArr/1/listInListStr',
        ].sort()
      );
      expectErrorsForPathLocal('objArr/0/nestBool');
      expectErrorsForPathLocal('objArr/1/nestBool');
      expectErrorsForPathLocal('objArr/0/nestObjArr/0/listInListStr');
      expectErrorsForPathLocal('objArr/0/nestObjArr/1/listInListStr');
      expectErrorsForPathLocal('objArr/0/nestObjArr/2/listInListStr');
      expectErrorsForPathLocal('objArr/1/nestObjArr/0/listInListStr');
      expectErrorsForPathLocal('objArr/1/nestObjArr/1/listInListStr');
      expectErrorsForPathLocal('objArr/0/nestObjArr/0');
      expectErrorsForPathLocal('objArr/0/nestObjArr/1');
      expectErrorsForPathLocal('objArr/0/nestObjArr/2');
      expectErrorsForPathLocal('objArr/1/nestObjArr/0');
      expectErrorsForPathLocal('objArr/1/nestObjArr/1');
      expectErrorsForPathLocal('objArr/0/nestObjArr');
      expectErrorsForPathLocal('objArr/1/nestObjArr');
      expectErrorsForPathLocal('objArr/0');
      expectErrorsForPathLocal('objArr/1');
      expectErrorsForPathLocal('objArr');
      expectErrorsForPathLocal('');
    }
  );
  test.each(NestedArrayTestCases)(
    'validation for nested object array - validation for parent',
    (valueModifier, expectedErrors) => {
      // Arrange
      const processor = createValidationProcessor();
      processor.register([(obj) => obj.objArr[0]?.nestBool], ([bl]) =>
        boolValidator(bl)
      );
      processor.register(
        [(obj) => obj.objArr[0]?.nestObjArr[0]?.listInListStr],
        ([str]) => strValidator(str)
      );
      const values = produce(
        produce(createInitTestObject(), (draft) => {
          draft.objArr[0]!.nestObjArr = [...Array(3)].map(() => ({
            listInListStr: 'success',
          }));
          (draft.objArr[1]!.nestBool = true),
            (draft.objArr[1]!.nestObjArr = [...Array(2)].map(() => ({
              listInListStr: 'success',
            })));
        }),
        valueModifier
      );

      // Act
      processor.schedule((obj) => obj.objArr);
      const needToRevalidatePaths = processor.run(values);

      // Assert
      const expectErrorsForPathLocal = (path: string) =>
        expectErrorsForPath(processor, expectedErrors, path);
      expect([...needToRevalidatePaths].sort()).toStrictEqual(
        [
          'objArr',
          'objArr/0',
          'objArr/1',
          'objArr/0/nestBool',
          'objArr/1/nestBool',
          'objArr/0/nestObjArr',
          'objArr/1/nestObjArr',
          'objArr/0/nestObjArr/0',
          'objArr/0/nestObjArr/1',
          'objArr/0/nestObjArr/2',
          'objArr/1/nestObjArr/0',
          'objArr/1/nestObjArr/1',
          'objArr/0/nestObjArr/0/listInListStr',
          'objArr/0/nestObjArr/1/listInListStr',
          'objArr/0/nestObjArr/2/listInListStr',
          'objArr/1/nestObjArr/0/listInListStr',
          'objArr/1/nestObjArr/1/listInListStr',
        ].sort()
      );
      expectErrorsForPathLocal('objArr/0/nestBool');
      expectErrorsForPathLocal('objArr/1/nestBool');
      expectErrorsForPathLocal('objArr/0/nestObjArr/0/listInListStr');
      expectErrorsForPathLocal('objArr/0/nestObjArr/1/listInListStr');
      expectErrorsForPathLocal('objArr/0/nestObjArr/2/listInListStr');
      expectErrorsForPathLocal('objArr/1/nestObjArr/0/listInListStr');
      expectErrorsForPathLocal('objArr/1/nestObjArr/1/listInListStr');
      expectErrorsForPathLocal('objArr/0/nestObjArr/0');
      expectErrorsForPathLocal('objArr/0/nestObjArr/1');
      expectErrorsForPathLocal('objArr/0/nestObjArr/2');
      expectErrorsForPathLocal('objArr/1/nestObjArr/0');
      expectErrorsForPathLocal('objArr/1/nestObjArr/1');
      expectErrorsForPathLocal('objArr/0/nestObjArr');
      expectErrorsForPathLocal('objArr/1/nestObjArr');
      expectErrorsForPathLocal('objArr/0');
      expectErrorsForPathLocal('objArr/1');
      expectErrorsForPathLocal('objArr');
      expectErrorsForPathLocal('');
    }
  );

  test.todo(
    '1回バリデーションをエラーが起こるパターンで流したあと、エラーが起こらないパターンで流すと、きちんとバリデーションエラーが無い状態になること'
  );
});
