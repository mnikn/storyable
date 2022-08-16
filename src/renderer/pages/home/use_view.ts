import { useEffect, useLayoutEffect, useState } from 'react';
import * as d3 from 'd3';
import useEventState from 'renderer/utils/use_event_state';
import { Storylet } from 'renderer/models/storylet';
import StoryProvider from '../../services/story_provider';
import eventBus, { Event } from './event';

function findNodeById(json: any, id: string): any | null {
  if (!json) {
    return null;
  }
  if (json.id === id) {
    return json;
  }

  let res: any | null = null;
  json.children.forEach((item: any) => {
    res = res || findNodeById(item, id);
  });

  return res;
}

function useView({
  zoomDom,
  dragingNode,
}: {
  zoomDom: HTMLElement | null;
  dragingNode: any;
}) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [linkData, setLinkData] = useState<any[]>([]);
  const [zoom, setZoom] = useState<number>(1);

  const currentStorylet = useEventState<Storylet>({
    event: StoryProvider.event,
    property: 'currentStorylet',
    initialVal: StoryProvider.currentStorylet || undefined,
  });

  useLayoutEffect(() => {
    if (!currentStorylet) {
      return;
    }
    const data = currentStorylet.clone();
    if (dragingNode) {
      Object.keys(data.links).forEach((k) => {
        if (k.includes(dragingNode.data.id)) {
          delete data.links[k];
        }
      });
      delete data.nodes[dragingNode.id];
    }
    const json = data.toHierarchyJson()[0] || {};
    const root = d3.hierarchy(json) as d3.HierarchyRectangularNode<any>;
    root.x0 = 0;
    root.y0 = 0;
    const tree = d3.tree().nodeSize([240, 700]);
    tree(root);

    root.descendants().forEach((d: any) => {
      d.id = d.data.id;
      d._children = d.children;
    });

    const updateNodeTree = (source: any) => {
      let nodes = root.descendants().reverse();
      if (dragingNode) {
        nodes = nodes.concat(dragingNode);
      }

      setTreeData(nodes);

      // Stash the old positions for transition.
      root.eachBefore((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      const diagonal = d3
        .linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x);
      const svg = d3.select('#dialogue-tree-links-container');
      svg.selectAll('*').remove();
      const gLink = svg
        .append('g')
        .attr('id', 'dialogue-tree-links')
        .style('position', 'absolute')
        .attr('fill', 'none')
        .attr('stroke', '#ffd4a3')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 5);

      const transition = svg
        .transition()
        .duration(300)
        .tween(
          'resize',
          (window as any).ResizeObserver
            ? null
            : () => () => svg.dispatch('toggle')
        );

      const link = gLink
        .selectAll('path')
        .data(root.links(), (d: any) => d.target.id)
        .style('position', 'absolute');
      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().append('path');
      // Transition links to their new position.

      const links: any[] = [];
      link
        .merge(linkEnter)
        .transition(transition)
        .attr('d', (c) => {
          const nodeSource = {
            ...(c as any).source,
          };
          nodeSource.x += 80;
          nodeSource.y += 400;
          const targetSource = {
            ...(c as any).target,
          };
          targetSource.x += 80;

          links.push({
            from: nodeSource,
            target: targetSource,
            data:
              (nodeSource.data?.links || []).find(
                (l) =>
                  l.sourceId === nodeSource.data.id &&
                  l.targetId === targetSource.data.id
              )?.data || {},
          });
          /* targetSource.y = targetSource.y - 30; */
          return diagonal({
            source: nodeSource,
            target: targetSource,
          });
        });

      setLinkData(links);

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });
    };

    updateNodeTree(root);
  }, [currentStorylet, dragingNode]);

  // useLayoutEffect(() => {
  //   const data = {
  //     nodes: [
  //       { id: 'Microsoft' },
  //       { id: 'Amazon' },
  //       { id: 'HTC' },
  //       { id: 'Samsung' },
  //       { id: 'Apple' },
  //       { id: 'Motorola' },
  //       { id: 'Nokia' },
  //       { id: 'Kodak' },
  //       { id: 'Barnes & Noble' },
  //       { id: 'Foxconn' },
  //       { id: 'Oracle' },
  //       { id: 'Google' },
  //       { id: 'Inventec' },
  //       { id: 'LG' },
  //       { id: 'RIM' },
  //       { id: 'Sony' },
  //       { id: 'Qualcomm' },
  //       { id: 'Huawei' },
  //       { id: 'ZTE' },
  //       { id: 'Ericsson' },
  //     ],
  //     links: [
  //       { source: 'Microsoft', target: 'Amazon', type: 'licensing' },
  //       { source: 'Microsoft', target: 'HTC', type: 'licensing' },
  //       { source: 'Samsung', target: 'Apple', type: 'suit' },
  //       { source: 'Motorola', target: 'Apple', type: 'suit' },
  //       { source: 'Nokia', target: 'Apple', type: 'resolved' },
  //       { source: 'HTC', target: 'Apple', type: 'suit' },
  //       { source: 'Kodak', target: 'Apple', type: 'suit' },
  //       { source: 'Microsoft', target: 'Barnes & Noble', type: 'suit' },
  //       { source: 'Microsoft', target: 'Foxconn', type: 'suit' },
  //       { source: 'Oracle', target: 'Google', type: 'suit' },
  //       { source: 'Apple', target: 'HTC', type: 'suit' },
  //       { source: 'Microsoft', target: 'Inventec', type: 'suit' },
  //       { source: 'Samsung', target: 'Kodak', type: 'resolved' },
  //       { source: 'LG', target: 'Kodak', type: 'resolved' },
  //       { source: 'RIM', target: 'Kodak', type: 'suit' },
  //       { source: 'Sony', target: 'LG', type: 'suit' },
  //       { source: 'Kodak', target: 'LG', type: 'resolved' },
  //       { source: 'Apple', target: 'Nokia', type: 'resolved' },
  //       { source: 'Qualcomm', target: 'Nokia', type: 'resolved' },
  //       { source: 'Apple', target: 'Motorola', type: 'suit' },
  //       { source: 'Microsoft', target: 'Motorola', type: 'suit' },
  //       { source: 'Motorola', target: 'Microsoft', type: 'suit' },
  //       { source: 'Huawei', target: 'ZTE', type: 'suit' },
  //       { source: 'Ericsson', target: 'ZTE', type: 'suit' },
  //       { source: 'Kodak', target: 'Samsung', type: 'resolved' },
  //       { source: 'Apple', target: 'Samsung', type: 'suit' },
  //       { source: 'Kodak', target: 'RIM', type: 'suit' },
  //       { source: 'Nokia', target: 'Qualcomm', type: 'suit' },
  //     ],
  //   };
  //   const types = ['licensing', 'suit', 'resolved'];
  //   const height = 600;
  //   const width = 600;
  //   const color = d3.scaleOrdinal(types, d3.schemeCategory10);
  //   const nodeWidth = 200;
  //   const nodeHeight = 50;

  //   const linkArc = (d) => {
  //     // d.x = d.x - nodeWidth / 2 < 0 ? nodeWidth / 2 : d.x;
  //     // d.x = d.x + nodeWidth / 2 > nodeWidth ? nodeWidth - nodeWidth / 2 : d.x;
  //     // d.y = d.y - nodeHeight / 2 < 0 ? nodeHeight / 2 : d.y;
  //     // d.y =
  //     //   d.y + nodeHeight / 2 > nodeHeight ? nodeHeight - nodeHeight / 2 : d.y;
  //     const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  //     return `
  //   M${d.source.x},${d.source.y}
  //   A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  // `;
  //   };

  //   const drag = (simulation) => {
  //     function dragstarted(event, d) {
  //       if (!event.active) simulation.alphaTarget(0.3).restart();
  //       d.fx = d.x;
  //       d.fy = d.y;
  //     }

  //     function dragged(event, d) {
  //       d.fx = event.x;
  //       d.fy = event.y;
  //     }

  //     function dragended(event, d) {
  //       if (!event.active) simulation.alphaTarget(0);
  //       d.fx = null;
  //       d.fy = null;
  //     }

  //     return d3
  //       .drag()
  //       .on('start', dragstarted)
  //       .on('drag', dragged)
  //       .on('end', dragended);
  //   };

  //   const simulation = d3
  //     .forceSimulation(data.nodes)
  //     .force(
  //       'link',
  //       d3.forceLink(data.links).id((d) => d.id)
  //     )
  //     .force('charge', d3.forceManyBody().strength(-400))
  //     .force('x', d3.forceX())
  //     .force('y', d3.forceY());

  //   const svg = d3
  //     .create('svg')
  //     .attr('viewBox', [-width / 2, -height / 2, width, height])
  //     .style('font', '12px sans-serif');

  //   // Per-type markers, as they don't inherit styles.
  //   svg
  //     .append('defs')
  //     .selectAll('marker')
  //     .data(types)
  //     .join('marker')
  //     .attr('id', (d) => `arrow-${d}`)
  //     .attr('viewBox', '0 -5 10 10')
  //     .attr('refX', 15)
  //     .attr('refY', -0.5)
  //     .attr('markerWidth', 6)
  //     .attr('markerHeight', 6)
  //     .attr('orient', 'auto')
  //     .append('path')
  //     .attr('fill', color)
  //     .attr('d', 'M0,-5L10,0L0,5');

  //   const link = svg
  //     .append('g')
  //     .attr('fill', 'none')
  //     .attr('stroke-width', 1.5)
  //     .selectAll('path')
  //     .data(data.links)
  //     .join('path')
  //     .attr('stroke', (d) => color(d.type))
  //     .attr(
  //       'marker-end',
  //       (d) => `url(${new URL(`#arrow-${d.type}`, location)})`
  //     );

  //   const node = svg
  //     .append('g')
  //     .attr('fill', 'currentColor')
  //     .attr('stroke-linecap', 'round')
  //     .attr('stroke-linejoin', 'round')
  //     .selectAll('g')
  //     .data(data.nodes)
  //     .join('g')
  //     .call(drag(simulation));

  //   node
  //     .append('circle')
  //     .attr('stroke', 'white')
  //     .attr('stroke-width', 1.5)
  //     .attr('r', 4);

  //   simulation.on('tick', () => {
  //     // data.nodes.forEach((d) => {
  //     //   d.x = d.x - nodeWidth / 2 < 0 ? nodeWidth / 2 : d.x;
  //     //   d.x = d.x + nodeWidth / 2 > nodeWidth ? nodeWidth - nodeWidth / 2 : d.x;
  //     //   d.y = d.y - nodeHeight / 2 < 0 ? nodeHeight / 2 : d.y;
  //     //   d.y =
  //     //     d.y + nodeHeight / 2 > nodeHeight ? nodeHeight - nodeHeight / 2 : d.y;
  //     // });
  //     // link.attr('x1', (d) => d.source.x);
  //     // link.attr('y1', (d) => d.source.y);
  //     // link.attr('x2', (d) => d.target.x);
  //     // link.attr('y2', (d) => d.target.y);
  //     link.attr('d', linkArc);
  //     node.attr('transform', (d) => `translate(${d.x},${d.y})`);
  //   });

  //   const elm = document.querySelector('#graph-container');
  //   elm?.appendChild(svg.node());
  //   // invalidation.then(() => simulation.stop());
  // }, []);

  // useLayoutEffect(() => {
  //   const graph = {
  //     nodes: Array.from({ length: 13 }, () => ({})),
  //     links: [
  //       { source: 0, target: 1 },
  //       { source: 1, target: 2 },
  //       { source: 2, target: 0 },
  //       { source: 1, target: 3 },
  //       { source: 3, target: 2 },
  //       { source: 3, target: 4 },
  //       { source: 4, target: 5 },
  //       { source: 5, target: 6 },
  //       { source: 5, target: 7 },
  //       { source: 6, target: 7 },
  //       { source: 6, target: 8 },
  //       { source: 7, target: 8 },
  //       { source: 9, target: 4 },
  //       { source: 9, target: 11 },
  //       { source: 9, target: 10 },
  //       { source: 10, target: 11 },
  //       { source: 11, target: 12 },
  //       { source: 12, target: 10 },
  //     ],
  //   };
  //   const width = 500;
  //   const height = 500;
  //   const svg = d3
  //       .create('svg')
  //       .style('height', '100%')
  //       .style('width', '100%')
  //       .style('overflow', 'inherit'),
  //     link = svg
  //       .selectAll('.link')
  //       .data(graph.links)
  //       .join('line')
  //       .classed('link', true)
  //       .style('stroke', '#000')
  //       .style('stroke-width', '1.5px');

  //   node = svg
  //     .selectAll('.node')
  //     .data(graph.nodes)
  //     .join('circle')
  //     .attr('r', 53)
  //     .classed('node', true)
  //     .style('fill', '#ccc')
  //     .style('stroke-width', '1.5px')
  //     .style('stroke', '#000')
  //     .style('cursor', 'move');

  //   // yield svg.node();

  //   const simulation = d3
  //     .forceSimulation()
  //     .nodes(graph.nodes)
  //     .force('charge', d3.forceManyBody())
  //     .force('center', d3.forceCenter(width / 2, height / 2))
  //     .force('link', d3.forceLink(graph.links).distance(200).strength(0.1))
  //     .on('tick', tick);

  //   const drag = d3.drag().on('start', dragstart).on('drag', dragged);

  //   node.call(drag).on('click', click);

  //   const nodeWidth = 50;
  //   const nodeHeight = 50;
  //   function tick() {
  //     // graph.nodes.forEach((d) => {
  //     //   d.x = d.x - nodeWidth / 2 < 0 ? nodeWidth / 2 : d.x;
  //     //   d.x = d.x + nodeWidth / 2 > nodeWidth ? nodeWidth - nodeWidth / 2 : d.x;
  //     //   d.y = d.y - nodeHeight / 2 < 0 ? nodeHeight / 2 : d.y;
  //     //   d.y =
  //     //     d.y + nodeHeight / 2 > nodeHeight ? nodeHeight - nodeHeight / 2 : d.y;
  //     // });
  //     link
  //       .attr('x1', (d) => d.source.x)
  //       .attr('y1', (d) => d.source.y)
  //       .attr('x2', (d) => d.target.x)
  //       .attr('y2', (d) => d.target.y);
  //     node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
  //   }

  //   function click(event, d) {
  //     delete d.fx;
  //     delete d.fy;
  //     d3.select(this).classed('fixed', false);
  //     simulation.alpha(1).restart();
  //   }

  //   function dragstart() {
  //     d3.select(this).classed('fixed', true);
  //   }

  //   function clamp(x, lo, hi) {
  //     return x < lo ? lo : x > hi ? hi : x;
  //   }

  //   function dragged(event, d) {
  //     d.fx = clamp(event.x, 0, width);
  //     d.fy = clamp(event.y, 0, height);
  //     simulation.alpha(1).restart();
  //   }

  //   const elm = document.querySelector('#graph-container');
  //   elm?.appendChild(svg.node());
  // }, []);

  useLayoutEffect(() => {
    if (!zoomDom) {
      return;
    }

    const elm = document.querySelector('#main-content');
    d3.select(elm).call(
      /* eslint-disable func-names */
      (d3 as any).zoom().on('zoom', function () {
        const transfromRes = d3.zoomTransform(this);
        setZoom(transfromRes.k);
        d3.select(zoomDom).style(
          'transform',
          `translate(${transfromRes.x}px,${transfromRes.y}px) scale(${transfromRes.k})`
        );
      })
    );

    d3.select(elm).on('dblclick.zoom', null);
  }, [zoomDom]);

  useEffect(() => {
    const refresh = () => {
      setTreeData((prev: any) => {
        return [...prev];
      });
    };
    eventBus.on(Event.REFRESH_NODE_VIEW, refresh);
    return () => {
      eventBus.off(Event.REFRESH_NODE_VIEW, refresh);
    };
  }, []);

  return {
    zoom,
    treeData,
    linkData,
  };
}

export default useView;
