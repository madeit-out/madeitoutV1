import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';

export default function Itinerary({ itinerary, onAddEvent, onDeleteEvent }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trip Itinerary</h1>
        <button
          onClick={onAddEvent}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          + Add Event
        </button>
      </div>

      {itinerary.map(day => (
        <div key={day.date} className="border rounded-2xl shadow-md p-4">
          <h2 className="text-xl font-semibold mb-2">{format(new Date(day.date), 'eeee, MMMM d')}</h2>
          <div className="space-y-2">
            {day.events.map(event => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-sm px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div>
                  <div className="text-lg font-medium">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(event.datetime), 'p')}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEvent(event._id);
                  }}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
            {day.events.length === 0 && (
              <p className="text-sm text-gray-500 italic">No events yet.</p>
            )}
          </div>
        </div>
      ))}

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <Dialog.Title className="text-xl font-semibold mb-4">
              {selectedEvent?.title}
            </Dialog.Title>
            <div className="space-y-2">
              <p><strong>Time:</strong> {format(new Date(selectedEvent?.datetime), 'PPPPp')}</p>
              <p><strong>Location:</strong> {selectedEvent?.location || '—'}</p>
              <p><strong>Description:</strong> {selectedEvent?.description || '—'}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
