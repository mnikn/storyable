import classNames from 'classnames';
import { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import Select, { components } from 'react-select';
import Dialog from 'renderer/components/dialog';
import {
  SchemaFieldSelect,
  SchemaFieldString,
} from 'renderer/models/schema/schema';
import {
  StoryletNode,
  StoryletSentenceNode,
  StoryletSentenceNodeData,
} from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import useEventState from 'renderer/utils/use_event_state';
import { CgMoreAlt } from 'react-icons/cg';
import eventBus, { Event } from '../event';
import ExtraDataPanel from './extra_data/extra_data_panel';
import FieldSelect from './extra_data/field/select_field';

enum Tab {
  BaseConfig = 'Base config',
  ExtraData = 'Extra data',
}

const onJumpProcesssSchema = new SchemaFieldString();
onJumpProcesssSchema.config = {
  ...onJumpProcesssSchema.config,
  type: 'multiline',
};

const actorDirectionDirection = new SchemaFieldSelect();
actorDirectionDirection.config.options = [
  {
    label: 'left',
    value: 'left',
  },
  {
    label: 'right',
    value: 'right',
  },
];

function SentenceEditDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StoryletSentenceNodeData | null>(null);
  const [sourceNode, setSourceNode] = useState<StoryletSentenceNode | null>(
    null
  );
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.BaseConfig);
  const translations = useEventState<any>({
    property: 'translations',
    event: StoryProvider.event,
    initialVal: StoryProvider.translations,
  });
  const currentLang = useEventState<any>({
    property: 'currentLang',
    event: StoryProvider.event,
    initialVal: StoryProvider.currentLang,
  });
  const projectSettings = useEventState<any>({
    property: 'projectSettings',
    event: StoryProvider.event,
    initialVal: StoryProvider.projectSettings,
  });
  const [contentSpeedEditVisible, setContentSpeedEditVisible] = useState(false);

  useEffect(() => {
    const showDialog = (data: StoryletSentenceNode) => {
      setOpen(true);
      setCurrentTab(Tab.BaseConfig);
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
          <div className="w-full flex flex-col p-2 overflow-auto">
            <div className="flex items-center">
              <div className="block mb-5 mr-5">
                <div className="text-md text-black mb-2 font-bold">
                  Custom node id
                </div>
                <input
                  className="resize-none text-md font-normal w-full h-8 outline-none border border-gray-300 rounded-md p-4 focus:ring-blue-500 focus:border-blue-500"
                  style={{ background: 'none' }}
                  value={form.customNodeId}
                  onChange={(e) => {
                    setForm((prev) => {
                      if (!prev) {
                        return prev;
                      }
                      return {
                        ...prev,
                        customNodeId: e.target.value,
                      };
                    });
                  }}
                />
              </div>
              <FieldSelect
                label="Actor direction"
                value={form.actorDirection}
                schema={actorDirectionDirection}
                onValueChange={(val) => {
                  setForm((prev) => {
                    if (!prev) {
                      return prev;
                    }
                    return {
                      ...prev,
                      actorDirection: val,
                    };
                  });
                }}
              />
            </div>

            <div className="block mb-5">
              <div className="text-md text-black mb-2 font-bold">Actor</div>
              <div className="flex items-center">
                <select
                  className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer mr-2 w-40"
                  value={form.actor || ''}
                  onChange={(e) => {
                    form.actor = e.target.value;
                    form.actorPortrait =
                      projectSettings.actors.find(
                        (item: any) => item.id === form.actor
                      )?.portraits[0]?.id || null;
                    setForm((prev: any) => {
                      return { ...prev };
                    });
                  }}
                >
                  {[
                    {
                      id: '',
                      name: 'None',
                      portraits: [],
                    },
                    ...projectSettings.actors,
                  ].map((actor: any, i: number) => {
                    return (
                      <option key={i} value={actor.id}>
                        {!actor.id
                          ? 'None'
                          : translations[actor.name]?.[currentLang]}
                      </option>
                    );
                  })}
                </select>
                <Select
                  className="text-sm block p-2 outline-none cursor-pointer mr-2 w-80"
                  value={form.actorPortrait || ''}
                  onChange={(e) => {
                    // form.actorPortrait = e.target.value;
                    form.actorPortrait = (e as any).value;
                    setForm((prev: any) => {
                      return { ...prev };
                    });
                  }}
                  options={(
                    projectSettings.actors.find(
                      (item: any) => item.id === form.actor
                    )?.portraits || []
                  ).map((p: any) => {
                    return {
                      value: p.id,
                      label: p.id,
                      pic: p.pic,
                    };
                  })}
                  components={{
                    Placeholder: () => {
                      return null;
                    },
                    IndicatorsContainer: (props) => {
                      return (
                        <components.IndicatorsContainer
                          {...props}
                          className={`${props.className} cursor-pointer`}
                        />
                      );
                    },
                    Input: (props) => {
                      const data = projectSettings.actors
                        .find((item: any) => item.id === form.actor)
                        ?.portraits.find((p) => p.id === form.actorPortrait);
                      return (
                        <div className="flex items-center p-2" {...props}>
                          <img
                            className="bg-gray-800 mr-2 object-cover"
                            src={data?.pic}
                            alt=""
                            style={{ width: '48px', height: '48px' }}
                          />
                          {form.actorPortrait || ''}
                        </div>
                      );
                    },
                    Option: ({ innerProps, data, label }) => {
                      return (
                        <div
                          className="flex items-center hover:bg-gray-100 transition-all p-2"
                          {...innerProps}
                        >
                          <img
                            className="bg-gray-800 mr-2 object-cover"
                            src={(data as any).pic}
                            alt=""
                            style={{ width: '80px', height: '80px' }}
                          />
                          {label}
                        </div>
                      );
                    },
                  }}
                />
              </div>
            </div>
            <div className="block mb-5">
              <div className="text-md text-black mb-2 font-bold">Content</div>
              <div className="flex items-center">
                <textarea
                  autoFocus
                  className="resize-none text-md font-normal w-full h-32 outline-none border border-gray-300 rounded-md p-4 focus:ring-blue-500 focus:border-blue-500 mr-2 mb-2"
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
                <button
                  className="border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center rounded"
                  onClick={() => {
                    setContentSpeedEditVisible(true);
                  }}
                >
                  <CgMoreAlt />
                </button>
              </div>
            </div>

            <div className="flex block">
              <div className="flex flex-col flex-grow">
                <div className="text-md text-black mb-2 font-bold flex">
                  On Jump process
                </div>
                <MonacoEditor
                  className="flex-shrink-0"
                  width="100%"
                  height="200"
                  theme="vs-dark"
                  value={form.onJumpProcess}
                  options={{
                    readOnly: false,
                    selectOnLineNumbers: true,
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
                    }, 0);
                  }}
                />
              </div>

              <div className="flex flex-col flex-grow">
                <div className="text-md text-black mb-2 font-bold">
                  After Jump process
                </div>
                <MonacoEditor
                  className="flex-shrink-0"
                  width="100%"
                  height="200"
                  theme="vs-dark"
                  value={form.afterJumpProcess}
                  options={{
                    readOnly: false,
                    selectOnLineNumbers: true,
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
                    }, 0);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col flex-grow">
              <div className="text-md text-black my-2 font-bold">
                Enable check
              </div>
              <MonacoEditor
                className="flex-shrink-0"
                width="100%"
                height="200"
                theme="vs-dark"
                language="plaintext"
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
              eventBus.emit(Event.CLOSE_DIALOG);
            }}
          >
            Cancel
          </button>
        </div>

        {contentSpeedEditVisible && form && (
          <Dialog
            open
            onClose={() => {
              setContentSpeedEditVisible(false);
            }}
            style={{
              width: '700px',
              border: '2px solid #2c2c2c',
              borderTop: '1px solid #2c2c2c',
            }}
          >
            <div className="text-md text-black mb-2 font-bold">
              Content Speed
            </div>
            <div className="flex flex-wrap">
              {form.content.split('').map((item, i) => {
                return (
                  <div className="flex flex-col mb-4 mr-10">
                    <div className="border rounded p-4 mb-2">{item}</div>
                    <input
                      className="border p-2 rouned w-16 outline-none"
                      type="number"
                      step="0.01"
                      value={
                        form.contentSpeed[StoryProvider.currentLang]?.[i] || 1
                      }
                      onChange={(e) => {
                        setForm((prev) => {
                          if (!prev) {
                            return prev;
                          }
                          if (!prev.contentSpeed[currentLang]) {
                            prev.contentSpeed[currentLang] = [];
                          }
                          prev.contentSpeed[currentLang][i] = Number(
                            e.target.value
                          );
                          return { ...prev };
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center mt-3 justify-center">
              <button
                className="border rounded-md shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-800 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  setContentSpeedEditVisible(false);
                }}
              >
                Confirm
              </button>
            </div>
          </Dialog>
        )}
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
    <>
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
    </>
  );
}

export default SentenceEditDialog;
