import { useState } from 'react';

function TodoInput({ onAdd }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 px-5 py-3.5 rounded-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-base"
      />
      <button
        type="submit"
        className="px-8 py-3.5 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-200"
      >
        Add
      </button>
    </form>
  );
}

export default TodoInput;