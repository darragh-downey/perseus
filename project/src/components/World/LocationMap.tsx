import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useApp } from '../../contexts/hooks';
import { Location } from '../../contexts/AppContext';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Settings,
  Download,
  MapPin,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';

interface MapNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  location: Location;
  radius: number;
  color: string;
}

interface MapLink extends d3.SimulationLinkDatum<MapNode> {
  source: MapNode;
  target: MapNode;
  distance: number;
}

export default function LocationMap() {
  const { state } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mapSettings, setMapSettings] = useState({
    showLabels: true,
    showConnections: true,
    nodeSize: 'medium',
    showGrid: true,
    colorByType: true,
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const simulationRef = useRef<d3.Simulation<MapNode, MapLink> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  const locationTypeColors = {
    city: '#3b82f6',
    building: '#10b981',
    region: '#f59e0b',
    landmark: '#ef4444',
    natural: '#84cc16',
    other: '#6b7280',
  };

  const getLocationColor = (location: Location): string => {
    if (location.color) return location.color;
    if (mapSettings.colorByType) {
      return locationTypeColors[location.type] || locationTypeColors.other;
    }
    return '#3b82f6';
  };

  const getNodeRadius = (location: Location): number => {
    const baseSize = mapSettings.nodeSize === 'small' ? 15 : mapSettings.nodeSize === 'large' ? 30 : 20;
    const connectionCount = location.connections.length;
    return baseSize + Math.min(connectionCount * 2, 10);
  };

  useEffect(() => {
    if (!svgRef.current || state.locations.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select('g.map-container');
    
    // Clear previous content
    container.selectAll('*').remove();

    // Setup dimensions
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Create nodes
    const nodes: MapNode[] = state.locations.map((location) => ({
      id: location.id,
      name: location.name,
      location,
      radius: getNodeRadius(location),
      color: getLocationColor(location),
      x: location.coordinates?.x || Math.random() * width,
      y: location.coordinates?.y || Math.random() * height,
    }));

    // Create links based on connections
    const links: MapLink[] = [];
    state.locations.forEach(location => {
      location.connections.forEach(connectionId => {
        const sourceNode = nodes.find(n => n.id === location.id);
        const targetNode = nodes.find(n => n.id === connectionId);
        
        if (sourceNode && targetNode) {
          // Avoid duplicate links
          const existingLink = links.find(l => 
            (l.source === sourceNode && l.target === targetNode) ||
            (l.source === targetNode && l.target === sourceNode)
          );
          
          if (!existingLink) {
            links.push({
              source: sourceNode,
              target: targetNode,
              distance: 100,
            });
          }
        }
      });
    });

    // Create force simulation
    const simulation = d3.forceSimulation<MapNode>(nodes)
      .force('link', d3.forceLink<MapNode, MapLink>(links)
        .id(d => d.id)
        .distance(d => d.distance)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.radius + 10))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    simulationRef.current = simulation;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        setZoomLevel(event.transform.k);
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Apply current transform
    svg.call(zoom.transform, transformRef.current);

    // Add grid pattern
    if (mapSettings.showGrid) {
      const defs = container.append('defs');
      const pattern = defs.append('pattern')
        .attr('id', 'grid')
        .attr('width', 50)
        .attr('height', 50)
        .attr('patternUnits', 'userSpaceOnUse');
      
      pattern.append('path')
        .attr('d', 'M 50 0 L 0 0 0 50')
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.3);

      container.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'url(#grid)');
    }

    // Create links
    if (mapSettings.showConnections) {
      const linkGroup = container.append('g').attr('class', 'links');
      const link = linkGroup.selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', '5,5');

      // Update link positions
      simulation.on('tick.links', () => {
        link
          .attr('x1', d => d.source.x!)
          .attr('y1', d => d.source.y!)
          .attr('x2', d => d.target.x!)
          .attr('y2', d => d.target.y!);
      });
    }

    // Create nodes
    const nodeGroup = container.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, MapNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .on('click', (event, d) => {
        setSelectedNode(selectedNode?.id === d.id ? null : d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.2)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius)
          .attr('stroke-width', 2);
      });

    // Add icons to nodes
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => Math.max(8, d.radius / 2))
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text('📍');

    // Add labels to nodes
    if (mapSettings.showLabels) {
      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', d => d.radius + 15)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .attr('stroke', 'white')
        .attr('stroke-width', '2')
        .attr('paint-order', 'stroke')
        .attr('pointer-events', 'none')
        .text(d => d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name);
    }

    // Update positions on tick
    simulation.on('tick', () => {
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [state.locations, selectedNode, mapSettings]);

  const handleReset = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
    setSelectedNode(null);
    
    // Reset zoom
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(750)
      .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
    transformRef.current = d3.zoomIdentity;
    setZoomLevel(1);
  };

  const handleZoom = (factor: number) => {
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(200)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, factor);
  };

  const handleExportMap = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = 'world-map.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (state.locations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center max-w-md">
          <div className="text-gray-400 dark:text-gray-500 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No Locations Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Create locations and connect them to build an interactive map of your story world. 
            Watch your fictional geography come to life!
          </p>
          <div className="space-y-3">
            <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
              Create Your First Location
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Locations will appear as interactive nodes on the map
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-1 flex items-center space-x-1">
          <button
            onClick={handleReset}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Reset Map"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600"></div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded transition-colors ${
              showSettings
                ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Map Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleExportMap}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Export Map"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm px-3 py-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-10 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Map Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={mapSettings.showLabels}
                  onChange={(e) => setMapSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show location names</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={mapSettings.showConnections}
                  onChange={(e) => setMapSettings(prev => ({ ...prev, showConnections: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show connections</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={mapSettings.showGrid}
                  onChange={(e) => setMapSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show grid</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={mapSettings.colorByType}
                  onChange={(e) => setMapSettings(prev => ({ ...prev, colorByType: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Color by type</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Node Size
              </label>
              <select
                value={mapSettings.nodeSize}
                onChange={(e) => setMapSettings(prev => ({ ...prev, nodeSize: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <svg
        ref={svgRef}
        className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800"
      >
        <g className="map-container"></g>
      </svg>

      {/* Location Details Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: selectedNode.color }}
              >
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedNode.location.name}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {selectedNode.location.type} • {selectedNode.location.connections.length} connections
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded"
            >
              ×
            </button>
          </div>
          
          {selectedNode.location.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {selectedNode.location.description}
            </p>
          )}
          
          {Object.keys(selectedNode.location.properties).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Properties</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedNode.location.properties).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full font-medium"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Connected Locations */}
          {selectedNode.location.connections.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Connected Locations</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedNode.location.connections.map(connectionId => {
                  const connectedLocation = state.locations.find(l => l.id === connectionId);
                  
                  return connectedLocation ? (
                    <div
                      key={connectionId}
                      className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: getLocationColor(connectedLocation) }}
                      >
                        <MapPin className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {connectedLocation.name}
                      </span>
                      <span className="text-xs text-gray-400 capitalize ml-auto">
                        {connectedLocation.type}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Location Types</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(locationTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600 dark:text-gray-400 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}