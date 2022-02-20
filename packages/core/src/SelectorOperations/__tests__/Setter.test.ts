import { describe, expect, it, test } from 'vitest';
import { Selector } from '..';
import { createInitTestObject, TestObject } from '../../TestSrc/TestObject';
import { setValueBySelector } from '../Setter';

const defineTestCaseSetValueBySelector = <ValueType>(
  selector: Selector<TestObject, ValueType>,
  nextValue: ValueType
): [Selector<TestObject, unknown>, unknown] => {
  return [selector, nextValue];
};

test.each<[Selector<TestObject, unknown>, unknown]>([
  defineTestCaseSetValueBySelector((obj) => obj.str, 'next string value'),
  defineTestCaseSetValueBySelector((obj) => obj.bl, false),
  defineTestCaseSetValueBySelector((obj) => obj.num, 200),
  defineTestCaseSetValueBySelector(
    (obj) => obj.obj.nestStr,
    'next nest string'
  ),
  defineTestCaseSetValueBySelector((obj) => obj.obj.obj2, {
    doubleNestNum: 123,
  }),
  defineTestCaseSetValueBySelector((obj) => obj.obj, {
    nestStr: 'nest next string 2',
    obj2: {
      doubleNestNum: 234,
    },
  }),
  defineTestCaseSetValueBySelector((obj) => obj.arr, [5, 4, 3]),
  defineTestCaseSetValueBySelector((obj) => obj.arr[1], 10),
  defineTestCaseSetValueBySelector((obj) => obj.objArr[0]?.nestBool, false),
  defineTestCaseSetValueBySelector(
    (obj) => obj.objArr[1]?.nestObjArr,
    [{ listInListStr: 'next list in list 2-1' }]
  ),
  defineTestCaseSetValueBySelector((obj) => obj.objArr[2], {
    nestBool: true,
    nestObjArr: [{ listInListStr: 'next list in list 2-1' }],
  }),
])('setValueBySelector', (selector, value) => {
  // Arrange
  const testObj = createInitTestObject();

  // Act
  setValueBySelector(selector, testObj, value);

  // Assert
  expect(selector(testObj)).toStrictEqual(value);
});
