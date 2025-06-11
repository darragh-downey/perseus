import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CharacterArcPoint } from '../../../contexts/AppContext';

interface RadarChartProps {
  data: CharacterArcPoint[];
  dimensions: string[];
  characterName: string;
  beatNames: string[];
}

export const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  dimensions, 
  characterName, 
  beatNames 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 400;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Number of dimensions
    const numDimensions = dimensions.length;
    const angleSlice = (Math.PI * 2) / numDimensions;

    // Scale for radius
    const rScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, radius]);

    // Create circular grid
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      
      container.append('circle')
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);

      if (level === levels) {
        container.append('text')
          .attr('x', 4)
          .attr('y', -levelRadius + 4)
          .style('font-size', '10px')
          .style('fill', '#6b7280')
          .text('10');
      }
    }

    // Create axes
    dimensions.forEach((dimension, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const lineCoordinate = rScale(10);
      const x = Math.cos(angle) * lineCoordinate;
      const y = Math.sin(angle) * lineCoordinate;

      // Axis line
      container.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 1);

      // Axis label
      const labelRadius = lineCoordinate + 20;
      const labelX = Math.cos(angle) * labelRadius;
      const labelY = Math.sin(angle) * labelRadius;

      container.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#374151')
        .text(dimension);
    });

    // Color scale for different beats
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create line generator
    const lineGenerator = d3.lineRadial<{ dimension: string; value: number }>()
      .angle((d, i) => angleSlice * i)
      .radius(d => rScale(d.value))
      .curve(d3.curveLinearClosed);

    // Draw radar charts for each beat
    data.forEach((arcPoint, beatIndex) => {
      const beatData = dimensions.map(dimension => ({
        dimension,
        value: arcPoint.emotionalState[dimension] || 0
      }));

      const beatColor = colorScale(beatIndex.toString());

      // Area
      container.append('path')
        .datum(beatData)
        .attr('d', lineGenerator)
        .attr('fill', beatColor)
        .attr('fill-opacity', 0.1)
        .attr('stroke', beatColor)
        .attr('stroke-width', 2);

      // Points
      container.selectAll(`.point-${beatIndex}`)
        .data(beatData)
        .enter()
        .append('circle')
        .attr('class', `point-${beatIndex}`)
        .attr('cx', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          return Math.cos(angle) * rScale(d.value);
        })
        .attr('cy', (d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          return Math.sin(angle) * rScale(d.value);
        })
        .attr('r', 4)
        .attr('fill', beatColor)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
          // Tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('padding', '8px')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0);

          tooltip.transition().duration(200).style('opacity', 1);
          tooltip.html(`
            <div><strong>${beatNames[beatIndex]}</strong></div>
            <div>${d.dimension}: ${d.value}/10</div>
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

    // Legend
    const legend = container.append('g')
      .attr('transform', `translate(${-radius - 80}, ${-radius})`);

    beatNames.forEach((beatName, i) => {
      if (i < data.length) {
        const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${i * 20})`);

        legendItem.append('circle')
          .attr('r', 6)
          .attr('fill', colorScale(i.toString()));

        legendItem.append('text')
          .attr('x', 15)
          .attr('y', 0)
          .attr('dy', '0.35em')
          .style('font-size', '12px')
          .style('fill', '#374151')
          .text(beatName);
      }
    });

  }, [data, dimensions, characterName, beatNames]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {characterName} - Emotional Arc Radar Chart
      </h3>
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Each colored area shows emotional state at different story beats
      </div>
    </div>
  );
};
