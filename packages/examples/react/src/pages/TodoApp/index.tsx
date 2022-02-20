import { useCallback, useRef, useState, VFC } from 'react';
import { CheckBoxInput } from '../../components/inputs/CheckBox';
import { SingleLineTextInput } from '../../components/inputs/SingleLineText';
import { RenderCountContainer } from '../../components/RenderCountBadge';
import { FormStateProvider, useChildrenChanged, useField } from './FormContext';

export const TodoAppPage: VFC = () => {
  return (
    <FormStateProvider>
      <div className="flex-1 overflow-auto p-4 flex flex-row gap-x-4">
        <div className="flex-1 flex flex-col gap-y-4">
          <AddTodoComponent />
          <TodoContainer />
        </div>
        <div className="flex-1">
          <FormValuesViewer />
        </div>
      </div>
    </FormStateProvider>
  );
};

const AddTodoComponent: VFC = () => {
  const { value: todos, setValue: setTodos } = useField(
    useCallback((values) => values.todos, [])
  );
  const nextIdRef = useRef(0);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const onAddTodo = useCallback(() => {
    const nextId = nextIdRef.current + 1;
    nextIdRef.current = nextId;
    setTodos([
      ...todos,
      {
        id: String(nextId),
        title: newTodoTitle,
        isDone: false,
      },
    ]);
    setNewTodoTitle('');
  }, [newTodoTitle, todos]);

  return (
    <div className="flex flex-row gap-x-2 items-center">
      <SingleLineTextInput value={newTodoTitle} onChange={setNewTodoTitle} />
      <button
        className="px-4 py-1 bg-blue-500 text-white hover:bg-blue-400 rounded"
        onClick={onAddTodo}
      >
        Add Todo
      </button>
    </div>
  );
};

const TodoContainer: VFC = () => {
  const { value: todos, setValue: setTodos } = useField(
    useCallback((values) => values.todos, [])
  );
  const onDelete = useCallback(
    (index: number) => {
      setTodos(todos.filter((_, i) => i !== index));
    },
    [todos, setTodos]
  );
  const swap = useCallback(
    (index: number, targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= todos.length) {
        return;
      }
      const nextTodos = [...todos];
      const swapItem = nextTodos.splice(index, 1);
      nextTodos.splice(targetIndex, 0, ...swapItem);
      setTodos(nextTodos);
    },
    [todos, setTodos]
  );

  return (
    <div className="flex flex-col gap-y-2">
      {todos.map((item, idx) => (
        <TodoItem
          key={item.id}
          index={idx}
          onDelete={onDelete}
          onSwapTo={swap}
        />
      ))}
    </div>
  );
};

interface TodoItemComponentProps {
  index: number;
  onDelete: (index: number) => void;
  onSwapTo: (selfIndex: number, targetIndex: number) => void;
}
const TodoItem: VFC<TodoItemComponentProps> = ({
  index,
  onDelete,
  onSwapTo,
}) => {
  const { value: title } = useField(
    useCallback((values) => values.todos[index]?.title, [index])
  );
  const { value: isDone, setValue: setIsDone } = useField(
    useCallback((values) => values.todos[index]?.isDone, [index])
  );
  const onDeleteLocal = useCallback(() => onDelete(index), [onDelete, index]);
  const onUp = useCallback(() => onSwapTo(index, index - 1), [onSwapTo, index]);
  const onDown = useCallback(
    () => onSwapTo(index, index + 1),
    [onSwapTo, index]
  );

  return (
    <RenderCountContainer className="border rounded p-2 flex flex-row items-center gap-x-2">
      <CheckBoxInput value={isDone} onChange={setIsDone} />
      <span className="flex-1">{title}</span>
      <button
        className="w-16 py-1 bg-blue-500 text-white text-center hover:bg-blue-400 rounded"
        onClick={onUp}
      >
        Up
      </button>
      <button
        className="w-16 py-1 bg-blue-500 text-white text-center hover:bg-blue-400 rounded"
        onClick={onDown}
      >
        Down
      </button>
      <button
        className="px-4 py-1 bg-red-600 text-white hover:bg-red-500 rounded"
        onClick={onDeleteLocal}
      >
        Delete
      </button>
    </RenderCountContainer>
  );
};

// Form content spy
const FormValuesViewer: VFC = () => {
  const [currentValueJson, setCurrentValueJson] = useState('');
  useChildrenChanged(
    useCallback((values) => values, []),
    useCallback(
      (nextValue) =>
        setCurrentValueJson(JSON.stringify(nextValue, undefined, 2)),
      []
    )
  );

  return <pre>{currentValueJson}</pre>;
};
