import classNames from 'classnames';
import sortBy from 'lodash/sortBy';
import { useEffect, useState } from 'react';
import {
  Menu,
  Item,
  Separator,
  Submenu,
  useContextMenu,
} from 'react-contexify';
import {
  CgMathPlus,
  CgFolderAdd,
  CgFolder,
  CgChevronRight,
  CgChevronDown,
  CgFile,
} from 'react-icons/cg';
import Dialog from 'renderer/components/dialog';
import { StoryletGroup } from 'renderer/models/story';
import { Storylet } from 'renderer/models/storylet';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from '../../services/story_provider';
import eventBus, { Event } from './event';

function RenameDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [customGroupId, setCustomGroupId] = useState('');
  const [item, setItem] = useState<Storylet | StoryletGroup | null>(null);
  useEffect(() => {
    const showDialog = (data: Storylet | StoryletGroup) => {
      setOpen(true);
      setItem(data);
      setName(data.name);
      if (data instanceof StoryletGroup) {
        setCustomGroupId(data.customGroupId);
      }
    };
    eventBus.on(Event.SHOW_SIDEBAR_RENAME_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_SIDEBAR_RENAME_DIALOG, showDialog);
    };
  }, []);
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        eventBus.emit(Event.CLOSE_DIALOG);
      }}
      title="Rename"
    >
      <div className="flex flex-row items-center w-full mb-2">
        <div className="font-bold mr-2">Name:</div>
        <input
          type="text"
          className="flex-grow border-2 border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="Please enter the name..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
      {item instanceof StoryletGroup && (
        <div className="flex flex-row items-center w-full mb-2">
          <div className="font-bold mr-2">Custom group id:</div>
          <input
            type="text"
            className="flex-grow border-2 border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Please enter the group id..."
            value={customGroupId}
            onChange={(e) => {
              setCustomGroupId(e.target.value);
            }}
          />
        </div>
      )}
      <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            if (item instanceof Storylet) {
              item.name = name;
              StoryProvider.updateStorylet(item);
            } else if (item instanceof StoryletGroup) {
              item.name = name;
              item.customGroupId = customGroupId;
              StoryProvider.updateStoryletGroup(item);
            }
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
    </Dialog>
  );
}

const MENU_ID = 'sidebar-menu';

function StoryletItem({
  level,
  storylet,
  showContextMenu,
}: {
  level: number;
  storylet: Storylet;
  showContextMenu: (
    e: any,
    type: 'group' | 'storylet',
    currentItem: Storylet | StoryletGroup
  ) => void;
}) {
  const currentStorylet = useEventState<Storylet>({
    event: StoryProvider.event,
    property: 'currentStorylet',
    initialVal: StoryProvider.currentStorylet || undefined,
  });
  return (
    <div
      className={classNames(
        'flex items-center hover:bg-gray-500 hover:text-white rounded-xl p-1 cursor-pointer transition-all select-none',
        { 'bg-gray-500 text-white': currentStorylet?.id === storylet.id }
      )}
      style={{ marginLeft: `${level * 20}px` }}
      onContextMenu={(e) => {
        e.stopPropagation();
        showContextMenu(e, 'storylet', storylet);
      }}
      onClick={() => {
        StoryProvider.changeCurrentStorylet(storylet.id);
      }}
    >
      <CgFile className="mr-4 p-0.5 text-xl" />
      <div>
        {Object.values(storylet.nodes).find((item) => item.data.type === 'root')
          ?.data?.extraData?.storylet_id || storylet.name}
      </div>
    </div>
  );
}

function TreeItem({
  level,
  expandedInfo,
  group,
  toggleExpaned,
  showContextMenu,
}: {
  level: number;
  expandedInfo: { [key: string]: boolean };
  group: StoryletGroup;
  toggleExpaned: (data: StoryletGroup) => void;
  showContextMenu: (
    e: any,
    type: 'group' | 'storylet',
    currentItem: Storylet | StoryletGroup
  ) => void;
}) {
  const expanded = expandedInfo[group.id];
  const storylets = useEventState<{ group: StoryletGroup; data: Storylet }[]>({
    event: StoryProvider.event,
    property: 'storylets',
    initialVal: StoryProvider.storylets,
  });

  const currentGroupStorylets = (storylets || []).filter(
    (item) => item.group.id === group.id
  );

  const currentStorylets = sortBy(currentGroupStorylets, (s1) => {
    const n1 =
      Object.values(s1.data.nodes).find((item) => item.data.type === 'root')
        ?.data?.extraData?.storylet_id || s1.data.name;
    return n1;
  });

  const groupItems = sortBy(group.children, (g1) => {
    return g1.name.charCodeAt(0);
  });
  return (
    <div
      className="flex flex-col select-none"
      style={{ marginLeft: `${level * 15}px` }}
      onContextMenu={(e) => {
        e.stopPropagation();
        showContextMenu(e, 'group', group);
      }}
    >
      <div
        className="flex items-center mb-2 hover:bg-gray-300 rounded-xl cursor-pointer p-1 transition-all"
        onClick={() => toggleExpaned(group)}
      >
        {expanded && <CgChevronDown className="mr-4 p-0.5 text-xl" />}
        {!expanded && <CgChevronRight className="mr-4 p-0.5 text-xl" />}

        <CgFolder className="mr-4" />
        <div>{group.name}</div>
      </div>
      {expanded &&
        groupItems.map((g2) => {
          return (
            <TreeItem
              key={g2.id}
              group={g2}
              level={level + 1}
              expandedInfo={expandedInfo}
              toggleExpaned={toggleExpaned}
              showContextMenu={showContextMenu}
            />
          );
        })}
      {expanded &&
        currentStorylets.map((s) => {
          return (
            <StoryletItem
              key={s.data.id}
              storylet={s.data}
              level={level + 1}
              showContextMenu={showContextMenu}
            />
          );
        })}
    </div>
  );
}

function Sidebar() {
  const { show: showMenu } = useContextMenu({
    id: MENU_ID,
  });
  const groups = useEventState<StoryletGroup[]>({
    event: StoryProvider.event,
    property: 'storyletGroups',
    initialVal: StoryProvider.storyletGroups,
  });
  const currentStorylet = useEventState<Storylet>({
    event: StoryProvider.event,
    property: 'currentStorylet',
    initialVal: StoryProvider.currentStorylet || undefined,
  });

  const [menuType, setMenuType] = useState<'storylet' | 'group'>('group');
  const [menuTriggeredItem, setMenuTriggeredItem] = useState<
    Storylet | StoryletGroup | null
  >(null);

  const [expandedInfo, setExpandedInfo] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (!groups) {
      return;
    }

    const groupId = StoryProvider.story.storylets.find(
      (item) => item.data.id === currentStorylet?.id
    )?.group.id;
    setExpandedInfo((prev) => {
      const res: any = prev;
      groups.forEach((group) => {
        group.iterRecursive((g) => {
          if (!Object.keys(res).includes(g.id)) {
            res[g.id] = false;
          }
        });

        if (groupId) {
          if (group.id === groupId || group.findChildRecursive(groupId)) {
            res[group.id] = true;
            group.iterRecursive((g) => {
              res[g.id] = true;
            });
          }
        }
      });

      return { ...res };
    });
  }, [groups, currentStorylet]);

  const addRootGroup = () => {
    StoryProvider.createStoryletGroup();
  };

  const addRootStorylet = () => {
    StoryProvider.createStorylet();
  };

  return (
    <div className="bg-gray-50 w-72 flex flex-col items-center p-5">
      <div className="text-xl font-bold mb-4">Storylets</div>
      <div className="flex ml-auto mb-2">
        <CgMathPlus
          className="cursor-pointer hover:bg-gray-500 hover:rounded-full p-0.5 text-2xl transition-all"
          onClick={addRootStorylet}
        />
        <CgFolderAdd
          className="ml-2 cursor-pointer hover:bg-gray-500 hover:rounded-full p-0.5 text-2xl transition-all"
          onClick={addRootGroup}
        />
      </div>
      <div className="flex-grow w-full overflow-auto">
        {(groups || [])
          .sort((g1, g2) => {
            return g1.name.charCodeAt(0) - g2.name.charCodeAt(0);
          })
          .map((group) => {
            return (
              <TreeItem
                key={group.id}
                group={group}
                level={0}
                expandedInfo={expandedInfo}
                toggleExpaned={(g) => {
                  setExpandedInfo((prev) => {
                    return {
                      ...prev,
                      [g.id]: !prev[g.id],
                    };
                  });
                }}
                showContextMenu={(e, type, item) => {
                  showMenu(e);
                  setMenuTriggeredItem(item);
                  setMenuType(type);
                }}
              />
            );
          })}
      </div>
      <Menu id={MENU_ID}>
        {menuType === 'group' && (
          <>
            <Item
              onClick={() => {
                StoryProvider.createStorylet(
                  menuTriggeredItem as StoryletGroup
                );
              }}
            >
              New storylet
            </Item>
            {menuTriggeredItem?.id !==
              (groups || []).find((item) => item.name === 'uncategorized')
                ?.id && (
              <>
                <Separator />
                <Item
                  onClick={() => {
                    StoryProvider.createStoryletGroup(
                      menuTriggeredItem as StoryletGroup
                    );
                  }}
                >
                  New group
                </Item>
              </>
            )}
          </>
        )}
        {menuTriggeredItem?.id !==
          (groups || []).find((item) => item.name === 'uncategorized')?.id && (
          <>
            <Item
              onClick={() => {
                eventBus.emit(
                  Event.SHOW_SIDEBAR_RENAME_DIALOG,
                  menuTriggeredItem
                );
              }}
            >
              Rename
            </Item>
            {menuTriggeredItem instanceof Storylet && (
              <Item
                onClick={() => {
                  StoryProvider.duplicateStorylet(menuTriggeredItem);
                }}
              >
                Duplicate
              </Item>
            )}
            <Item
              onClick={() => {
                eventBus.emit(Event.SHOW_MOVE_DIALOG, menuTriggeredItem);
              }}
            >
              Move
            </Item>
            <Item
              onClick={() => {
                if (menuTriggeredItem instanceof Storylet) {
                  StoryProvider.removeStorylet(menuTriggeredItem.id);
                } else if (menuTriggeredItem instanceof StoryletGroup) {
                  StoryProvider.removeStoryletGroup(menuTriggeredItem.id);
                }
              }}
            >
              Delete
            </Item>
          </>
        )}
      </Menu>
      <RenameDialog />
    </div>
  );
}

export default Sidebar;
