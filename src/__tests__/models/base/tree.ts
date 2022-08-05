import {
  Tree,
  Node,
  formatNodeLinkId,
} from '../../../renderer/models/base/tree';

describe('model tree', () => {
  it('should handle tree correct', () => {
    const tree = new Tree<any>();

    const node1 = new Node();
    node1.data = { content: 'tt' };
    tree.upsertNode(node1);
    expect(tree.nodes[node1.id]).toBe(node1);

    const childNode1 = new Node();
    childNode1.data = { content: 'tt1' };
    tree.upsertNode(childNode1);
    tree.upsertLink(node1.id, childNode1.id);
    const link = tree.links[formatNodeLinkId(node1.id, childNode1.id)];
    expect(link).not.toBeUndefined();
    expect(link.source).toBe(node1);
    expect(link.target).toBe(childNode1);
    expect(tree.getNodeSingleParent(childNode1.id)).toBe(node1);
    tree.removeNode(node1.id);
    expect(Object.keys(tree.nodes).length).toBe(1);
    expect(Object.keys(tree.links).length).toBe(0);

    tree.upsertNode(node1);
    const childNode2 = new Node();
    const childNode3 = new Node();
    tree.upsertNode(childNode2);
    tree.upsertNode(childNode3);
    tree.upsertLinks(node1.id, [childNode1.id, childNode2.id, childNode3.id]);
    expect(Object.keys(tree.links).length).toBe(3);
  });

  it('should create tree from json correct', () => {
    const json = {
      nodes: {
        b1202d674ac74e1999e4ebdb9976b6c6: {
          id: 'b1202d674ac74e1999e4ebdb9976b6c6',
          data: { content: 'dd' },
        },
        f973dc07a9de4e4f979cdf9c94ed7630: {
          id: 'f973dc07a9de4e4f979cdf9c94ed7630',
          data: null,
        },
        b88ccc9e1749484c8df4cc3a6a64119a: {
          id: 'b88ccc9e1749484c8df4cc3a6a64119a',
          data: null,
        },
        '51123af2eae14b4095535573d4b2976a': {
          id: '51123af2eae14b4095535573d4b2976a',
          data: null,
        },
      },
      links: {
        'f973dc07a9de4e4f979cdf9c94ed7630-b1202d674ac74e1999e4ebdb9976b6c6': {
          sourceId: 'f973dc07a9de4e4f979cdf9c94ed7630',
          targetId: 'b1202d674ac74e1999e4ebdb9976b6c6',
          data: {},
        },
        'f973dc07a9de4e4f979cdf9c94ed7630-b88ccc9e1749484c8df4cc3a6a64119a': {
          sourceId: 'f973dc07a9de4e4f979cdf9c94ed7630',
          targetId: 'b88ccc9e1749484c8df4cc3a6a64119a',
          data: {},
        },
        'f973dc07a9de4e4f979cdf9c94ed7630-51123af2eae14b4095535573d4b2976a': {
          sourceId: 'f973dc07a9de4e4f979cdf9c94ed7630',
          targetId: '51123af2eae14b4095535573d4b2976a',
          data: {},
        },
      },
    };
    const instance = Tree.fromJson(json);
    expect(JSON.stringify(instance.toJson())).toEqual(JSON.stringify(json));
  });

  it('should format hierarchy json correct', () => {
    const json = {
      nodes: {
        b1202d674ac74e1999e4ebdb9976b6c6: {
          id: 'b1202d674ac74e1999e4ebdb9976b6c6',
          data: {},
        },
        asre02d674ac74e1999e4ebdb9976b6c6: {
          id: 'asre02d674ac74e1999e4ebdb9976b6c6',
          data: {},
        },
        f973dc07a9de4e4f979cdf9c94ed7630: {
          id: 'f973dc07a9de4e4f979cdf9c94ed7630',
          data: {},
        },
        b88ccc9e1749484c8df4cc3a6a64119a: {
          id: 'b88ccc9e1749484c8df4cc3a6a64119a',
          data: {},
        },
        '51123af2eae14b4095535573d4b2976a': {
          id: '51123af2eae14b4095535573d4b2976a',
          data: {},
        },
      },
      links: {
        'f973dc07a9de4e4f979cdf9c94ed7630-b1202d674ac74e1999e4ebdb9976b6c6': {
          sourceId: 'f973dc07a9de4e4f979cdf9c94ed7630',
          targetId: 'b1202d674ac74e1999e4ebdb9976b6c6',
          data: {},
        },
        'f973dc07a9de4e4f979cdf9c94ed7630-b88ccc9e1749484c8df4cc3a6a64119a': {
          sourceId: 'f973dc07a9de4e4f979cdf9c94ed7630',
          targetId: 'b88ccc9e1749484c8df4cc3a6a64119a',
          data: {},
        },
        'f973dc07a9de4e4f979cdf9c94ed7630-51123af2eae14b4095535573d4b2976a': {
          sourceId: 'f973dc07a9de4e4f979cdf9c94ed7630',
          targetId: '51123af2eae14b4095535573d4b2976a',
          data: {},
        },
        'b1202d674ac74e1999e4ebdb9976b6c6-asre02d674ac74e1999e4ebdb9976b6c6': {
          sourceId: 'b1202d674ac74e1999e4ebdb9976b6c6',
          targetId: 'asre02d674ac74e1999e4ebdb9976b6c6',
          data: {},
        },
      },
    };

    const expectResult = [
      {
        id: 'f973dc07a9de4e4f979cdf9c94ed7630',
        children: [
          {
            id: 'b1202d674ac74e1999e4ebdb9976b6c6',
            children: [
              { id: 'asre02d674ac74e1999e4ebdb9976b6c6', children: [] },
            ],
          },
          { id: 'b88ccc9e1749484c8df4cc3a6a64119a', children: [] },
          { id: '51123af2eae14b4095535573d4b2976a', children: [] },
        ],
      },
    ];
    const instance = Tree.fromJson(json);
    const realResult = instance.toHierarchyJson();
    expect(JSON.stringify(expectResult)).toEqual(JSON.stringify(realResult));
  });
});
