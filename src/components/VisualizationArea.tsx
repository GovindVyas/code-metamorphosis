import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { Download, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { CommitData } from '../lib/github';

interface Node {
  id: string;
  group: number;
  value: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface VisualizationAreaProps {
  data: CommitData[];
  timelinePosition: number;
}

interface DetailPanelProps {
  node: Node | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="absolute right-0 top-0 w-80 h-full bg-white dark:bg-gray-800 shadow-lg p-4 overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ×
      </button>
      <h3 className="text-lg font-semibold mb-4">{node.id}</h3>
      <dl className="space-y-2">
        <dt className="text-sm text-gray-500 dark:text-gray-400">File Type</dt>
        <dd className="text-sm font-medium">{node.id.split('.').pop()}</dd>
        <dt className="text-sm text-gray-500 dark:text-gray-400">Changes</dt>
        <dd className="text-sm font-medium">{node.value}</dd>
        <dt className="text-sm text-gray-500 dark:text-gray-400">Group</dt>
        <dd className="text-sm font-medium">{getFileTypeLabel(node.group)}</dd>
      </dl>
    </div>
  );
};

export const VisualizationArea: React.FC<VisualizationAreaProps> = ({
  data,
  timelinePosition,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svgElement = svgRef.current;
    while (svgElement.firstChild) {
      svgElement.removeChild(svgElement.firstChild);
    }

    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 600;

    const processedData = processData(data, timelinePosition);
    
    if (processedData.nodes.length === 0) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", (width / 2).toString());
      text.setAttribute("y", (height / 2).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#666");
      text.textContent = "No file changes found in the selected time period";
      svgElement.appendChild(text);
      return;
    }

    // Filter nodes based on search term
    const filteredNodes = searchTerm
      ? processedData.nodes.filter(node => 
          node.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : processedData.nodes;

    const filteredLinks = processedData.links.filter(link => 
      filteredNodes.some(n => n.id === link.source) && 
      filteredNodes.some(n => n.id === link.target)
    );

    const svg = d3.select(svgElement);

    // Add zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior as any);

    // Create container for zoomable content
    const container = svg.append('g');

    const simulation = d3.forceSimulation(filteredNodes as any)
      .force('link', d3.forceLink(filteredLinks).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => Math.sqrt(d.value) * 2 + 5));

    const links = container
      .append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    const nodes = container
      .append('g')
      .selectAll('g')
      .data(filteredNodes)
      .enter()
      .append('g')
      .call(drag(simulation) as any)
      .on('click', (event: any, d: Node) => {
        setSelectedNode(d);
      })
      .on('mouseover', function(event: any, d: Node) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', (d: any) => Math.sqrt(d.value) * 2.5);
      })
      .on('mouseout', function(event: any, d: Node) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', (d: any) => Math.sqrt(d.value) * 2);
      });

    nodes.append('circle')
      .attr('r', (d: any) => Math.sqrt(d.value) * 2)
      .attr('fill', (d: any) => d3.schemeCategory10[d.group])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    nodes.append('title')
      .text((d: any) => `${d.id}\nChanges: ${d.value}`);

    nodes.append('text')
      .attr('dx', (d: any) => Math.sqrt(d.value) * 2 + 5)
      .attr('dy', '.35em')
      .text((d: any) => d.value > 50 ? d.id.split('/').pop() : '')
      .attr('font-size', '10px')
      .attr('fill', '#666');

    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, timelinePosition, searchTerm]);

  const handleExport = (format: 'png' | 'svg') => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    if (format === 'svg') {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'visualization.svg';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        canvas.width = svgElement.clientWidth;
        canvas.height = svgElement.clientHeight;
        context?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'visualization.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search files..."
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <button
          onClick={() => handleExport('svg')}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          title="Export as SVG"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm">SVG</span>
        </button>
        <button
          onClick={() => handleExport('png')}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          title="Export as PNG"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm">PNG</span>
        </button>
      </div>
      <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
        <span className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow">
          {Math.round(zoom * 100)}%
        </span>
      </div>
      <svg
        ref={svgRef}
        className="w-full h-full"
      />
      <DetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </motion.div>
  );
};

const getFileTypeLabel = (group: number): string => {
  const labels: { [key: number]: string } = {
    0: 'TypeScript',
    1: 'JavaScript',
    2: 'Styles',
    3: 'HTML',
    4: 'JSON',
    5: 'Documentation',
    6: 'Other',
  };
  return labels[group] || 'Unknown';
};

const processData = (commits: CommitData[], timelinePosition: number) => {
  const nodes: Node[] = [];
  const links: Link[] = [];
  const fileMap = new Map<string, number>();

  const relevantCommits = commits.slice(0, Math.floor(commits.length * timelinePosition));

  relevantCommits.forEach(commit => {
    if (!commit.files) return;

    commit.files.forEach(file => {
      const fileId = file.filename;
      const fileType = fileId.split('.').pop() || 'unknown';
      
      if (!fileMap.has(fileId)) {
        fileMap.set(fileId, nodes.length);
        nodes.push({
          id: fileId,
          group: getFileTypeGroup(fileType),
          value: file.changes,
        });
      } else {
        const nodeIndex = fileMap.get(fileId)!;
        nodes[nodeIndex].value += file.changes;
      }

      commit.files.forEach(otherFile => {
        if (file.filename !== otherFile.filename) {
          links.push({
            source: file.filename,
            target: otherFile.filename,
            value: 1,
          });
        }
      });
    });
  });

  return { nodes, links };
};

const getFileTypeGroup = (fileType: string): number => {
  const typeMap: { [key: string]: number } = {
    ts: 0,
    tsx: 0,
    js: 1,
    jsx: 1,
    css: 2,
    scss: 2,
    html: 3,
    json: 4,
    md: 5,
    unknown: 6,
  };
  return typeMap[fileType.toLowerCase()] || 6;
};

const drag = (simulation: d3.Simulation<any, undefined>) => {
  const dragstarted = (event: any) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  };

  const dragged = (event: any) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  };

  const dragended = (event: any) => {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  };

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};