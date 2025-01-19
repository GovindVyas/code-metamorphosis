import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface FileStats {
  extension: string;
  count: number;
  size: number;
}

interface FileDistributionProps {
  data: FileStats[];
}

export const FileDistribution: React.FC<FileDistributionProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Add table view for accessibility
  const tableData = data.map(item => ({
    extension: item.extension,
    count: item.count,
    percentage: ((item.size / d3.sum(data, d => d.size)) * 100).toFixed(1)
  }));

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const width = svgRef.current.clientWidth;
    const height = width;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie<FileStats>()
      .value(d => d.size)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<FileStats>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius - 1);

    const labelArc = d3.arc<d3.PieArcDatum<FileStats>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', d => 
        `${d.data.extension}: ${d.data.count} files, ${((d.data.size / d3.sum(data, d => d.size)) * 100).toFixed(1)}% of total changes`
      );

    arcs.append('path')
      .attr('d', arc)
      .style('fill', d => color(d.data.extension))
      .attr('role', 'presentation')
      // Add patterns for better accessibility
      .style('stroke', '#fff')
      .style('stroke-width', '2')
      .each(function(d) {
        const pattern = svg.append('pattern')
          .attr('id', `pattern-${d.data.extension}`)
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('width', 8)
          .attr('height', 8);
        
        pattern.append('path')
          .attr('d', d3.symbol().type(d3.symbolCross).size(16))
          .attr('transform', 'translate(4,4)')
          .attr('fill', color(d.data.extension));
      });

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '.35em')
      .text(d => d.data.extension)
      .style('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Add keyboard navigation
    arcs
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setActiveSegment(d.data.extension);
        }
      });

  }, [data]);

  return (
    <div className="relative">
      <div className="sr-only">
        File distribution chart showing the proportion of different file types in the repository
      </div>
      <svg
        ref={svgRef}
        className="w-full aspect-square"
        role="img"
        aria-label="File distribution pie chart"
      />
      
      {/* Add accessible table view */}
      <div className="sr-only">
        <table>
          <caption>File distribution breakdown</caption>
          <thead>
            <tr>
              <th scope="col">File Type</th>
              <th scope="col">Number of Files</th>
              <th scope="col">Percentage of Changes</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(item => (
              <tr key={item.extension}>
                <td>{item.extension}</td>
                <td>{item.count}</td>
                <td>{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        id="tooltip"
        className="absolute pointer-events-none bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 transition-opacity"
        role="tooltip"
      />
    </div>
  );
};