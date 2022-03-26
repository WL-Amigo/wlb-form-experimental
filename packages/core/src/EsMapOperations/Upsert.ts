export const upsertArrayInMap = <KeyType, ItemType>(
  targetMap: Map<KeyType, ItemType[]>,
  key: KeyType,
  ...item: ItemType[]
) => {
  const existingArray = targetMap.get(key);
  if (existingArray === undefined) {
    targetMap.set(key, [...item]);
  } else {
    existingArray.push(...item);
  }
};

export const deleteItemOfArrayInMap = <KeyType, ItemType>(
  targetMap: Map<KeyType, ItemType[]>,
  key: KeyType,
  item: ItemType
) => {
  const existingArray = targetMap.get(key);
  if (existingArray === undefined) {
    return;
  }
  const indexOfItem = existingArray.findIndex((i) => i === item);
  if (indexOfItem === -1) {
    return;
  }
  existingArray.splice(indexOfItem, 1);
};

export const upsertSetInMap = <KeyType, ItemType>(
  targetMap: Map<KeyType, Set<ItemType>>,
  key: KeyType,
  ...items: ItemType[]
) => {
  const existingSet = targetMap.get(key);
  if (existingSet === undefined) {
    targetMap.set(key, new Set(items));
  } else {
    items.forEach((i) => existingSet.add(i));
  }
};
