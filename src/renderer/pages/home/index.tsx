import { useCallback, useEffect, useState } from 'react';
import StoryProvider from 'renderer/services/story_provider';
import Link from './components/link';
import NodeCard from './components/node_card';
import Sidebar from './sidebar';
import useView from './use_view';
import Context from './context';
import eventBus, { Event } from './event';
import useShortcut from './use_shortcut';
import { StoryletNode } from 'renderer/models/storylet';
import SentenceEditDialog from './components/sentence_edit_dialog';
import BranchEditDialog from './components/branch_edit_dialog';
import TopMenu from './top_menu';
import ProjectSettingsDialog from './components/project_settings_dialog';
import BranchLinkEditDialog from './components/branch_link_edit_dialog';

function Home() {
  const [zoomDom, setZoomDom] = useState<HTMLDivElement | null>(null);

  const [selectingNode, setSelectingNode] = useState<string | null>(null);
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [isDialogEditing, setIsDialogEditing] = useState(false);

  const { treeData, linkData } = useView({
    zoomDom,
  });

  useEffect(() => {
    setIsQuickEditing(false);
  }, [selectingNode]);

  useShortcut({
    selectingNode,
    isQuickEditing,
    isDialogEditing,
  });

  useEffect(() => {
    const onSelectNode = (node: string) => {
      setSelectingNode((prev) => {
        if (prev === node) {
          return null;
        }
        return node;
      });
    };

    const onDeselect = () => {
      setSelectingNode(null);
    };

    const onQuickEditStart = () => {
      setIsQuickEditing(true);
    };

    const onQuickEditEnd = () => {
      setIsQuickEditing(false);
    };

    const onDeleteNode = (currentSelectingNode: StoryletNode<any>) => {
      const currentStorylet = StoryProvider.currentStorylet;
      if (!currentStorylet) {
        return;
      }
      if (!currentSelectingNode) {
        return;
      }

      const parent = currentStorylet.getNodeSingleParent(
        currentSelectingNode.id
      );
      if (parent) {
        const children = currentStorylet.getNodeChildren(parent.id);
        const index = children.findIndex((node) => {
          return node.id === currentSelectingNode.id;
        });
        if (index !== -1 && children.length > index + 1) {
          eventBus.emit(Event.SELECT_NODE, children[index + 1].id);
        } else if (children.length < index) {
          eventBus.emit(Event.SELECT_NODE, children[index - 1].id);
        } else if (children.length > 0) {
          eventBus.emit(Event.SELECT_NODE, children[0].id);
        } else {
          eventBus.emit(Event.SELECT_NODE, parent.id);
        }
      }
    };

    const onDialogShow = () => {
      setIsDialogEditing(true);
    };

    const onDialogClose = () => {
      setIsDialogEditing(false);
    };

    const onSave = async () => {
      StoryProvider.save();
    };

    eventBus.on(Event.SELECT_NODE, onSelectNode);
    eventBus.on(Event.DESELECT_NODE, onDeselect);
    eventBus.on(Event.QUICK_EDIT_START, onQuickEditStart);
    eventBus.on(Event.QUICK_EDIT_END, onQuickEditEnd);
    eventBus.on(Event.DELETE_NODE, onDeleteNode);
    eventBus.on(Event.SHOW_SENTENCE_EDIT_DIALOG, onDialogShow);
    eventBus.on(Event.SHOW_BRANCH_EDIT_DIALOG, onDialogShow);
    eventBus.on(Event.SHOW_PROJECT_SETTINGS_DIALOG, onDialogShow);
    eventBus.on(Event.SHOW_BRANCH_LINK_EDIT_DIALOG, onDialogShow);
    eventBus.on(Event.CLOSE_EDIT_DIALOG, onDialogClose);
    eventBus.on(Event.SAVE, onSave);
    return () => {
      eventBus.off(Event.SELECT_NODE, onSelectNode);
      eventBus.off(Event.DESELECT_NODE, onDeselect);
      eventBus.off(Event.QUICK_EDIT_START, onQuickEditStart);
      eventBus.off(Event.QUICK_EDIT_END, onQuickEditEnd);
      eventBus.off(Event.DELETE_NODE, onDeleteNode);
      eventBus.off(Event.SHOW_SENTENCE_EDIT_DIALOG, onDialogShow);
      eventBus.off(Event.SHOW_BRANCH_EDIT_DIALOG, onDialogShow);
      eventBus.off(Event.SHOW_BRANCH_LINK_EDIT_DIALOG, onDialogShow);
      eventBus.off(Event.CLOSE_EDIT_DIALOG, onDialogClose);
      eventBus.off(Event.SAVE, onSave);
    };
  }, []);

  const onDomMounted = useCallback((dom: HTMLDivElement) => {
    if (dom) {
      setZoomDom(dom);
    }
  }, []);

  return (
    <Context.Provider
      value={{
        selectingNode,
        isQuickEditing,
      }}
    >
      <div className="flex h-full">
        <Sidebar />
        <div
          id="main-content"
          className="flex-grow bg-gray-600 relative"
          style={{ overflow: 'hidden' }}
        >
          <div
            id="graph-container"
            ref={onDomMounted}
            className="absolute h-full w-full"
          >
            <div id="nodes" className="absolute h-full w-full">
              {treeData.map((item) => {
                return (
                  <div key={item.id}>
                    <>
                      <NodeCard
                        nodeId={item.id}
                        pos={{
                          x: item.x0,
                          y: item.y0,
                        }}
                      />
                    </>
                  </div>
                );
              })}
            </div>

            <svg
              id="dialogue-tree-links-container"
              className="absolute w-full h-full"
              style={{
                overflow: 'inherit',
                pointerEvents: 'none',
              }}
            />

            <div
              id="connections"
              className="absolute w-full h-full"
              style={{
                overflow: 'inherit',
              }}
            >
              {linkData.map((item) => {
                return (
                  <Link
                    key={item.from.data.id + '-' + item.target.data.id}
                    from={item.from}
                    target={item.target}
                  />
                );
              })}
            </div>
          </div>

          <TopMenu />
        </div>
      </div>
      <SentenceEditDialog />
      <BranchEditDialog />
      <BranchLinkEditDialog />
      <ProjectSettingsDialog />
    </Context.Provider>
  );
}

export default Home;
