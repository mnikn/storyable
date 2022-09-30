import { set } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import Dialog from 'renderer/components/dialog';
import { buildSchema } from 'renderer/models/schema/factory';
import {
  iterSchema,
  SchemaField,
  SchemaFieldArray,
  SchemaFieldObject,
} from 'renderer/models/schema/schema';
import { StoryletNode } from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import Context from '../context';
import eventBus, { Event } from '../event';
import { FieldContainer } from './extra_data/field';

function MultiEditDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StoryletNode<any>[]>([]);
  const [sourceData, setSourceData] = useState<StoryletNode<any>[]>([]);
  const { selectingNodes } = useContext(Context);
  const [fieldTable, setFieldTable] = useState<any>({});
  const [schema, setSchema] = useState<SchemaField | null>(null);
  const [fieldValue, setFieldValue] = useState<any>(null);
  /* const fieldSelectSchema = new SchemaFieldSelect();
   * fieldSelectSchema.config.options  */

  useEffect(() => {
    const showDialog = () => {
      const currentStorylet = StoryProvider.currentStorylet;
      if (!currentStorylet) {
        return;
      }
      setOpen(true);
      const data = selectingNodes.map((k) => currentStorylet.nodes[k]);
      setSourceData(data);
      setForm([...data]);

      if (data.length > 0) {
        if (data[0].data.type === 'custom') {
          const config = StoryProvider.projectSettings.customNodeConfig.find(
            (item) => item.type === (data[0].data as any).customType
          ).schema;
          const schema = buildSchema(config);
          const res: any = {};
          iterSchema(schema, (item, path) => {
            if (
              !(item instanceof SchemaFieldObject) &&
              !(item instanceof SchemaFieldArray)
            ) {
              res[path] = item;
            }
          });
          setFieldTable(res);
        }
      }
    };
    eventBus.on(Event.SHOW_MULTI_EDIT_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_MULTI_EDIT_DIALOG, showDialog);
    };
  }, [selectingNodes]);

  const selectConfig = Object.keys(fieldTable).map((key) => {
    return {
      label: key,
      value: fieldTable[key],
    };
  });

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Multi edit"
    >
      <div className="w-full flex flex-col p-2" style={{ height: '650px' }}>
        <Select
          className="text-sm block outline-none cursor-pointer w-full"
          value={selectConfig.find((k) => k.value === schema) as any}
          onChange={(e) => {
            setSchema(e?.value);
          }}
          options={selectConfig}
        />
        {schema && (
          <FieldContainer
            className="mt-5"
            schema={schema}
            value={fieldValue}
            onValueChange={(val) => {
              setFieldValue(val);

              sourceData.forEach((data) => {
                const path = Object.keys(fieldTable).find(
                  (k) => fieldTable[k] === schema
                );
                set(data.data.extraData, path, val);
                StoryProvider.updateStoryletNode(data);
              });
            }}
          />
        )}
      </div>

      <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
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

export default MultiEditDialog;
