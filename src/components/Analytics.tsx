import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, GitBranch, FileCode, Clock } from 'lucide-react';
import { CommitData } from '../lib/github';

interface AnalyticsProps {
  data: CommitData[];
  timelinePosition: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ data, timelinePosition }) => {
  const relevantCommits = data.slice(0, Math.floor(data.length * timelinePosition));
  
  const stats = calculateStats(relevantCommits);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <StatCard
        icon={<FileCode className="w-6 h-6" />}
        title="Files Changed"
        value={stats.totalFiles}
      />
      <StatCard
        icon={<BarChart3 className="w-6 h-6" />}
        title="Total Changes"
        value={stats.totalChanges}
      />
      <StatCard
        icon={<GitBranch className="w-6 h-6" />}
        title="Commits"
        value={stats.totalCommits}
      />
      <StatCard
        icon={<Clock className="w-6 h-6" />}
        title="Active Days"
        value={stats.activeDays}
      />
    </motion.div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
    <div className="flex items-center space-x-4">
      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <p className="text-2xl font-bold">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

const calculateStats = (commits: CommitData[]) => {
  const uniqueFiles = new Set<string>();
  let totalChanges = 0;
  const uniqueDates = new Set<string>();

  commits.forEach(commit => {
    if (!commit.files) return;

    commit.files.forEach(file => {
      uniqueFiles.add(file.filename);
      totalChanges += file.changes;
    });

    if (commit.commit?.author?.date) {
      uniqueDates.add(commit.commit.author.date.split('T')[0]);
    }
  });

  return {
    totalFiles: uniqueFiles.size,
    totalChanges,
    totalCommits: commits.length,
    activeDays: uniqueDates.size,
  };
};