import { useState } from 'react';
import { StoryletNode } from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import classNames from 'classnames';
import BgContent from './pic_part/bg';
import Cropper from 'react-easy-crop';
import * as d3 from 'd3';

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
  const [form, setForm] = useState<any>(sourceNode.data.extraData);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.Bg);
  /* form.size_type = 'full'; */

  const cellSize = (CELL_SIZE as any)[form.size_type];
  return (
    <div className="w-full flex flex-col overflow-auto">
      <div className="text-md font-bold mb-2">Preview pic:</div>
      <div
        className="relative bg-gray-500 m-auto flex-shrink-0 overflow-hidden"
        style={{
          width: cellSize[0],
          height: cellSize[1],
        }}
      >
        {currentTab !== Tab.Bg && (
          <img
            className="w-full h-full"
            style={{
              transform: `scaleX(${
                form.bg.flip_h ? -form.bg.scale : form.bg.scale
              }) scaleY(${
                form.bg.flip_v ? -form.bg.scale : form.bg.scale
              }) translateX(${form.bg.pos.x / form.bg.scale}px) translateY(${form.bg.pos.y / form.bg.scale}px)`,
            }}
            src={form?.bg?.pic}
          />
        )}
        {currentTab === Tab.Bg && (
          <div className="relative h-full w-full">
            <Cropper
              image={form?.bg?.pic}
              aspect={
                (CELL_SIZE as any)[form.size_type][0] /
                (CELL_SIZE as any)[form.size_type][1]
              }
              crop={form.bg.pos}
              zoom={form.bg.scale}
              onCropChange={(val) => {
                form.bg.pos = val;
                setForm((prev) => {
                  return { ...prev };
                });
              }}
              onZoomChange={(val) => {
                form.bg.scale = val;
                setForm((prev) => {
                  return { ...prev };
                });
              }}
              onCropAreaChange={(croppedArea) => {
                console.log('reer: ', croppedArea, form.bg);
              }}
            />
          </div>
        )}
        {currentTab !== Tab.Actor &&
          form.actors.map((actor) => {
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
        {currentTab === Tab.Actor &&
          form.actors.map((actor) => {
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
      </div>
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
      {currentTab === Tab.Bg && <BgContent data={form.bg} />}
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
