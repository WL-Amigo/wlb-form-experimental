import { assert, expect, test } from 'vitest';
import { getPathInclusionRelations, getSlashJoinedPaths } from '..';
import { getPath } from '../GetPaths';
import { Selector } from '../Type';

interface TestObject {
  str: string;
  bl: boolean;
  num: number;
  obj: {
    nestStr: string;
    obj2: {
      doubleNestNum: string;
    };
  };
  arr: number[];
  objArr: {
    nestBool: boolean;
    nestObjArr: {
      listInListStr: string;
    }[];
  }[];
}

test.each<[Selector<TestObject, unknown>, string[]]>([
  [(obj) => obj, []],
  [(obj) => obj.num, ['num']],
  [(obj) => obj.bl, ['bl']],
  [(obj) => obj.str, ['str']],
  [(obj) => obj.obj, ['obj']],
  [(obj) => obj.obj.nestStr, ['obj', 'nestStr']],
  [(obj) => obj.arr, ['arr']],
  [(obj) => obj.arr[0], ['arr', '0']],
  [(obj) => obj.arr[123], ['arr', '123']],
  [(obj) => obj.objArr, ['objArr']],
  [(obj) => obj.objArr[0], ['objArr', '0']],
  [(obj) => obj.objArr[1]?.nestBool, ['objArr', '1', 'nestBool']],
  [(obj) => obj.obj.obj2.doubleNestNum, ['obj', 'obj2', 'doubleNestNum']],
  [
    (obj) => obj.objArr[2]?.nestObjArr[1]?.listInListStr,
    ['objArr', '2', 'nestObjArr', '1', 'listInListStr'],
  ],
])('getPath()', (selector, expectPath) => {
  expect(getPath(selector)).toStrictEqual(expectPath);
});

test.each<[Selector<TestObject, unknown>, string[]]>([
  [(obj) => obj, []],
  [(obj) => obj.num, ['num']],
  [(obj) => obj.bl, ['bl']],
  [(obj) => obj.str, ['str']],
  [(obj) => obj.obj, ['obj']],
  [(obj) => obj.obj.nestStr, ['obj', 'obj/nestStr']],
  [(obj) => obj.arr, ['arr']],
  [(obj) => obj.arr[0], ['arr', 'arr/0']],
  [(obj) => obj.arr[123], ['arr', 'arr/123']],
  [(obj) => obj.objArr, ['objArr']],
  [(obj) => obj.objArr[0], ['objArr', 'objArr/0']],
  [
    (obj) => obj.objArr[1]?.nestBool,
    ['objArr', 'objArr/1', 'objArr/1/nestBool'],
  ],
  [
    (obj) => obj.obj.obj2.doubleNestNum,
    ['obj', 'obj/obj2', 'obj/obj2/doubleNestNum'],
  ],
  [
    (obj) => obj.objArr[2]?.nestObjArr[1]?.listInListStr,
    [
      'objArr',
      'objArr/2',
      'objArr/2/nestObjArr',
      'objArr/2/nestObjArr/1',
      'objArr/2/nestObjArr/1/listInListStr',
    ],
  ],
])('getSlashJoinedPaths', (selector, expectPaths) => {
  expect(getSlashJoinedPaths(selector)).toStrictEqual(expectPaths);
});

test.each<[Selector<TestObject, unknown>, [string, string[]][]]>([
  [
    (obj) => obj.objArr[2]?.nestObjArr[1]?.listInListStr,
    [
      [
        'objArr',
        [
          'objArr',
          'objArr/2',
          'objArr/2/nestObjArr',
          'objArr/2/nestObjArr/1',
          'objArr/2/nestObjArr/1/listInListStr',
        ],
      ],
      [
        'objArr/2',
        [
          'objArr/2',
          'objArr/2/nestObjArr',
          'objArr/2/nestObjArr/1',
          'objArr/2/nestObjArr/1/listInListStr',
        ],
      ],
      [
        'objArr/2/nestObjArr',
        [
          'objArr/2/nestObjArr',
          'objArr/2/nestObjArr/1',
          'objArr/2/nestObjArr/1/listInListStr',
        ],
      ],
      [
        'objArr/2/nestObjArr/1',
        ['objArr/2/nestObjArr/1', 'objArr/2/nestObjArr/1/listInListStr'],
      ],
      [
        'objArr/2/nestObjArr/1/listInListStr',
        ['objArr/2/nestObjArr/1/listInListStr'],
      ],
    ],
  ],
])('getPathInclusionRelations', (selector, expectData) => {
  // Arrange/Act
  const relations = getPathInclusionRelations(selector);

  // Assert
  for (const entry of expectData) {
    const relation = relations.find((r) => r[0] === entry[0]);
    expect(relation).not.toBeUndefined();
    const relatedPathsSet = relation![1];
    expect(relatedPathsSet.size).toBe(entry[1].length);
    expect(entry[1].every((path) => relatedPathsSet.has(path))).toBe(true);
  }
});
