import { getPath } from '.';
import { Selector } from './Type';

export const setValueBySelector = <ObjectType extends {}, ValueType>(
  selector: Selector<ObjectType, ValueType>,
  target: ObjectType,
  value: ValueType
) => {
  const path = getPath(selector);
  let currentTarget: any = target;
  while (path.length > 1) {
    const fieldName = path.shift();
    const nextTarget = Reflect.get(currentTarget, fieldName!);
    if (nextTarget === undefined) {
      // TODO: fill by object or array (determine by next path)
      throw new Error(
        'set value for undefined object/array is not yet implemented'
      );
    }
    currentTarget = nextTarget;
  }
  Reflect.set(currentTarget, path[0]!, value);
};
