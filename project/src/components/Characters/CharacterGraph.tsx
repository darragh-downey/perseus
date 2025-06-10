import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useApp } from '../../contexts/hooks';
import { Character, Relationship } from '../../contexts/AppContext';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Settings,
  Download,
  Share,
  Filter,
  Eye,
  EyeOff,
  Layers,
  Target,
} from 'lucide-react';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  character: Character;
  radius: number;
  color: string;
  group?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  relationship: Relationship;
  strength: number;
  color: string;
  width: number;
}

export default function CharacterGraph() {
  const { state } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [graphSettings, setGraphSettings] = useState({
    showLabels: true,
    showRelationshipTypes: true,
    nodeSize: 'medium',
    linkStrength: 'medium',
    physics: 'medium',
    colorScheme: 'default',
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  const relationshipColors = {
    ally: '#10b981',
    friend: '#3b82f6',
    lover: '#ec4899',
    family: '#8b5cf6',
    enemy: '#ef4444',
    rival: '#f59e0b',
    mentor: '#06b6d4',
    neutral: '#6b7280',
    antagonist: '#dc2626',
    romantic: '#f472b6',
    sibling: '#a855f7',
    parent: '#7c3aed',
    child: '#8b5cf6',
  };

  const getRelationshipColor = (type: string): string => {
    const normalizedType = type.toLowerCase();
    return relationshipColors[normalizedType as keyof typeof relationshipColors] || relationshipColors.neutral;
  };

  const getCharacterColor = (character: Character): string => {
    if (character.color) return character.color;
    
    // Generate color based on character name hash
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
    let hash = 0;
    for (let i = 0; i < character.name.length; i++) {
      hash = character.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getNodeRadius = (character: Character): number => {
    const baseSize = graphSettings.nodeSize === 'small' ? 20 : graphSettings.nodeSize === 'large' ? 40 : 30;
    const relationshipCount = state.relationships.filter(r => r.from === character.id || r.to === character.id).length;
    return baseSize + Math.min(relationshipCount * 3, 15);
  };

  useEffect(() => {
    if (!svgRef.current || state.characters.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select('g.graph-container');
    
    // Clear previous content
    container.selectAll('*').remove();

    // Setup dimensions
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Create nodes
    const nodes: GraphNode[] = state.characters.map((character, index) => ({
      id: character.id,
      name: character.name,
      character,
      radius: getNodeRadius(character),
      color: getCharacterColor(character),
      group: index % 5, // Simple grouping for clustering
    }));

    // Create links
    const links: GraphLink[] = state.relationships.map(rel => {
      const source = nodes.find(n => n.id === rel.from);
      const target = nodes.find(n => n.id === rel.to);
      
      return {
        source: source!,
        target: target!,
        relationship: rel,
        strength: rel.strength / 100,
        color: getRelationshipColor(rel.type),
        width: 2 + (rel.strength / 100) * 4,
      };
    }).filter(link => link.source && link.target);

    // Create force simulation
    const forceStrength = graphSettings.physics === 'weak' ? 0.3 : graphSettings.physics === 'strong' ? 0.8 : 0.5;
    const linkDistance = graphSettings.linkStrength === 'short' ? 80 : graphSettings.linkStrength === 'long' ? 150 : 120;

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(d => linkDistance + (1 - d.strength) * 50)
        .strength(d => d.strength * forceStrength)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.radius + 15))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

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

    // Create gradient definitions for links
    const defs = container.append('defs');
    links.forEach((link, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', (link.source as GraphNode).color)
        .attr('stop-opacity', 0.8);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (link.target as GraphNode).color)
        .attr('stop-opacity', 0.8);
    });

    // Create links
    const linkGroup = container.append('g').attr('class', 'links');
    const link = linkGroup.selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => d.width)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-dasharray', d => d.relationship.type === 'enemy' ? '5,5' : null);

    // Create link labels
    const linkLabelGroup = container.append('g').attr('class', 'link-labels');
    const linkLabel = linkLabelGroup.selectAll('text')
      .data(links)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .attr('stroke', 'white')
      .attr('stroke-width', '2')
      .attr('paint-order', 'stroke')
      .attr('pointer-events', 'none')
      .style('opacity', graphSettings.showRelationshipTypes ? 1 : 0)
      .text(d => d.relationship.type);

    // Create nodes
    const nodeGroup = container.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
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
      .attr('stroke-width', 3)
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .on('click', (event, d) => {
        setSelectedNode(selectedNode?.id === d.id ? null : d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.2)
          .attr('stroke-width', 4);
        
        // Highlight connected links
        link
          .transition()
          .duration(200)
          .attr('stroke-opacity', l => 
            (l.source as GraphNode).id === d.id || (l.target as GraphNode).id === d.id ? 1 : 0.2
          );
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius)
          .attr('stroke-width', 3);
        
        // Reset link opacity
        link
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.7);
      });

    // Add text to nodes
    if (graphSettings.showLabels) {
      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', d => Math.max(10, d.radius / 3))
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .attr('stroke', 'rgba(0,0,0,0.3)')
        .attr('stroke-width', '1')
        .attr('paint-order', 'stroke')
        .attr('pointer-events', 'none')
        .text(d => {
          const maxLength = Math.floor(d.radius / 4);
          return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
        });
    }

    // Add relationship strength indicators
    const strengthGroup = container.append('g').attr('class', 'strength-indicators');
    links.forEach((link, i) => {
      if (link.relationship.strength > 80) {
        strengthGroup.append('circle')
          .datum(link)
          .attr('r', 3)
          .attr('fill', link.color)
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
          .attr('opacity', 0.8);
      }
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      linkLabel
        .attr('x', d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);

      strengthGroup.selectAll('circle')
        .attr('cx', (d: any) => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('cy', (d: any) => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);
    });

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [state.characters, state.relationships, selectedNode, graphSettings]);

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

  const handleExportGraph = () => {
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
      link.download = 'character-graph.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (state.characters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center max-w-md">
          <div className="text-gray-400 dark:text-gray-500 mb-6">
            <svg className="w-20 h-20 mx-auto\" fill="none\" stroke="currentColor\" viewBox="0 0 24 24">
              <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No Characters Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Create characters and define their relationships to see them visualized in this interactive graph. 
            Watch your story world come to life!
          </p>
          <div className="space-y-3">
            <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Create Your First Character
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Characters will appear as nodes, relationships as connections
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
            title="Reset Graph"
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
            title="Graph Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleExportGraph}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Export Graph"
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
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Graph Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={graphSettings.showLabels}
                  onChange={(e) => setGraphSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show character names</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={graphSettings.showRelationshipTypes}
                  onChange={(e) => setGraphSettings(prev => ({ ...prev, showRelationshipTypes: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show relationship types</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Node Size
              </label>
              <select
                value={graphSettings.nodeSize}
                onChange={(e) => setGraphSettings(prev => ({ ...prev, nodeSize: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Physics Strength
              </label>
              <select
                value={graphSettings.physics}
                onChange={(e) => setGraphSettings(prev => ({ ...prev, physics: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weak">Weak</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Graph */}
      <svg
        ref={svgRef}
        className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g className="graph-container"></g>
      </svg>

      {/* Character Details Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: selectedNode.character.color || selectedNode.color }}
              >
                {selectedNode.character.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedNode.character.name}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {state.relationships.filter(r => r.from === selectedNode.id || r.to === selectedNode.id).length} relationships
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
          
          {selectedNode.character.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {selectedNode.character.description}
            </p>
          )}
          
          {Object.keys(selectedNode.character.traits).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Traits</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedNode.character.traits).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Relationships */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Relationships</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {state.relationships
                .filter(rel => rel.from === selectedNode.id || rel.to === selectedNode.id)
                .map(rel => {
                  const otherCharacterId = rel.from === selectedNode.id ? rel.to : rel.from;
                  const otherCharacter = state.characters.find(c => c.id === otherCharacterId);
                  
                  return (
                    <div
                      key={rel.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: getCharacterColor(otherCharacter!) }}
                        >
                          {otherCharacter?.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {otherCharacter?.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="px-2 py-1 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: getRelationshipColor(rel.type) }}
                        >
                          {rel.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {rel.strength}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Relationship Types</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(relationshipColors).slice(0, 8).map(([type, color]) => (
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