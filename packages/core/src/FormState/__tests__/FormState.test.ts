import { describe, it, fn, expect, test } from 'vitest';
import { FormState } from '..';
import { Selector } from '../../SelectorOperations';
import { createInitTestObject, TestObject } from '../../TestSrc/TestObject';

const defineTestCaseChangeValue = <ValueType>(
  selector: Selector<TestObject, ValueType>,
  nextValue: ValueType
): [Selector<TestObject, unknown>, unknown] => {
  return [selector, nextValue];
};

describe('FormState', () => {
  it.each<[Selector<TestObject, unknown>, unknown]>([
    defineTestCaseChangeValue((obj) => obj.str, 'next string value'),
    defineTestCaseChangeValue((obj) => obj.bl, false),
    defineTestCaseChangeValue((obj) => obj.num, 200),
    defineTestCaseChangeValue((obj) => obj.obj.nestStr, 'next nest string'),
    defineTestCaseChangeValue((obj) => obj.obj.obj2, { doubleNestNum: 123 }),
    defineTestCaseChangeValue((obj) => obj.obj, {
      nestStr: 'nest next string 2',
      obj2: {
        doubleNestNum: 234,
      },
    }),
    defineTestCaseChangeValue((obj) => obj.arr, [5, 4, 3]),
    defineTestCaseChangeValue((obj) => obj.arr[1], 10),
    defineTestCaseChangeValue((obj) => obj.objArr[0]?.nestBool, false),
    defineTestCaseChangeValue(
      (obj) => obj.objArr[1]?.nestObjArr,
      [{ listInListStr: 'next list in list 2-1' }]
    ),
    defineTestCaseChangeValue((obj) => obj.objArr[2], {
      nestBool: true,
      nestObjArr: [{ listInListStr: 'next list in list 2-1' }],
    }),
  ])('subscribe change for field', (selector, nextValue) => {
    // Arrange
    const valueChangedHandler = fn();
    const formState = new FormState(createInitTestObject());
    formState.subscribeValue(selector, valueChangedHandler);

    // Act
    formState.changeValue(selector, nextValue);

    // Assert
    expect(valueChangedHandler.mock.calls.length).toBe(1);
    expect(valueChangedHandler.mock.calls[0]?.[0]).toStrictEqual(nextValue);
    expect(selector(formState.getCurrentValues())).toStrictEqual(nextValue);
  });

  const NestedObjectChangeValueTestCase = defineTestCaseChangeValue(
    (obj) => obj.obj,
    {
      nestStr: 'nest next string 2',
      obj2: {
        doubleNestNum: 234,
      },
    }
  );
  const SimpleArrayChangeValueTestCase = defineTestCaseChangeValue(
    (obj) => obj.arr,
    [111, 222, 333]
  );
  const ObjInArrayChangeValueTestCase = defineTestCaseChangeValue(
    (obj) => obj.objArr[2],
    {
      nestBool: true,
      nestObjArr: [{ listInListStr: 'next list in list 2-1' }],
    }
  );
  it.each<
    [
      Selector<TestObject, unknown>,
      unknown,
      Selector<TestObject, unknown>,
      unknown
    ]
  >([
    [
      ...defineTestCaseChangeValue(
        (obj) => obj.obj.nestStr,
        'nest next string 2'
      ),
      ...NestedObjectChangeValueTestCase,
    ],
    [
      ...defineTestCaseChangeValue((obj) => obj.obj.obj2, {
        doubleNestNum: 234,
      }),
      ...NestedObjectChangeValueTestCase,
    ],
    [
      ...defineTestCaseChangeValue((obj) => obj.obj.obj2.doubleNestNum, 234),
      ...NestedObjectChangeValueTestCase,
    ],
    [
      ...defineTestCaseChangeValue((obj) => obj.arr[0], 111),
      ...SimpleArrayChangeValueTestCase,
    ],
    [
      ...defineTestCaseChangeValue((obj) => obj.arr[1], 222),
      ...SimpleArrayChangeValueTestCase,
    ],
    [
      ...defineTestCaseChangeValue((obj) => obj.arr[2], 333),
      ...SimpleArrayChangeValueTestCase,
    ],
    [
      ...defineTestCaseChangeValue((obj) => obj.objArr[2]?.nestBool, true),
      ...ObjInArrayChangeValueTestCase,
    ],
    [
      ...defineTestCaseChangeValue((obj) => obj.objArr[2]?.nestObjArr[0], {
        listInListStr: 'next list in list 2-1',
      }),
      ...ObjInArrayChangeValueTestCase,
    ],
    [
      ...defineTestCaseChangeValue(
        (obj) => obj.objArr[2]?.nestObjArr[1],
        undefined
      ),
      ...ObjInArrayChangeValueTestCase,
    ],
  ])(
    'subscribe change for child, and perform change on parent',
    (
      subscribeSelector,
      expectedReceivingValue,
      changeTargetSelector,
      nextValue
    ) => {
      // Arrange
      const valueChangedHandler = fn();
      const formState = new FormState(createInitTestObject());
      formState.subscribeValue(subscribeSelector, valueChangedHandler);

      // Act
      formState.changeValue(changeTargetSelector, nextValue);

      // Assert
      expect(valueChangedHandler.mock.calls.length).toBe(1);
      expect(valueChangedHandler.mock.calls[0]?.[0]).toStrictEqual(
        expectedReceivingValue
      );
    }
  );

  describe('only relevant value listeners are called', () => {
    test('simple', () => {
      // Arrange
      const valueChangedHandler = fn();
      const notRelevantValueChangedHandler = fn();
      const formState = new FormState(createInitTestObject());
      formState.subscribeValue((obj) => obj.str, valueChangedHandler);
      formState.subscribeValue((obj) => obj.bl, notRelevantValueChangedHandler);
      formState.subscribeValue(
        (obj) => obj.num,
        notRelevantValueChangedHandler
      );
      formState.subscribeValue(
        (obj) => obj.obj,
        notRelevantValueChangedHandler
      );
      formState.subscribeValue(
        (obj) => obj.arr,
        notRelevantValueChangedHandler
      );
      formState.subscribeValue(
        (obj) => obj.objArr,
        notRelevantValueChangedHandler
      );

      // Act
      formState.changeValue((obj) => obj.str, 'next string');

      // Assert
      expect(valueChangedHandler.mock.calls.length).toBe(1);
      expect(notRelevantValueChangedHandler.mock.calls.length).toBe(0);
    });
  });
});
