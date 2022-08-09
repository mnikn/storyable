import { useEffect, useState } from 'react';
import Dialog from 'renderer/components/dialog';
import { CgMathPlus, CgRemove } from 'react-icons/cg';
import eventBus, { Event } from '../event';
import StoryProvider from '../../../services/story_provider';

function ProjectSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const showDialog = () => {
      setForm(StoryProvider.projectSettings);
      setOpen(true);
    };
    eventBus.on(Event.SHOW_PROJECT_SETTINGS_DIALOG, showDialog);
    return () => {
      eventBus.off(Event.SHOW_PROJECT_SETTINGS_DIALOG, showDialog);
    };
  }, []);
  if (!open) {
    return null;
  }
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Project settings"
    >
      <div className="block p-6 flex flex-col">
        <div className="text-md text-black mb-2 font-bold">I18n</div>
        <div className="h-48 overflow-auto p-2 mb-4 grid grid-cols-3 gap-3">
          {(form.i18n || []).map((lang: string, i: number) => {
            return (
              <div
                className="flex rounded-md items-center outline-none h-24"
                key={i}
              >
                <input
                  className="mr-2 border border-gray-300 p-2 rounded-md flex-grow w-full outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={lang}
                  disabled={i === 0}
                  placeholder="Lang"
                  onChange={(e) => {
                    form.i18n[i] = e.target.value;
                    setForm((prev: any) => {
                      return {
                        ...prev,
                      };
                    });
                  }}
                />
                <CgRemove
                  className="cursor-pointer"
                  style={{ visibility: i !== 0 ? 'visible' : 'hidden' }}
                  onClick={() => {
                    form.i18n.splice(i, 1);
                    setForm((prev: any) => {
                      return {
                        ...prev,
                      };
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
        <button
          className="w-full border border-gray-300 hover:text-gray-400 p-2 border-dashed transition-all flex items-center justify-center"
          onClick={() => {
            form.i18n.push('');
            setForm((prev: any) => {
              return {
                ...prev,
              };
            });
          }}
        >
          <CgMathPlus className="mr-2" /> Add lang
        </button>
      </div>
      <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            StoryProvider.updateProjectSettings(form);
            setOpen(false);
            eventBus.emit(Event.CLOSE_EDIT_DIALOG);
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            setOpen(false);
            eventBus.emit(Event.CLOSE_EDIT_DIALOG);
          }}
        >
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

export default ProjectSettingsDialog;
