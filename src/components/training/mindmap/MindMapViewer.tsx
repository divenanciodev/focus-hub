import { useState, useRef, useEffect, useCallback } from 'react';
import { MindMap, MindMapNode } from '@/types/training';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MindMapViewerProps {
  mindMap: MindMap;
  onClose: () => void;
}

interface PositionedNode extends MindMapNode {
  x: number;
  y: number;
  children: PositionedNode[];
}

// Color palette for different node levels/types
const getNodeColor = (color: string, tipo?: string): { bg: string; border: string; text: string } => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    '#8b5cf6': { bg: 'hsl(var(--primary))', border: 'hsl(var(--primary))', text: 'hsl(var(--primary-foreground))' },
    '#3b82f6': { bg: 'hsl(221 83% 53%)', border: 'hsl(221 83% 43%)', text: 'white' },
    '#06b6d4': { bg: 'hsl(186 85% 50%)', border: 'hsl(186 85% 40%)', text: 'white' },
    '#10b981': { bg: 'hsl(160 84% 39%)', border: 'hsl(160 84% 29%)', text: 'white' },
    '#f59e0b': { bg: 'hsl(38 92% 50%)', border: 'hsl(38 92% 40%)', text: 'white' },
    '#6366f1': { bg: 'hsl(239 84% 67%)', border: 'hsl(239 84% 57%)', text: 'white' },
    '#ec4899': { bg: 'hsl(330 81% 60%)', border: 'hsl(330 81% 50%)', text: 'white' },
    '#6b7280': { bg: 'hsl(var(--muted))', border: 'hsl(var(--border))', text: 'hsl(var(--muted-foreground))' },
  };
  return colors[color] || colors['#6b7280'];
};

// Build tree structure from flat nodes
function buildTree(nodes: MindMapNode[]): PositionedNode | null {
  if (nodes.length === 0) return null;
  
  const nodeMap = new Map<string, PositionedNode>();
  
  // Initialize all nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });
  
  let root: PositionedNode | null = null;
  
  // Build parent-child relationships
  nodes.forEach(node => {
    const posNode = nodeMap.get(node.id)!;
    if (!node.parentId) {
      root = posNode;
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(posNode);
      }
    }
  });
  
  return root;
}

// Calculate positions for nodes in a radial layout
function calculatePositions(
  node: PositionedNode,
  x: number,
  y: number,
  angle: number,
  angleSpread: number,
  level: number,
  horizontalSpacing: number,
  verticalSpacing: number
): void {
  node.x = x;
  node.y = y;
  
  if (node.children.length === 0) return;
  
  const childAngleSpread = angleSpread / node.children.length;
  let currentAngle = angle - angleSpread / 2 + childAngleSpread / 2;
  
  node.children.forEach((child, index) => {
    // Use horizontal layout for level 1, then radial
    let childX: number, childY: number;
    
    if (level === 0) {
      // First level children spread horizontally
      const totalWidth = (node.children.length - 1) * horizontalSpacing;
      childX = x - totalWidth / 2 + index * horizontalSpacing;
      childY = y + verticalSpacing;
    } else {
      // Subsequent levels spread outward
      const distance = verticalSpacing * 0.8;
      childX = x + Math.cos(currentAngle) * distance;
      childY = y + Math.sin(currentAngle) * distance + verticalSpacing * 0.5;
    }
    
    calculatePositions(
      child,
      childX,
      childY,
      currentAngle,
      childAngleSpread,
      level + 1,
      horizontalSpacing * 0.7,
      verticalSpacing * 0.8
    );
    
    currentAngle += childAngleSpread;
  });
}

// Render curved connection lines
function renderConnections(
  node: PositionedNode,
  parentX?: number,
  parentY?: number
): JSX.Element[] {
  const connections: JSX.Element[] = [];
  
  if (parentX !== undefined && parentY !== undefined) {
    const midX = (parentX + node.x) / 2;
    const midY = parentY + (node.y - parentY) * 0.3;
    
    connections.push(
      <path
        key={`line-${node.id}`}
        d={`M ${parentX} ${parentY} Q ${midX} ${midY} ${node.x} ${node.y}`}
        fill="none"
        stroke="hsl(var(--primary) / 0.4)"
        strokeWidth="2"
        className="transition-all duration-300"
      />
    );
  }
  
  node.children.forEach(child => {
    connections.push(...renderConnections(child, node.x, node.y));
  });
  
  return connections;
}

// Render nodes recursively
function renderNodes(
  node: PositionedNode,
  level: number = 0
): JSX.Element[] {
  const elements: JSX.Element[] = [];
  const colors = getNodeColor(node.color);
  
  // Node sizing based on level
  const isRoot = level === 0;
  const isPrimary = level === 1;
  const width = isRoot ? 180 : isPrimary ? 140 : 120;
  const height = isRoot ? 60 : isPrimary ? 45 : 35;
  const fontSize = isRoot ? 14 : isPrimary ? 12 : 11;
  const borderRadius = isRoot ? 30 : isPrimary ? 20 : 15;
  
  elements.push(
    <g key={`node-${node.id}`} className="cursor-pointer">
      {/* Node shape */}
      <rect
        x={node.x - width / 2}
        y={node.y - height / 2}
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth={isRoot ? 3 : 2}
        className="transition-all duration-300 hover:opacity-90"
        filter={isRoot ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : undefined}
      />
      {/* Node text */}
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={fontSize}
        fontWeight={isRoot ? 600 : isPrimary ? 500 : 400}
        className="pointer-events-none select-none"
      >
        {node.text.length > 20 ? node.text.substring(0, 18) + '...' : node.text}
      </text>
    </g>
  );
  
  node.children.forEach(child => {
    elements.push(...renderNodes(child, level + 1));
  });
  
  return elements;
}

export function MindMapViewer({ mindMap, onClose }: MindMapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Build and position the tree
  const tree = buildTree(mindMap.nodes);
  
  useEffect(() => {
    if (tree && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Position root at top center
      calculatePositions(
        tree,
        containerWidth / 2,
        80,
        Math.PI / 2,
        Math.PI,
        0,
        200,
        120
      );
      
      // Center the view
      setPan({ x: 0, y: 0 });
    }
  }, [mindMap.nodes]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  if (!tree) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Mapa mental vazio</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="font-semibold text-foreground text-lg">{mindMap.name}</h1>
            <p className="text-sm text-muted-foreground">
              {mindMap.discipline || 'Geral'} • {mindMap.nodes.length} nós
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetView}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Mind Map Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          className="transition-transform duration-100"
        >
          {/* Connections */}
          <g className="connections">
            {renderConnections(tree)}
          </g>
          
          {/* Nodes */}
          <g className="nodes">
            {renderNodes(tree)}
          </g>
        </svg>
      </div>
    </div>
  );
}