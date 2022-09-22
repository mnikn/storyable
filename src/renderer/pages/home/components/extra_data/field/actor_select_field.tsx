import classNames from 'classnames';
import { useMemo } from 'react';
import Select, { components } from 'react-select';
import { SchemaFieldActorSelect } from 'renderer/models/schema/schema';
import StoryProvider from 'renderer/services/story_provider';
import useEventState from 'renderer/utils/use_event_state';

function FieldActorSelect({
  className,
  label,
  schema,
  value,
  onValueChange,
}: {
  className?: string;
  label?: string;
  schema: SchemaFieldActorSelect;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  const projectSettings = useEventState<any>({
    property: 'projectSettings',
    event: StoryProvider.event,
    initialVal: StoryProvider.projectSettings,
  });
  const translations = useEventState<any>({
    property: 'translations',
    event: StoryProvider.event,
    initialVal: StoryProvider.translations,
  });
  const currentLang = useEventState<any>({
    property: 'currentLang',
    event: StoryProvider.event,
    initialVal: StoryProvider.currentLang,
  });

  const actorOptions = useMemo(() => {
    return projectSettings.actors.map((item: any) => {
      return {
        value: item.id,
        label: translations[item.name]?.[currentLang],
      };
    });
  }, [projectSettings, translations, currentLang]);

  return (
    <div className={classNames('w-full flex flex-col items-center', className)}>
      {label && <div className="text-sm font-bold mb-2">{label}</div>}
      <div className="flex items-center w-full">
        <Select
          className="text-sm block outline-none cursor-pointer flex-grow mr-2"
          value={actorOptions.find((d) => d.value === value.id)}
          onChange={(e) => {
            if (onValueChange) {
              onValueChange({
                ...value,
                id: e.value,
                portrait:
                  projectSettings.actors.find(
                    (item: any) => item.id === e.value
                  )?.portraits[0]?.id || null,
              });
            }
          }}
          options={actorOptions}
        />
        <Select
          className="text-sm block p-2 outline-none cursor-pointer w-1/2"
          value={value.portrait || ''}
          onChange={(e) => {
            if (onValueChange) {
              onValueChange({
                ...value,
                portrait: e.value,
              });
            }
          }}
          options={(
            projectSettings.actors.find((item: any) => item.id === value.id)
              ?.portraits || []
          ).map((p: any) => {
            return {
              value: p.id,
              label: p.id,
              pic: p.pic,
            };
          })}
          components={{
            Placeholder: () => {
              return null;
            },
            IndicatorsContainer: (props) => {
              return (
                <components.IndicatorsContainer
                  {...props}
                  className={`${props.className} cursor-pointer`}
                />
              );
            },
            Input: (props) => {
              const data = projectSettings.actors
                .find((item: any) => item.id === value.id)
                ?.portraits.find((p) => p.id === value.portrait);
              return (
                <div className="flex items-center p-2" {...props}>
                  <img
                    className="bg-gray-800 mr-2 object-cover"
                    src={data?.pic}
                    alt=""
                    style={{ width: '48px', height: '48px' }}
                  />
                  {value.portrait || ''}
                </div>
              );
            },
            Option: ({ innerProps, data, label }) => {
              return (
                <div
                  className="flex items-center hover:bg-gray-100 transition-all p-2"
                  {...innerProps}
                >
                  <img
                    className="bg-gray-800 mr-2 object-cover"
                    src={(data as any).pic}
                    alt=""
                    style={{ width: '80px', height: '80px' }}
                  />
                  {label}
                </div>
              );
            },
          }}
        />
      </div>
    </div>
  );
}

export default FieldActorSelect;
