import { IUniqueIdProvider } from './UniqueIdProvider';

interface ValueWithId<ValueType> {
  id: string;
  value: ValueType;
}

export class IdentifiedArray<ValueType> {
  private values: readonly ValueType[];
  private ids: readonly string[];
  private readonly uniqueIdProvider: IUniqueIdProvider;

  public constructor(
    iterable: Iterable<ValueType>,
    uniqueIdProvider: IUniqueIdProvider
  ) {
    this.uniqueIdProvider = uniqueIdProvider;
    this.values = [...iterable];
    this.ids = this.values.map(() => uniqueIdProvider.getId());
  }

  public at(index: number): ValueWithId<ValueType> | undefined {
    const value = this.values[index];
    const id = this.ids[index];
    if (value === undefined || id === undefined) {
      return undefined;
    }
    return {
      id,
      value,
    };
  }

  public set(index: number, value: ValueType): void {
    const newValues = [...this.values];
    const existingId = this.ids[index];

    newValues[index] = value;
    if (existingId === undefined) {
      const newIds = [...this.ids];
      newIds[index] = this.uniqueIdProvider.getId();
    }
  }
}
