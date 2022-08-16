import EventEmitter from 'eventemitter3';

export enum Event {
  INIT = 'init',
  TRANSFER_NEW_NODE = 'transfer_new_node',
}

export default new EventEmitter();
