import { expect, test } from 'vitest';
import { getPath, Selector } from '..';
import { createInitTestObject, TestObject } from '../../TestSrc/TestObject';
import { getValueByPath } from '../Getter';

test.each<[Selector<TestObject, unknown>]>([
  [(obj) => obj],
  [(obj) => obj.num],
  [(obj) => obj.bl],
  [(obj) => obj.str],
  [(obj) => obj.obj],
  [(obj) => obj.obj.nestStr],
  [(obj) => obj.arr],
  [(obj) => obj.arr[0]],
  [(obj) => obj.arr[123]],
  [(obj) => obj.objArr],
  [(obj) => obj.objArr[0]],
  [(obj) => obj.objArr[1]?.nestBool],
  [(obj) => obj.obj.obj2.doubleNestNum],
  [(obj) => obj.objArr[2]?.nestObjArr[1]?.listInListStr],
])('getValueByPath', (selector) => {
  // Arrange
  const testObj = createInitTestObject();
  const path = getPath(selector);

  // Act
  const value = getValueByPath(path, testObj);

  // Assert
  expect(value).toStrictEqual(selector(testObj));
});
