import { generateUUID } from '../../utils/uuid';

export function formatNodeLinkId(from: string, target: string) {
  return `${from}-${target}`;
}

export function createTree(json: any): Tree<any> {
  const instance = new Tree();
  instance.nodes = Object.keys(json.nodes).reduce((res: any, k: string) => {
    res[k] = Node.fromJson(json.nodes[k]);
    return res;
  }, {});

  instance.links = Object.keys(json.links).reduce((res: any, k: string) => {
    const data = json.links[k];
    const source = instance.nodes[data.sourceId];
    const target = instance.nodes[data.targetId];
    const link = new NodeLink(source, target);
    link.data = data.data;
    res[k] = link;
    return res;
  }, {});
  return instance;
}

// link
export interface NodeLinkData {
  [key: string]: any;
}

export interface NodeLinkJsonData {
  sourceId: string;
  targetId: string;
  data: NodeLinkData;
}

export class NodeLink {
  public source: Node<any>;
  public target: Node<any>;
  public data: NodeLinkData = {};

  constructor(source: Node<any>, target: Node<any>) {
    this.source = source;
    this.target = target;
  }

  toJson(): NodeLinkJsonData {
    const sourceId = this.source.id;
    const targetId = this.target.id;
    return {
      sourceId: sourceId,
      targetId: targetId,
      data: this.data,
    };
  }
}

// node
export interface NodeJsonData {
  id: string;
  data: {
    [key: string]: any;
  };
}

export class Node<T> {
  public id = `node_${generateUUID()}`;

  public data: T | null = null;

  public toJson(): any {
    return {
      id: this.id,
      data: this.data,
    };
  }

  static fromJson(json: any): Node<any> {
    const instance = new Node<any>();
    instance.id = json.id;
    instance.data = json.data;
    return instance;
  }
}

export class Tree<T> {
  public nodes: { [key: string]: Node<T> } = {};
  public links: { [key: string]: NodeLink } = {};

  public upsertNode(node: Node<T>) {
    this.nodes[node.id] = node;
  }

  public removeNode(id: string) {
    delete this.nodes[id];
    const matchLinkIds = Object.keys(this.links).filter((linkId) => {
      return linkId.includes(id);
    });
    matchLinkIds.forEach(this.unlink.bind(this));
  }

  public upsertLink(fromNodeId: string, targetNodeId: string, linkData?: any) {
    if (!this.nodes[fromNodeId]) {
      throw new Error('from node not exists!');
    }
    if (!this.nodes[targetNodeId]) {
      throw new Error('target node not exists!');
    }
    const linkId = formatNodeLinkId(fromNodeId, targetNodeId);
    if (this.links[linkId]) {
      this.links[linkId].data = linkData || this.links[linkId].data;
    } else {
      this.links[linkId] = new NodeLink(
        this.nodes[fromNodeId],
        this.nodes[targetNodeId]
      );
      this.links[linkId].data = linkData || this.links[linkId].data;
    }
  }

  public upsertLinks(fromNodeId: string, targetNodeIds: string[]) {
    // Object.keys(this.links)
    //   .filter((linkId) => {
    //     return (
    //       linkId.split('-')[1] === parentNodeId &&
    //       !childrenNodeIds.includes(linkId.split('-')[0])
    //     );
    //   })
    //   .forEach(this.unlink.bind(this));
    targetNodeIds.forEach((childId) => {
      this.upsertLink(fromNodeId, childId);
    });
  }

  public unlink(linkId: string) {
    delete this.links[linkId];
  }

  public getNodeParents(id: string): Node<T>[] {
    const targetNode = this.nodes[id];
    if (!targetNode) {
      return [];
    }

    const matchLinkIds = Object.keys(this.links).filter((linkId) => {
      return linkId.split('-')[1] === id;
    });

    return matchLinkIds.map((linkId) => {
      return this.links[linkId].source;
    });
  }

  public getNodeSingleParent(id: string): Node<T> | null {
    const parents = this.getNodeParents(id);
    return parents[0] || null;
  }

  public getNodeChildren(id: string): Node<T>[] {
    const targetNode = this.nodes[id];
    if (!targetNode) {
      return [];
    }

    const matchLinkIds = Object.keys(this.links).filter((linkId) => {
      return linkId.split('-')[0] === id;
    });

    return matchLinkIds.map((linkId) => {
      return this.links[linkId].source;
    });
  }

  public toJson(): any {
    return {
      nodes: Object.keys(this.nodes).reduce((res: any, k) => {
        res[k] = this.nodes[k].toJson();
        return res;
      }, {}),
      links: Object.keys(this.links).reduce((res: any, k) => {
        res[k] = this.links[k].toJson();
        return res;
      }, {}),
    };
  }
}
