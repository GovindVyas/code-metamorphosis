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
import { fetchRepoCommits, fetchCommitDetails, RepoData } from './lib/github';

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

  const isLoading = isLoadingCommits || isLoadingDetails;
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Github className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Code Metamorphosis
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize your GitHub repository's evolution
              </p>
            </div>
          </div>
          <ThemeToggle />
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

          {commitDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <Analytics
                data={commitDetails}
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
    </div>
  );
}

export default App;