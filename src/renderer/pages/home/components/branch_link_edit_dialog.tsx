import { useEffect, useState } from 'react';
import Dialog from 'renderer/components/dialog';
import { NodeLink } from 'renderer/models/base/tree';
import StoryProvider from 'renderer/services/story_provider';
import MonacoEditor from 'react-monaco-editor';
import eventBus, { Event } from '../event';

function BranchLinkEditDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [sourceNode, setSourceNode] = useState<NodeLink | null>(null);

  useEffect(() => {
    const showDialog = (data: NodeLink) => {
      setOpen(true);
      setForm({
        ...data.data,
        optionName:
          StoryProvider.translations[data.data.optionName]?.[
            StoryProvider.currentLang
          ],
      });
      setSourceNode(data);
    };
    eventBus.on(Event.SHOW_BRANCH_LINK_EDIT_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_BRANCH_LINK_EDIT_DIALOG, showDialog);
    };
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Option edit"
    >
      <div className="w-full flex flex-col p-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="text-md text-black font-bold mr-2">Option id</div>
            <input
              className="text-md text-black mr-2 w-32 border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
              placeholder="option id"
              value={form.optionId}
              onChange={(e) => {
                setForm((prev: any) => {
                  return {
                    ...prev,
                    optionId: e.target.value,
                  };
                });
              }}
            />
          </div>
          <div className="flex items-center flex-grow mb-2">
            <div className="text-md text-black font-bold mr-2">Option name</div>
            <input
              className="text-md text-black mr-2 border flex-grow border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
              placeholder="option name"
              value={form.optionName}
              onChange={(e) => {
                setForm((prev: any) => {
                  return {
                    ...prev,
                    optionName: e.target.value,
                  };
                });
              }}
            />
          </div>

          <div className="flex items-center flex-grow">
            <div className="text-md text-black font-bold mr-2">
              Control type
            </div>
            <select
              className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer mr-4"
              value={form.controlType}
              onChange={(e) => {
                form.controlType = e.target.value;
                setForm((prev) => {
                  return {
                    ...prev,
                  };
                });
              }}
            >
              <option value={'visible'}>Visible</option>
              <option value={'enable'}>Enable</option>
            </select>
          </div>

          <div className="flex flex-col flex-grow">
            <div className="text-md text-black my-2 font-bold">
              Control check
            </div>
            <MonacoEditor
              className="flex-shrink-0"
              width="100%"
              height="200"
              theme="vs-dark"
              value={form.controlCheck}
              options={{
                readOnly: false,
                selectOnLineNumbers: true,
              }}
              onChange={(v) => {
                form.controlCheck = v;
                setForm((prev) => {
                  return {
                    ...prev,
                  };
                });
              }}
              editorDidMount={(editor) => {
                setTimeout(() => {
                  editor.layout();
                }, 0);
              }}
            />
          </div>
        </div>
      </div>
      <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            setOpen(false);
            eventBus.emit(Event.CLOSE_DIALOG);
            if (sourceNode && form) {
              const newTranslations = { ...StoryProvider.translations };
              if (!newTranslations[sourceNode.data.optionName]) {
                newTranslations[sourceNode.data.optionName] = {
                  [StoryProvider.currentLang]: form.optionName,
                };
              } else {
                newTranslations[sourceNode.data.optionName][
                  StoryProvider.currentLang
                ] = form.optionName;
              }
              sourceNode.data = {
                ...form,
                optionName: sourceNode.data.optionName,
                controlType: form.controlType || 'visible',
                controlCheck: form.controlCheck || '',
              };
              StoryProvider.updateTranslations(newTranslations);
              StoryProvider.updateStoryletNodeLink(sourceNode);
            }
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            setOpen(false);
            eventBus.emit(Event.CLOSE_DIALOG);
          }}
        >
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

export default BranchLinkEditDialog;
