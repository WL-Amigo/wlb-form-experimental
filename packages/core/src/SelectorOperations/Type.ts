export type Selector<ObjectType extends {}, ValueType> = (
  object: ObjectType
) => ValueType;
