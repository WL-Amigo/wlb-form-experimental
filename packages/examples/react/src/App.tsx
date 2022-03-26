import { PropsWithChildren, useCallback, useState, VFC } from 'react';
import { windi } from './windi';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import clsx from 'clsx';
import { BasicExamplePage } from './pages/Basic';
import { TodoAppPage } from './pages/TodoApp';
import { RenderCountVisibilityContextProvider } from './components/RenderCountBadge';
import { RPGItemEditorExamplePage } from './pages/RPGItemEditor';

interface LinkProps {
  to: string;
}
const StyledLink: VFC<PropsWithChildren<LinkProps>> = ({ children, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          windi`rounded px-4 py-1 transition-colors duration-200 no-underline`,
          isActive
            ? windi`bg-blue-500 text-white`
            : windi`text-black hover:bg-blue-50`
        )
      }
    >
      {children}
    </NavLink>
  );
};

function App() {
  const [isVisibleRenderCount, setIsVisibleRenderCount] = useState(false);
  const toggleIsVisibleRenderCount = useCallback(
    () => setIsVisibleRenderCount((prev) => !prev),
    []
  );

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <nav className="flex flex-row items-center gap-x-2 px-4 py-2 border-b border-gray-300">
        <h1 className="font-bold pr-4">@wlb-form + React Demo</h1>
        <StyledLink to="/">Basic</StyledLink>
        <StyledLink to="/todo">Todo App</StyledLink>
        <StyledLink to="/item-editor">RPG Item Editor</StyledLink>
        <button
          className="px-4 py-1 bg-gray-100 hover:bg-gray-200"
          onClick={toggleIsVisibleRenderCount}
        >
          Toggle render count
        </button>
      </nav>
      <RenderCountVisibilityContextProvider value={isVisibleRenderCount}>
        <Routes>
          <Route path="/" element={<BasicExamplePage />} />
          <Route path="/todo" element={<TodoAppPage />} />
          <Route path="/item-editor" element={<RPGItemEditorExamplePage />} />
        </Routes>
      </RenderCountVisibilityContextProvider>
    </div>
  );
}

export default App;
