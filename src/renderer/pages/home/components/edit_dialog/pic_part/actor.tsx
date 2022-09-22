import { CgMathPlus, CgRemove } from 'react-icons/cg';
import {
  SchemaFieldActorSelect,
  SchemaFieldBoolean,
  SchemaFieldNumber,
} from 'renderer/models/schema/schema';
import FieldActorSelect from '../../extra_data/field/actor_select_field';
import FieldBoolean from '../../extra_data/field/boolean_field';
import FieldNumber from '../../extra_data/field/number_field';

const actorSchema = new SchemaFieldActorSelect();
const scaleSchema = new SchemaFieldNumber();
const flipHSchema = new SchemaFieldBoolean();
const flipVSchema = new SchemaFieldBoolean();

function ActorContent({
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
        {data.map((actor, i) => {
          return (
            <div className="flex items-center mb-2">
              <FieldActorSelect
                className="flex-shrink-0 w-80 h-24 mr-4"
                schema={actorSchema}
                value={actor.actor}
                onValueChange={(val) => {
                  data[i].actor = val;
                  onValueChange();
                }}
              />

              <FieldNumber
                className="flex-shrink-0 w-12 mr-4"
                schema={scaleSchema}
                label="scale"
                value={actor.scale}
                onValueChange={(val) => {
                  data[i].scale = val;
                  onValueChange();
                }}
              />
              <FieldBoolean
                className="flex-shrink-0 w-12 mr-4"
                schema={flipHSchema}
                label="flip_h"
                value={actor.flip_h}
                onValueChange={(val) => {
                  data[i].flip_h = val;
                  onValueChange();
                }}
              />
              <FieldBoolean
                className="flex-shrink-0 w-12 mr-4"
                schema={flipVSchema}
                label="flip_v"
                value={actor.flip_v}
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
            actor: { id: null, portrait: null },
            scale: 1,
            flip_h: false,
            flip_v: false,
            pos: { x: 0, y: 0 },
          });
          onValueChange();
        }}
      >
        <CgMathPlus className="mr-2" /> Add Item
      </button>
    </div>
  );
}

export default ActorContent;
