import classNames from 'classnames';
import { useEffect, useState } from 'react';
import Dialog from 'renderer/components/dialog';
import {
  StoryletSentenceNode,
  StoryletSentenceNodeData,
} from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import eventBus, { Event } from '../event';
import ConditionPanel from './condition_panel';

enum Tab {
  BaseConfig = 'Base config',
  ExtraData = 'Extra data',
}

function SentenceEditDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StoryletSentenceNodeData | null>(null);
  const [sourceNode, setSourceNode] = useState<StoryletSentenceNode | null>(
    null
  );
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.BaseConfig);

  useEffect(() => {
    const showDialog = (data: StoryletSentenceNode) => {
      setOpen(true);
      setForm({
        ...data.data,
        content:
          StoryProvider.translations[data.data.content]?.[
            StoryProvider.currentLang
          ],
      });
      setSourceNode(data);
    };
    eventBus.on(Event.SHOW_SENTENCE_EDIT_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_SENTENCE_EDIT_DIALOG, showDialog);
    };
  }, []);

  let content: any = null;
  if (currentTab === Tab.BaseConfig) {
    content = (
      <>
        {form && (
          <div className="w-full flex flex-col p-2">
            <div className="block mb-5">
              <div className="text-md text-black mb-2 font-bold">Content</div>
              <textarea
                autoFocus
                className="resize-none text-md font-normal w-full h-32 outline-none border border-gray-300 rounded-md p-4 focus:ring-blue-500 focus:border-blue-500"
                style={{ background: 'none' }}
                value={form.content}
                onChange={(e) => {
                  setForm((prev) => {
                    if (!prev) {
                      return prev;
                    }
                    return {
                      ...prev,
                      content: e.target.value,
                    };
                  });
                }}
              />
            </div>

            <ConditionPanel
              conditions={form.enableConditions}
              onChange={(val) => {
                form.enableConditions = val;
                setForm((prev) => {
                  if (!prev) {
                    return prev;
                  }
                  return { ...prev };
                });
              }}
            />
          </div>
        )}
        <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => {
              setOpen(false);
              eventBus.emit(Event.CLOSE_EDIT_DIALOG);
              if (sourceNode && form) {
                const newTranslations = { ...StoryProvider.translations };
                if (!newTranslations[sourceNode.data.content]) {
                  newTranslations[sourceNode.data.content] = {
                    [StoryProvider.currentLang]: form.content,
                  };
                } else {
                  newTranslations[sourceNode.data.content][
                    StoryProvider.currentLang
                  ] = form.content;
                }
                sourceNode.data = {
                  ...form,
                  content: sourceNode.data.content,
                };
                StoryProvider.updateTranslations(newTranslations);
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
              eventBus.emit(Event.CLOSE_EDIT_DIALOG);
            }}
          >
            Cancel
          </button>
        </div>
      </>
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

export default SentenceEditDialog;
