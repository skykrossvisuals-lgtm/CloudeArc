import { useState } from 'react';

function TodoItem({ todo, onToggle, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`group flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 ${
        todo.completed
          ? 'bg-gray-50 border-gray-100'
          : 'bg-white border-gray-200 hover:border-violet-200 hover:shadow-sm'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          todo.completed
            ? 'bg-violet-600 border-violet-600'
            : 'border-gray-300 hover:border-violet-400'
        }`}
        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
      >
        {todo.completed && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className={`flex-1 text-base transition-all duration-200 ${
          todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
        }`
      >
        {todo.text}
      </span>

      {/* Delete */}
      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(todo.id)}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition-all duration-200"
          >
            Confirm
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all duration-200 p-1"
          aria-label="Delete task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default TodoItem;