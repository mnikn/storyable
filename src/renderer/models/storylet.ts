import { generateUUID } from '../utils/uuid';
import { Node, Tree } from './base/tree';
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
}

// sentence node
export interface StoryletSentenceNodeData extends StoryletNodeData {
  content: string;
}
export class StoryletSentenceNode extends StoryletNode<StoryletSentenceNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Sentence,
      content: 'content_' + generateUUID(),
      enableConditions: [],
    };
  }
}

// branch node
export interface StoryletBranchNodeData extends StoryletNodeData {
  content: string;
  options: {
    id: string;
    name: string;
  }[];
}
export class StoryletBranchNode extends StoryletNode<StoryletBranchNodeData> {
  constructor() {
    super();
    this.data = {
      type: NodeType.Branch,
      content: 'content_' + generateUUID(),
      options: [],
      enableConditions: [],
    };
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

  public clone(): Storylet {
    const instance = new Storylet();
    instance.id = this.id;
    instance.name = this.name;
    instance.conditions = this.conditions;
    instance.nodes = this.nodes;
    instance.links = this.links;
    return instance;
  }
}
