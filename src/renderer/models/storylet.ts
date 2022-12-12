import { generateUUID } from '../utils/uuid';
import { Node, NodeLink, Tree } from './base/tree';
import { Condition } from './condition';

export enum NodeType {
  Root = 'root',
  Sentence = 'sentence',
  Branch = 'branch',
  Custom = 'custom',
}

// base node
export interface StoryletNodeData {
  type: NodeType;
  extraData: any;
  enableConditions: Condition[];
  customNodeId?: string;
  enableCheck?: string;
  onJumpProcess?: any;
  afterJumpProcess?: any;
}
export class StoryletNode<D extends StoryletNodeData> extends Node<D> {}

// init node
export interface StoryletRootNodeData extends StoryletNodeData {}
export class StoryletRootNode extends StoryletNode<StoryletRootNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Root,
      enableConditions: [],
      extraData: {},
      onJumpProcess: '',
      afterJumpProcess: '',
    };
  }

  static fromJson(json: any): Node<any> {
    const instance = new StoryletRootNode();
    instance.id = json.id;
    instance.data.enableConditions = json.data.enableConditions;
    instance.data.extraData = json.data.extraData || {};
    instance.data.customNodeId = json.data.customNodeId;
    instance.data.onJumpProcess = json.data.onJumpProcess;
    instance.data.afterJumpProcess = json.data.afterJumpProcess;
    instance.data.enableCheck = json.data.enableCheck;
    return instance;
  }
}

// sentence node
export interface StoryletSentenceNodeData extends StoryletNodeData {
  content: string;
  contentSpeed: { [key: string]: number[] };
  actor: string | null;
  actorDirection?: string;
  actorPortrait: string | null;
}
export class StoryletSentenceNode extends StoryletNode<StoryletSentenceNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Sentence,
      content: 'content_' + generateUUID(),
      contentSpeed: {},
      enableConditions: [],
      onJumpProcess: '',
      extraData: {},
      actor: null,
      actorPortrait: null,
      actorDirection: 'left',
    };
  }

  static fromJson(json: any): StoryletSentenceNode {
    const instance = new StoryletSentenceNode();
    instance.id = json.id;
    instance.data.content = json.data.content;
    instance.data.contentSpeed = json.data.contentSpeed || {};
    instance.data.enableConditions = json.data.enableConditions;
    instance.data.extraData = json.data.extraData || {};
    instance.data.actor = json.data.actor;
    instance.data.actorPortrait = json.data.actorPortrait;
    instance.data.customNodeId = json.data.customNodeId;
    instance.data.onJumpProcess = json.data.onJumpProcess;
    instance.data.afterJumpProcess = json.data.afterJumpProcess;
    instance.data.enableCheck = json.data.enableCheck;
    instance.data.actorDirection = json.data.actorDirection;
    return instance;
  }
}

// branch node
export interface StoryletBranchNodeData extends StoryletNodeData {
  content: string;
  contentSpeed: { [key: string]: number[] };
  actor: string | null;
  actorPortrait: string | null;
  actorDirection?: string;
}
export class StoryletBranchNode extends StoryletNode<StoryletBranchNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Branch,
      content: 'content_' + generateUUID(),
      contentSpeed: {},
      onJumpProcess: '',
      enableConditions: [],
      extraData: {},
      actor: null,
      actorPortrait: null,
      actorDirection: 'left',
    };
  }

  static fromJson(json: any): StoryletBranchNode {
    const instance = new StoryletBranchNode();
    instance.id = json.id;
    instance.data.content = json.data.content;
    instance.data.contentSpeed = json.data.contentSpeed || {};
    instance.data.enableConditions = json.data.enableConditions;
    instance.data.extraData = json.data.extraData || {};
    instance.data.actor = json.data.actor;
    instance.data.actorPortrait = json.data.actorPortrait;
    instance.data.customNodeId = json.data.customNodeId;
    instance.data.onJumpProcess = json.data.onJumpProcess;
    instance.data.afterJumpProcess = json.data.afterJumpProcess;
    instance.data.enableCheck = json.data.enableCheck;
    instance.data.actorDirection = json.data.actorDirection;
    return instance;
  }
}

// action node
export interface StoryletCustomNodeData extends StoryletNodeData {
  customType: string;
}
export class StoryletCustomNode extends StoryletNode<StoryletCustomNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Custom,
      onJumpProcess: '',
      customType: '',
      enableConditions: [],
      extraData: {},
    };
  }

  static fromJson(json: any): StoryletCustomNode {
    const instance = new StoryletCustomNode();
    instance.id = json.id;
    instance.data.customType = json.data.customType;
    instance.data.extraData = json.data.extraData;
    instance.data.enableConditions = json.data.enableConditions;
    instance.data.customNodeId = json.data.customNodeId;
    instance.data.onJumpProcess = json.data.onJumpProcess;
    instance.data.afterJumpProcess = json.data.afterJumpProcess;
    instance.data.enableCheck = json.data.enableCheck;
    return instance;
  }
}

export class Storylet extends Tree<StoryletNodeData> {
  public id: string = 'storylet_' + generateUUID();
  public stotyletId: string = '';
  public name: string = '';
  public conditions: any[] = [];

  constructor(newRoot = true) {
    super();
    if (newRoot) {
      const node = new StoryletRootNode();
      this.upsertNode(node);
    }
  }

  public findParent(
    nodeId: string,
    parentId: string
  ): StoryletNode<any> | null {
    const parents = this.getNodeParents(nodeId);
    const node = parents.find((n) => n.id === parentId);
    if (node) {
      return node;
    }
    return parents.reduce((res: any, p) => {
      if (res) {
        return res;
      }
      res = this.findParent(p.id, parentId);
      return res;
    }, null);
  }

  public clone(): Storylet {
    const instance = new Storylet();
    instance.id = this.id;
    instance.name = this.name;
    instance.stotyletId = this.stotyletId;
    instance.conditions = this.conditions;
    instance.nodes = { ...this.nodes };
    instance.links = { ...this.links };
    return instance;
  }

  public toJson(): any {
    const data = super.toJson();
    data.name = this.name;
    data.id = this.id;
    data.stotyletId = this.stotyletId;
    data.conditions = this.conditions;
    return data;
  }

  public getNodeChildrenLinks(id: string): NodeLink[] {
    return Object.values(this.links).filter((item) => item.source.id === id);
  }

  public static fromJson(json: any): Storylet {
    const instance = new Storylet();

    instance.nodes = Object.keys(json.nodes).reduce((res: any, k: string) => {
      const nodeType = json.nodes[k].data.type;
      const nodeData = json.nodes[k];
      let instance: any = null;
      if (nodeType === NodeType.Sentence) {
        instance = StoryletSentenceNode.fromJson(nodeData);
      } else if (nodeType === NodeType.Branch) {
        instance = StoryletBranchNode.fromJson(nodeData);
      } else if (nodeType === NodeType.Custom) {
        instance = StoryletCustomNode.fromJson(nodeData);
      } else if (nodeType === NodeType.Root) {
        instance = StoryletRootNode.fromJson(nodeData);
      }
      if (instance) {
        res[k] = instance;
      }
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

    instance.id = json.id;
    instance.name = json.name;
    instance.stotyletId = json.st;
    instance.conditions = json.conditions;
    return instance;
  }
}
