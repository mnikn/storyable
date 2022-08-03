import { useLayoutEffect, useState } from 'react';
import * as d3 from 'd3';

function useView({ zoomDom }: { zoomDom: HTMLElement | null }) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [linkData, setLinkData] = useState<any[]>([]);
  useLayoutEffect(() => {
    /* const json = rootData.toRenderJson();
     * if (dragingTreeNode) {
     *   const pnode = findNodeById(
     *     json,
     *     findNodeById(json, dragingTreeNode.data.id)?.parentId as string
     *   );
     *   if (pnode) {
     *     pnode.children = pnode.children.filter(
     *       (n) => n.id !== dragingTreeNode.data.id
     *     );
     *   }
     * } */

    const json = {
      id: 't1',
      children: [
        {
          id: 't2',
        },
        {
          id: 't3',
        },
      ],
    };
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
      /* if (dragingTreeNode) {
       *   nodes = nodes.concat(dragingTreeNode);
       * } */
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
  }, []);

  useLayoutEffect(() => {
    if (!zoomDom) {
      return;
    }

    const elm = document.querySelector('#main-content');
    d3.select(elm).call(
      /* d3.select(container).call( */
      /* eslint-disable func-names */
      (d3 as any).zoom().on('zoom', function () {
        const transfromRes = d3.zoomTransform(this);
        /* owner.zoom = transfromRes.k; */
        d3.select(zoomDom).style(
          'transform',
          `translate(${transfromRes.x}px,${transfromRes.y}px) scale(${transfromRes.k})`
        );
      })
    );

    d3.select(elm).on('dblclick.zoom', null);
  }, [zoomDom]);

  return {
    treeData,
    linkData,
  };
}

export default useView;
