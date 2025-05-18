import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function ImageZoomModal({ isOpen, onClose, imageUrl }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay for background */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-80"
          leave="ease-in duration-200"
          leaveFrom="opacity-80"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/80 cursor-zoom-out"
            aria-hidden="true"
            onClick={onClose}
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="relative w-auto max-w-5xl transform overflow-hidden rounded-2xl bg-white p-2 shadow-2xl">
              {/* Close button */}
              <button
                type="button"
                className="absolute top-4 right-4 text-5xl text-gray-400 hover:text-gray-700 z-10 bg-white/50 rounded-full px-3 py-1"
                onClick={onClose}
                aria-label="Close"
              >
                &times;
              </button>
              <img
                src={imageUrl}
                alt="Zoomed"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}