import classNames from 'classnames';
import * as d3 from 'd3';
import { get } from 'lodash';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { buildSchema } from 'renderer/models/schema/factory';
import {
  NodeType,
  Storylet,
  StoryletCustomNode,
  StoryletBranchNode,
  StoryletRootNode,
  StoryletSentenceNode,
} from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import useEventState from 'renderer/utils/use_event_state';
import Context from '../context';
import eventBus, { Event } from '../event';
import NodeActionMenu from './node_action_menu';

function NodeCard({
  pos,
  nodeId,
  data,
}: {
  pos: { x: number; y: number };
  nodeId: string;
  data: any;
}) {
  const currentStorylet = useEventState<Storylet>({
    event: StoryProvider.event,
    property: 'currentStorylet',
    initialVal: StoryProvider.currentStorylet || undefined,
  });
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

  const { selectingNode, isQuickEditing, dragingNode } = useContext(Context);
  const nodeData = currentStorylet?.nodes[nodeId];

  const [quickEditContent, setQuickEditContent] = useState('');
  const quickEditContentRef = useRef(quickEditContent);
  quickEditContentRef.current = quickEditContent;

  useEffect(() => {
    if (selectingNode !== nodeId) {
      /* setQuickEditing(false); */
      const currentNodeData = currentStorylet?.nodes[nodeId];
      if (
        currentNodeData &&
        (currentNodeData.data.type === NodeType.Sentence ||
          currentNodeData.data.type === NodeType.Branch)
      ) {
        const contentVal =
          StoryProvider.translations[(currentNodeData?.data as any)?.content]?.[
            StoryProvider.currentLang
          ] || '';
        setQuickEditContent(contentVal);
      }
    }
  }, [selectingNode, nodeId]);

  useEffect(() => {
    const submit = () => {
      if (selectingNode !== nodeId) {
        return;
      }
      eventBus.emit(Event.QUICK_EDIT_END);
      /* setQuickEditing(false); */
      const currentNodeData = currentStorylet?.nodes[nodeId];
      const contentVal =
        StoryProvider.translations[(currentNodeData?.data as any)?.content]?.[
          StoryProvider.currentLang
        ] || '';
      if (
        currentNodeData &&
        (currentNodeData.data.type === NodeType.Sentence ||
          currentNodeData.data.type === NodeType.Branch) &&
        contentVal !== quickEditContentRef.current
      ) {
        const newTranslations = { ...StoryProvider.translations };
        if (!newTranslations[(currentNodeData.data as any).content]) {
          newTranslations[(currentNodeData.data as any).content] = {
            [StoryProvider.currentLang]: quickEditContentRef.current,
          };
        } else {
          newTranslations[(currentNodeData.data as any).content][
            StoryProvider.currentLang
          ] = quickEditContentRef.current;
        }
        StoryProvider.updateTranslations(newTranslations);
      }
    };

    const addChildSentence = () => {
      if (selectingNode !== nodeId) {
        return;
      }
      const newNode = new StoryletSentenceNode();
      const currentNodeData = currentStorylet?.nodes[nodeId];
      if (!currentNodeData) {
        return;
      }
      StoryProvider.addStoryletNode(newNode, currentNodeData);
    };

    const addChildBranch = () => {
      if (selectingNode !== nodeId) {
        return;
      }
      const newNode = new StoryletBranchNode();
      const currentNodeData = currentStorylet?.nodes[nodeId];
      if (!currentNodeData) {
        return;
      }
      StoryProvider.addStoryletNode(newNode, currentNodeData);
    };

    const addChildAction = () => {
      if (selectingNode !== nodeId) {
        return;
      }
      const newNode = new StoryletCustomNode();
      const currentNodeData = currentStorylet?.nodes[nodeId];
      if (!currentNodeData) {
        return;
      }
      StoryProvider.addStoryletNode(newNode, currentNodeData);
    };

    eventBus.on(Event.QUICK_EDIT_SUBMIT, submit);
    eventBus.on(Event.ADD_CHILD_SENTENCE, addChildSentence);
    eventBus.on(Event.ADD_CHILD_BRANCH, addChildBranch);
    eventBus.on(Event.ADD_CHILD_ACTION, addChildAction);
    return () => {
      eventBus.off(Event.QUICK_EDIT_SUBMIT, submit);
      eventBus.off(Event.ADD_CHILD_SENTENCE, addChildSentence);
      eventBus.off(Event.ADD_CHILD_BRANCH, addChildBranch);
      eventBus.off(Event.ADD_CHILD_ACTION, addChildAction);
    };
  }, [selectingNode, nodeId]);

  useEffect(() => {
    if (!nodeData) {
      return;
    }
    if (
      nodeData.data.type === NodeType.Sentence ||
      nodeData.data.type === NodeType.Branch
    ) {
      const contentVal =
        StoryProvider.translations[(nodeData?.data as any)?.content]?.[
          StoryProvider.currentLang
        ] || '';
      setQuickEditContent(contentVal);
    }
  }, [nodeData]);

  const dragListen = useCallback(
    (dom: any) => {
      const dragListener = d3
        .drag()
        .on('drag', (d) => {
          eventBus.emit(Event.DRAG_NODE, d, data);
        })
        .on('end', (d) => {
          eventBus.emit(Event.END_DRAG_NODE, d);
        });
      dragListener(d3.select(dom));
    },
    [selectingNode, nodeId]
  );

  const actionSummary = useMemo(() => {
    if (!(nodeData instanceof StoryletCustomNode)) {
      return '';
    }
    const schemaItem = StoryProvider.projectSettings.customNodeConfig
      .map((item: any) => {
        return {
          type: item.type,
          schema: buildSchema(item.schema),
          schemaConfig: item.schema,
        };
      })
      .find((item) => item.type === nodeData.data.customType);
    if (!schemaItem) {
      return '';
    }
    return schemaItem.schema.config.summary.replace(
      /\{\{[A-Za-z0-9_.\[\]]+\}\}/g,
      (all) => {
        const word = all.substring(2, all.length - 2);
        const v = get(nodeData.data.extraData, word, '');
        if (typeof v === 'string' && StoryProvider.translations[v]) {
          return StoryProvider.translations[v]?.[currentLang];
        }
        return v;
      }
    );
  }, [nodeData]);

  if (!nodeData) {
    return null;
  }

  const isSelecting = selectingNode === nodeId;

  return (
    <>
      {nodeData instanceof StoryletRootNode && (
        <div
          id={nodeData.id}
          className={classNames(
            'absolute bg-amber-400 rounded-xl p-4 text-3xl flex items-center justify-center font-bold hover:bg-amber-200 cursor-pointer transition-all select-none',
            {
              'bg-amber-200': isSelecting,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '400px',
            zIndex: isSelecting ? '2' : '1',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (dragingNode) {
              return;
            }
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
        >
          {currentStorylet.name}
          <NodeActionMenu
            visible={isSelecting && !dragingNode}
            sourceNode={nodeData}
          />
        </div>
      )}
      {nodeData instanceof StoryletSentenceNode && (
        <div
          id={nodeData.id}
          className={classNames(
            'absolute bg-green-400 rounded-xl p-12 text-3xl flex items-center justify-center font-bold hover:bg-green-200 cursor-pointer transition-all select-none',
            {
              'bg-green-200': isSelecting,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '500px',
            zIndex: isSelecting ? '2' : '1',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isSelecting) {
              /* setQuickEditing(false); */
              eventBus.emit(Event.QUICK_EDIT_END);
            }
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
          ref={dragListen}
        >
          {(!isQuickEditing || !isSelecting) && (
            <div className="flex cursor-pointer w-full h-full overflow-hidden">
              {nodeData.data.actor && (
                <img
                  className="mr-5 object-contain bg-gray-800 rounded-md"
                  src={
                    (
                      projectSettings.actors.find(
                        (item: any) => item.id === nodeData.data.actor
                      )?.portraits || []
                    ).find((p: any) => p.id === nodeData.data.actorPortrait)
                      ?.pic || ''
                  }
                  alt=""
                  style={{ width: '100px', height: '100px' }}
                />
              )}
              <div
                className="resize-none text-md font-normal overflow-hidden text-ellipsis"
                style={{
                  lineClamp: 3,
                  display: '-webkit-box',
                  overflow: 'hidden',
                  boxOrient: 'vertical',
                }}
              >
                {translations[nodeData.data.content]?.[currentLang]}
              </div>
            </div>
          )}
          {isQuickEditing && isSelecting && (
            <textarea
              autoFocus
              className="resize-none text-md font-normal h-full overflow-hidden cursor-pointer outline-none"
              style={{ background: 'none' }}
              value={quickEditContent}
              onChange={(e) => {
                setQuickEditContent(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.code === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  eventBus.emit(Event.QUICK_EDIT_SUBMIT);
                }
              }}
            />
          )}
          <NodeActionMenu
            visible={isSelecting && !dragingNode}
            sourceNode={nodeData}
          />
        </div>
      )}

      {nodeData instanceof StoryletBranchNode && (
        <div
          id={nodeData.id}
          className={classNames(
            'absolute bg-blue-400 rounded-xl p-12 text-3xl flex items-center justify-center font-bold hover:bg-blue-200 cursor-pointer transition-all select-none',
            {
              'bg-blue-200': isSelecting,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '500px',
            zIndex: isSelecting ? '2' : '1',
          }}
          onClick={(e) => {
            e.stopPropagation();
            eventBus.emit(Event.QUICK_EDIT_END);
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
          ref={dragListen}
        >
          {(!isQuickEditing || !isSelecting) && (
            <div className="flex cursor-pointer w-full h-full overflow-hidden">
              {nodeData.data.actor && (
                <img
                  className="mr-5 object-contain bg-gray-800 rounded-md"
                  src={
                    (
                      projectSettings.actors.find(
                        (item: any) => item.id === nodeData.data.actor
                      )?.portraits || []
                    ).find((p: any) => p.id === nodeData.data.actorPortrait)
                      ?.pic || ''
                  }
                  alt=""
                  style={{ width: '100px', height: '100px' }}
                />
              )}
              <div
                className="resize-none text-md font-normal overflow-hidden text-ellipsis"
                style={{
                  lineClamp: 3,
                  display: '-webkit-box',
                  overflow: 'hidden',
                  boxOrient: 'vertical',
                }}
              >
                {translations[nodeData.data.content]?.[currentLang]}
              </div>
            </div>
          )}
          {isQuickEditing && isSelecting && (
            <textarea
              autoFocus
              className="resize-none text-md font-normal h-full overflow-hidden cursor-pointer outline-none"
              style={{ background: 'none' }}
              value={quickEditContent}
              onChange={(e) => {
                setQuickEditContent(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.code === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  eventBus.emit(Event.QUICK_EDIT_SUBMIT);
                }
              }}
            />
          )}
          <NodeActionMenu
            visible={isSelecting && !dragingNode}
            sourceNode={nodeData}
          />
        </div>
      )}
      {nodeData instanceof StoryletCustomNode && (
        <div
          id={nodeData.id}
          className={classNames(
            'absolute bg-rose-400 rounded-xl p-12 hover:bg-rose-200 cursor-pointer transition-all select-none',
            {
              'bg-rose-200': isSelecting,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '400px',
            zIndex: isSelecting ? '2' : '1',
          }}
          onClick={(e) => {
            e.stopPropagation();
            eventBus.emit(Event.QUICK_EDIT_END);
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
          ref={dragListen}
        >
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold mb-5">
              {nodeData.data.customType}
            </div>
            <div
              className="text-2xl"
              style={{
                lineClamp: 3,
                display: '-webkit-box',
                overflow: 'hidden',
                boxOrient: 'vertical',
                wordBreak: 'break-all',
              }}
            >
              {actionSummary}
            </div>
          </div>
          <NodeActionMenu
            visible={isSelecting && !dragingNode}
            sourceNode={nodeData}
          />
        </div>
      )}
    </>
  );
}

export default NodeCard;
