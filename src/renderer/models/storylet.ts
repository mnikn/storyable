import { generateUUID } from '../utils/uuid';
import { Node, NodeLink, Tree } from './base/tree';
import { Condition } from './condition';

export enum NodeType {
  Init = 'init',
  Sentence = 'sentence',
  Branch = 'branch',
  Action = 'action',
}

// base node
export interface StoryletNodeData {
  type: NodeType;
  enableConditions: Condition[];
}
export class StoryletNode<D extends StoryletNodeData> extends Node<D> {}

// init node
export interface StoryletInitNodeData extends StoryletNodeData {}
export class StoryletInitNode extends StoryletNode<StoryletInitNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Init,
      enableConditions: [],
    };
  }

  static fromJson(json: any): Node<any> {
    const instance = new StoryletInitNode();
    instance.id = json.id;
    instance.data.enableConditions = json.data.enableConditions;
    return instance;
  }
}

// sentence node
export interface StoryletSentenceNodeData extends StoryletNodeData {
  content: string;
  actor: string | null;
  actorPortrait: string | null;
}
export class StoryletSentenceNode extends StoryletNode<StoryletSentenceNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Sentence,
      content: 'content_' + generateUUID(),
      enableConditions: [],
      actor: null,
      actorPortrait: null,
    };
  }

  static fromJson(json: any): StoryletSentenceNode {
    const instance = new StoryletSentenceNode();
    instance.id = json.id;
    instance.data.content = json.data.content;
    instance.data.enableConditions = json.data.enableConditions;
    instance.data.actor = json.data.actor;
    instance.data.actorPortrait = json.data.actorPortrait;
    return instance;
  }
}

// branch node
export interface StoryletBranchNodeData extends StoryletNodeData {
  content: string;
  actor: string | null;
  actorPortrait: string | null;
}
export class StoryletBranchNode extends StoryletNode<StoryletBranchNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Branch,
      content: 'content_' + generateUUID(),
      enableConditions: [],
      actor: null,
      actorPortrait: null,
    };
  }

  static fromJson(json: any): StoryletBranchNode {
    const instance = new StoryletBranchNode();
    instance.id = json.id;
    instance.data.content = json.data.content;
    instance.data.enableConditions = json.data.enableConditions;
    instance.data.actor = json.data.actor;
    instance.data.actorPortrait = json.data.actorPortrait;
    return instance;
  }
}

export enum ActionType {
  Unknown = 'unknown',
  Empty = 'empty',
  SwitchToMatchStorylet = 'switch_to_match_storylet',
}

// action node
export interface StoryletActionNodeData extends StoryletNodeData {
  actionType: string;
}
export abstract class StoryletActionNode extends StoryletNode<StoryletActionNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Action,
      actionType: ActionType.Unknown,
      enableConditions: [],
    };
  }
}

export class StoryletEmptyActionNode extends StoryletActionNode {
  constructor() {
    super();
    this.data = {
      type: NodeType.Action,
      actionType: ActionType.Empty,
      enableConditions: [],
    };
  }

  static fromJson(json: any): StoryletEmptyActionNode {
    const instance = new StoryletEmptyActionNode();
    instance.id = json.id;
    instance.data.enableConditions = json.data.enableConditions;
    return instance;
  }
}

export interface StoryletSwitchToMatchStoryletActionNodeData
  extends StoryletActionNodeData {}

export class StoryletSwitchToMatchStoryletActionNode extends StoryletNode<StoryletSwitchToMatchStoryletActionNodeData> {
  constructor() {
    super();
    if (this.data) {
      this.data.actionType = ActionType.SwitchToMatchStorylet;
    }
  }

  static fromJson(json: any): StoryletEmptyActionNode {
    const instance = new StoryletEmptyActionNode();
    instance.id = json.id;
    instance.data.enableConditions = json.data.enableConditions;
    return instance;
  }
}

export class Storylet extends Tree<StoryletNodeData> {
  public id: string = 'storylet_' + generateUUID();
  public name: string = '';
  public conditions: any[] = [];

  constructor() {
    super();
    const node = new StoryletInitNode();
    this.upsertNode(node);
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
    instance.conditions = this.conditions;
    instance.nodes = { ...this.nodes };
    instance.links = { ...this.links };
    return instance;
  }

  public toJson(): any {
    const data = super.toJson();
    data.name = this.name;
    data.id = this.id;
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
      } else if (nodeType === NodeType.Action) {
        if (json.nodes[k].data.actionType === ActionType.Empty) {
          instance = StoryletEmptyActionNode.fromJson(nodeData);
        } else if (
          json.nodes[k].data.actionType === ActionType.SwitchToMatchStorylet
        ) {
          instance = StoryletSwitchToMatchStoryletActionNode.fromJson(nodeData);
        }
      } else if (nodeType === NodeType.Init) {
        instance = StoryletInitNode.fromJson(nodeData);
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
    instance.conditions = json.conditions;
    return instance;
  }
}
