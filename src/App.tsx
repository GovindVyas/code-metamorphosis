import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { RepoInput } from './components/RepoInput';
import { VisualizationArea } from './components/VisualizationArea';
import { TimelineControl } from './components/TimelineControl';
import { Analytics } from './components/Analytics';
import { ThemeToggle } from './components/ThemeToggle';
import { CommitTimeline } from './components/commitTimeline';
import { FileDistribution } from './components/fileDistribution';
import { fetchRepoCommits, fetchCommitDetails, RepoData, fetchRepoDetails } from './lib/github';

function App() {
  const [repoInfo, setRepoInfo] = useState<RepoData | null>(null);
  const [timelinePosition, setTimelinePosition] = useState(1);

  const { data: commits, isLoading: isLoadingCommits, error: commitsError } = useQuery({
    queryKey: ['commits', repoInfo?.owner, repoInfo?.repo],
    queryFn: () => repoInfo ? fetchRepoCommits(repoInfo) : null,
    enabled: !!repoInfo,
    retry: 2,
  });

  const { data: commitDetails, isLoading: isLoadingDetails, error: detailsError } = useQuery({
    queryKey: ['commitDetails', commits],
    queryFn: async () => {
      if (!commits || !repoInfo) return null;
      try {
        const details = await Promise.all(
          commits.slice(0, 30).map((commit: any) =>
            fetchCommitDetails({ ...repoInfo, sha: commit.sha })
          )
        );
        return details;
      } catch (error) {
        console.error('Error fetching commit details:', error);
        throw error;
      }
    },
    enabled: !!commits,
    retry: 2,
  });

  const { data: repoDetails, isLoading: isLoadingRepoDetails } = useQuery({
    queryKey: ['repoDetails', repoInfo?.owner, repoInfo?.repo],
    queryFn: () => repoInfo ? fetchRepoDetails(repoInfo) : null,
    enabled: !!repoInfo,
  });

  const isLoading = isLoadingCommits || isLoadingDetails || isLoadingRepoDetails;
  const apiError = commitsError || detailsError;

  const startDate = commits?.[commits.length - 1]?.commit?.author?.date
    ? new Date(commits[commits.length - 1].commit.author.date)
    : new Date();
  const endDate = commits?.[0]?.commit?.author?.date
    ? new Date(commits[0].commit.author.date)
    : new Date();

  // Calculate file distribution data
  const fileStats = React.useMemo(() => {
    if (!commitDetails) return [];
    
    const stats = new Map<string, { count: number; size: number }>();
    
    commitDetails.forEach(commit => {
      commit.files?.forEach(file => {
        const ext = file.filename.split('.').pop() || 'unknown';
        const current = stats.get(ext) || { count: 0, size: 0 };
        stats.set(ext, {
          count: current.count + 1,
          size: current.size + file.changes,
        });
      });
    });

    return Array.from(stats.entries()).map(([extension, { count, size }]) => ({
      extension,
      count,
      size,
    }));
  }, [commitDetails]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto pb-16"
      >
        <div className="flex flex-col items-center mb-8">
          <Github className="w-12 h-12 text-gray-900 dark:text-white transition-colors mb-4" />
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Code Metamorphosis
            </h1>
            <p className="text-gray-700 dark:text-gray-300 transition-colors">
              Visualize your GitHub repository's evolution
            </p>
          </div>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <RepoInput
              onSubmit={setRepoInfo}
              isLoading={isLoading}
              label="Repository"
            />
          </div>

          {isLoading && (
            <div className="text-center mt-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading repository data...</p>
            </div>
          )}

          {apiError && (
            <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-medium">Error loading repository data:</p>
              <p>{apiError instanceof Error ? apiError.message : 'An unexpected error occurred'}</p>
            </div>
          )}

          {commitDetails && repoDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <Analytics
                data={commitDetails}
                repoDetails={repoDetails}
                timelinePosition={timelinePosition}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">File Distribution</h2>
                  <FileDistribution data={fileStats} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Commit Timeline</h2>
                  <CommitTimeline
                    commits={commits?.map((commit: any) => ({
                      ...commit,
                      branch: 'main', // You might want to fetch actual branch information
                    }))}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Code Changes Visualization</h2>
                <VisualizationArea
                  data={commitDetails}
                  timelinePosition={timelinePosition}
                />
              </div>

              <TimelineControl
                startDate={startDate}
                endDate={endDate}
                position={timelinePosition}
                onChange={setTimelinePosition}
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 Code Metamorphosis. Built by Govind Vyas with ❤️
          </p>
          <a 
            href="https://github.com/GovindVyas/code-metamorphosis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;