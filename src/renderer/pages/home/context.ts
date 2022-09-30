import { createContext } from 'react';

export default createContext<{
  selectingNode: string | null;
  isQuickEditing: boolean;
  dragingNode: any;
  multiSelectMode: boolean;
  selectingNodes: any[];
}>({
  selectingNode: null,
  isQuickEditing: false,
  dragingNode: false,
  multiSelectMode: false,
  selectingNodes: []
});
