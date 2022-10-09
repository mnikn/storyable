import { CgMathPlus, CgRemove } from 'react-icons/cg';
import { DIALOGUE_PIC } from 'renderer/constatnts';
import {
  SchemaFieldBoolean,
  SchemaFieldNumber,
  SchemaFieldSelect,
  SchemaFieldString,
} from 'renderer/models/schema/schema';
import { generateUUID } from 'renderer/utils/uuid';
import FieldBoolean from '../../extra_data/field/boolean_field';
import FieldNumber from '../../extra_data/field/number_field';
import FieldSelect from '../../extra_data/field/select_field';
import FieldString from '../../extra_data/field/string_field';

const selectTypeSchema = new SchemaFieldSelect();
selectTypeSchema.config.options = Object.keys(DIALOGUE_PIC)
  .map((k) => {
    return {
      label: k,
      value: k,
    };
  })
  .concat({
    label: 'text',
    value: 'text',
  });
const contentSchema = new SchemaFieldString();
contentSchema.config.type = 'multiline';
contentSchema.config.needI18n = true;
const scaleSchema = new SchemaFieldNumber();
const flipHSchema = new SchemaFieldBoolean();
const flipVSchema = new SchemaFieldBoolean();
const rotationSchema = new SchemaFieldNumber();
const textColorSchema = new SchemaFieldString();

function DialogueContent({
  data,
  onValueChange,
}: {
  data: any;
  onValueChange: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div
        className="flex flex-col overflow-auto mb-5"
        style={{ height: '300px' }}
      >
        {data.map((item, i) => {
          return (
            <div className="flex items-center mb-2 flex-wrap" key={i}>
              <FieldSelect
                className="flex-shrink-0 w-64 mr-4"
                schema={selectTypeSchema}
                label="type"
                value={item.type}
                onValueChange={(val) => {
                  data[i].type = val;
                  onValueChange();
                }}
              />
              <FieldString
                className="flex-shrink-0 w-48 mr-4"
                schema={contentSchema}
                label="content"
                value={item.content}
                onValueChange={() => {
                  onValueChange();
                }}
              />
              <FieldNumber
                className="flex-shrink-0 w-12 mr-4"
                schema={scaleSchema}
                label="scale"
                value={item.scale}
                onValueChange={(val) => {
                  data[i].scale = val;
                  onValueChange();
                }}
              />
              <FieldNumber
                className="flex-shrink-0 w-12 mr-4"
                schema={scaleSchema}
                label="text_size"
                value={item.text_size}
                onValueChange={(val) => {
                  data[i].text_size = val;
                  onValueChange();
                }}
              />
              <FieldNumber
                className="flex-shrink-0 w-12 mr-4"
                schema={rotationSchema}
                label="rotation"
                value={item.rotation}
                onValueChange={(val) => {
                  data[i].rotation = val;
                  onValueChange();
                }}
              />
              <FieldString
                className="flex-shrink-0 w-48 mr-4"
                schema={textColorSchema}
                label="text_color"
                value={item.text_color}
                onValueChange={(val) => {
                  data[i].text_color = val;
                  onValueChange();
                }}
              />
              <FieldBoolean
                className="flex-shrink-0 w-12 mr-4"
                schema={flipHSchema}
                label="flip_h"
                value={item.flip_h}
                onValueChange={(val) => {
                  data[i].flip_h = val;
                  onValueChange();
                }}
              />
              <FieldBoolean
                className="flex-shrink-0 w-12 mr-4"
                schema={flipVSchema}
                label="flip_v"
                value={item.flip_v}
                onValueChange={(val) => {
                  data[i].flip_v = val;
                  onValueChange();
                }}
              />
              <CgRemove
                className="cursor-pointer mr-2 text-gray-800 hover:text-gray-500 transition-all flex-shrink-0 ml-auto"
                onClick={() => {
                  data.splice(i, 1);
                  onValueChange();
                }}
              />
            </div>
          );
        })}
      </div>
      <button
        className="w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center"
        onClick={() => {
          data.push({
            type: 'talk_normal',
            content: 'extra_field_' + generateUUID(),
            scale: 1,
            flip_h: false,
            flip_v: false,
            text_size: 18,
            rotation: 0,
            pos: { x: 0, y: 0 },
            text_color: '#000000',
          });
          onValueChange();
        }}
      >
        <CgMathPlus className="mr-2" /> Add Item
      </button>
    </div>
  );
}

export default DialogueContent;
