import React, { useRef, useEffect } from 'react';
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
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .style('fill', d => color(d.data.extension))
      .on('mouseover', function(event, d) {
        const percentage = ((d.data.size / d3.sum(data, d => d.size)) * 100).toFixed(1);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)');

        const tooltip = d3.select('#tooltip')
          .style('opacity', 1)
          .html(`
            <div class="p-2">
              <p class="font-medium">${d.data.extension}</p>
              <p>${d.data.count} files</p>
              <p>${percentage}% of total</p>
            </div>
          `);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)');

        d3.select('#tooltip')
          .style('opacity', 0);
      });

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '.35em')
      .text(d => d.data.extension)
      .style('text-anchor', 'middle')
      .style('fill', '#fff')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

  }, [data]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full aspect-square"
      />
      <div
        id="tooltip"
        className="absolute pointer-events-none bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 transition-opacity"
      />
    </div>
  );
};