import { ArrayOps } from '../ArrayOperations';
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

export const getPathInclusionRelations = <ObjectType extends {}>(
  selector: Selector<ObjectType, unknown>
): [string, Set<string>][] => {
  const paths = getSlashJoinedPaths(selector);
  return paths.map((path, index) => [path, new Set(paths.slice(index))]);
};
