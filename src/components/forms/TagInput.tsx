import React, { useState } from 'react';

import closeIcon from '../../assets/icons/close.svg';

interface TagInputProps {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
}

export function TagInput({ label, tags, setTags, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const labelStyles =
    'block text-sm font-medium text-gray-700 dark:text-white mb-1';
  const inputStyles =
    'flex-grow bg-transparent outline-none text-gray-800 dark:text-gray-100 min-w-[150px]';

  return (
    <div>
      <label className={labelStyles}>{label}*</label>
      <div className="flex items-center gap-2 p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-lumi-primary focus-within:border-lumi-primary overflow-x-auto whitespace-nowrap">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex-shrink-0 flex items-center bg-lumi-primary text-white text-sm font-semibold px-3 py-1 rounded-full"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2"
            >
              <img src={closeIcon} alt="Remover" className="w-4 h-4 invert" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className={inputStyles}
        />
      </div>
    </div>
  );
}
