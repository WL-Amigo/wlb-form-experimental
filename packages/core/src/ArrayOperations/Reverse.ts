export const reverse = <ItemType>(array: readonly ItemType[]): ItemType[] =>
  array.map((_, i) => array[array.length - 1 - i]!);
