import { createContext } from 'react';

export default createContext<{
  selectingNode: string | null;
  isQuickEditing: boolean;
}>({
  selectingNode: null,
  isQuickEditing: false,
});
