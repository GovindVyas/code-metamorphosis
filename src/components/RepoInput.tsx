import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface RepoInputProps {
  onSubmit: (data: { owner: string; repo: string }) => void;
  isLoading?: boolean;
}

export const RepoInput: React.FC<RepoInputProps> = ({ onSubmit, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};