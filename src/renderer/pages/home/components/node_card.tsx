import { StoryletGroup } from 'renderer/models/story';
import {
  NodeType,
  Storylet,
  StoryletActionNode,
  StoryletBranchNode,
  StoryletEmptyActionNode,
  StoryletInitNode,
  StoryletSentenceNode,
} from 'renderer/models/storylet';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';
import eventBus, { Event } from '../event';
import Context from '../context';
import classNames from 'classnames';
import { useContext, useEffect, useRef, useState } from 'react';
import NodeActionMenu from './node_action_menu';

function NodeCard({
  pos,
  nodeId,
}: {
  pos: { x: number; y: number };
  nodeId: string;
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

  const { selectingNode, isQuickEditing } = useContext(Context);
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

    const deleteNode = () => {
      if (selectingNode !== nodeId) {
        return;
      }
      StoryProvider.deleteStoryletNode(nodeId);
    };

    const addChildAction = () => {
      if (selectingNode !== nodeId) {
        return;
      }
      const newNode = new StoryletEmptyActionNode();
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
    eventBus.on(Event.DELETE_NODE, deleteNode);
    return () => {
      eventBus.off(Event.QUICK_EDIT_SUBMIT, submit);
      eventBus.off(Event.ADD_CHILD_SENTENCE, addChildSentence);
      eventBus.off(Event.ADD_CHILD_BRANCH, addChildBranch);
      eventBus.off(Event.ADD_CHILD_ACTION, addChildAction);
      eventBus.off(Event.DELETE_NODE, deleteNode);
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

  if (!nodeData) {
    return null;
  }

  const isSelecting = selectingNode === nodeId;
  return (
    <>
      {nodeData instanceof StoryletInitNode && (
        <div
          className={classNames(
            'absolute bg-amber-400 rounded-xl p-4 text-3xl flex items-center justify-center font-bold hover:bg-amber-200 cursor-pointer transition-all',
            {
              'bg-amber-200': isSelecting,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '400px',
            zIndex: isSelecting ? '100' : '1',
          }}
          onClick={(e) => {
            e.stopPropagation();
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
        >
          {currentStorylet.name}
          <NodeActionMenu visible={isSelecting} sourceNode={nodeData} />
        </div>
      )}
      {nodeData instanceof StoryletSentenceNode && (
        <div
          className={classNames(
            'absolute bg-green-400 rounded-xl p-12 text-3xl flex items-center justify-center font-bold hover:bg-green-200 cursor-pointer transition-all',
            {
              'bg-green-200': isSelecting,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '400px',
            zIndex: isSelecting ? '100' : '1',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isSelecting) {
              /* setQuickEditing(false); */
              eventBus.emit(Event.QUICK_EDIT_END);
            }
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
        >
          {(!isQuickEditing || !isSelecting) && (
            <div
              className="resize-none text-md font-normal overflow-hidden cursor-pointer text-ellipsis"
              style={{ whiteSpace: 'nowrap' }}
            >
              {translations[nodeData.data.content]?.[currentLang]}
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
          <NodeActionMenu visible={isSelecting} sourceNode={nodeData} />
        </div>
      )}

      {nodeData instanceof StoryletBranchNode && (
        <div
          className={classNames(
            'absolute bg-blue-400 rounded-xl p-12 text-3xl flex items-center justify-center font-bold hover:bg-blue-200 cursor-pointer transition-all',
            {
              'bg-blue-200': isSelecting,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '400px',
            zIndex: isSelecting ? '100' : '1',
          }}
          onClick={(e) => {
            e.stopPropagation();
            eventBus.emit(Event.QUICK_EDIT_END);
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
        >
          {(!isQuickEditing || !isSelecting) && (
            <div
              className="resize-none text-md font-normal overflow-hidden cursor-pointer text-ellipsis"
              style={{ whiteSpace: 'nowrap' }}
            >
              {translations[nodeData.data.content]?.[currentLang]}
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
          <NodeActionMenu visible={isSelecting} sourceNode={nodeData} />
        </div>
      )}
      {nodeData instanceof StoryletActionNode && (
        <div
          className={classNames(
            'absolute bg-rose-400 rounded-xl p-12 text-3xl flex items-center justify-center font-bold hover:bg-blue-200 cursor-pointer transition-all',
            {
              'bg-rose-200': isSelecting,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '400px',
            zIndex: isSelecting ? '100' : '1',
          }}
          onClick={(e) => {
            e.stopPropagation();
            eventBus.emit(Event.QUICK_EDIT_END);
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
        >
          <NodeActionMenu visible={isSelecting} sourceNode={nodeData} />
        </div>
      )}
    </>
  );
}

export default NodeCard;
