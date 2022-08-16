import EventEmitter from 'eventemitter3';
import { Storylet, StoryletNode } from '../storylet';

export class StoryTracker {
  public storyletPath: string[] = [];
  public nodePath: { nodeId: string; data: any }[] = [];
  public event = new EventEmitter();

  public paramChangePath: { nodeId: string; oldParams: any; newParams: any }[] =
    [];

  public recordNode(node: StoryletNode<any> | null, data?: any) {
    if (node) {
      this.nodePath.push({
        nodeId: node.id,
        data,
      });
      this.event.emit('change:nodePath', [...this.nodePath]);
    }
  }

  public updateRecordNode(id: string, data: any) {
    this.nodePath = this.nodePath.map((item) =>
      item.nodeId === id
        ? { nodeId: id, data: { ...item.data, ...data } }
        : item
    );
    this.event.emit('change:nodePath', [...this.nodePath]);
  }

  public recordStorylet(storylet: Storylet) {
    this.storyletPath.push(storylet.id);
    this.event.emit('change:storyletPath', [...this.nodePath]);
  }

  public recordParamChange(nodeId: string, oldParams: any, newParams: any) {
    this.paramChangePath.push({ nodeId, oldParams, newParams });
  }

  public reset() {
    this.nodePath = [];
    this.storyletPath = [];
    this.paramChangePath = [];
    this.event.emit('change:nodePath', [...this.nodePath]);
    this.event.emit('change:storyletPath', [...this.nodePath]);
    this.event.emit('change:paramChangePath', [...this.paramChangePath]);
  }
}
