// パスベースでバリデーションのスケジュール、及び実行と結果の効率的な更新・提供を行う
// 数値だけで構成されるプロパティアクセスがあった場合、それは配列アクセスとみなす

import {
  getAllAccessedPaths,
  getAllIncludedPathsFromSeparatedPath,
  getSlashJoinedFullPath,
  Selector,
  separateJoinedPath,
  getValueByPath,
} from '../SelectorOperations';
import { EsMapOps } from '../EsMapOperations';

const IntPathRegex = /\/\d+/g;
const replaceIntPathToWildcard = (path: string) =>
  path.replace(IntPathRegex, '/*');
const extractIndicesFromPath = (path: string): string[] | undefined =>
  path.match(IntPathRegex)?.map((s) => s.slice(1));
const restoreIndexedPathFromWildcardPath = (
  wildcardPath: string,
  indices: readonly string[] | undefined
): string => {
  if (indices === undefined) {
    return wildcardPath;
  }

  let result = wildcardPath;
  for (const index of indices) {
    result = result.replace('*', index);
  }
  return result;
};

type InferredValidatorFuncValuesType<
  ObjectType extends {},
  SelectorsType extends Selector<ObjectType, any>[]
> = { [I in keyof SelectorsType]: InferSelectorReturnType<SelectorsType[I]> };
type InferSelectorReturnType<SelectorType> = SelectorType extends Selector<
  any,
  infer ValueType
>
  ? ValueType
  : never;

type SelectorTupleType<ObjectType> = [
  Selector<ObjectType, any>,
  ...Selector<ObjectType, any>[]
];

interface ValidatorInfo<ValuesType> {
  readonly validator: (selectedValues: ValuesType) => string | undefined;
  /** バリデーションに利用する値へのパス */
  readonly selectPaths: readonly string[];
  /** バリデーション対象となる値へのパス */
  readonly relatedPaths: readonly string[];
}

export type RegisterValidatorFuncType<ObjectType extends {}> = <
  SelectorsType extends SelectorTupleType<ObjectType>
>(
  selectors: SelectorsType,
  validator: (
    selectedValues: InferredValidatorFuncValuesType<ObjectType, SelectorsType>
  ) => string | undefined,
  relatedPathSelectors?: readonly Selector<ObjectType, unknown>[]
) => void;

export interface ValidationError {
  readonly paths: readonly string[];
  readonly errors: readonly string[];
}

export class ValidationProcessor<ObjectType extends {}> {
  private readonly pathToValidatorMap = new Map<string, ValidatorInfo<any>[]>();
  private readonly pathToValidationErrorsMapInner = new Map<
    string,
    ValidationError[]
  >();
  private validationScheduledPaths: Set<string> = new Set();

  public register<SelectorsType extends SelectorTupleType<ObjectType>>(
    selectors: SelectorsType,
    validator: (
      selectedValues: InferredValidatorFuncValuesType<ObjectType, SelectorsType>
    ) => string | undefined,
    relatedPathSelectors?: readonly Selector<ObjectType, unknown>[]
  ) {
    const paths = selectors.map((s) =>
      replaceIntPathToWildcard(getSlashJoinedFullPath(s))
    );
    const relatedPaths =
      relatedPathSelectors !== undefined
        ? relatedPathSelectors.map((s) =>
            replaceIntPathToWildcard(getSlashJoinedFullPath(s))
          )
        : paths;
    const validatorInfo: ValidatorInfo<
      InferredValidatorFuncValuesType<ObjectType, SelectorsType>
    > = {
      relatedPaths,
      selectPaths: paths,
      validator,
    };
    for (const shouldValidatePath of paths) {
      EsMapOps.upsertArrayInMap(
        this.pathToValidatorMap,
        shouldValidatePath,
        validatorInfo
      );
    }
  }

  public schedule(affectedValueSelector: Selector<ObjectType, any>): void {
    const affectedPath = getSlashJoinedFullPath(affectedValueSelector);
    this.validationScheduledPaths.add(affectedPath);
  }

  private scheduleValidation(
    nextValues: ObjectType
  ): Map<string, Set<ValidatorInfo<any>>> {
    const scheduledPathToValidatorMap = new Map<
      string,
      Set<ValidatorInfo<any>>
    >();

    for (const scheduledPath of this.validationScheduledPaths) {
      const indices = extractIndicesFromPath(scheduledPath);
      const wildcardPath = replaceIntPathToWildcard(scheduledPath);

      // schedule されたパスに包含されるパス全てに関係するバリデーションをスケジュールに追加
      const allIncludedPaths = getAllIncludedPathsFromSeparatedPath(
        separateJoinedPath(wildcardPath)
      );
      for (const path of allIncludedPaths) {
        const viList = this.pathToValidatorMap.get(path);
        if (viList !== undefined) {
          EsMapOps.upsertSetInMap(
            scheduledPathToValidatorMap,
            restoreIndexedPathFromWildcardPath(path, indices),
            ...viList
          );
        }
      }

      // schedule されたパス以下のバリデーションが存在する場合、以下の通りスケジュール
      // * バリデーション対象パスに未解決の配列ワイルドカードが
      //   * 含まれない: そのままスケジュールに追加
      //   * 含まれる: nextValues から対象パスに格納されている配列を取り出し、その配列の長さの分のバリデーションをスケジュール
      const childrenValidationPaths = [
        ...this.pathToValidatorMap.keys(),
      ].filter((p) => p.startsWith(wildcardPath));
      for (const path of childrenValidationPaths) {
        const viList = this.pathToValidatorMap.get(path)!;
        const actualValidationTargetPath = restoreIndexedPathFromWildcardPath(
          path,
          indices
        );
        if (!actualValidationTargetPath.includes('*')) {
          EsMapOps.upsertSetInMap(
            scheduledPathToValidatorMap,
            actualValidationTargetPath,
            ...viList
          );
        } else {
          const interpolatedPaths = this.generateAllArrayValidationTargetPaths(
            actualValidationTargetPath,
            nextValues
          );
          for (const p of interpolatedPaths) {
            EsMapOps.upsertSetInMap(scheduledPathToValidatorMap, p, ...viList);
          }
        }
      }
    }

    return scheduledPathToValidatorMap;
  }

  private generateAllArrayValidationTargetPaths(
    incompleteValidationTargetPath: string,
    nextValues: ObjectType
  ): string[] {
    const pathFragments = separateJoinedPath(incompleteValidationTargetPath);
    const wildcardPos = pathFragments.indexOf('*');
    if (wildcardPos === -1) {
      return [incompleteValidationTargetPath];
    }
    const pathFragmentsBeforeWildcard = pathFragments.slice(0, wildcardPos);
    const targetArray = getValueByPath(pathFragmentsBeforeWildcard, nextValues);
    if (!Array.isArray(targetArray) || targetArray.length === 0) {
      // 配列ではない(ex. undefined)、もしくはアイテムが無いのでバリデーション対象は存在しない
      return [];
    }
    const interpolatedValidationTargetPaths = [
      ...Array(targetArray.length),
    ].map((_, i) =>
      restoreIndexedPathFromWildcardPath(incompleteValidationTargetPath, [
        String(i),
      ])
    );
    const firstInterpolatedPath = interpolatedValidationTargetPaths[0]!;
    return firstInterpolatedPath.includes('*')
      ? interpolatedValidationTargetPaths.flatMap((p) =>
          this.generateAllArrayValidationTargetPaths(p, nextValues)
        )
      : interpolatedValidationTargetPaths;
  }

  public run(nextValues: ObjectType): Set<string> {
    const scheduledValidators = this.scheduleValidation(nextValues);

    // 再バリデーションが発生する全てのパスについて、
    // バリデーションエラーを一旦リセットする
    // 要エラー再取得パスの構成もここで行う
    const revalidatedPaths = new Set<string>();
    for (const [path, viSet] of scheduledValidators) {
      const indices = extractIndicesFromPath(path);
      for (const vi of viSet) {
        vi.relatedPaths.forEach((p) => {
          const actualPath = restoreIndexedPathFromWildcardPath(p, indices);
          this.pathToValidationErrorsMapInner.delete(actualPath);
          getAllIncludedPathsFromSeparatedPath(
            separateJoinedPath(actualPath)
          ).forEach((ip) => revalidatedPaths.add(ip));
        });
      }
    }

    // バリデーションを実行
    for (const [path, viSet] of scheduledValidators) {
      const indices = extractIndicesFromPath(path);
      const validatorInfoList = [...viSet];

      const validationErrorList = validatorInfoList
        .map((vi): ValidationError | undefined => {
          const valuePaths = vi.relatedPaths.map((p) =>
            restoreIndexedPathFromWildcardPath(p, indices)
          );
          const values = valuePaths.map((p) =>
            getValueByPath(separateJoinedPath(p), nextValues)
          );
          const validationResult = vi.validator(values);
          return validationResult === undefined
            ? undefined
            : {
                paths: valuePaths,
                errors: [validationResult],
              };
        })
        .filter((vr): vr is ValidationError => vr !== undefined);
      for (const validationError of validationErrorList) {
        validationError.paths.forEach((path) => {
          EsMapOps.upsertArrayInMap(
            this.pathToValidationErrorsMapInner,
            path,
            validationError
          );
        });
      }
    }

    // 後処理
    this.validationScheduledPaths = new Set();

    return revalidatedPaths;
  }

  public getErrorsForPath(path: string): ValidationError[] {
    // 子のバリデーションエラーもすべて集める
    if (path === '') {
      return [...this.pathToValidationErrorsMapInner.values()].flat();
    }
    const relevantKeys = [...this.pathToValidationErrorsMapInner.keys()].filter(
      (p) => p.startsWith(path)
    );
    return relevantKeys
      .map((p) => this.pathToValidationErrorsMapInner.get(p)!)
      .flat();
  }
}
