export const getValueByPath = <ObjectType extends {}>(
  path: readonly string[],
  target: ObjectType
): unknown => {
  let currentTarget: any = target;
  const restPath = [...path];
  while (restPath.length > 0) {
    const fieldName = restPath.shift();
    currentTarget = Reflect.get(currentTarget, fieldName!);
    if (
      (currentTarget === null || currentTarget === undefined) &&
      restPath.length > 0
    ) {
      return currentTarget;
    }
  }

  return currentTarget;
};
