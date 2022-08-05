import { StoryletGroup } from 'renderer/models/story';
import { Storylet, StoryletInitNode } from 'renderer/models/storylet';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';
import eventBus, { Event } from '../event';
import Context from '../context';
import classNames from 'classnames';
import { useContext } from 'react';

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

  const { selectingNode } = useContext(Context);
  const nodeData = currentStorylet?.nodes[nodeId];
  if (!nodeData) {
    return null;
  }
  return (
    <>
      {nodeData instanceof StoryletInitNode && (
        <div
          className={classNames(
            'absolute bg-amber-400 rounded-xl p-4 text-3xl flex items-center justify-center font-bold hover:bg-amber-200 cursor-pointer transition-all',
            {
              'bg-amber-200': selectingNode === nodeId,
            }
          )}
          style={{
            transform: `translate(${pos.y}px,${pos.x}px)`,
            height: '200px',
            width: '400px',
          }}
          onClick={() => {
            eventBus.emit(Event.SELECT_NODE, nodeData.id);
          }}
        >
          {currentStorylet.name}
        </div>
      )}
    </>
  );
}

export default NodeCard;
