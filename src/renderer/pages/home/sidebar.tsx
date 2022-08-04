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
import { StoryletGroup } from 'renderer/models/story';
import { Storylet } from 'renderer/models/storylet';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from '../../services/story_provider';

const MENU_ID = 'sidebar-menu';

function StoryletItem({
  level,
  storylet,
}: {
  level: number;
  storylet: Storylet;
}) {
  return (
    <div
      className="flex items-center hover:bg-gray-500 hover:text-white rounded-xl p-1 cursor-pointer transition-all select-none"
      style={{ marginLeft: `${level * 15}px` }}
    >
      <CgFile className="mr-4 p-0.5 text-xl" />
      <div>{storylet.name}</div>
    </div>
  );
}

function TreeItem({
  level,
  expandedInfo,
  group,
  toggleExpaned,
}: {
  level: number;
  expandedInfo: { [key: string]: boolean };
  group: StoryletGroup;
  toggleExpaned: (data: StoryletGroup) => void;
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
  return (
    <div
      className="flex flex-col select-none	"
      style={{ marginLeft: `${level * 15}px` }}
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
        group.children.map((g2) => {
          return (
            <TreeItem
              group={g2}
              level={level + 1}
              expandedInfo={expandedInfo}
              toggleExpaned={toggleExpaned}
            />
          );
        })}
      {expanded &&
        currentGroupStorylets.map((s) => {
          return <StoryletItem storylet={s.data} level={level + 1} />;
        })}
    </div>
  );
}

function Sidebar() {
  const { show: showContextMenu } = useContextMenu({
    id: MENU_ID,
  });
  const groups = useEventState<StoryletGroup[]>({
    event: StoryProvider.event,
    property: 'storyletGroups',
    initialVal: StoryProvider.storyletGroups,
  });

  const [expandedInfo, setExpandedInfo] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (!groups) {
      return;
    }

    setExpandedInfo((prev) => {
      const res: any = prev;
      groups.forEach((group) => {
        group.iterRecursive((g) => {
          if (!Object.keys(res).includes(g.id)) {
            res[g.id] = false;
          }
        });
      });
      return res;
    });
  }, [groups]);

  const handleItemClick = ({ event, props, triggerEvent, data }) => {
    console.log(event, props, triggerEvent, data);
  };

  const addRootGroup = () => {
    StoryProvider.createStoryletGroup();
  };

  return (
    <div className="bg-gray-50 w-72 flex flex-col items-center p-5">
      <div className="text-xl font-bold mb-4">Storylets</div>
      <div className="flex ml-auto mb-2">
        <CgMathPlus className="cursor-pointer hover:bg-gray-500 hover:rounded-full p-0.5 text-2xl transition-all" />
        <CgFolderAdd
          className="ml-2 cursor-pointer hover:bg-gray-500 hover:rounded-full p-0.5 text-2xl transition-all"
          onClick={addRootGroup}
        />
      </div>
      <div
        className="flex-grow w-full overflow-auto"
        onContextMenu={showContextMenu}
      >
        {(groups || []).map((group) => {
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
            />
          );
        })}
      </div>
      <Menu id={MENU_ID}>
        <Item onClick={handleItemClick}>Item 1</Item>
        <Item onClick={handleItemClick}>Item 2</Item>
        <Separator />
        <Item disabled>Disabled</Item>
        <Separator />
        <Submenu label="Submenu">
          <Item onClick={handleItemClick}>Sub Item 1</Item>
          <Item onClick={handleItemClick}>Sub Item 2</Item>
        </Submenu>
      </Menu>
    </div>
  );
}

export default Sidebar;
