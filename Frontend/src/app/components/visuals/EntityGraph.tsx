import { useEffect, useRef, useState } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Link {
  source: string;
  target: string;
}

interface EntityGraphProps {
  entities: string[];
  width?: number;
  height?: number;
}

export function EntityGraph({ entities, width = 600, height = 400 }: EntityGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  // Initialize simulation
  useEffect(() => {
    if (!entities.length) return;

    // Create central node for the story concept
    const centerNode: Node = {
      id: 'Main Topic',
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      radius: 30,
      color: '#d4af37', // Gold
    };

    // Create nodes for entities
    const entityNodes: Node[] = entities.map((entity, i) => {
      const angle = (i / entities.length) * 2 * Math.PI;
      const distance = 100 + Math.random() * 50;
      return {
        id: entity,
        x: width / 2 + Math.cos(angle) * distance,
        y: height / 2 + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        radius: 20,
        color: '#2c3e50', // Dark Blue
      };
    });

    const newNodes = [centerNode, ...entityNodes];
    
    // Create links from center to all entities
    const newLinks: Link[] = entityNodes.map(node => ({
        source: centerNode.id,
        target: node.id
    }));

    // Create random links between entities to simulate complexity
    for (let i = 0; i < entityNodes.length; i++) {
        if (Math.random() > 0.7) {
            const targetIndex = Math.floor(Math.random() * entityNodes.length);
            if (targetIndex !== i) {
                newLinks.push({
                    source: entityNodes[i].id,
                    target: entityNodes[targetIndex].id
                });
            }
        }
    }

    setNodes(newNodes);
    setLinks(newLinks);
  }, [entities, width, height]);

  // Simulation Loop
  useEffect(() => {
    if (!nodes.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Physics constants
      const repulsion = 500;
      const springLength = 100;
      const springStrength = 0.05;
      const damping = 0.9;
      const centerForce = 0.01;

      // Update velocities
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Repulsion between nodes
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (distance * distance);
          node.vx += (dx / distance) * force;
          node.vy += (dy / distance) * force;
        }

        // Attraction to center
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        node.vx += dx * centerForce;
        node.vy += dy * centerForce;
      }

      // Spring forces for links
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (distance - springLength) * springStrength;
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // Update positions and draw
      // Draw links first
      ctx.strokeStyle = '#e5e3df';
      ctx.lineWidth = 1;
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        // Apply velocity
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#2c3e50';
        ctx.font = '10px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Wrap text if too long
        const label = node.id.length > 15 ? node.id.substring(0, 12) + '...' : node.id;
        ctx.fillText(label, node.x, node.y + node.radius + 12);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, links, width, height]);

  return (
    <div className="border border-[#e5e3df] rounded-xl bg-[#faf9f6]/50 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center p-4">
      <h3 className="text-sm font-serif text-[#6b7280] uppercase tracking-wider mb-2">Entity Relationship Graph</h3>
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="max-w-full h-auto"
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}
