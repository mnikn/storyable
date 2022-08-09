import EventEmitter from 'eventemitter3';

export enum Event {
  SHOW_SIDEBAR_RENAME_DIALOG = 'show_sidebar_rename_dialog',
  SHOW_SENTENCE_EDIT_DIALOG = 'show_sentence_edit_dialog',
  SHOW_BRANCH_EDIT_DIALOG = 'show_branch_edit_dialog',
  SHOW_PROJECT_SETTINGS_DIALOG = 'show_project_settings_dialog',
  SHOW_BRANCH_LINK_EDIT_DIALOG = 'show_branch_link_edit_dialog',
  CLOSE_EDIT_DIALOG = 'close_edit_dialog',
  SELECT_NODE = 'select_node',
  DESELECT_NODE = 'deselect_node',
  QUICK_EDIT_SUBMIT = 'quick_edit_submit',
  QUICK_EDIT_START = 'quick_edit_start',
  QUICK_EDIT_END = 'quick_edit_end',

  ADD_CHILD_SENTENCE = 'add_child_sentence',
  ADD_CHILD_BRANCH = 'add_child_branch',
  ADD_CHILD_ACTION = 'add_child_action',
  DELETE_NODE = 'delete_node',
  SAVE = 'save',
}

export default new EventEmitter();
