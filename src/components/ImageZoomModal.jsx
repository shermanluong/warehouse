// components/ImageZoomModal.jsx
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react';
import { Fragment } from 'react';

export default function ImageZoomModal({ isOpen, onClose, imageUrl }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Transparent background, no overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Transparent clickable background (optional for closing) */}
          <div className="fixed inset-0" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-auto max-w-4xl transform overflow-hidden rounded-xl bg-white p-2 shadow-xl">
              <img
                src={imageUrl}
                alt="Zoomed"
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
