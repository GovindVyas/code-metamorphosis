import React from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, Eye, FileText, GitCommit, Calendar, BarChart2, Scale } from 'lucide-react';
import { CommitData, RepoDetails } from '../lib/github';

interface AnalyticsProps {
  data: CommitData[];
  repoDetails: RepoDetails;
  timelinePosition: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' && value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
        </p>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
        {icon}
      </div>
    </div>
  </motion.div>
);

export const Analytics: React.FC<AnalyticsProps> = ({ data, repoDetails, timelinePosition }) => {
  const stats = React.useMemo(() => {
    // Use the total commit count from repoDetails instead of the current data slice
    const totalCommits = repoDetails.commit_count;
    
    // Calculate files changed and total changes
    let totalChanges = 0;
    const uniqueFiles = new Set<string>();
    const activeDays = new Set<string>();

    data.forEach(commit => {
      commit.files?.forEach(file => {
        totalChanges += file.changes;
        uniqueFiles.add(file.filename);
      });
      if (commit.commit?.author?.date) {
        activeDays.add(commit.commit.author.date.split('T')[0]);
      }
    });

    return {
      stars: repoDetails.stargazers_count,
      forks: repoDetails.forks_count,
      watchers: repoDetails.subscribers_count, // Use subscribers_count for actual watchers
      filesChanged: uniqueFiles.size,
      totalChanges,
      commits: totalCommits, // Use the total commit count
      activeDays: activeDays.size,
      license: repoDetails.license?.name || 'No License'
    };
  }, [data, repoDetails]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Stars"
        value={stats.stars}
        icon={<Star className="w-6 h-6 text-yellow-500" />}
      />
      <StatCard
        title="Forks"
        value={stats.forks}
        icon={<GitFork className="w-6 h-6 text-blue-500" />}
      />
      <StatCard
        title="Watching"
        value={stats.watchers}
        icon={<Eye className="w-6 h-6 text-purple-500" />}
      />
      <StatCard
        title="Files Changed"
        value={stats.filesChanged}
        icon={<FileText className="w-6 h-6 text-green-500" />}
      />
      <StatCard
        title="Total Changes"
        value={stats.totalChanges}
        icon={<BarChart2 className="w-6 h-6 text-red-500" />}
        description="Lines added & removed"
      />
      <StatCard
        title="Commits"
        value={stats.commits}
        icon={<GitCommit className="w-6 h-6 text-indigo-500" />}
      />
      <StatCard
        title="Active Days"
        value={stats.activeDays}
        icon={<Calendar className="w-6 h-6 text-orange-500" />}
      />
      <StatCard
        title="License"
        value={stats.license}
        icon={<Scale className="w-6 h-6 text-teal-500" />}
      />
    </div>
  );
};