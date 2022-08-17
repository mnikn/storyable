import { useCallback, useEffect, useRef, useState } from 'react';
import Dialog from 'renderer/components/dialog';
import { CgMathPlus, CgRemove } from 'react-icons/cg';
import eventBus, { Event } from '../event';
import StoryProvider from '../../../services/story_provider';
import { ConditionType } from 'renderer/models/condition';
import { StoryletProcessor } from 'renderer/models/processor/strolet_processor';
import {
  Storylet,
  StoryletBranchNode,
  StoryletNode,
  StoryletSentenceNode,
} from 'renderer/models/storylet';
import useEventState from 'renderer/utils/use_event_state';
import StoryProcessor from 'renderer/models/processor/story_processor';
import { formatNodeLinkId } from 'renderer/models/base/tree';

const storyProcessor = new StoryProcessor();

function PreviewDialog() {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  /* const [passedNodes, setPassedNodes] = useState<StoryletNode<any>[]>([]); */
  const [finished, setFinished] = useState(false);
  const contentDomRef = useRef<HTMLDivElement>();
  const translations = useEventState<any>({
    event: StoryProvider.event,
    property: 'translations',
    initialVal: StoryProvider.translations,
  });
  const currentLang = useEventState<any>({
    event: StoryProvider.event,
    property: 'currentLang',
    initialVal: StoryProvider.currentLang,
  });
  const projectSettings = useEventState<any>({
    event: StoryProvider.event,
    property: 'projectSettings',
    initialVal: StoryProvider.projectSettings,
  });
  const nodePath = useEventState<{ nodeId: string; data: any }[]>({
    event: storyProcessor.tracker.event,
    property: 'nodePath',
    initialVal: storyProcessor.tracker.nodePath,
  });
  const passedNodes = (nodePath || []).map((item) => {
    return {
      node: (StoryProvider.currentStorylet as Storylet).nodes[item.nodeId],
      extra: item.data,
    };
  });

  useEffect(() => {
    const showDialog = () => {
      setParams([]);
      /* setPassedNodes([]); */
      setFinished(false);
      setProcessing(false);
      setOpen(true);
    };
    eventBus.on(Event.SHOW_PREVIEW_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_PREVIEW_DIALOG, showDialog);
    };
  }, []);

  const onDomMounted = useCallback((dom: HTMLDivElement) => {
    if (!dom) {
      return;
    }

    contentDomRef.current = dom;
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
      title="Preview"
    >
      <div className="block p-6 flex flex-col" style={{ height: '720px' }}>
        {!processing && (
          <>
            <div className="text-md text-black mb-2 font-bold">Params</div>
            <div className="flex-grow overflow-auto border border-gray-300 p-2 mb-4 rounded-md">
              {params.length === 0 && (
                <div className="text-md text-gray-500 w-full h-full flex items-center justify-center">
                  Empty params
                </div>
              )}
              {params.map((item, i) => {
                return (
                  <div className="flex border border-gray-300 p-2 mb-2 rounded-md items-center">
                    <div className="block mr-2 flex items-center">
                      <div className="text-sm mr-2">Param:</div>
                      <input
                        className="border border-gray-300 flex-grow text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none mr-2 w-32"
                        placeholder="Param name"
                        value={item.name}
                        onChange={(e) => {
                          params[i].name = e.target.value;
                          setParams((prev: any) => {
                            return [...prev];
                          });
                        }}
                      />
                      <div className="text-sm mr-2">Type:</div>
                      <select
                        className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer mr-2"
                        value={item.type}
                        onChange={(e) => {
                          let initialValue: any = 0;
                          const newType = e.target.value;
                          if (newType === ConditionType.String) {
                            initialValue = '';
                          }
                          if (newType === ConditionType.Boolean) {
                            initialValue = false;
                          }
                          setParams((prev) =>
                            prev.map((p, j) =>
                              i === j
                                ? {
                                    ...item,
                                    type: e.target.value,
                                    value: initialValue,
                                  }
                                : p
                            )
                          );
                        }}
                      >
                        {Object.keys(ConditionType).map((key, i) => {
                          return (
                            <option value={Object.values(ConditionType)[i]}>
                              {key}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    {item.type === ConditionType.Number && (
                      <input
                        className="border border-gray-300 flex-grow text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none w-32"
                        type="number"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => {
                          params[i].value = Number(e.target.value);
                          setParams((prev: any) => {
                            return [...prev];
                          });
                        }}
                      />
                    )}
                    {item.type === ConditionType.String && (
                      <input
                        className="border border-gray-300 flex-grow text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none w-32"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => {
                          params[i].value = e.target.value;
                          setParams((prev: any) => {
                            return [...prev];
                          });
                        }}
                      />
                    )}
                    {item.type === ConditionType.Boolean && (
                      <input
                        className="text-blue-600 flex-grow bg-gray-100 rounded border-gray-300 focus:ring-blue-500 outline-none cursor-pointer w-32"
                        type="checkbox"
                        placeholder="Value"
                        checked={item.value}
                        onChange={(e) => {
                          params[i].value = e.target.checked;
                          setParams((prev: any) => {
                            return [...prev];
                          });
                        }}
                      />
                    )}
                    <CgRemove
                      className="ml-2 cursor-pointer text-md hover:text-gray-400 transition-all flex-shrink-0"
                      onClick={() => {
                        params.splice(i, 1);
                        setParams((prev: any) => {
                          return [...prev];
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <button
              className="w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center outline-none"
              onClick={() => {
                params.push({
                  name: '',
                  type: ConditionType.String,
                  value: '',
                });
                setParams((prev: any) => {
                  return [...prev];
                });
              }}
            >
              <CgMathPlus className="mr-2" /> Add param
            </button>

            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  if (StoryProvider.currentStorylet) {
                    //processor.init(StoryProvider.currentStorylet);
                    storyProcessor.init(StoryProvider.currentStorylet, params);
                  }
                  setProcessing(true);
                  eventBus.emit(Event.CLOSE_DIALOG);
                }}
              >
                Preview story
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  if (StoryProvider.currentStorylet) {
                    storyProcessor.init(StoryProvider.currentStorylet, params);
                  }
                  setProcessing(true);
                  eventBus.emit(Event.CLOSE_DIALOG);
                }}
              >
                Preview storylet
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {}}
              >
                Node visualize
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm items-center"
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

        {processing && (
          <>
            <div
              className="block mt-6 bg-gray-600 rounded-md h-full cursor-pointer mb-5 p-4 overflow-auto"
              ref={onDomMounted}
              onClick={() => {
                if (finished) {
                  return;
                }

                //processor.next();
                storyProcessor.next();
                if (!storyProcessor.storyletProcessor.currentNode) {
                  setFinished(true);
                }
                setTimeout(() => {
                  contentDomRef.current?.scrollBy(
                    0,
                    contentDomRef.current.scrollHeight
                  );
                }, 0);
                /* contentDomRef.current?.scrollTo(
                 *   0,
                 *   contentDomRef.current.scrollHeight
                 * ); */
              }}
            >
              {passedNodes.map((item, j) => {
                const node = item.node;
                const currentStorylet = StoryProvider.currentStorylet;
                if (!currentStorylet) {
                  return null;
                }
                const childLinks = currentStorylet.getNodeChildrenLinks(
                  node.id
                );
                return (
                  <>
                    {node instanceof StoryletSentenceNode && (
                      <div
                        className="bg-green-400 rounded-xl p-12 text-md flex items-center mb-4 select-none"
                        style={{
                          wordBreak: 'break-all',
                        }}
                        key={item.node.id}
                      >
                        {node.data.actor && (
                          <img
                            className="mr-5 object-contain bg-gray-800 rounded-md"
                            src={
                              (
                                projectSettings.actors.find(
                                  (item: any) => item.id === node.data.actor
                                )?.portraits || []
                              ).find(
                                (p: any) => p.id === node.data.actorPortrait
                              )?.pic || ''
                            }
                            style={{ width: '100px', height: '100px' }}
                          />
                        )}
                        {translations[node.data.content]?.[currentLang]}
                      </div>
                    )}
                    {node instanceof StoryletBranchNode && (
                      <>
                        <div
                          className="bg-blue-400 rounded-xl p-12 text-md flex items-center justify-center mb-4 select-none"
                          style={{
                            wordBreak: 'break-all',
                          }}
                          key={item.node.id}
                        >
                          {node.data.actor && (
                            <img
                              className="mr-5 object-contain bg-gray-800 rounded-md"
                              src={
                                (
                                  projectSettings.actors.find(
                                    (item: any) => item.id === node.data.actor
                                  )?.portraits || []
                                ).find(
                                  (p: any) => p.id === node.data.actorPortrait
                                )?.pic || ''
                              }
                              style={{ width: '100px', height: '100px' }}
                            />
                          )}
                          {translations[node.data.content]?.[currentLang]}
                        </div>
                        {j === passedNodes.length - 1 &&
                          !finished &&
                          childLinks.map((link) => {
                            return (
                              <div
                                className="rounded-xl p-2 text-md flex items-center justify-center mb-4 border-2 border-amber-400 rounded-md text-white hover:bg-amber-400 transition-all select-none"
                                style={{
                                  wordBreak: 'break-all',
                                }}
                                key={formatNodeLinkId(
                                  link.source.id,
                                  link.target.id
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  storyProcessor.chooseOption(
                                    link.data.optionId
                                  );
                                  if (
                                    !storyProcessor.storyletProcessor
                                      .currentNode
                                  ) {
                                    setFinished(true);
                                  }
                                  setTimeout(() => {
                                    contentDomRef.current?.scrollBy(
                                      0,
                                      contentDomRef.current.scrollHeight
                                    );
                                  }, 0);
                                }}
                              >
                                {
                                  translations[link.data.optionName]?.[
                                    currentLang
                                  ]
                                }
                              </div>
                            );
                          })}
                        {(j !== passedNodes.length - 1 || finished) && (
                          <div
                            className="rounded-xl p-2 text-md flex items-center justify-center mb-4 border-2 border-amber-400 rounded-md text-white transition-all select-none"
                            style={{
                              wordBreak: 'break-all',
                            }}
                          >
                            {
                              translations[
                                (childLinks || []).find(
                                  (o) =>
                                    o.data?.optionId === item.extra?.optionId
                                )?.data?.optionName
                              ]?.[currentLang]
                            }
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })}
              {finished && (
                <div className="font-bold text-gray-400 flex items-center justify-center select-none">
                  -----&nbsp;Finished&nbsp;-----
                </div>
              )}
            </div>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto transition-all outline-none select-none"
              onClick={() => {
                setOpen(false);
                eventBus.emit(Event.CLOSE_DIALOG);
              }}
            >
              Exit
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
}

export default PreviewDialog;
