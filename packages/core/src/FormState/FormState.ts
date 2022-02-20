import { klona } from 'klona';
import { Unsubscribe } from '../Events';
import {
  getPathInclusionRelations,
  getSlashJoinedFullPath,
  getSlashJoinedPaths,
  Selector,
  separateJoinedPath,
  setValueBySelector,
} from '../SelectorOperations';
import { getValueByPath } from '../SelectorOperations/Getter';

type ValueChangedHandler<ValueType> = (nextValue: ValueType) => void;
interface FormStateSubscribeHandlers<ValueType> {
  onChange: ValueChangedHandler<ValueType>;
}

export class FormState<ObjectType extends {}> {
  private currentValues: ObjectType;
  private readonly pathInclusionRelationsMap = new Map<string, Set<string>>();
  private readonly valueListenersMap = new Map<
    string,
    Set<ValueChangedHandler<any>>
  >();
  private readonly childrenListenersMap = new Map<
    string,
    Set<ValueChangedHandler<any>>
  >();

  public constructor(initialValues: ObjectType) {
    this.currentValues = klona(initialValues);
  }

  public getCurrentValues(): ObjectType {
    return klona(this.currentValues);
  }

  public subscribeValue<ValueType>(
    selector: Selector<ObjectType, ValueType>,
    handler: ValueChangedHandler<ValueType>
  ): Unsubscribe {
    const pathForSelector = getSlashJoinedFullPath(selector);
    const existingHandlers = this.valueListenersMap.get(pathForSelector);
    if (existingHandlers !== undefined) {
      existingHandlers.add(handler);
    } else {
      this.valueListenersMap.set(pathForSelector, new Set([handler]));
    }

    this.extendPathInclusionRelations(selector);

    handler(selector(this.currentValues));

    return () => {
      this.valueListenersMap.get(pathForSelector)?.delete(handler);
    };
  }

  public subscribeChildrenChanged<ValueType>(
    selector: Selector<ObjectType, ValueType>,
    handler: ValueChangedHandler<ValueType>
  ): Unsubscribe {
    const pathForSelector = getSlashJoinedFullPath(selector);
    const existingHandlers = this.childrenListenersMap.get(pathForSelector);
    if (existingHandlers !== undefined) {
      existingHandlers.add(handler);
    } else {
      this.childrenListenersMap.set(pathForSelector, new Set([handler]));
    }

    handler(selector(this.currentValues));

    return () => {
      this.childrenListenersMap.get(pathForSelector)?.delete(handler);
    };
  }

  private extendPathInclusionRelations(
    selector: Selector<ObjectType, unknown>
  ): void {
    const relations = getPathInclusionRelations(selector);
    for (const relation of relations) {
      const [path, relatedPaths] = relation;
      const existingRelatedPathsSet = this.pathInclusionRelationsMap.get(path);
      if (existingRelatedPathsSet !== undefined) {
        relatedPaths.forEach((p) => existingRelatedPathsSet.add(p));
      } else {
        this.pathInclusionRelationsMap.set(path, new Set(relatedPaths));
      }
    }
  }

  public changeValue<ValueType>(
    selector: Selector<ObjectType, ValueType>,
    nextValue: ValueType
  ): void {
    setValueBySelector(selector, this.currentValues, nextValue);
    this.invokeValueChangedHandlers(selector);
    this.invokeChildrenChangedHandlers(selector);
  }

  private invokeValueChangedHandlers(
    selector: Selector<ObjectType, unknown>
  ): void {
    const relatedPathsSet = this.pathInclusionRelationsMap.get(
      getSlashJoinedFullPath(selector)
    );
    if (relatedPathsSet === undefined) {
      return;
    }
    for (const relatedPath of relatedPathsSet) {
      const handlers = this.valueListenersMap.get(relatedPath);
      if (handlers === undefined || handlers.size === 0) {
        continue;
      }
      const value = getValueByPath(
        separateJoinedPath(relatedPath),
        this.currentValues
      );
      handlers.forEach((h) => h(value));
    }
  }

  private invokeChildrenChangedHandlers(
    selector: Selector<ObjectType, unknown>
  ): void {
    const allPaths = getSlashJoinedPaths(selector);
    for (const path of allPaths) {
      const handlers = this.childrenListenersMap.get(path);
      if (handlers === undefined || handlers.size === 0) {
        continue;
      }
      const value = getValueByPath(
        separateJoinedPath(path),
        this.currentValues
      );
      handlers.forEach((h) => h(value));
    }

    // for root handler
    const rootHandlers = this.childrenListenersMap.get('');
    rootHandlers?.forEach((h) => h(this.currentValues));
  }
}
