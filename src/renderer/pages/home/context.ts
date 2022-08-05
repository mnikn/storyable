import { createContext } from 'react';

export default createContext<{
  selectingNode: string | null;
}>({
  selectingNode: null,
});
