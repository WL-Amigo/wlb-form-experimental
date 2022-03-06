import { Selector } from './Type';

// ref: https://qiita.com/ysKuga/items/039dacadd14dddb651a7

export const getPath = <ObjectType extends {}>(
  selector: Selector<ObjectType, unknown>
): string[] => {
  const paths: string[] = [];
  const proxyOps: ProxyHandler<any> = {
    get(_, prop) {
      if (typeof prop === 'symbol') {
        throw new Error('symbol access is not supported');
      }
      paths.push(prop);
      return new Proxy({}, proxyOps);
    },
  };
  selector(new Proxy({}, proxyOps) as unknown as ObjectType);

  return paths;
};

type PathTree = {
  name: string;
  refs: PathTree[];
};
const getPathTree = <ObjectType extends {}>(
  selector: Selector<ObjectType, unknown>
): PathTree[] => {
  const rootPathTrees: PathTree[] = [];
  const createHandler = (pathTreeRefs: PathTree[]): ProxyHandler<any> => {
    return {
      get(_, prop) {
        if (typeof prop === 'symbol') {
          throw new Error('symbol access is not supported');
        }
        const newPathTree: PathTree = {
          name: prop,
          refs: [],
        };
        pathTreeRefs.push(newPathTree);
        return new Proxy({}, createHandler(newPathTree.refs));
      },
    };
  };
  selector(
    new Proxy({}, createHandler(rootPathTrees)) as unknown as ObjectType
  );

  return rootPathTrees;
};
const getAllPathsInPathTrees = (
  pathTrees: PathTree[],
  parentPrefix: string,
  excludeParent: boolean
): string[] => {
  const result: string[] = [];
  for (const pathTree of pathTrees) {
    const currentPath = parentPrefix + pathTree.name;
    if (!(excludeParent && pathTree.refs.length > 0)) {
      result.push(currentPath);
    }
    result.push(
      ...getAllPathsInPathTrees(pathTree.refs, currentPath + '/', excludeParent)
    );
  }
  return result;
};

export const getAllAccessedPaths = <ObjectType extends {}>(
  selector: Selector<ObjectType, unknown>,
  includeParent = false
): string[] => {
  const resultsRaw = getAllPathsInPathTrees(
    getPathTree(selector),
    '',
    !includeParent
  );
  return [...new Set(resultsRaw)];
};

export const getSlashJoinedPaths = <ObjectType extends {}>(
  selector: Selector<ObjectType, unknown>
): string[] => {
  const paths = getPath(selector);
  return paths.map((_, index) => paths.slice(0, index + 1).join('/'));
};

export const getSlashJoinedFullPath = <ObjectType extends {}>(
  selector: Selector<ObjectType, unknown>
): string => {
  return getPath(selector).join('/');
};
export const separateJoinedPath = (slashJoinedPath: string): string[] =>
  slashJoinedPath.split('/');
export const joinSeparatedPath = (separatedPath: readonly string[]): string =>
  separatedPath.join('/');
export const getAllIncludedPathsFromSeparatedPath = (
  separatedPath: readonly string[]
): string[] =>
  separatedPath.map((_, index) => separatedPath.slice(0, index + 1).join('/'));

export const getPathInclusionRelations = <ObjectType extends {}>(
  selector: Selector<ObjectType, unknown>
): [string, Set<string>][] => {
  const paths = getSlashJoinedPaths(selector);
  return paths.map((path, index) => [path, new Set(paths.slice(index))]);
};
