import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import StoryProvider from 'renderer/services/story_provider';
import Link from './components/link';
import NodeCard from './components/node_card';
import Sidebar from './sidebar';
import useView from './use_view';
import Context from './context';
import eventBus, { Event } from './event';
import useShortcut from './use_shortcut';
import {
  StoryletRootNode,
  StoryletNode,
  StoryletCustomNode,
  StoryletSentenceNode,
  StoryletBranchNode,
} from 'renderer/models/storylet';
import SentenceEditDialog from './components/sentence_edit_dialog';
import BranchEditDialog from './components/branch_edit_dialog';
import TopMenu from './top_menu';
import ProjectSettingsDialog from './components/project_settings';
import BranchLinkEditDialog from './components/branch_link_edit_dialog';
import { CgShapeHalfCircle } from 'react-icons/cg';
import PreviewDialog from './components/preview_dialog';
import MoveDialog from './move_dialog';
import RootEditDialog from './components/root_edit_dialog';
import CustomEditDialog from './components/custom_edit_dialog';

function Home() {
  const [zoomDom, setZoomDom] = useState<HTMLDivElement | null>(null);

  const [selectingNode, setSelectingNode] = useState<string | null>(null);
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [isDialogShowing, setIsDialogShowing] = useState(false);
  const [dragingNode, setDragingNode] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [init, setInit] = useState(false);
  const initRef = useRef(init);
  initRef.current = init;

  const dragingNodeRef = useRef<any>(dragingNode);
  dragingNodeRef.current = dragingNode;
  const dragTargetRef = useRef<any>(null);

  const { zoom, treeData, linkData } = useView({
    zoomDom,
    dragingNode,
  });

  useEffect(() => {
    setIsQuickEditing(false);
  }, [selectingNode]);

  useLayoutEffect(() => {
    if (initRef.current) {
      return;
    }
    if (treeData.length > 0) {
      console.log(treeData);
      eventBus.emit(Event.SELECT_NODE, treeData[treeData.length-1].data.id);
      setInit(true);
    }
  }, [treeData]);

  useShortcut({
    selectingNode,
    isQuickEditing,
    isDialogEditing: isDialogShowing,
  });

  useEffect(() => {
    const onSelectNode = (node: string) => {
      setSelectingNode((prev) => {
        if (prev === node) {
          return null;
        }
        return node;
      });
      const dom = document.querySelector(`#${node}`);
      if (dom) {
        const rect = dom.getBoundingClientRect();
        const pos = [0, 0];
        if (visualViewport.width < rect.x + rect.width) {
          pos[0] = -(rect.x - rect.width) * 0.8;
        } else if (rect.x < rect.width) {
          pos[0] = (rect.width + Math.abs(rect.x)) * 3.0;
        }

        if (visualViewport.height < rect.y + rect.height) {
          pos[1] = -(rect.y - rect.height) * 0.8;
        } else if (rect.y < rect.height) {
          pos[1] = (rect.height + Math.abs(rect.y)) * 3.0;
        }
        eventBus.emit(Event.UPDATE_VIEW_POS, pos);
      }
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
        let index = children.findIndex((node) => {
          return node.id === currentSelectingNode.id;
        });
        if (index !== -1 && children.length > 1) {
          if (index === 0) {
            eventBus.emit(Event.SELECT_NODE, children[1].id);
          } else {
            eventBus.emit(Event.SELECT_NODE, children[index - 1].id);
          }
        } else {
          eventBus.emit(Event.SELECT_NODE, parent.id);
        }
      }
      StoryProvider.deleteStoryletNode(currentSelectingNode.id);
    };

    const onDialogShow = () => {
      setIsDialogShowing(true);
    };

    const onDialogClose = () => {
      setIsDialogShowing(false);
    };

    const onSave = async () => {
      if (saving) {
        return;
      }
      setSaving(true);
      await StoryProvider.save();
      setTimeout(() => {
        setSaving(false);
      }, 1000);
    };

    const onDragNode = (val: any, item: any) => {
      if (!dragingNodeRef.current) {
        dragingNodeRef.current = item;
        setSelectingNode(item.data.id);
        setDragingNode(item);
        return;
      }
      item.x0 += val.dy / zoom;
      item.y0 += val.dx / zoom;
      eventBus.emit(Event.REFRESH_NODE_VIEW);
    };

    const onDragEnd = () => {
      if (dragTargetRef.current) {
        if (dragTargetRef.current.type === 'child') {
          StoryProvider.moveStoryletNode(
            dragingNodeRef.current.id,
            dragTargetRef.current.node.id
          );
        } else if (dragTargetRef.current.type === 'parent') {
          const parentId =
            StoryProvider.currentStorylet?.getNodeSingleParent(
              dragTargetRef.current.node.id
            )?.id || '';
          StoryProvider.moveStoryletNode(dragingNodeRef.current.id, parentId);
        }
      }
      setDragingNode(null);
      dragTargetRef.current = null;
    };

    const addSiblingCustom = () => {
      if (!selectingNode || !StoryProvider.currentStorylet) {
        return;
      }
      const newNode = new StoryletCustomNode();
      const parentNode = StoryProvider.currentStorylet.getNodeSingleParent(
        StoryProvider.currentStorylet.nodes[selectingNode].id
      );
      if (!parentNode) {
        return;
      }
      StoryProvider.addStoryletNode(newNode, parentNode);
    };

    const addSiblingSentence = () => {
      if (!selectingNode || !StoryProvider.currentStorylet) {
        return;
      }
      const newNode = new StoryletSentenceNode();
      const parentNode = StoryProvider.currentStorylet.getNodeSingleParent(
        StoryProvider.currentStorylet.nodes[selectingNode].id
      );
      if (!parentNode) {
        return;
      }
      StoryProvider.addStoryletNode(newNode, parentNode);
    };

    const addSiblingBranch = () => {
      if (!selectingNode || !StoryProvider.currentStorylet) {
        return;
      }
      const newNode = new StoryletBranchNode();
      const parentNode = StoryProvider.currentStorylet.getNodeSingleParent(
        StoryProvider.currentStorylet.nodes[selectingNode].id
      );
      if (!parentNode) {
        return;
      }
      StoryProvider.addStoryletNode(newNode, parentNode);
    };

    const duplicateNode = () => {
      if (!selectingNode || !StoryProvider.currentStorylet) {
        return;
      }
      const parentNode = StoryProvider.currentStorylet.nodes[selectingNode];
      if (!parentNode) {
        return;
      }
      const newNode = StoryProvider.duplicateStoryletNode(
        StoryProvider.currentStorylet.nodes[selectingNode],
        parentNode.id
      );
      if (newNode) {
        setTimeout(() => {
          eventBus.emit(Event.SELECT_NODE, newNode.id);
        }, 0);
      }
    };
    const duplicateSiblingNode = () => {
      if (!selectingNode || !StoryProvider.currentStorylet) {
        return;
      }
      const parentNode = StoryProvider.currentStorylet.getNodeSingleParent(
        StoryProvider.currentStorylet.nodes[selectingNode].id
      );
      if (!parentNode) {
        return;
      }
      const newNode = StoryProvider.duplicateStoryletNode(
        StoryProvider.currentStorylet.nodes[selectingNode],
        parentNode.id
      );
      if (newNode) {
        eventBus.emit(Event.SELECT_NODE, newNode.id);
      }
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
    eventBus.on(Event.SHOW_PREVIEW_DIALOG, onDialogShow);
    eventBus.on(Event.SHOW_SIDEBAR_RENAME_DIALOG, onDialogShow);
    eventBus.on(Event.SHOW_CUSTOM_EDIT_DIALOG, onDialogShow);
    eventBus.on(Event.SHOW_ROOT_EDIT_DIALOG, onDialogShow);
    eventBus.on(Event.ON_SHOW_DIALOG, onDialogShow);
    eventBus.on(Event.CLOSE_DIALOG, onDialogClose);
    eventBus.on(Event.DRAG_NODE, onDragNode);
    eventBus.on(Event.END_DRAG_NODE, onDragEnd);
    eventBus.on(Event.DUPLICATE_NODE, duplicateNode);
    eventBus.on(Event.DUPLICATE_SIBLING_NODE, duplicateSiblingNode);

    eventBus.on(Event.ADD_SIBLING_SENTENCE, addSiblingSentence);
    eventBus.on(Event.ADD_SIBLING_BRANCH, addSiblingBranch);
    eventBus.on(Event.ADD_SIBLING_CUSTOM, addSiblingCustom);
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
      eventBus.off(Event.SHOW_PREVIEW_DIALOG, onDialogShow);
      eventBus.off(Event.SHOW_SIDEBAR_RENAME_DIALOG, onDialogShow);
      eventBus.off(Event.SHOW_CUSTOM_EDIT_DIALOG, onDialogShow);
      eventBus.off(Event.SHOW_ROOT_EDIT_DIALOG, onDialogShow);
      eventBus.off(Event.ON_SHOW_DIALOG, onDialogShow);
      eventBus.off(Event.CLOSE_DIALOG, onDialogClose);
      eventBus.off(Event.DRAG_NODE, onDragNode);
      eventBus.off(Event.END_DRAG_NODE, onDragEnd);
      eventBus.off(Event.ADD_SIBLING_SENTENCE, addSiblingSentence);
      eventBus.off(Event.ADD_SIBLING_BRANCH, addSiblingBranch);
      eventBus.off(Event.ADD_SIBLING_CUSTOM, addSiblingCustom);
      eventBus.off(Event.DUPLICATE_NODE, duplicateNode);
      eventBus.off(Event.DUPLICATE_SIBLING_NODE, duplicateSiblingNode);
      eventBus.off(Event.SAVE, onSave);
    };
  }, [zoom, selectingNode]);

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
        dragingNode,
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
                      {dragingNode && item !== dragingNode && (
                        <div
                          className="w-32 h-32 bg-pink-500 opacity-80 absolute hover:opacity-100 rounded-full cursor-pointer"
                          style={{
                            left: item.y + 700,
                            top: item.x + 20,
                            zIndex: 3,
                          }}
                          onMouseEnter={() => {
                            const currentStorylet =
                              StoryProvider.currentStorylet;
                            if (!currentStorylet) {
                              return;
                            }
                            const currentNode = currentStorylet.nodes[item.id];
                            dragTargetRef.current = {
                              node: currentNode,
                              type: 'child',
                            };
                          }}
                          onMouseLeave={() => {
                            dragTargetRef.current = null;
                          }}
                        />
                      )}
                      <NodeCard
                        key={item.id}
                        nodeId={item.id}
                        pos={{
                          x: item.x0,
                          y: item.y0,
                        }}
                        data={item}
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
      <CustomEditDialog />
      <ProjectSettingsDialog />
      <RootEditDialog />
      <PreviewDialog />
      <MoveDialog />
      {saving && (
        <div className="absolute inset-x-0 top-12 left-1/2 h-16 p-2 bg-gray-50 w-64 rounded-md flex items-center justify-center">
          <CgShapeHalfCircle className="animate-spin text-xl mr-2" />
          <div className="font-bold text-xl">Saving...</div>
        </div>
      )}
    </Context.Provider>
  );
}

export default Home;
