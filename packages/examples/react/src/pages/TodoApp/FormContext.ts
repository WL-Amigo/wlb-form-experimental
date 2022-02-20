import { createFormContext } from '@wlb-form/react';

export interface TodoItem {
  readonly id: string;
  title: string;
  isDone: boolean;
}

export interface TodoContainer {
  todos: readonly TodoItem[];
}

export const { FormStateProvider, useField, useChildrenChanged } =
  createFormContext<TodoContainer>({ todos: [] });
