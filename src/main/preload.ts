import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { generateUUID } from 'renderer/utils/uuid';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    async call(command: string, arg: any) {
      const id = generateUUID();
      return new Promise((resolve) => {
        const handle = (_: any, res: any) => {
          if (res.arg.action === id) {
            resolve(res);
            ipcRenderer.off(command, handle);
          }
        };
        ipcRenderer.on(command, handle);
        ipcRenderer.send(command, { action: id, ...arg });
      });
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
