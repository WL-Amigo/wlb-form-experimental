export interface TestObject {
  str: string;
  bl: boolean;
  num: number;
  obj: {
    nestStr: string;
    obj2: {
      doubleNestNum: number;
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

export const createInitTestObject = (): TestObject => {
  return {
    str: 'test string',
    bl: true,
    num: 100,
    obj: {
      nestStr: 'nest string',
      obj2: {
        doubleNestNum: 200,
      },
    },
    arr: [1, 2, 3],
    objArr: [
      {
        nestBool: true,
        nestObjArr: [
          {
            listInListStr: 'list in list 1-1',
          },
          {
            listInListStr: 'list in list 1-2',
          },
          {
            listInListStr: 'list in list 1-3',
          },
        ],
      },
      {
        nestBool: false,
        nestObjArr: [
          {
            listInListStr: 'list in list 2-1',
          },
          {
            listInListStr: 'list in list 2-2',
          },
        ],
      },
    ],
  };
};
