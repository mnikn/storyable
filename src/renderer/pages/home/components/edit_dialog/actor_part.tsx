import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';
import Select, { components } from 'react-select';

function ActorPart({ form, onChange }: { form: any; onChange: () => void }) {
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
  const projectSettings = useEventState<any>({
    property: 'projectSettings',
    event: StoryProvider.event,
    initialVal: StoryProvider.projectSettings,
  });

  return (
    <div className="block mb-5">
      <div className="text-md text-black mb-2 font-bold">Actor</div>
      <div className="flex items-center">
        <select
          className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer mr-2 w-40"
          value={form.actor || ''}
          onChange={(e) => {
            form.actor = e.target.value;
            form.actorPortrait =
              projectSettings.actors.find((item: any) => item.id === form.actor)
              ?.portraits[0]?.id || null;
            onChange();
          }}
        >
          {[
            {
              id: '__none',
              name: 'None',
              portraits: [],
            },
            ...projectSettings.actors,
          ].map((actor: any, i: number) => {
            return (
              <option key={i} value={actor.id}>
                {actor.id === '__none'
                  ? 'None'
                  : translations[actor.name]?.[currentLang]}
              </option>
            );
          })}
        </select>
        <Select
          className="text-sm block p-2 outline-none cursor-pointer mr-2 w-80"
          value={form.actorPortrait || ''}
          onChange={(e) => {
            // form.actorPortrait = e.target.value;
            form.actorPortrait = (e as any).value;
            onChange();
          }}
          options={(
            projectSettings.actors.find((item: any) => item.id === form.actor)
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
                .find((item: any) => item.id === form.actor)
                ?.portraits.find((p) => p.id === form.actorPortrait);
              return (
                <div className="flex items-center p-2" {...props}>
                  <img
                    className="bg-gray-800 mr-2 object-cover"
                    src={data?.pic}
                    alt=""
                    style={{ width: '48px', height: '48px' }}
                  />
                  {form.actorPortrait || ''}
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

export default ActorPart;
