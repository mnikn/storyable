import EventEmitter from 'eventemitter3';

export enum Event {
  SHOW_SIDEBAR_RENAME_DIALOG = 'show_sidebar_rename_dialog',
  SHOW_ROOT_EDIT_DIALOG = 'show_root_edit_dialog',
  SHOW_SENTENCE_EDIT_DIALOG = 'show_sentence_edit_dialog',
  SHOW_BRANCH_EDIT_DIALOG = 'show_branch_edit_dialog',
  SHOW_PROJECT_SETTINGS_DIALOG = 'show_project_settings_dialog',
  SHOW_BRANCH_LINK_EDIT_DIALOG = 'show_branch_link_edit_dialog',
  SHOW_PREVIEW_DIALOG = 'show_preview_dialog',
  SHOW_MOVE_DIALOG = 'show_move_dialog',
  SHOW_CUSTOM_EDIT_DIALOG = 'show_custom_edit_dialog',
  ON_SHOW_DIALOG = 'ON_SHOW_DIALOG',
  CLOSE_DIALOG = 'close_dialog',
  SELECT_NODE = 'select_node',
  DESELECT_NODE = 'deselect_node',
  QUICK_EDIT_SUBMIT = 'quick_edit_submit',
  QUICK_EDIT_START = 'quick_edit_start',
  QUICK_EDIT_END = 'quick_edit_end',

  START_DRAG_NODE = 'start_drag_node',
  DRAG_NODE = 'drag_node',
  END_DRAG_NODE = 'end_drag_node',

  REFRESH_NODE_VIEW = 'refresh_node_view',

  ADD_CHILD_SENTENCE = 'add_child_sentence',
  ADD_CHILD_BRANCH = 'add_child_branch',
  ADD_CHILD_ACTION = 'add_child_action',
  ADD_SIBLING_SENTENCE = 'add_sibling_sentence',
  ADD_SIBLING_BRANCH = 'add_sibling_branch',
  ADD_SIBLING_CUSTOM = 'add_sibling_custom',
  DELETE_NODE = 'delete_node',
  DUPLICATE_NODE = 'duplicate_node',
  DUPLICATE_SIBLING_NODE = 'duplicate_sibling_node',

  UPDATE_VIEW_POS = 'update_view_pos',
  SAVE = 'save',

  TOGGLE_MULTI_SELECT = 'toggle_multi_select',
  SHOW_MULTI_EDIT_DIALOG = 'show_multi_edit_dialog',
}

export default new EventEmitter();
