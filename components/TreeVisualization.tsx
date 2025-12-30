
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Person } from '../types';

interface TreeVisualizationProps {
  data: Person[];
  onSelectPerson: (id: string) => void;
  onAddRelation?: (parentId: string) => void;
  canEdit: boolean;
}

const VIRTUAL_ROOT_ID = 'VIRTUAL_ROOT_HIDDEN';

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({ 
  data, 
  onSelectPerson, 
  onAddRelation,
  canEdit 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Track expanded nodes.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const parentIds = new Set(data.map(p => p.parentId).filter(Boolean));

    const lineageSource = data.filter(p => {
      if (p.parentId || parentIds.has(p.id)) return true;
      if (!p.spouseId) return true;
      const spouse = data.find(s => s.id === p.spouseId);
      if (spouse) {
        if (spouse.parentId || parentIds.has(spouse.id)) return false;
        return p.id < spouse.id;
      }
      return true;
    });

    const workingLineage = lineageSource.map(p => ({ ...p }));
    const actualRoots = workingLineage.filter(p => !p.parentId);

    let stratifiedRoot: d3.HierarchyNode<Person>;
    const stratify = d3.stratify<Person>()
      .id(d => d.id)
      .parentId(d => d.parentId);

    try {
      if (actualRoots.length > 1) {
        workingLineage.push({
          id: VIRTUAL_ROOT_ID,
          parentId: undefined,
          name: 'Virtual Root',
          gender: 'Other',
          bio: '',
          mainImage: '',
          gallery: [],
          birthDate: ''
        } as Person);

        workingLineage.forEach(node => {
          if (!node.parentId && node.id !== VIRTUAL_ROOT_ID) {
            node.parentId = VIRTUAL_ROOT_ID;
          }
        });
      }
      
      stratifiedRoot = stratify(workingLineage);
    } catch (e) {
      console.error("Hierarchy error", e);
      return;
    }

    stratifiedRoot.descendants().forEach((d: any) => {
      if (d.id !== VIRTUAL_ROOT_ID && !expandedIds.has(d.id)) {
        d._children = d.children;
        d.children = null;
      }
    });

    const lineageIds = new Set(lineageSource.map(p => p.id));
    const spouses = data.filter(p => !lineageIds.has(p.id));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);

    // Increase horizontal spacing significantly to account for spouses
    const treeLayout = d3.tree<Person>().nodeSize([500, 260]);
    const treeData = treeLayout(stratifiedRoot);

    if (!svg.attr('data-initialized')) {
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 100).scale(0.6));
      svg.attr('data-initialized', 'true');
    }

    // Links
    g.selectAll('.link')
      .data(treeData.links().filter(l => l.source.id !== VIRTUAL_ROOT_ID))
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('d', d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y) as any);

    // Nodes
    const nodeGroups = g.selectAll('.node')
      .data(treeData.descendants().filter(d => d.id !== VIRTUAL_ROOT_ID))
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    const renderPersonNode = (selection: any, personData: Person, offsetX: number, isMainLineage: boolean, dNode: any) => {
      const isExpanded = expandedIds.has(personData.id);
      const spouseExists = !!personData.spouseId;
      const childrenExist = (dNode.children || dNode._children)?.length > 0;
      const canToggle = isMainLineage && (spouseExists || childrenExist);

      // Adjusted card size to better fit contents
      const cardWidth = 180;
      const cardHeight = 84;

      const personG = selection.append('g')
        .attr('transform', `translate(${offsetX}, 0)`)
        .attr('class', 'cursor-pointer group')
        .on('click', (event: any) => {
          event.stopPropagation();
          onSelectPerson(personData.id);
        });

      // Background Rect
      personG.append('rect')
        .attr('width', cardWidth)
        .attr('height', cardHeight)
        .attr('x', -cardWidth / 2)
        .attr('y', -cardHeight / 2)
        .attr('rx', 18)
        .attr('fill', 'white')
        .attr('stroke', isMainLineage && isExpanded ? '#4f46e5' : '#e2e8f0')
        .attr('stroke-width', 2)
        .attr('class', 'transition-all duration-300 group-hover:shadow-lg group-hover:stroke-indigo-400');

      // Avatar Group - shifted to stay inside the rect
      const imgG = personG.append('g').attr('transform', `translate(${-cardWidth/2 + 34}, 0)`);
      imgG.append('circle').attr('r', 28).attr('fill', '#f8fafc');
      
      const clipId = `clip-${personData.id.replace(/\W/g, '')}`;
      personG.append('clipPath').attr('id', clipId).append('circle').attr('r', 28);
      
      imgG.append('image')
        .attr('xlink:href', personData.mainImage)
        .attr('width', 56).attr('height', 56).attr('x', -28).attr('y', -28)
        .attr('clip-path', `url(#${clipId})`)
        .attr('preserveAspectRatio', 'xMidYMid slice');

      // Info Text - shifted right to avoid avatar
      personG.append('text')
        .attr('x', -cardWidth/2 + 70).attr('y', -5)
        .style('font-size', '14px').style('font-weight', '700').style('fill', '#1e293b')
        .text(personData.name.length > 14 ? personData.name.substring(0, 11) + '...' : personData.name);
      
      personG.append('text')
        .attr('x', -cardWidth/2 + 70).attr('y', 15)
        .style('font-size', '11px').style('fill', '#94a3b8').style('font-weight', '500')
        .text(`${personData.birthDate.split('-')[0]}${personData.deathDate ? ' - ' + personData.deathDate.split('-')[0] : ''}`);

      if (canToggle) {
        const toggleBtn = personG.append('g')
          .attr('transform', `translate(0, ${cardHeight/2})`)
          .attr('class', 'toggle-btn')
          .on('click', (event: any) => {
            event.stopPropagation();
            toggleExpand(personData.id);
          });

        toggleBtn.append('circle')
          .attr('r', 11)
          .attr('fill', 'white')
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 1.5);

        toggleBtn.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '4')
          .style('font-size', '15px')
          .style('font-weight', 'bold')
          .style('fill', '#64748b')
          .text(isExpanded ? '−' : '+');
      }

      if (canEdit && onAddRelation && isMainLineage) {
        const addBtn = personG.append('g')
          .attr('transform', `translate(${cardWidth/2 - 25}, ${cardHeight/2})`)
          .attr('class', 'opacity-0 group-hover:opacity-100 transition-opacity duration-300')
          .on('click', (event: any) => {
            event.stopPropagation();
            onAddRelation(personData.id);
          });
        addBtn.append('circle').attr('r', 10).attr('fill', '#4f46e5');
        addBtn.append('path').attr('d', 'M -4 0 L 4 0 M 0 -4 L 0 4').attr('stroke', 'white').attr('stroke-width', 1.5);
      }
    };

    nodeGroups.each(function(d: any) {
      const nodeSelection = d3.select(this);
      const mainPerson = d.data;
      const isExpanded = expandedIds.has(mainPerson.id);
      const spouse = spouses.find(s => s.spouseId === mainPerson.id);

      // Increased spouseOffset to 210 to ensure no overlap even with wider cards
      const spouseOffset = -210;

      if (spouse && isExpanded) {
        const linkLine = nodeSelection.append('g').attr('class', 'marriage-link');
        // Bridge lines between cards
        linkLine.append('line').attr('x1', -120).attr('x2', -90).attr('y1', -5).attr('y2', -5).attr('stroke', '#cbd5e1').attr('stroke-width', 2);
        linkLine.append('line').attr('x1', -120).attr('x2', -90).attr('y1', 5).attr('y2', 5).attr('stroke', '#cbd5e1').attr('stroke-width', 2);

        renderPersonNode(nodeSelection, mainPerson, 0, true, d);
        renderPersonNode(nodeSelection, spouse, spouseOffset, false, d);
      } else {
        renderPersonNode(nodeSelection, mainPerson, 0, true, d);
      }
    });

  }, [data, onSelectPerson, onAddRelation, canEdit, expandedIds]);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="absolute bottom-6 left-6 z-10 bg-white/80 backdrop-blur shadow-sm rounded-xl px-4 py-2 border border-slate-200 text-xs text-slate-500 font-medium space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>Parent lineage line points to blood descendant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full border border-slate-400 bg-white flex items-center justify-center text-[10px]">+</div>
          <span>Click to reveal spouse & branches</span>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full outline-none" />
    </div>
  );
};
