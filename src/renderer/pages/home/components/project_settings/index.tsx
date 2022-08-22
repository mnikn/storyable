import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { CgArrowDownO, CgArrowUpO, CgMathPlus, CgRemove } from 'react-icons/cg';
import ImageUploading from 'react-images-uploading';
import Dialog from 'renderer/components/dialog';
import useEventState from 'renderer/utils/use_event_state';
import { generateUUID } from 'renderer/utils/uuid';
import StoryProvider from 'renderer/services/story_provider';
import eventBus, { Event } from '../../event';
import ExtraDataConfigPanel from '../edit_dialog/extra_data_config';
import CustomNodeConfigPanel from './custom_node_config';

enum Tab {
  I18n = 'I18n',
  ActorSettings = 'Actor settings',
  ExtraDataConfig = 'Extra data config',
  CustomNodeSettings = 'Custom node settings',
}

function ProjectSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.I18n);
  const currentLang = useEventState<any>({
    event: StoryProvider.event,
    property: 'currentLang',
    initialVal: StoryProvider.currentLang,
  });
  const translations = useEventState<any>({
    event: StoryProvider.event,
    property: 'translations',
    initialVal: StoryProvider.translations,
  });

  useEffect(() => {
    const showDialog = () => {
      setCurrentTab(Tab.I18n);
      setForm(StoryProvider.projectSettings);
      setOpen(true);
    };
    eventBus.on(Event.SHOW_PROJECT_SETTINGS_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_PROJECT_SETTINGS_DIALOG, showDialog);
    };
  }, []);

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Project settings"
    >
      <div className="w-full flex flex-col p-2" style={{ height: '650px' }}>
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
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
        {currentTab === Tab.I18n && (
          <>
            <div className="block p-6 flex flex-col flex-grow">
              <div className="h-48 overflow-auto p-2 mb-4 grid grid-cols-3 gap-3 flex-grow">
                {(form.i18n || []).map((lang: string, i: number) => {
                  return (
                    <div
                      className="flex rounded-md items-center outline-none h-24"
                      key={i}
                    >
                      <input
                        className="mr-2 border border-gray-300 p-2 rounded-md flex-grow w-full outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        value={lang}
                        disabled={i === 0}
                        placeholder="Lang"
                        onChange={(e) => {
                          form.i18n[i] = e.target.value;
                          setForm((prev: any) => {
                            return {
                              ...prev,
                            };
                          });
                        }}
                      />
                      {i !== 0 && (
                        <CgArrowUpO
                          className="cursor-pointer text-3xl mr-1"
                          onClick={() => {
                            const tmp = form.i18n[i - 1];
                            form.i18n[i - 1] = form.i18n[i];
                            form.i18n[i] = tmp;
                            setForm((prev: any) => {
                              return {
                                ...prev,
                              };
                            });
                          }}
                        />
                      )}
                      {i !== form.i18n.length - 1 && (
                        <CgArrowDownO
                          className="cursor-pointer text-3xl mr-1"
                          onClick={() => {
                            const tmp = form.i18n[i + 1];
                            form.i18n[i + 1] = form.i18n[i];
                            form.i18n[i] = tmp;
                            setForm((prev: any) => {
                              return {
                                ...prev,
                              };
                            });
                          }}
                        />
                      )}
                      <CgRemove
                        className="cursor-pointer text-3xl"
                        style={{ visibility: i !== 0 ? 'visible' : 'hidden' }}
                        onClick={() => {
                          form.i18n.splice(i, 1);
                          setForm((prev: any) => {
                            return {
                              ...prev,
                            };
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <button
                className="w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center"
                onClick={() => {
                  form.i18n.push('');
                  setForm((prev: any) => {
                    return {
                      ...prev,
                    };
                  });
                }}
              >
                <CgMathPlus className="mr-2" /> Add lang
              </button>
            </div>

            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-auto">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  StoryProvider.updateProjectSettings(form);
                  setOpen(false);
                  eventBus.emit(Event.CLOSE_DIALOG);
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
        )}
        {currentTab === Tab.ActorSettings && (
          <>
            <div className="block p-6 flex flex-col flex-grow">
              <div className="p-2 mb-4 flex-grow flex">
                <div className="flex flex-col p-2 mr-2 flex-grow">
                  <div className="h-96  overflow-auto">
                    {form.actors.map((item: any, i: number) => {
                      return (
                        <div
                          className="flex flex-col border rounded-md border-gray-300 p-2 mb-5 items-center"
                          key={i}
                        >
                          <div className="flex items-center mb-2 w-full">
                            <div className="flex p-1 items-center flex-grow">
                              <div className="font-bold text-sm mr-2">id:</div>
                              <input
                                className="border rounded-md border-gray-300 p-2 w-40 outline-none"
                                placeholder="id"
                                value={item.id}
                                onChange={(e) => {
                                  item.id = e.target.value;
                                  setForm((prev: any) => {
                                    return {
                                      ...prev,
                                    };
                                  });
                                }}
                              />
                            </div>
                            <div className="flex p-1 items-center flex-grow">
                              <div className="font-bold text-sm mr-2">
                                Name:
                              </div>
                              <input
                                className="border rounded-md border-gray-300 p-2 w-40 outline-none"
                                placeholder="name"
                                value={
                                  item.nameStr ||
                                  translations[item.name]?.[currentLang]
                                }
                                onChange={(e) => {
                                  item.nameStr = e.target.value;
                                  setForm((prev: any) => {
                                    return {
                                      ...prev,
                                    };
                                  });
                                }}
                              />
                            </div>
                            <CgRemove
                              className="cursor-pointer text-md"
                              onClick={() => {
                                form.actors.splice(i, 1);
                                setForm((prev: any) => {
                                  return {
                                    ...prev,
                                  };
                                });
                              }}
                            />
                          </div>
                          <div className="flex flex-col items-center h-32 w-full">
                            <div className="font-bold text-md">Portraits</div>
                            <div className="h-32 w-full overflow-auto">
                              {item.portraits.map((p) => {
                                return (
                                  <div className="flex items-center mb-2">
                                    <input
                                      className="border rounded-md border-gray-300 p-2 flex-grow outline-none mr-4"
                                      placeholder="id"
                                      value={p.id}
                                      onChange={(e) => {
                                        p.id = e.target.value;
                                        setForm((prev: any) => {
                                          return {
                                            ...prev,
                                          };
                                        });
                                      }}
                                    />
                                    <ImageUploading
                                      value={p.pic}
                                      onChange={(e) => {
                                        p.pic = e[0].file?.path;
                                        setForm((prev: any) => {
                                          return {
                                            ...prev,
                                          };
                                        });
                                      }}
                                      dataURLKey="data_url"
                                    >
                                      {({
                                        dragProps,
                                        onImageUpload,
                                        onImageUpdate,
                                      }) => {
                                        return (
                                          // write your building UI
                                          <div
                                            className="bg-gray-800 rounded-md flex items-center justify-center p-1 hover:bg-gray-500 transition-all cursor-pointer"
                                            style={{
                                              width: '80px',
                                              height: '80px',
                                            }}
                                          >
                                            {!p.pic && (
                                              <button
                                                className="flex text-white justify-center items-center w-full h-full"
                                                onClick={onImageUpload}
                                                {...dragProps}
                                              >
                                                <CgMathPlus className="mr-1" />
                                                Upload
                                              </button>
                                            )}
                                            {p.pic && (
                                              <div className="relative w-full h-full flex">
                                                <img
                                                  className="m-auto"
                                                  src={p.pic}
                                                  alt=""
                                                  onClick={() => {
                                                    onImageUpdate(0);
                                                  }}
                                                />
                                                <CgRemove
                                                  className="cursor-pointer text-md absolute top-0 right-0 text-white"
                                                  onClick={() => {
                                                    p.pic = '';
                                                    setForm((prev: any) => {
                                                      return {
                                                        ...prev,
                                                      };
                                                    });
                                                  }}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }}
                                    </ImageUploading>
                                    <CgRemove
                                      className="ml-2 cursor-pointer text-md"
                                      onClick={() => {
                                        item.portraits.splice(i, 1);
                                        setForm((prev: any) => {
                                          return {
                                            ...prev,
                                          };
                                        });
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            className="w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center mt-2"
                            onClick={() => {
                              item.portraits.push({
                                id: 'portrait_' + (item.portraits.length + 1),
                                pic: '',
                              });
                              setForm((prev: any) => {
                                return {
                                  ...prev,
                                };
                              });
                            }}
                          >
                            <CgMathPlus className="mr-2" /> Add portrait
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button
                className="w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center"
                onClick={() => {
                  const actorItem = {
                    id: 'actor_' + (form.actors.length + 1),
                    name: 'actor_name_' + generateUUID(),
                    portraits: [],
                  };
                  form.actors.push(actorItem);
                  const nameStr = 'Actor ' + (form.actors.length + 1);
                  StoryProvider.updateTranslateKey(actorItem.name, nameStr);
                  setForm((prev: any) => {
                    return {
                      ...prev,
                    };
                  });
                }}
              >
                <CgMathPlus className="mr-2" /> Add actor
              </button>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-auto">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  form.actors.forEach((item: any) => {
                    if (item.nameStr) {
                      StoryProvider.updateTranslateKey(item.name, item.nameStr);
                      delete item['nameStr'];
                    }
                  });
                  StoryProvider.updateProjectSettings(form);
                  setOpen(false);
                  eventBus.emit(Event.CLOSE_DIALOG);
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
        )}
        {currentTab === Tab.ExtraDataConfig && (
          <ExtraDataConfigPanel
            close={() => {
              setOpen(false);
              eventBus.emit(Event.CLOSE_DIALOG);
            }}
          />
        )}
        {currentTab === Tab.CustomNodeSettings && (
          <CustomNodeConfigPanel
            close={() => {
              setOpen(false);
              eventBus.emit(Event.CLOSE_DIALOG);
            }}
          />
        )}
      </div>
    </Dialog>
  );
}

export default ProjectSettingsDialog;
