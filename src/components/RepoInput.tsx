import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface RepoInputProps {
  onSubmit: (data: { owner: string; repo: string }) => void;
  isLoading?: boolean;
  label: string;
}

export const RepoInput: React.FC<RepoInputProps> = ({ onSubmit, isLoading, label }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputId = React.useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = new URL(repoUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      if (url.hostname !== 'github.com' || pathParts.length !== 2) {
        throw new Error('Invalid GitHub repository URL');
      }

      const [owner, repo] = pathParts;
      onSubmit({ owner, repo });
    } catch (err) {
      setError('Please enter a valid GitHub repository URL');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" role="search">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="Search repository"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </form>
      {error && (
        <p 
          id={`${inputId}-error`} 
          className="mt-2 text-sm text-red-600" 
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};