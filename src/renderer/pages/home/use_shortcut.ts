import { useContext, useEffect, useState } from 'react';
import {
  StoryletCustomNode,
  StoryletBranchNode,
  StoryletRootNode,
  StoryletSentenceNode,
} from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import Context from './context';
import eventBus, { Event } from './event';

function useShortcut({
  multiSelectMode,
  selectingNode,
  isQuickEditing,
  isDialogEditing,
}: {
  multiSelectMode: boolean;
  selectingNode: string | null;
  isQuickEditing: boolean;
  isDialogEditing: boolean;
}) {
  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (isQuickEditing || isDialogEditing) {
        return;
      }

      e.preventDefault();
      // switch lang shortcut
      if (e.code.includes('Digit') && e.ctrlKey) {
        const index = Number(e.code.split('Digit')[1]) - 1;
        if (index >= 0 && StoryProvider.projectSettings.i18n.length > index) {
          StoryProvider.changeLang(StoryProvider.projectSettings.i18n[index]);
        }
      }

      if (e.code === 'KeyS' && e.ctrlKey) {
        eventBus.emit(Event.SAVE);
      }

      const currentStorylet = StoryProvider.currentStorylet;
      if (!selectingNode || !currentStorylet) {
        return;
      }
      const currentSelectingNode = currentStorylet.nodes[selectingNode];
      if (!currentSelectingNode) {
        return;
      }
      const parent = currentStorylet.getNodeSingleParent(selectingNode);
      if (e.code === 'Tab') {
        if (e.ctrlKey) {
          if (e.shiftKey) {
            eventBus.emit(Event.ADD_CHILD_ACTION);
          } else {
            eventBus.emit(Event.ADD_CHILD_BRANCH);
          }
        } else {
          eventBus.emit(Event.ADD_CHILD_SENTENCE);
        }
      }

      if (e.code === 'Enter') {
        if (e.ctrlKey) {
          if (e.shiftKey) {
            eventBus.emit(Event.ADD_SIBLING_CUSTOM);
          } else {
            eventBus.emit(Event.ADD_SIBLING_BRANCH);
          }
        } else {
          eventBus.emit(Event.ADD_SIBLING_SENTENCE);
        }
      }

      if (e.code === 'Escape') {
        eventBus.emit(Event.DESELECT_NODE);
      }

      if (e.code === 'KeyE') {
        if (multiSelectMode) {
          eventBus.emit(Event.SHOW_MULTI_EDIT_DIALOG);
          return;
        }
        if (currentSelectingNode instanceof StoryletSentenceNode) {
          eventBus.emit(Event.SHOW_SENTENCE_EDIT_DIALOG, currentSelectingNode);
        } else if (currentSelectingNode instanceof StoryletBranchNode) {
          eventBus.emit(Event.SHOW_BRANCH_EDIT_DIALOG, currentSelectingNode);
        } else if (currentSelectingNode instanceof StoryletRootNode) {
          eventBus.emit(Event.SHOW_ROOT_EDIT_DIALOG, currentSelectingNode);
        } else if (currentSelectingNode instanceof StoryletCustomNode) {
          eventBus.emit(Event.SHOW_CUSTOM_EDIT_DIALOG, currentSelectingNode);
        }
      }

      if (e.code === 'KeyD' && e.ctrlKey) {
        const event = e.altKey
          ? Event.DUPLICATE_SIBLING_NODE
          : Event.DUPLICATE_NODE;
        eventBus.emit(event);
        return;
      }

      if (
        e.code === 'Backspace' &&
        !(currentSelectingNode instanceof StoryletRootNode)
      ) {
        e.preventDefault();
        eventBus.emit(Event.DELETE_NODE, currentSelectingNode);
      }
      // if (
      //   e.code === 'Space' &&
      //   !(currentSelectingNode instanceof StoryletRootNode)
      // ) {
      //   e.preventDefault();
      //   eventBus.emit(Event.QUICK_EDIT_START);
      // }

      if (e.code === 'ArrowLeft' && parent) {
        eventBus.emit(Event.SELECT_NODE, parent.id);
      }
      if (e.code === 'ArrowRight') {
        const children = currentStorylet.getNodeChildren(selectingNode);
        if (children.length > 0) {
          eventBus.emit(Event.SELECT_NODE, children[0].id);
        }
      }
      if (e.code === 'ArrowUp' && parent) {
        const children = currentStorylet.getNodeChildren(parent.id);
        const index =
          children.findIndex((node) => {
            return node.id === currentSelectingNode.id;
          }) - 1;
        if (index >= 0) {
          eventBus.emit(Event.SELECT_NODE, children[index].id);
        }
      }

      if (e.code === 'ArrowDown' && parent) {
        const children = currentStorylet.getNodeChildren(parent.id);
        const index = children.findIndex((node) => {
          return node.id === currentSelectingNode.id;
        });
        if (index !== -1 && (children.length || -1) > index + 1) {
          eventBus.emit(Event.SELECT_NODE, children[index + 1].id);
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selectingNode, isQuickEditing, isDialogEditing, multiSelectMode]);
}

export default useShortcut;
