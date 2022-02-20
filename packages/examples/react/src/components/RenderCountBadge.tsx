import clsx from 'clsx';
import { createContext, PropsWithChildren, useContext, VFC } from 'react';
import { useRenderCount } from '../hooks/RenderCount';
import { windi } from '../windi';

export const RenderCountBadge: VFC<{ count: number }> = ({ count }) => {
  return (
    <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full border-2 border-blue-500 flex justify-center items-center text-sm">
      {count}
    </div>
  );
};

const RenderCountVisibilityContext = createContext(false);
export const RenderCountVisibilityContextProvider =
  RenderCountVisibilityContext.Provider;

export const RenderCountContainer: VFC<
  PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  const count = useRenderCount();
  const visible = useContext(RenderCountVisibilityContext);

  return (
    <div className={clsx(windi`relative`, className)}>
      {children}
      {visible && <RenderCountBadge count={count} />}
    </div>
  );
};
