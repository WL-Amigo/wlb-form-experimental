export interface IUniqueIdProvider {
  getId(): string;
}

export class UniqueIdProvider implements IUniqueIdProvider {
  private count = 0;
  public getId() {
    this.count++;
    return String(this.count);
  }
}
