import EventEmitter from 'eventemitter3';

export enum Event {
  SHOW_SIDEBAR_RENAME_DIALOG = 'show_sidebar_rename_dialog',
  SELECT_NODE = 'select_node',
}

export default new EventEmitter();
