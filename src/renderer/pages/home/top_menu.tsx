import { CgMenu, CgPlayButton } from 'react-icons/cg';
import { Menu, Item, Separator, useContextMenu } from 'react-contexify';
import eventBus, { Event } from './event';
import useEventState from 'renderer/utils/use_event_state';
import StoryProvider from 'renderer/services/story_provider';

const MENU_ID = 'top-menu';
function TopMenu() {
  const { show: showMenu } = useContextMenu({
    id: MENU_ID,
  });
  const projectSettings = useEventState<any>({
    property: 'projectSettings',
    event: StoryProvider.event,
    initialVal: StoryProvider.projectSettings,
  });
  const currentLang = useEventState<string>({
    property: 'currentLang',
    event: StoryProvider.event,
    initialVal: StoryProvider.currentLang,
  });
  return (
    <>
      <CgMenu
        className="absolute text-white text-3xl cursor-pointer hover:text-gray-800 transition-all"
        style={{
          left: '12px',
          top: '12px',
        }}
        onClick={showMenu}
      />
      <div
        className="absolute flex items-center"
        style={{
          right: '12px',
          top: '12px',
        }}
      >
        <CgPlayButton
          className="text-5xl text-white cursor-pointer hover:text-gray-800 transition-all"
          onClick={() => {
            if (StoryProvider.currentStorylet) {
              eventBus.emit(Event.SHOW_PREVIEW_DIALOG);
            }
          }}
        />
        <select
          className="border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer"
          value={currentLang}
          onChange={(e) => {
            StoryProvider.changeLang(e.target.value);
          }}
        >
          {projectSettings.i18n.map((key: string) => {
            return (
              <option value={key} key={key}>
                {key}
              </option>
            );
          })}
        </select>
      </div>

      <Menu id={MENU_ID}>
        <Item>New</Item>
        <Item>Open</Item>
        <Item>Save</Item>
        <Separator />
        <Item
          onClick={() => {
            eventBus.emit(Event.SHOW_PROJECT_SETTINGS_DIALOG);
          }}
        >
          Project settings
        </Item>
      </Menu>
    </>
  );
}

export default TopMenu;
