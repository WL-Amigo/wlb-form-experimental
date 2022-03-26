import { VFC } from 'react';

export const ErrorDisplay: VFC<{ error: string | null }> = ({ error }) => {
  if (error === null || error.length === 0) {
    return null;
  }

  return <span className="block text-red-400">{error}</span>;
};
