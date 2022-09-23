import { formatNodeLinkId } from 'renderer/models/base/tree';
import { Storylet, StoryletBranchNode } from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import useEventState from 'renderer/utils/use_event_state';
import eventBus, { Event } from '../event';

function Link({ from, target }: { from: any; target: any }) {
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
  if (!currentStorylet) {
    return null;
  }
  const midpoint = [
    (from.x + target.x) / 2 - (from.data.type === 'branch' ? 120 : 55),
    (from.y + target.y) / 2 - (from.data.type === 'branch' ? 70 : 15),
  ];
  const linkData =
    currentStorylet.links[formatNodeLinkId(from.data.id, target.data.id)];
  if (!linkData) {
    return null;
  }

  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${midpoint[1]}px,${midpoint[0]}px)`,
      }}
    >
      {linkData.source instanceof StoryletBranchNode && (
        <div
          className="bg-gray-50 rounded-md p-2 w-24 flex flex-col cursor-pointer hover:bg-gray-400 transition-all"
          style={{
            width: 'auto',
            maxWidth: '320px',
            overflow: 'hidden',
            height: '128px',
          }}
          onClick={() => {
            eventBus.emit(Event.SHOW_BRANCH_LINK_EDIT_DIALOG, linkData);
          }}
        >
          {linkData.data.optionId && (
            <>
              <div className="h-6 text-sm flex justify-center">
                {linkData.data.optionId}
              </div>
              <div className="rounded-md w-full bg-gray-500 mt-1 mb-1 h-1" />
            </>
          )}
          <div className="h-6 text-3xl flex justify-center">
            {translations[linkData.data.optionName]?.[currentLang]}
          </div>
        </div>
      )}
    </div>
  );
}

export default Link;
