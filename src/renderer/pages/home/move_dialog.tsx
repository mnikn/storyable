import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { CgChevronDown, CgChevronRight, CgFolder } from 'react-icons/cg';
import Dialog from 'renderer/components/dialog';
import { StoryletGroup } from 'renderer/models/story';
import { Storylet } from 'renderer/models/storylet';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from '../../services/story_provider';
import eventBus, { Event } from './event';

function TreeItem({
  level,
  expandedInfo,
  group,
  toggleExpaned,
  selectingGroup,
  select,
}: {
  level: number;
  expandedInfo: { [key: string]: boolean };
  group: StoryletGroup;
  toggleExpaned: (data: StoryletGroup) => void;
  selectingGroup: StoryletGroup;
  select: (data: StoryletGroup) => void;
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
      <div className="flex items-center mb-2  p-1">
        {expanded && (
          <CgChevronDown
            className="mr-4 p-0.5 text-xl cursor-pointer"
            onClick={() => toggleExpaned(group)}
          />
        )}
        {!expanded && (
          <CgChevronRight
            className="mr-4 p-0.5 text-xl cursor-pointer"
            onClick={() => toggleExpaned(group)}
          />
        )}

        <CgFolder className="mr-4" />
        <div
          className={classNames(
            'hover:bg-gray-300 p-2 rounded-xl transition-all cursor-pointer',
            {
              'bg-gray-300': selectingGroup?.id === group.id,
            }
          )}
          onClick={() => {
            select(group);
          }}
        >
          {group.name}
        </div>
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
              select={select}
              selectingGroup={selectingGroup}
            />
          );
        })}
    </div>
  );
}

function FileTree({
  select,
  selectingGroup,
}: {
  select: (data: StoryletGroup) => void;
  selectingGroup: StoryletGroup | null;
}) {
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
            select={select}
            selectingGroup={selectingGroup}
          />
        );
      })}
    </div>
  );
}

function MoveDialog() {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<Storylet | StoryletGroup | null>(null);
  const [selectingGroup, setSelectingGroup] = useState<StoryletGroup | null>(
    null
  );
  const select = (data: StoryletGroup) => {
    setSelectingGroup((prev) => {
      if (prev === data) {
        return null;
      }
      return data;
    });
  };
  useEffect(() => {
    const showDialog = (data: Storylet | StoryletGroup) => {
      setItem(data);
      setSelectingGroup(null);
      setOpen(true);
    };
    eventBus.on(Event.SHOW_MOVE_DIALOG, showDialog);
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
      <div className="flex-grow h-60 overflow-auto">
        <FileTree select={select} selectingGroup={selectingGroup} />
      </div>
      <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className={classNames(
            'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-all',
            {
              'bg-indigo-900': !selectingGroup,
              'cursor-not-allowed': !selectingGroup,
            }
          )}
          disabled={!selectingGroup}
          onClick={() => {
            if (!item || !selectingGroup) {
              return;
            }

            StoryProvider.moveStorylet(item.id, selectingGroup.id);
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

export default MoveDialog;
