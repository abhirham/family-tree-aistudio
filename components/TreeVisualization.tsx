
import React, { useEffect, useRef, useState } from 'react';
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Helper to find all descendants of a node to ensure deep collapse
  const getAllDescendantIds = (parentId: string, allPeople: Person[]): string[] => {
    const children = allPeople.filter(p => p.parentId === parentId);
    let descendants: string[] = children.map(c => c.id);
    children.forEach(c => {
      descendants = [...descendants, ...getAllDescendantIds(c.id, allPeople)];
    });
    return descendants;
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Collapsing: remove the node and ALL its descendants from the expanded set
        const descendants = getAllDescendantIds(id, data);
        next.delete(id);
        descendants.forEach(dId => next.delete(dId));
      } else {
        // Expanding: just add the node
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
    let g = svg.select<SVGGElement>('g.main-container');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'main-container');
    }

    const currentTransform = d3.zoomTransform(svgRef.current as any);
    g.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);
    g.attr('transform', currentTransform.toString());

    // Compact layout settings
    const treeLayout = d3.tree<Person>().nodeSize([280, 160]);
    const treeData = treeLayout(stratifiedRoot);

    if (!svg.attr('data-initialized')) {
      const initialTransform = d3.zoomIdentity.translate(width / 2, 80).scale(0.8);
      svg.call(zoom.transform, initialTransform);
      g.attr('transform', initialTransform.toString());
      svg.attr('data-initialized', 'true');
    }

    // Links
    g.selectAll('.link')
      .data(treeData.links().filter(l => l.source.id !== VIRTUAL_ROOT_ID))
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5)
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

      const cardWidth = 140;
      const cardHeight = 54;
      const avatarSize = 36;
      const avatarRadius = avatarSize / 2;

      const personG = selection.append('g')
        .attr('transform', `translate(${offsetX}, 0)`)
        .attr('class', 'cursor-pointer group')
        .on('click', (event: any) => {
          event.stopPropagation();
          onSelectPerson(personData.id);
        });

      personG.append('rect')
        .attr('width', cardWidth)
        .attr('height', cardHeight)
        .attr('x', -cardWidth / 2)
        .attr('y', -cardHeight / 2)
        .attr('rx', 12)
        .attr('fill', 'white')
        .attr('stroke', isMainLineage && isExpanded ? '#4f46e5' : '#e2e8f0')
        .attr('stroke-width', 1.5)
        .attr('class', 'transition-all duration-300 group-hover:shadow-md group-hover:stroke-indigo-400');

      const imgG = personG.append('g').attr('transform', `translate(${-cardWidth/2 + avatarRadius + 8}, 0)`);
      imgG.append('circle').attr('r', avatarRadius).attr('fill', '#f8fafc');
      
      const clipId = `clip-${personData.id.replace(/\W/g, '')}`;
      personG.append('clipPath').attr('id', clipId).append('circle').attr('r', avatarRadius);
      
      imgG.append('image')
        .attr('xlink:href', personData.mainImage)
        .attr('width', avatarSize).attr('height', avatarSize).attr('x', -avatarRadius).attr('y', -avatarRadius)
        .attr('clip-path', `url(#${clipId})`)
        .attr('preserveAspectRatio', 'xMidYMid slice');

      personG.append('text')
        .attr('x', -cardWidth/2 + 54).attr('y', -2)
        .style('font-size', '12px').style('font-weight', '700').style('fill', '#1e293b')
        .text(personData.name.length > 12 ? personData.name.substring(0, 9) + '...' : personData.name);
      
      personG.append('text')
        .attr('x', -cardWidth/2 + 54).attr('y', 14)
        .style('font-size', '10px').style('fill', '#94a3b8').style('font-weight', '500')
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
          .attr('r', 8)
          .attr('fill', 'white')
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 1);

        toggleBtn.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '3')
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .style('fill', '#64748b')
          .text(isExpanded ? '−' : '+');
      }

      if (canEdit && onAddRelation && isMainLineage) {
        const addBtn = personG.append('g')
          .attr('transform', `translate(${cardWidth/2 - 12}, ${cardHeight/2})`)
          .attr('class', 'opacity-0 group-hover:opacity-100 transition-opacity duration-300')
          .on('click', (event: any) => {
            event.stopPropagation();
            onAddRelation(personData.id);
          });
        addBtn.append('circle').attr('r', 8).attr('fill', '#4f46e5');
        addBtn.append('path').attr('d', 'M -3 0 L 3 0 M 0 -3 L 0 3').attr('stroke', 'white').attr('stroke-width', 1.2);
      }
    };

    nodeGroups.each(function(d: any) {
      const nodeSelection = d3.select(this);
      const mainPerson = d.data;
      const isExpanded = expandedIds.has(mainPerson.id);
      const spouse = spouses.find(s => s.spouseId === mainPerson.id);

      const spouseOffset = -155;

      if (spouse && isExpanded) {
        const linkLine = nodeSelection.append('g').attr('class', 'marriage-link');
        linkLine.append('line').attr('x1', -85).attr('x2', -70).attr('y1', -3).attr('y2', -3).attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);
        linkLine.append('line').attr('x1', -85).attr('x2', -70).attr('y1', 3).attr('y2', 3).attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);

        renderPersonNode(nodeSelection, mainPerson, 0, true, d);
        renderPersonNode(nodeSelection, spouse, spouseOffset, false, d);
      } else {
        renderPersonNode(nodeSelection, mainPerson, 0, true, d);
      }
    });

  }, [data, onSelectPerson, onAddRelation, canEdit, expandedIds]);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur shadow-sm rounded-lg px-3 py-1.5 border border-slate-200 text-[10px] text-slate-500 font-medium space-y-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          <span>Lineage points to blood descendant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full border border-slate-400 bg-white flex items-center justify-center text-[8px]">+</div>
          <span>Toggle spouse & branches</span>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full outline-none" />
    </div>
  );
};
