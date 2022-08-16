import { CgAddR, CgPen, CgRemoveR } from 'react-icons/cg';
import {
  StoryletBranchNode,
  StoryletInitNode,
  StoryletNode,
  StoryletSentenceNode,
} from 'renderer/models/storylet';
import eventBus, { Event } from '../event';

function NodeActionMenu({
  visible,
  sourceNode,
}: {
  visible: boolean;
  sourceNode: StoryletNode<any>;
}) {
  if (!visible) {
    return null;
  }
  return (
    <div
      className="bg-gray-100 w-86 flex items-center absolute rounded-md p-2 cursor-default h-12"
      style={{ top: '-100px' }}
    >
      <button
        className="pl-2 pr-2 text-base hover:bg-gray-300 rounded-sm transition-all h-full flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          eventBus.emit(Event.ADD_CHILD_SENTENCE);
        }}
      >
        <CgAddR className="font-bold text-xl mr-1" /> S
      </button>
      <div className="ml-2 mr-2 bg-gray-500 h-4/5 w-0.5" />
      <button
        className="pl-2 pr-2 text-base hover:bg-gray-300 rounded-sm transition-all h-full flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          eventBus.emit(Event.ADD_CHILD_BRANCH);
        }}
      >
        <CgAddR className="font-bold text-xl mr-1" /> B
      </button>
      <div className="ml-2 mr-2 bg-gray-500 h-4/5 w-0.5" />
      <button
        className="pl-2 pr-2 text-base hover:bg-gray-300 rounded-sm transition-all h-full flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          eventBus.emit(Event.ADD_CHILD_ACTION);
        }}
      >
        <CgAddR className="font-bold text-xl mr-1" /> A
      </button>

      {!(sourceNode instanceof StoryletInitNode) && (
        <>
          <div className="ml-2 mr-2 bg-gray-500 h-4/5 w-0.5" />
          <button
            className="pl-2 pr-2 text-base hover:bg-gray-300 rounded-sm transition-all h-full flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              eventBus.emit(Event.DELETE_NODE, sourceNode);
            }}
          >
            <CgRemoveR className="font-bold text-xl" />
          </button>
        </>
      )}

      <div className="ml-2 mr-2 bg-gray-500 h-4/5 w-0.5" />
      <button
        className="pl-2 pr-2 text-base hover:bg-gray-300 rounded-sm transition-all h-full flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (sourceNode instanceof StoryletSentenceNode) {
            eventBus.emit(Event.SHOW_SENTENCE_EDIT_DIALOG, sourceNode);
          } else if (sourceNode instanceof StoryletBranchNode) {
            eventBus.emit(Event.SHOW_BRANCH_EDIT_DIALOG, sourceNode);
          } else if (sourceNode instanceof StoryletInitNode) {
            eventBus.emit(Event.SHOW_ROOT_EDIT_DIALOG, sourceNode);
          }
        }}
      >
        <CgPen className="font-bold text-xl" />
      </button>

      <div className="ml-2 mr-2 bg-gray-500 h-4/5 w-0.5" />
    </div>
  );
}

export default NodeActionMenu;
