import { useState } from 'react';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';

function Hero({
  todos,
  allTodos,
  filter,
  setFilter,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  activeCount,
  completedCount,
}) {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <main id="tasks" className="flex-1 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              Get things done
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Capture, track, and complete your tasks. Simple, fast, and stays in your browser.
          </p>
        </div>

        {/* Input */}
        <TodoInput onAdd={addTodo} />

        {/* Filters */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <div className="flex gap-1 bg-gray-100 rounded-full p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  filter === f.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-400">
            {activeCount} task{activeCount !== 1 ? 's' : ''} left
          </span>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {todos.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium">
                {filter === 'completed'
                  ? 'No completed tasks yet'
                  : filter === 'active'
                  ? 'All caught up!'
                  : 'Add your first task above'}
              </p>
            </div>
          )}
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>

        {/* Clear completed */}
        {completedCount > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={clearCompleted}
              className="text-sm text-gray-400 hover:text-red-500 transition-all duration-200 underline underline-offset-2"
            >
              Clear {completedCount} completed task{completedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {/* About section */}
        <section id="about" className="mt-24 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Why Taskflow?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Lightning Fast</h3>
              <p className="text-sm text-gray-500">No server, no signup. Everything lives in your browser with instant state updates.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="w-10 h-10 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Private by Default</h3>
              <p className="text-sm text-gray-500">Your data never leaves your device. localStorage keeps it safe and under your control.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Persists Automatically</h3>
              <p className="text-sm text-gray-500">Close the tab, come back tomorrow — your tasks are exactly where you left them.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Hero;