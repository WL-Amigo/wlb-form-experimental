import { describe, expect, test } from 'vitest';
import { createInitTestObject, TestObject } from '../../TestSrc/TestObject';
import { ValidationError, ValidationProcessor } from '../ValidationProcessor';

const createValidationProcessor = () => {
  return new ValidationProcessor<TestObject>();
};

const StrValidationErrorMsg = 'str is not "success"';
const strValidator = (str: string) =>
  str !== 'success' ? StrValidationErrorMsg : undefined;
const BoolValidationErrorMsg = 'bl is not true';
const boolValidator = (bl: boolean) =>
  !bl ? BoolValidationErrorMsg : undefined;
const NumValidationErrorMsg = 'num must be 0 or positive';
const numValidator = (num: number) =>
  num < 0 ? NumValidationErrorMsg : undefined;

describe('ValidationProcessor', () => {
  test.each<[Partial<TestObject>, { path: string; msg: string[] }[]]>([
    [
      { str: 'success', bl: true, num: 1 },
      [
        { path: 'str', msg: [] },
        { path: 'bl', msg: [] },
        { path: 'num', msg: [] },
      ],
    ],
    [
      { str: 'not success', bl: true, num: 1 },
      [
        { path: 'str', msg: [StrValidationErrorMsg] },
        { path: 'bl', msg: [] },
        { path: 'num', msg: [] },
      ],
    ],
    [
      { str: 'success', bl: false, num: 1 },
      [
        { path: 'str', msg: [] },
        { path: 'bl', msg: [BoolValidationErrorMsg] },
        { path: 'num', msg: [] },
      ],
    ],
    [
      { str: 'success', bl: true, num: -1 },
      [
        { path: 'str', msg: [] },
        { path: 'bl', msg: [] },
        { path: 'num', msg: [NumValidationErrorMsg] },
      ],
    ],
    [
      { str: 'not success', bl: false, num: -1 },
      [
        { path: 'str', msg: [StrValidationErrorMsg] },
        { path: 'bl', msg: [BoolValidationErrorMsg] },
        { path: 'num', msg: [NumValidationErrorMsg] },
      ],
    ],
  ])('validation for flat props', (mergeValues, expectedErrors) => {
    // Arrange
    const processor = createValidationProcessor();
    processor.register([(obj) => obj.str], ([str]) => strValidator(str));
    processor.register([(obj) => obj.bl], ([bl]) => boolValidator(bl));
    processor.register([(obj) => obj.num], ([num]) => numValidator(num));
    const values: TestObject = {
      ...createInitTestObject(),
      ...mergeValues,
    };

    // Act
    processor.schedule((obj) => obj.str);
    processor.schedule((obj) => obj.bl);
    processor.schedule((obj) => obj.num);
    const needToRevalidatePaths = processor.run(values);

    // Assert
    expect([...needToRevalidatePaths].sort()).toStrictEqual(
      ['str', 'bl', 'num'].sort()
    );
    expect(
      processor.getErrorsForPath('str').flatMap((e) => e.errors)
    ).toStrictEqual(expectedErrors.find((ee) => ee.path === 'str')?.msg);
    expect(
      processor.getErrorsForPath('bl').flatMap((e) => e.errors)
    ).toStrictEqual(expectedErrors.find((ee) => ee.path === 'bl')?.msg);
    expect(
      processor.getErrorsForPath('num').flatMap((e) => e.errors)
    ).toStrictEqual(expectedErrors.find((ee) => ee.path === 'num')?.msg);
    expect(
      processor
        .getErrorsForPath('')
        .flatMap((ee) => ee.errors)
        .sort()
    ).toStrictEqual(
      expectedErrors
        .flatMap((e) => e.msg)
        .filter((msg) => msg !== undefined)
        .sort()
    );
  });

  test.each<[Partial<TestObject>, Record<'str' | 'num', ValidationError[]>]>([
    [
      {
        obj: {
          nestStr: 'success',
          obj2: {
            doubleNestNum: 1,
          },
        },
      },
      {
        str: [],
        num: [],
      },
    ],
    [
      {
        obj: {
          nestStr: 'not success',
          obj2: {
            doubleNestNum: 1,
          },
        },
      },
      {
        str: [{ paths: ['obj/nestStr'], errors: [StrValidationErrorMsg] }],
        num: [],
      },
    ],
    [
      {
        obj: {
          nestStr: 'success',
          obj2: {
            doubleNestNum: -1,
          },
        },
      },
      {
        str: [],
        num: [
          {
            paths: ['obj/obj2/doubleNestNum'],
            errors: [NumValidationErrorMsg],
          },
        ],
      },
    ],
    [
      {
        obj: {
          nestStr: 'not success',
          obj2: {
            doubleNestNum: -1,
          },
        },
      },
      {
        str: [{ paths: ['obj/nestStr'], errors: [StrValidationErrorMsg] }],
        num: [
          {
            paths: ['obj/obj2/doubleNestNum'],
            errors: [NumValidationErrorMsg],
          },
        ],
      },
    ],
  ])('validation for simple nested object', (mergeValues, expectedErrors) => {
    // Arrange
    const processor = createValidationProcessor();
    processor.register([(obj) => obj.obj.nestStr], ([nestStr]) =>
      strValidator(nestStr)
    );
    processor.register([(obj) => obj.obj.obj2.doubleNestNum], ([num]) =>
      numValidator(num)
    );
    const values: TestObject = {
      ...createInitTestObject(),
      ...mergeValues,
    };

    // Act
    processor.schedule((obj) => obj.obj.nestStr);
    processor.schedule((obj) => obj.obj.obj2.doubleNestNum);
    const needToRevalidatePaths = processor.run(values);

    // Assert
    // -- 再バリデーションが必要なパスには親パスも全て含まれる
    expect([...needToRevalidatePaths].sort()).toStrictEqual(
      ['obj', 'obj/nestStr', 'obj/obj2', 'obj/obj2/doubleNestNum'].sort()
    );
    // -- 直接バリデーション対象のエラー内容が正しい
    expect(processor.getErrorsForPath('obj/nestStr')).toStrictEqual(
      expectedErrors.str
    );
    expect(processor.getErrorsForPath('obj/obj2/doubleNestNum')).toStrictEqual(
      expectedErrors.num
    );
    // -- 子のエラーが親にも伝搬していること
    expect(processor.getErrorsForPath('obj/obj2')).toStrictEqual(
      expectedErrors.num
    );
    expect(processor.getErrorsForPath('obj').length).toBe(
      expectedErrors.str.length + expectedErrors.num.length
    );
    expect(processor.getErrorsForPath('obj')).toEqual(
      expect.arrayContaining(expectedErrors.str.concat(expectedErrors.num))
    );
    expect(processor.getErrorsForPath('').length).toBe(
      expectedErrors.str.length + expectedErrors.num.length
    );
    expect(processor.getErrorsForPath('')).toEqual(
      expect.arrayContaining(expectedErrors.str.concat(expectedErrors.num))
    );
  });

  test.todo(
    '1回バリデーションをエラーが起こるパターンで流したあと、エラーが起こらないパターンで流すと、きちんとバリデーションエラーが無い状態になること'
  );
});
