import { Component, inject, ElementRef, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../core/services/session.service';
import { ShortcutService } from '../../core/services/shortcut.service';
import { IdeaCard } from '../idea-card/idea-card';
import { IdeaCard as IdeaCardModel } from '../../core/models/mimir.model';
import * as d3 from 'd3';
import { LlmService } from '../../core/services/llm.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SynthesisDialog } from '../synthesis-dialog/synthesis-dialog';

export type ViewType = 'Tiling' | 'Kanban' | 'Chain of Thoughts';

@Component({
  selector: 'mimir-work-area',
  standalone: true,
  imports: [CommonModule, IdeaCard, MatDialogModule],
  templateUrl: './work-area.html',
  styleUrl: './work-area.scss',
})
export class WorkArea implements AfterViewInit {
  sessionService = inject(SessionService);
  shortcutService = inject(ShortcutService);
  llmService = inject(LlmService);
  dialog = inject(MatDialog);
  
  views: ViewType[] = ['Tiling', 'Kanban', 'Chain of Thoughts'];
  
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  
  constructor() {
    effect(() => {
      if (this.shortcutService.activeWorkAreaView() === 'Chain of Thoughts') {
        setTimeout(() => this.renderGraph(), 100);
      }
    });
  }
  
  ngAfterViewInit() {
    if (this.shortcutService.activeWorkAreaView() === 'Chain of Thoughts') {
      setTimeout(() => this.renderGraph(), 100);
    }
  }

  setView(v: ViewType) {
    this.shortcutService.activeWorkAreaView.set(v);
  }

  renderGraph() {
    if (!this.graphContainer) return;
    const element = this.graphContainer.nativeElement;
    element.innerHTML = '';
    
    const ideas = this.sessionService.activeSession()?.ideas || [];
    if (ideas.length === 0) return;
    
    const width = element.clientWidth || 800;
    const height = element.clientHeight || 600;
    
    const nodes = ideas.map(i => ({ id: i.id, idea: i, x: width/2, y: height/2 }));
    const links: any[] = [];
    
    ideas.forEach(i => {
      if (i.referencedIds) {
        i.referencedIds.forEach(refId => {
          links.push({ source: refId, target: i.id });
        });
      }
    });
    
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
      
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(30).iterations(2));
      
    // arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 28) // radius + offset
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#888')
      .style('stroke', 'none');

    const link = svg.append('g')
      .attr('stroke', '#888')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');
      
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 20)
      .attr('fill', (d: any) => this.getColor(d.idea.category))
      .call(this.drag(simulation));
      
    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d: any) => d.idea.rawText.substring(0, 15) + '...')
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dy', 35);
      
    node.on('click', (event, d: any) => {
      this.synthesizeBranch(d.idea);
    });
      
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => { d.x = Math.max(30, Math.min(width - 30, d.x)); return d.x; })
        .attr('cy', (d: any) => { d.y = Math.max(30, Math.min(height - 30, d.y)); return d.y; });
        
      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  }

  getColor(category: string) {
    const colors: any = {
      'Idea': '#e91e63',
      'Claim': '#ffeb3b',
      'Definition': '#00e5ff',
      'Reference': '#b388ff',
      'Narrative': '#ff9800',
      'Note': '#9e9e9e'
    };
    return colors[category] || '#9e9e9e';
  }

  drag(simulation: any) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended) as any;
  }

  async synthesizeBranch(idea: IdeaCardModel) {
    const branch = this.sessionService.getBranch(idea.id);
    
    const dialogRef = this.dialog.open(SynthesisDialog, {
      width: '500px',
      data: { branchCount: branch.length }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.sessionService.updateSynthesis({
          summary: 'Synthesizing branch...',
          suggestedNextIdeas: [],
          timestamp: new Date()
        });
        
        const doc = await this.llmService.synthesizeDocument(branch, result.title, result.instructions);
        
        this.sessionService.updateSynthesis({
          summary: doc,
          suggestedNextIdeas: [],
          timestamp: new Date()
        });
        
        this.shortcutService.rightSidebarOpen.set(true);
      }
    });
  }
}
