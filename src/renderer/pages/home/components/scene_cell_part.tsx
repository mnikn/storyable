import { CELL_SIZE, DIALOGUE_PIC } from 'renderer/constatnts';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';

function SceneCellPart({ nodeData }: { nodeData: any }) {
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
  const projectSettings = useEventState<any>({
    event: StoryProvider.event,
    property: 'projectSettings',
    initialVal: StoryProvider.projectSettings,
  });

  const scale = 100 / nodeData.data.extraData.bg?.crop_arena?.width;
  const transform = {
    x: `${-nodeData.data.extraData.bg?.crop_arena?.x * scale}%`,
    y: `${-nodeData.data.extraData.bg?.crop_arena?.y * scale}%`,
    scale,
    width: 'calc(100% + 0.5px)',
    height: 'auto',
  };

  const imageStyle = {
    transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
    width: transform.width,
    height: transform.height,
    top: 0,
    left: 0,
    transformOrigin: 'top left',
  };

  const aspect =
    (CELL_SIZE as any)[nodeData.data.extraData.size_type]?.[0] /
    (CELL_SIZE as any)[nodeData.data.extraData.size_type]?.[1];

  return (
    <div className="flex flex-col items-center h-full">
      <div className="text-3xl font-bold mb-5">
        {nodeData.data.customType}({nodeData.data.extraData.size_type})
        {nodeData.data.customNodeId ? `(${nodeData.data.customNodeId})` : ''}
      </div>
      <div
        className="text-2xl"
        style={{
          lineClamp: 3,
          display: '-webkit-box',
          overflow: 'hidden',
          boxOrient: 'vertical',
          wordBreak: 'break-all',
        }}
      ></div>
      <div
        className="relative m-auto "
        style={{
          outline: '4px solid #000',
          borderRadius: '4px',
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            width: CELL_SIZE[nodeData.data.extraData.size_type]?.[0] + 'px',
            height: CELL_SIZE[nodeData.data.extraData.size_type]?.[1] + 'px',
          }}
        >
          <div className="h-full">
            <div
              className="h-full overflow-hidden relative"
              style={{ paddingBottom: 100 / aspect }}
            >
              <img
                className="absolute"
                style={imageStyle}
                src={nodeData.data.extraData?.bg?.pic}
              />
            </div>
          </div>
          {(nodeData.data.extraData?.actors || []).map((actorData) => {
            return (
              <img
                className="absolute"
                style={{
                  width: '128px',
                  height: '128px',
                  bottom: actorData.pos.y + 'px',
                  left: actorData.pos.x + 'px',
                  transform: `scaleX(${
                    actorData.flip_h ? -actorData.scale : actorData.scale
                  }) scaleY(${
                    actorData.flip_v ? -actorData.scale : actorData.scale
                  })`,
                }}
                src={
                  projectSettings.actors
                    .find((item: any) => item.id === actorData.actor.id)
                    ?.portraits.find((p) => p.id === actorData.actor.portrait)
                    .pic
                }
                alt=""
              />
            );
          })}
          {(nodeData.data.extraData?.decals || []).map((decal) => {
            return (
              <img
                className="absolute"
                src={decal.pic}
                style={{
                  top: decal.pos.y + 'px',
                  left: decal.pos.x + 'px',
                  transform: `scaleX(${decal.flip_h ? -1 : 1}) scaleY(${
                    decal.flip_v ? -1 : 1
                  })`,
                  zoom: decal.scale,
                }}
                alt=""
              />
            );
          })}
        </div>
        {(nodeData.data.extraData?.dialogues || []).map((dialogue) => {
          if (dialogue.type === 'text') {
            return (
              <>
                <div
                  className="absolute"
                  style={{
                    width: dialogue.rotation === 0 ? '208px' : undefined,
                    height: dialogue.rotation === 0 ? '128px' : undefined,
                    transform: `scaleX(${dialogue.flip_h ? -1 : 1}) scaleY(${
                      dialogue.flip_v ? -1 : 1
                    }) rotate(${dialogue.rotation}deg)`,
                    top: dialogue.pos.y + 'px',
                    left: dialogue.pos.x + 'px',
                    color: dialogue.text_color,
                    fontSize: `${dialogue.text_size || 18}px`,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {translations[dialogue.content]?.[currentLang]}
                </div>
              </>
            );
          }
          return (
            <div
              className="absolute"
              style={{
                width: '208px',
                height: '128px',
                bottom: dialogue.pos.y + 'px',
                left: dialogue.pos.x + 'px',
                transform: `scaleX(${dialogue.scale}) scaleY(${dialogue.scale})`,
              }}
            >
              {dialogue.type !== 'text' && (
                <>
                  <img
                    className="absolute"
                    src={DIALOGUE_PIC[dialogue.type]}
                    alt=""
                    style={{
                      transform: `scaleX(${dialogue.flip_h ? -1 : 1}) scaleY(${
                        dialogue.flip_v ? -1 : 1
                      })`,
                    }}
                  />
                  <div
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translateX(-50%) translateY(-50%)',
                      fontSize: `${dialogue.text_size || 18}px`,
                      color: dialogue.text_color,
                    }}
                  >
                    {translations[dialogue.content]?.[currentLang]}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SceneCellPart;
