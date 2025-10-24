/* eslint-disable max-len */
import React, { useEffect, useState } from "react";
import "bulma/css/bulma.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { TodoList } from "./components/TodoList";
import { TodoFilter } from "./components/TodoFilter";
import { TodoModal } from "./components/TodoModal";
import { Todo } from "./types/Todo";
import { getTodos, getUser } from "./api";
import { User } from "./types/User";
import { Loader } from "./components/Loader";

export type Category = "all" | "active" | "completed";

export const App: React.FC = () => {
  type FilterOptions = {
    filterCategory: Category;
    filterQuery: string;
  };

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [loadeorUser, setLoaderUser] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState<string>("");

  const handleSelectTodo = async (todoId: number | null) => {
    if (!todoId) {
      setSelectedTodo(null);
      setUser(null);
      setIsLoadingModal(false);
      return;
    }

    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    setIsLoadingModal(true);
    setUser(null);
    setLoaderUser(true);

    try {
      const user = await getUser(todo.userId);
      setSelectedTodo(todo);
      setUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoaderUser(false);
      setIsLoadingModal(false);
    }
  };

  const filterTodo = (
    todos: Todo[],
    { filterCategory, filterQuery }: FilterOptions,
  ): Todo[] => {
    const query = filterQuery.toLowerCase().trim();

    return todos.filter((todo) => {
      const result =
        filterCategory === "all" ||
        (filterCategory === "completed" && todo.completed) ||
        (filterCategory === "active" && !todo.completed);

      const results = !query || todo.title.toLowerCase().includes(query);

      return result && results;
    });
  };
  const visibleTodos = filterTodo(todos, {
    filterCategory: category,
    filterQuery: query,
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      getTodos()
        .then(setTodos)
        .catch((error) => {
          throw new Error(`Error loading todos: ${error}`);
        })
        .finally(() => setLoading(false));
    }, 500);
  }, []);

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                category={category}
                query={query}
                onCategoryChange={setCategory}
                onQueryChange={setQuery}
              />
            </div>

            <div className="block">
              {isLoading ? (
                <Loader />
              ) : (
                <TodoList
                  todos={visibleTodos}
                  onSelectTodo={handleSelectTodo}
                />
              )}
            </div>

            {isLoadingModal && (
              <div className="modal is-active">
                <div className="modal-background" />
                <Loader />
              </div>
            )}

            {selectedTodo && !isLoadingModal && (
              <TodoModal
                loaderUser={loadeorUser}
                selectedTodo={selectedTodo}
                user={user}
                onModalClose={setSelectedTodo}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
