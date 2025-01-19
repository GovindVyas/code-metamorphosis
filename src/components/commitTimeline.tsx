import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  branch: string;
}

interface CommitTimelineProps {
  commits?: Commit[];
}

export const CommitTimeline: React.FC<CommitTimelineProps> = ({ commits = [] }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date]>(() => {
    if (!commits.length) return [new Date(), new Date()];
    
    const dates = commits
      .map(c => c.commit?.author?.date)
      .filter(Boolean)
      .map(date => new Date(date));
    
    if (!dates.length) return [new Date(), new Date()];
    
    return [
      new Date(Math.min(...dates.map(d => d.getTime()))),
      new Date(Math.max(...dates.map(d => d.getTime())))
    ];
  });

  useEffect(() => {
    if (!svgRef.current || !commits.length) return;

    const validCommits = commits.filter(commit => {
      const date = commit.commit?.author?.date;
      return date && !isNaN(new Date(date).getTime());
    });

    if (!validCommits.length) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const x = d3.scaleTime()
      .domain(dateRange)
      .range([0, width]);

    const xAxis = d3.axisBottom(x);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    const commitGroups = g.selectAll('.commit')
      .data(validCommits)
      .enter()
      .append('g')
      .attr('class', 'commit')
      .attr('transform', d => {
        const date = new Date(d.commit.author.date);
        return `translate(${x(date)},${height/2})`;
      });

    commitGroups.append('circle')
      .attr('r', 4)
      .attr('fill', '#4299e1')
      .on('mouseover', (event, d) => {
        setSelectedCommit(d);
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', 6);
      })
      .on('mouseout', (event) => {
        setSelectedCommit(null);
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', 4);
      });

    // Add branch lines
    const branches = Array.from(new Set(validCommits.map(c => c.branch)));
    const yScale = d3.scalePoint()
      .domain(branches)
      .range([height/4, 3*height/4]);

    g.selectAll('.branch-line')
      .data(branches)
      .enter()
      .append('line')
      .attr('class', 'branch-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d)!)
      .attr('y2', d => yScale(d)!)
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '4,4');

  }, [commits, dateRange]);

  if (!commits.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-500">
        No commit data available
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full h-[200px]"
      />
      {selectedCommit && (
        <div className="absolute top-0 left-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <p className="font-medium">{selectedCommit.commit.message}</p>
          <p className="text-sm text-gray-500">
            {selectedCommit.commit.author.name} on{' '}
            {format(new Date(selectedCommit.commit.author.date), 'PPP')}
          </p>
          <p className="text-sm text-gray-500">Branch: {selectedCommit.branch}</p>
        </div>
      )}
    </div>
  );
};