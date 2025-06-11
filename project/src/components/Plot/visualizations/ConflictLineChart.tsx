import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Conflict } from '../../../contexts/AppContext';

interface ConflictLineChartProps {
  conflicts: Conflict[];
  beats: Array<{
    name: string;
    percentage: number;
  }>;
}

export const ConflictLineChart: React.FC<ConflictLineChartProps> = ({ conflicts, beats }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || conflicts.length === 0 || beats.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 60, left: 50 };

    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Prepare data: simulate conflict intensity across story beats
    const conflictData = conflicts.map(conflict => {
      return beats.map(beat => ({
        conflict,
        beat,
        percentage: beat.percentage,
        // Simulate intensity progression based on conflict type and story structure
        intensity: calculateConflictIntensity(conflict, beat.percentage)
      }));
    });

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(['internal', 'external'])
      .range(['#8b5cf6', '#f97316']); // Purple for internal, orange for external

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
      .text('Conflict Intensity');

    container.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 45})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Story Progress (%)');

    // Create line generator
    const lineGenerator = d3.line<any>()
      .x(d => xScale(d.percentage))
      .y(d => yScale(d.intensity))
      .curve(d3.curveCatmullRom);

    // Draw lines for each conflict
    conflictData.forEach((conflictBeats, conflictIndex) => {
      const conflict = conflictBeats[0].conflict;
      const lineColor = colorScale(conflict.type) as string;

      // Area under the line
      const areaGenerator = d3.area<any>()
        .x(d => xScale(d.percentage))
        .y0(chartHeight)
        .y1(d => yScale(d.intensity))
        .curve(d3.curveCatmullRom);

      container.append('path')
        .datum(conflictBeats)
        .attr('d', areaGenerator)
        .attr('fill', lineColor)
        .attr('fill-opacity', 0.1);

      // Line
      container.append('path')
        .datum(conflictBeats)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.8);

      // Points
      container.selectAll(`.point-${conflictIndex}`)
        .data(conflictBeats)
        .enter()
        .append('circle')
        .attr('class', `point-${conflictIndex}`)
        .attr('cx', d => xScale(d.percentage))
        .attr('cy', d => yScale(d.intensity))
        .attr('r', 4)
        .attr('fill', lineColor)
        .attr('stroke', 'white')
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
            <div><strong>${d.conflict.description}</strong></div>
            <div>Type: ${d.conflict.type}</div>
            <div>Beat: ${d.beat.name} (${d.percentage}%)</div>
            <div>Intensity: ${d.intensity}/10</div>
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');

          d3.select(this).transition().duration(200).attr('r', 6);
        })
        .on('mouseout', function() {
          d3.selectAll('.tooltip').remove();
          d3.select(this).transition().duration(200).attr('r', 4);
        });
    });

    // Add beat markers
    beats.forEach(beat => {
      if ([10, 50, 75].includes(beat.percentage)) { // Key story beats
        container.append('line')
          .attr('x1', xScale(beat.percentage))
          .attr('x2', xScale(beat.percentage))
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .attr('stroke', '#d1d5db')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-width', 1);

        container.append('text')
          .attr('x', xScale(beat.percentage))
          .attr('y', -5)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', '#6b7280')
          .text(beat.name);
      }
    });

    // Legend
    const legend = container.append('g')
      .attr('transform', `translate(${chartWidth + 20}, 20)`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text('Conflict Types');

    const legendItems = [
      { type: 'internal', label: 'Internal Conflicts', color: '#8b5cf6' },
      { type: 'external', label: 'External Conflicts', color: '#f97316' }
    ];

    legendItems.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${20 + i * 25})`);

      legendItem.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', item.color)
        .attr('stroke-width', 3);

      legendItem.append('text')
        .attr('x', 25)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '11px')
        .style('fill', '#374151')
        .text(item.label);
    });

  }, [conflicts, beats]);

  // Helper function to simulate conflict intensity progression
  function calculateConflictIntensity(conflict: Conflict, percentage: number): number {
    const baseIntensity = conflict.intensity || 5;
    
    if (conflict.type === 'internal') {
      // Internal conflicts often peak around midpoint and climax
      if (percentage < 20) return baseIntensity * 0.3;
      if (percentage < 50) return baseIntensity * 0.6;
      if (percentage < 75) return baseIntensity * 0.9;
      if (percentage < 85) return baseIntensity * 1.2;
      return baseIntensity * 0.4; // Resolution
    } else {
      // External conflicts escalate more linearly
      if (percentage < 10) return baseIntensity * 0.2;
      if (percentage < 25) return baseIntensity * 0.5;
      if (percentage < 50) return baseIntensity * 0.7;
      if (percentage < 75) return baseIntensity * 1.0;
      if (percentage < 90) return baseIntensity * 1.3;
      return baseIntensity * 0.3; // Resolution
    }
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Conflict Progression Analysis
      </h3>
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Track how internal and external conflicts escalate throughout your story
      </div>
    </div>
  );
};
