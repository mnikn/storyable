import classNames from 'classnames';
import { table } from 'console';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import Dialog from 'renderer/components/dialog';
import { buildSchema } from 'renderer/models/schema/factory';
import { validateValue } from 'renderer/models/schema/schema';
import {
  StoryletCustomNode,
  StoryletCustomNodeData,
  StoryletNode,
} from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import useEventState from 'renderer/utils/use_event_state';
import eventBus, { Event } from '../event';
import ConditionPanel from './edit_dialog/condition_panel';
import PicPart from './edit_dialog/pic_part';
import ExtraDataPanel from './extra_data/extra_data_panel';

enum Tab {
  BaseConfig = 'Base config',
  Data = 'Extra data',
  Pic = 'Pic',
}

function CustomEditDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StoryletCustomNodeData | null>(null);
  const [sourceNode, setSourceNode] = useState<StoryletCustomNode | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.BaseConfig);
  const projectSettings = useEventState<any>({
    property: 'projectSettings',
    event: StoryProvider.event,
    initialVal: StoryProvider.projectSettings,
  });

  const customSchemas = useMemo(() => {
    return projectSettings.customNodeConfig.map((item: any) => {
      return {
        type: item.type,
        schema: buildSchema(item.schema),
        schemaConfig: item.schema,
      };
    });
  }, [projectSettings]);
  useEffect(() => {
    const showDialog = (data: StoryletCustomNode) => {
      setCurrentTab(Tab.BaseConfig);
      setOpen(true);
      setForm(data.data);
      setSourceNode(data);
    };
    eventBus.on(Event.SHOW_CUSTOM_EDIT_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_CUSTOM_EDIT_DIALOG, showDialog);
    };
  }, []);

  const options = customSchemas.map((item: any) => {
    return {
      label: item.type,
      value: item.type,
    };
  });

  if (!form || !sourceNode) {
    return null;
  }

  return (
    <Dialog
      width={800}
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Edit custom node"
    >
      <div className="w-full flex flex-col p-2" style={{ height: '900px' }}>
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 mb-5">
          {Object.values(
            ['desc_cell', 'option_cell'].includes(sourceNode.data.customType)
              ? Tab
              : {
                  BaseConfig: 'Base config',
                  Data: 'Extra data',
                }
          ).map((key) => {
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
        {currentTab === Tab.BaseConfig && (
          <>
            <div className="w-full flex flex-col mb-5">
              <div className="block mb-5">
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
              <div className="w-full flex items-center mb-5">
                <div className="text-md font-bold mr-2">Custom type:</div>
                <Select
                  className="text-sm block outline-none cursor-pointer flex-grow"
                  value={options.find((o: any) => o.value === form.customType)}
                  onChange={(e) => {
                    form.customType = e.value;
                    setForm((prev: any) => {
                      return { ...prev };
                    });
                  }}
                  options={options}
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
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-auto">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  setOpen(false);
                  eventBus.emit(Event.CLOSE_DIALOG);
                  sourceNode.data.customType = form.customType;
                  sourceNode.data.enableConditions = form.enableConditions;
                  StoryProvider.updateStoryletNode(sourceNode);
                  setForm((prev) => {
                    if (!prev) {
                      return prev;
                    }
                    return { ...prev };
                  });
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
        {currentTab === Tab.Data && (
          <ExtraDataPanel
            sourceNode={sourceNode as StoryletNode<any>}
            customType={form.customType}
            onSubmit={() => {
              sourceNode.data.customType = form.customType;
              StoryProvider.updateStoryletNode(sourceNode);
            }}
            close={() => {
              setOpen(false);
              eventBus.emit(Event.CLOSE_DIALOG);
            }}
          />
        )}
        {currentTab === Tab.Pic && (
          <PicPart
            sourceNode={sourceNode as StoryletNode<any>}
            onSubmit={() => {
              StoryProvider.updateStoryletNode(sourceNode);
            }}
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

export default CustomEditDialog;
