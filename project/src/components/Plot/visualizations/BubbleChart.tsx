import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Theme } from '../../../contexts/AppContext';

interface BubbleChartProps {
  themes: Theme[];
  scenes: Array<{
    id: string;
    title: string;
    percentage: number;
    wordCount: number;
  }>;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ themes, scenes }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || themes.length === 0 || scenes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Prepare data: for each theme-scene combination, create a bubble
    const bubbleData: Array<{
      theme: Theme;
      scene: typeof scenes[0];
      intensity: number;
      x: number;
      y: number;
      radius: number;
    }> = [];

    themes.forEach(theme => {
      theme.sceneIds.forEach(sceneId => {
        const scene = scenes.find(s => s.id === sceneId);
        if (scene) {
          const intensity = theme.intensity?.[sceneId] || 5;
          bubbleData.push({
            theme,
            scene,
            intensity,
            x: scene.percentage,
            y: themes.indexOf(theme),
            radius: intensity * 3 + 5 // Scale intensity to radius
          });
        }
      });
    });

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, chartWidth]);

    const yScale = d3.scalePoint()
      .domain(themes.map(t => t.name))
      .range([0, chartHeight])
      .padding(0.1);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(themes.map(t => t.id));

    // Add axes
    container.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}%`));

    container.append('g')
      .call(d3.axisLeft(yScale));

    // Add axis labels
    container.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Themes');

    container.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 35})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Story Progress (%)');

    // Create bubbles
    const bubbles = container.selectAll('.bubble')
      .data(bubbleData)
      .enter()
      .append('g')
      .attr('class', 'bubble');

    bubbles.append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.theme.name) || 0)
      .attr('r', d => d.radius)
      .attr('fill', d => colorScale(d.theme.id))
      .attr('fill-opacity', 0.7)
      .attr('stroke', d => colorScale(d.theme.id))
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('padding', '10px')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <div><strong>${d.theme.name}</strong></div>
          <div>Scene: ${d.scene.title}</div>
          <div>Progress: ${d.scene.percentage}%</div>
          <div>Intensity: ${d.intensity}/10</div>
          <div>Words: ${d.scene.wordCount.toLocaleString()}</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');

        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.2);
      })
      .on('mouseout', function(event, d) {
        d3.selectAll('.tooltip').remove();
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius);
      });

    // Add intensity scale legend
    const legend = container.append('g')
      .attr('transform', `translate(${chartWidth - 120}, 20)`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text('Intensity Scale');

    const intensityLevels = [2, 5, 8, 10];
    intensityLevels.forEach((level, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${20 + i * 25})`);

      legendItem.append('circle')
        .attr('r', level * 3 + 5)
        .attr('fill', '#6b7280')
        .attr('fill-opacity', 0.5)
        .attr('stroke', '#6b7280');

      legendItem.append('text')
        .attr('x', 30)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '10px')
        .style('fill', '#374151')
        .text(`${level}/10`);
    });

  }, [themes, scenes]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Theme Distribution Bubble Chart
      </h3>
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Bubble size represents theme intensity • X-axis shows story progress • Y-axis shows themes
      </div>
    </div>
  );
};
