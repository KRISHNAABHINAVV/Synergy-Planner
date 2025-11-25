
import React from 'react';
import { Todo } from '../../types';

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (id: number) => void;
}

const TodoItem: React.FC<{ todo: Todo; index: number; onToggle: () => void; }> = ({ todo, index, onToggle }) => {
    return (
        <div 
            onClick={onToggle} 
            className={`flex items-center gap-4 p-4 rounded-xl mb-3 transition-all cursor-pointer ${todo.completed ? 'bg-gray-100 dark:bg-gray-800/50' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                {index + 1}
            </div>
            <div className="flex-grow">
                <p className={`font-semibold ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>{todo.text}</p>
                <p className={`text-sm ${todo.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>{todo.description}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold text-sm text-gray-600 dark:text-gray-300">{todo.time}</p>
            </div>
        </div>
    );
};


const TodoList: React.FC<TodoListProps> = ({ todos, onToggleTodo }) => {

  if (todos.length === 0) {
    return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <p className="font-medium">No appointments scheduled.</p>
            <p className="text-sm">Enjoy your day!</p>
        </div>
    );
  }

  return (
    <div className="space-y-1">
      {todos.map((todo, index) => (
        <TodoItem key={todo.id} todo={todo} index={index} onToggle={() => onToggleTodo(todo.id)} />
      ))}
    </div>
  );
};

export default TodoList;