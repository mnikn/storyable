import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  SchemaField,
  SchemaFieldObject,
  SchemaFieldString,
  validateValue,
} from 'renderer/models/schema/schema';
import {
  StoryletCustomNode,
  StoryletBranchNode,
  StoryletRootNode,
  StoryletNode,
  StoryletSentenceNode,
} from 'renderer/models/storylet';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';
import { FieldContainer } from './field';
import { buildSchema } from 'renderer/models/schema/factory';

function ExtraDataPanel({
  sourceNode,
  customType,
  close,
  children,
  onSubmit,
}: {
  sourceNode: StoryletNode<any>;
  customType?: string;
  close: () => void;
  children?: ReactNode;
  onSubmit?: () => void;
}) {
  const [form, setForm] = useState<any>(sourceNode.data.extraData || {});
  const [schema, setSchema] = useState<SchemaFieldObject>(
    new SchemaFieldObject()
  );
  const projectSettings = useEventState<any>({
    property: 'projectSettings',
    event: StoryProvider.event,
    initialVal: StoryProvider.projectSettings,
  });

  useEffect(() => {
    if (sourceNode instanceof StoryletSentenceNode) {
      const s = buildSchema(
        projectSettings.extraDataConfig.sentence
      ) as SchemaFieldObject;
      setSchema(s);
    }
    if (sourceNode instanceof StoryletRootNode) {
      const s = buildSchema(
        projectSettings.extraDataConfig.root
      ) as SchemaFieldObject;
      setSchema(s);
    }
    if (sourceNode instanceof StoryletBranchNode) {
      const s = buildSchema(
        projectSettings.extraDataConfig.branch
      ) as SchemaFieldObject;
      setSchema(s);
    }
    if (sourceNode instanceof StoryletCustomNode) {
      const schemaItem = StoryProvider.projectSettings.customNodeConfig
        .map((item: any) => {
          return {
            type: item.type,
            schema: buildSchema(item.schema),
            schemaConfig: item.schema,
          };
        })
        .find((item) => item.type === customType);

      const s = schemaItem?.schema || new SchemaFieldObject();
      setSchema(s as SchemaFieldObject);
      setForm((prev: any) => {
        return validateValue(prev, prev, s, schemaItem);
      });
    }
  }, [projectSettings, customType]);

  return (
    <div className="w-full flex flex-col h-full">
      {children}
      <div className="p-2 mb-4 flex-grow flex flex-col h-96 overflow-auto">
        <FieldContainer
          schema={schema}
          value={form}
          onValueChange={(val) => {
            setForm(val);
          }}
        />
      </div>
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

export default ExtraDataPanel;
