import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import Dialog from 'renderer/components/dialog';
import { buildSchema } from 'renderer/models/schema/factory';
import { validateValue } from 'renderer/models/schema/schema';
import {
  StoryletActionNode,
  StoryletActionNodeData,
  StoryletNode,
} from 'renderer/models/storylet';
import StoryProvider from 'renderer/services/story_provider';
import useEventState from 'renderer/utils/use_event_state';
import eventBus, { Event } from '../event';
import ExtraDataPanel from './extra_data/extra_data_panel';

function ActionEditDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StoryletActionNodeData | null>(null);
  const [sourceNode, setSourceNode] = useState<StoryletActionNode | null>(null);
  const projectSettings = useEventState<any>({
    property: 'projectSettings',
    event: StoryProvider.event,
    initialVal: StoryProvider.projectSettings,
  });

  const actionSchemas = useMemo(() => {
    return projectSettings.actionNodeConfig.map((item: any) => {
      return {
        type: item.type,
        schema: buildSchema(item.schema),
        schemaConfig: item.schema,
      };
    });
  }, [projectSettings]);
  useEffect(() => {
    const showDialog = (data: StoryletActionNode) => {
      setOpen(true);
      setForm(data.data);
      setSourceNode(data);
    };
    eventBus.on(Event.SHOW_ACTION_EDIT_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_ACTION_EDIT_DIALOG, showDialog);
    };
  }, []);

  const options = actionSchemas.map((item: any) => {
    return {
      label: item.type,
      value: item.type,
    };
  });

  if (!form || !sourceNode) {
    return null;
  }
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Edit action"
    >
      <div className="w-full flex flex-col p-2" style={{ height: '650px' }}>
        <ExtraDataPanel
          sourceNode={sourceNode as StoryletNode<any>}
          actionType={form.actionType}
          onSubmit={() => {
            sourceNode.data.actionType = form.actionType;
            StoryProvider.updateStoryletNode(sourceNode);
          }}
          close={() => {
            setOpen(false);
            eventBus.emit(Event.CLOSE_DIALOG);
          }}
        >
          <div className="w-full flex items-center mb-5">
            <div className="text-md font-bold mr-2">Action type:</div>
            <Select
              className="text-sm block outline-none cursor-pointer flex-grow"
              value={options.find((o: any) => o.value === form.actionType)}
              onChange={(e) => {
                form.actionType = e.value;
                setForm((prev: any) => {
                  return { ...prev };
                });
              }}
              options={options}
            />
          </div>
        </ExtraDataPanel>
      </div>
    </Dialog>
  );
}

export default ActionEditDialog;
