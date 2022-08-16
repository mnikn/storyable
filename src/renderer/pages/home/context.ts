import { createContext } from 'react';

export default createContext<{
  selectingNode: string | null;
  isQuickEditing: boolean;
  dragingNode: any;
}>({
  selectingNode: null,
  isQuickEditing: false,
  dragingNode: false,
});
