import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Beat } from '../../../contexts/AppContext';

interface BeatTimelineProps {
  beats: Beat[];
  targetWordCount: number;
  onBeatClick?: (beat: Beat) => void;
}

export const BeatTimeline: React.FC<BeatTimelineProps> = ({ 
  beats, 
  targetWordCount, 
  onBeatClick 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || beats.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const container = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(beats, d => d.wordCount || 0) || targetWordCount])
      .range([height, 0]);

    // Color scale for acts
    const getActColor = (percentage: number) => {
      if (percentage <= 20) return '#3b82f6'; // Blue for Act I
      if (percentage <= 80) return '#10b981'; // Green for Act II
      return '#ef4444'; // Red for Act III
    };

    // Add axes
    container.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}%`));

    container.append('g')
      .call(d3.axisLeft(yScale));

    // Add axis labels
    container.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Word Count');

    container.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Story Progress (%)');

    // Create line generator
    const line = d3.line<Beat>()
      .x(d => xScale(d.percentage))
      .y(d => yScale(d.wordCount || 0))
      .curve(d3.curveCatmullRom);

    // Add the line
    container.append('path')
      .datum(beats)
      .attr('fill', 'none')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add beat points
    const beatPoints = container.selectAll('.beat-point')
      .data(beats)
      .enter()
      .append('g')
      .attr('class', 'beat-point')
      .attr('transform', d => `translate(${xScale(d.percentage)}, ${yScale(d.wordCount || 0)})`);

    beatPoints.append('circle')
      .attr('r', 6)
      .attr('fill', d => d.isCompleted ? getActColor(d.percentage) : '#e5e7eb')
      .attr('stroke', d => getActColor(d.percentage))
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
          <div><strong>${d.name}</strong></div>
          <div>${d.percentage}% - ${(d.wordCount || 0).toLocaleString()} words</div>
          <div>${d.description}</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');

        d3.select(this).transition().duration(200).attr('r', 8);
      })
      .on('mouseout', function() {
        d3.selectAll('.tooltip').remove();
        d3.select(this).transition().duration(200).attr('r', 6);
      })
      .on('click', (event, d) => {
        if (onBeatClick) onBeatClick(d);
      });

    // Add beat labels
    beatPoints.append('text')
      .attr('dy', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#374151')
      .style('font-weight', 'bold')
      .text(d => d.name);

    // Add act dividers
    const actDividers = [20, 80];
    actDividers.forEach(percentage => {
      container.append('line')
        .attr('x1', xScale(percentage))
        .attr('x2', xScale(percentage))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#d1d5db')
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-width', 1);
    });

    // Add act labels
    const acts = [
      { label: 'Act I', x: 10, color: '#3b82f6' },
      { label: 'Act II', x: 50, color: '#10b981' },
      { label: 'Act III', x: 90, color: '#ef4444' }
    ];

    acts.forEach(act => {
      container.append('text')
        .attr('x', xScale(act.x))
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', act.color)
        .text(act.label);
    });

  }, [beats, targetWordCount, onBeatClick]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Story Timeline Visualization
      </h3>
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Click on beats to edit • Completed beats are filled • Line shows cumulative word count
      </div>
    </div>
  );
};
