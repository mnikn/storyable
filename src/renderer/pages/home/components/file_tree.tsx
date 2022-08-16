import { useEffect, useState } from 'react';
import { CgChevronDown, CgChevronRight, CgFolder } from 'react-icons/cg';
import { StoryletGroup } from 'renderer/models/story';
import { Storylet } from 'renderer/models/storylet';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from '../../../services/story_provider';

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

  return (
    <div
      className="flex flex-col select-none	"
      style={{ marginLeft: `${level * 15}px` }}
      onContextMenu={(e) => {
        e.stopPropagation();
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
        group.children.map((g2) => {
          return (
            <TreeItem
              key={g2.id}
              group={g2}
              level={level + 1}
              expandedInfo={expandedInfo}
              toggleExpaned={toggleExpaned}
            />
          );
        })}
    </div>
  );
}

function FileTree() {
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

      return { ...res };
    });
  }, [groups, currentStorylet]);

  return (
    <div className="flex-grow w-full overflow-auto">
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
  );
}

export default FileTree;
