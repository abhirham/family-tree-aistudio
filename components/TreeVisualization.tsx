
import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Identify all IDs that are currently acting as parents
    const parentIds = new Set(data.map(p => p.parentId).filter(Boolean));

    /**
     * Determine lineage anchors for D3 stratification.
     */
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

    // Create a working copy to avoid mutating props
    const workingLineage = lineageSource.map(p => ({ ...p }));
    const actualRoots = workingLineage.filter(p => !p.parentId);

    let stratifiedRoot;
    const stratify = d3.stratify<Person>()
      .id(d => d.id)
      .parentId(d => d.parentId);

    try {
      if (actualRoots.length > 1) {
        // Multiple roots detected. Inject a virtual parent to satisfy D3 requirements.
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

        // Point all real roots to the virtual one
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

    /**
     * Tree layout configuration:
     * - Horizontal (x): 400px provides a nice buffer between branches.
     * - Vertical (y): 220px is enough for clear lineage lines without being sparse.
     */
    const treeLayout = d3.tree<Person>().nodeSize([400, 220]);
    const treeData = treeLayout(stratifiedRoot);

    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 100).scale(0.6));

    // Render Links (Lineage) - Hide links from virtual root
    g.selectAll('.link')
      .data(treeData.links().filter(l => l.source.id !== VIRTUAL_ROOT_ID))
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('d', d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y) as any);

    // Render Nodes - Hide virtual root node
    const nodeGroups = g.selectAll('.node')
      .data(treeData.descendants().filter(d => d.id !== VIRTUAL_ROOT_ID))
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    const renderPersonNode = (selection: any, personData: Person, offsetX: number) => {
      const personG = selection.append('g')
        .attr('transform', `translate(${offsetX}, 0)`)
        .attr('class', 'cursor-pointer group')
        .on('click', (event: any) => {
          event.stopPropagation();
          onSelectPerson(personData.id);
        });

      // Card Shadow/Background
      personG.append('rect')
        .attr('width', 160)
        .attr('height', 80)
        .attr('x', -80)
        .attr('y', -40)
        .attr('rx', 16)
        .attr('fill', 'white')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 2)
        .attr('class', 'transition-all duration-300 group-hover:shadow-lg group-hover:stroke-indigo-400');

      // Profile Image
      const imgG = personG.append('g').attr('transform', 'translate(-70, 0)');
      imgG.append('circle').attr('r', 28).attr('fill', '#f8fafc');
      
      const clipId = `clip-${personData.id.replace(/\W/g, '')}`;
      personG.append('clipPath').attr('id', clipId).append('circle').attr('r', 28);
      
      imgG.append('image')
        .attr('xlink:href', personData.mainImage)
        .attr('width', 56).attr('height', 56).attr('x', -28).attr('y', -28)
        .attr('clip-path', `url(#${clipId})`)
        .attr('preserveAspectRatio', 'xMidYMid slice');

      // Name & Date
      personG.append('text')
        .attr('x', -32).attr('y', -5)
        .style('font-size', '14px').style('font-weight', '700').style('fill', '#1e293b')
        .text(personData.name.length > 14 ? personData.name.substring(0, 11) + '...' : personData.name);
      
      personG.append('text')
        .attr('x', -32).attr('y', 15)
        .style('font-size', '11px').style('fill', '#94a3b8').style('font-weight', '500')
        .text(`${personData.birthDate.split('-')[0]}${personData.deathDate ? ' - ' + personData.deathDate.split('-')[0] : ''}`);

      // Action Button
      if (canEdit && onAddRelation) {
        const addBtn = personG.append('g')
          .attr('transform', 'translate(0, 52)')
          .attr('class', 'opacity-0 group-hover:opacity-100 transition-opacity duration-300')
          .on('click', (event: any) => {
            event.stopPropagation();
            onAddRelation(personData.id);
          });
        addBtn.append('circle').attr('r', 12).attr('fill', '#4f46e5');
        addBtn.append('path').attr('d', 'M -5 0 L 5 0 M 0 -5 L 0 5').attr('stroke', 'white').attr('stroke-width', 2);
      }
    };

    nodeGroups.each(function(d) {
      const nodeSelection = d3.select(this);
      const mainPerson = d.data;
      const spouse = spouses.find(s => s.spouseId === mainPerson.id);

      if (spouse) {
        // Render marriage link between the two cards
        const linkLine = nodeSelection.append('g').attr('class', 'marriage-link');
        linkLine.append('line').attr('x1', -15).attr('x2', 15).attr('y1', -5).attr('y2', -5).attr('stroke', '#cbd5e1').attr('stroke-width', 1);
        linkLine.append('line').attr('x1', -15).attr('x2', 15).attr('y1', 5).attr('y2', 5).attr('stroke', '#cbd5e1').attr('stroke-width', 1);

        // Compact couple offset: 92px each way centers them nicely with a small gap
        renderPersonNode(nodeSelection, mainPerson, 92);
        renderPersonNode(nodeSelection, spouse, -92);
      } else {
        renderPersonNode(nodeSelection, mainPerson, 0);
      }
    });

  }, [data, onSelectPerson, onAddRelation, canEdit]);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <svg ref={svgRef} className="w-full h-full outline-none" />
    </div>
  );
};
