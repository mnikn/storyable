/* This example requires Tailwind CSS v2.0+ */
import { Dialog as BaseDialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

function Dialog({
  open,
  children,
  onClose,
  title,
  width,
  style,
}: {
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  width?: number;
  style?: React.CSSProperties;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <BaseDialog as="div" className="relative z-300" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <BaseDialog.Panel
                className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 w-3/6"
                style={{
                  width,
                  ...style,
                }}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-2">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      {title && (
                        <BaseDialog.Title
                          as="h3"
                          className="text-xl leading-6 font-bold text-gray-900 text-center select-none"
                        >
                          {title}
                        </BaseDialog.Title>
                      )}
                      <div className="mt-2 w-full">{children}</div>
                    </div>
                  </div>
                </div>
              </BaseDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </BaseDialog>
    </Transition.Root>
  );
}

export default Dialog;
