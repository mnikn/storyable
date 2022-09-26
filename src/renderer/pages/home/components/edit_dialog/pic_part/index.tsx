import { useState, useRef } from 'react';
import { StoryletNode } from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import classNames from 'classnames';
import BgContent from './bg';
import Cropper from 'react-easy-crop';
import * as d3 from 'd3';
import { DIALOGUE_PIC } from 'renderer/constatnts';
import useEventState from 'renderer/utils/use_event_state';
import ActorContent from './actor';
import DialogueContent from './dialogue';

const CELL_SIZE = {
  full: [692, 608],
  'wf-h3': [692, 432],
  'wf-h2': [692, 278],
  'wf-h1': [692, 144],
  'w/7-h1': [460, 144],
  'w/5-h1': [336, 144],
  'w/3-h1': [224, 144],
};

enum Tab {
  Total = 'total',
  Bg = 'bg',
  Actor = 'actor',
  Dialogue = 'dialogue',
  Decal = 'decal',
}

function PicPart({
  sourceNode,
  close,
  onSubmit,
}: {
  sourceNode: StoryletNode<any>;
  close: () => void;
  onSubmit: () => void;
}) {
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

  const [form, setForm] = useState<any>(sourceNode.data.extraData);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.Total);

  const scale = 100 / form?.bg?.crop_arena?.width;
  const transform = {
    x: `${-form?.bg?.crop_arena?.x * scale}%`,
    y: `${-form?.bg?.crop_arena?.y * scale}%`,
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

  const cellSize = (CELL_SIZE as any)[form.size_type];
  const aspect =
    (CELL_SIZE as any)[form.size_type]?.[0] /
    (CELL_SIZE as any)[form.size_type]?.[1];

  return (
    <div className="w-full flex flex-col overflow-auto">
      {currentTab === Tab.Bg && (
        <>
          <div className="text-md font-bold mb-2">Crop bg:</div>
          <div
            className="relative w-full"
            style={{
              height: '400px',
            }}
          >
            <Cropper
              image={form?.bg?.pic}
              aspect={aspect}
              objectFt={'vertical-cover'}
              crop={form.bg.crop_arena?.crop}
              zoom={form.bg.crop_arena?.zoom}
              onCropChange={(val) => {
                form.bg.crop_arena.crop = val;
                setForm((prev) => {
                  return { ...prev };
                });
              }}
              onZoomChange={(val) => {
                form.bg.crop_arena.zoom = val;
                setForm((prev) => {
                  return { ...prev };
                });
              }}
              onCropAreaChange={(val) => {
                form.bg.crop_arena.x = val.x;
                form.bg.crop_arena.y = val.y;
                form.bg.crop_arena.width = val.width;
                setForm((prev) => {
                  return { ...prev };
                });
              }}
            />
          </div>
        </>
      )}
      {currentTab !== Tab.Bg && (
        <>
          <div className="text-md font-bold mb-2">Preview pic:</div>
          <div
            className="relative bg-gray-500 m-auto flex-shrink-0 overflow-hidden"
            style={{
              width: cellSize?.[0],
              height: cellSize?.[1],
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
                  src={form?.bg?.pic}
                />
              </div>
            </div>
            {currentTab !== Tab.Actor &&
              (form?.actors || []).map((actor) => {
                return (
                  <img
                    className="absolute"
                    style={{
                      width: '128px',
                      height: '128px',
                      bottom: actor.pos.y + 'px',
                      left: actor.pos.x + 'px',
                      transform: `scaleX(${
                        actor.flip_h ? -actor.scale : actor.scale
                      }) scaleY(${actor.flip_v ? -actor.scale : actor.scale})`,
                    }}
                    src={
                      StoryProvider.projectSettings.actors
                        .find((item) => item.id === actor?.actor?.id)
                        ?.portraits.find(
                          (item) => item.id === actor?.actor?.portrait
                        )?.pic
                    }
                  />
                );
              })}
            {currentTab !== Tab.Decal &&
              form?.decals?.map((decal) => {
                return (
                  <img
                    className="absolute"
                    style={{
                      bottom: decal.pos.y + 'px',
                      left: decal.pos.x + 'px',
                      transform: `scaleX(${
                        decal.flip_h ? -decal.scale : decal.scale
                      }) scaleY(${decal.flip_v ? -decal.scale : decal.scale})`,
                    }}
                    src={decal.pic}
                  />
                );
              })}
            {currentTab !== Tab.Dialogue &&
              form?.dialogues?.map((dialogue) => {
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
                    <img
                      className="absolute"
                      style={{
                        transform: `scaleX(${
                          dialogue.flip_h ? -1 : 1
                        }) scaleY(${dialogue.flip_v ? -1 : 1})`,
                      }}
                      src={DIALOGUE_PIC[dialogue.type]}
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
                  </div>
                );
              })}
            {currentTab === Tab.Dialogue &&
              form?.dialogues?.map((dialogue) => {
                return (
                  <div
                    className="absolute cursor-move"
                    style={{
                      width: '208px',
                      height: '128px',
                      bottom: dialogue.pos.y + 'px',
                      left: dialogue.pos.x + 'px',
                      transform: `scaleX(${dialogue.scale}) scaleY(${dialogue.scale})`,
                      outline: '5px solid black',
                    }}
                    ref={(dom: any) => {
                      if (!dom) {
                        return;
                      }
                      dom.style.left = dialogue.pos.x + 'px';
                      dom.style.bottom = dialogue.pos.y + 'px';
                      const dragListener = d3.drag().on('drag', (val) => {
                        dialogue.pos.x += val.dx / dialogue.scale;
                        dialogue.pos.x = Math.max(-150, dialogue.pos.x);
                        dialogue.pos.x = Math.min(
                          cellSize[0] - 50,
                          dialogue.pos.x
                        );

                        dialogue.pos.y -= val.dy / dialogue.scale;
                        dialogue.pos.y = Math.max(-100, dialogue.pos.y);
                        dialogue.pos.y = Math.min(
                          cellSize[1] - 50,
                          dialogue.pos.y
                        );
                        setForm((prev) => {
                          return { ...prev };
                        });
                      });
                      dragListener(d3.select(dom));
                    }}
                  >
                    <img
                      className="absolute"
                      style={{
                        transform: `scaleX(${
                          dialogue.flip_h ? -1 : 1
                        }) scaleY(${dialogue.flip_v ? -1 : 1})`,
                      }}
                      src={DIALOGUE_PIC[dialogue.type]}
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
                  </div>
                );
              })}
            {currentTab === Tab.Actor &&
              form?.actors?.map((actor) => {
                return (
                  <img
                    ref={(dom: any) => {
                      if (!dom) {
                        return;
                      }
                      dom.style.left = actor.pos.x + 'px';
                      dom.style.bottom = actor.pos.y + 'px';
                      const dragListener = d3.drag().on('drag', (val) => {
                        actor.pos.x += val.dx / actor.scale;
                        actor.pos.x = Math.max(-50, actor.pos.x);
                        actor.pos.x = Math.min(cellSize[0] - 50, actor.pos.x);

                        actor.pos.y -= val.dy / actor.scale;
                        actor.pos.y = Math.max(-50, actor.pos.y);
                        actor.pos.y = Math.min(cellSize[1] - 50, actor.pos.y);
                        setForm((prev) => {
                          return { ...prev };
                        });
                      });
                      dragListener(d3.select(dom));
                    }}
                    className="absolute bottom-0 left-0 cursor-move"
                    style={{
                      outline: '5px solid black',
                      width: '128px',
                      height: '128px',
                      bottom: actor.pos.y + 'px',
                      left: actor.pos.x + 'px',
                      transform: `scaleX(${
                        actor.flip_h ? -actor.scale : actor.scale
                      }) scaleY(${actor.flip_v ? -actor.scale : actor.scale})`,
                    }}
                    src={
                      StoryProvider.projectSettings.actors
                        .find((item) => item.id === actor?.actor?.id)
                        ?.portraits.find(
                          (item) => item.id === actor?.actor?.portrait
                        )?.pic
                    }
                  />
                );
              })}
            {currentTab === Tab.Decal &&
              form?.decals?.map((decal) => {
                return (
                  <img
                    ref={(dom: any) => {
                      if (!dom) {
                        return;
                      }
                      dom.style.left = decal.pos.x + 'px';
                      dom.style.bottom = decal.pos.y + 'px';
                      const dragListener = d3.drag().on('drag', (val) => {
                        decal.pos.x += val.dx / decal.scale;
                        decal.pos.x = Math.max(-50, decal.pos.x);
                        decal.pos.x = Math.min(cellSize[0] - 50, decal.pos.x);

                        decal.pos.y -= val.dy / decal.scale;
                        decal.pos.y = Math.max(-50, decal.pos.y);
                        decal.pos.y = Math.min(cellSize[1] - 50, decal.pos.y);
                        setForm((prev) => {
                          return { ...prev };
                        });
                      });
                      dragListener(d3.select(dom));
                    }}
                    className="absolute bottom-0 left-0 cursor-move"
                    style={{
                      outline: '5px solid black',
                      bottom: decal.pos.y + 'px',
                      left: decal.pos.x + 'px',
                      transform: `scaleX(${
                        decal.flip_h ? -decal.scale : decal.scale
                      }) scaleY(${decal.flip_v ? -decal.scale : decal.scale})`,
                    }}
                    src={decal.pic}
                  />
                );
              })}
          </div>
        </>
      )}
      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 my-5">
        {Object.values(Tab).map((key) => {
          return (
            <li
              className="mr-2"
              key={key}
              onClick={() => {
                setCurrentTab(key);
              }}
            >
              <div
                className={classNames(
                  'inline-block p-4 text-gray-600 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500 outline-none cursor-pointer',
                  {
                    'bg-gray-100 font-bold': currentTab === key,
                  }
                )}
              >
                {key}
              </div>
            </li>
          );
        })}
      </ul>
      {currentTab === Tab.Bg && (
        <BgContent
          data={form.bg}
          onValueChange={() => {
            setForm((prev) => {
              return { ...prev };
            });
          }}
        />
      )}
      {currentTab === Tab.Actor && (
        <ActorContent
          data={form.actors}
          onValueChange={() => {
            setForm((prev) => {
              return { ...prev };
            });
          }}
        />
      )}
      {currentTab === Tab.Dialogue && (
        <DialogueContent
          data={form.dialogues}
          onValueChange={() => {
            setForm((prev) => {
              return { ...prev };
            });
          }}
        />
      )}
      <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-auto">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            sourceNode.data.extraData = form;
            StoryProvider.updateStoryletNode(sourceNode);
            if (onSubmit) {
              onSubmit();
            }
            close();
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={close}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PicPart;
