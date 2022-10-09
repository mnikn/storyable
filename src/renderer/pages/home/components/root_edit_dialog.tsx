import classNames from 'classnames';
import { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import Dialog from 'renderer/components/dialog';
import {
  StoryletRootNode,
  StoryletRootNodeData,
  StoryletNode,
} from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import eventBus, { Event } from '../event';
import ConditionPanel from './edit_dialog/condition_panel';
import ExtraDataPanel from './extra_data/extra_data_panel';

enum Tab {
  BaseConfig = 'Base config',
  ExtraData = 'Extra data',
}

function RootEditDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StoryletRootNodeData | null>(null);
  const [sourceNode, setSourceNode] = useState<StoryletRootNode | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.BaseConfig);

  useEffect(() => {
    const showDialog = (data: StoryletRootNode) => {
      setOpen(true);
      setForm({
        ...data.data,
      });
      setSourceNode(data);
    };
    eventBus.on(Event.SHOW_ROOT_EDIT_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_ROOT_EDIT_DIALOG, showDialog);
    };
  }, []);

  let content: any = null;
  if (currentTab === Tab.BaseConfig) {
    content = (
      <>
        {form && (
          <div className="w-full flex flex-col p-2 flex-grow overflow-auto">
            <div className="text-md text-black mb-2 font-bold">
              On jump process
            </div>
            <MonacoEditor
              className="block flex-shrink-0"
              width="100%"
              height="200"
              theme="vs-dark"
              value={form.onJumpProcess}
              language={'python'}
              options={{
                readOnly: false,
                selectOnLineNumbers: true,
                insertSpaces: true,
              }}
              onChange={(v) => {
                form.onJumpProcess = v;
                setForm((prev) => {
                  return {
                    ...prev,
                  };
                });
              }}
              editorDidMount={(editor) => {
                setTimeout(() => {
                  editor.layout();
                  editor.focus();
                }, 0);
              }}
            />

            <div className="text-md text-black mb-2 font-bold">
              After jump process
            </div>
            <MonacoEditor
              className="block flex-shrink-0"
              width="100%"
              height="200"
              theme="vs-dark"
              value={form.afterJumpProcess}
              language={'python'}
              options={{
                readOnly: false,
                selectOnLineNumbers: true,
                insertSpaces: true,
              }}
              onChange={(v) => {
                form.afterJumpProcess = v;
                setForm((prev) => {
                  return {
                    ...prev,
                  };
                });
              }}
              editorDidMount={(editor) => {
                setTimeout(() => {
                  editor.layout();
                  editor.focus();
                }, 0);
              }}
            />

            <div className="flex flex-col flex-grow">
              <div className="text-md text-black my-2 font-bold">
                Enable check
              </div>
              <MonacoEditor
                className="flex-shrink-0"
                width="100%"
                height="200"
                theme="vs-dark"
                value={form.enableCheck}
                options={{
                  readOnly: false,
                  selectOnLineNumbers: true,
                }}
                onChange={(v) => {
                  form.enableCheck = v;
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
        )}
        <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => {
              setOpen(false);
              eventBus.emit(Event.CLOSE_DIALOG);
              if (sourceNode && form) {
                sourceNode.data = {
                  ...form,
                };
                StoryProvider.updateStoryletNode(sourceNode);
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
      </>
    );
  }
  if (currentTab === Tab.ExtraData) {
    content = (
      <ExtraDataPanel
        sourceNode={sourceNode as StoryletNode<any>}
        close={() => {
          setOpen(false);
          eventBus.emit(Event.CLOSE_DIALOG);
        }}
      />
    );
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Edit sentence"
    >
      <div className="w-full flex flex-col p-2" style={{ height: '650px' }}>
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 mb-5">
          {Object.values(Tab).map((key) => {
            return (
              <li
                className="mr-2"
                key={key}
                onClick={() => {
                  setCurrentTab(key);
                }}
              >
                <div
                  className={classNames(
                    'inline-block p-4 text-gray-600 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500 outline-none cursor-pointer',
                    {
                      'bg-gray-100 font-bold': currentTab === key,
                    }
                  )}
                >
                  {key}
                </div>
              </li>
            );
          })}
        </ul>
        {content}
      </div>
    </Dialog>
  );
}

export default RootEditDialog;
