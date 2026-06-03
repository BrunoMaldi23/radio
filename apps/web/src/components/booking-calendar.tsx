'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { io } from 'socket.io-client';
import { useEffect, useMemo, useState } from 'react';
import { API_URL, type Booking } from '@/lib/api';

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
};

function toEvent(booking: Booking): CalendarEvent {
  const resources = booking.details.map((detail) => detail.resource.title).join(', ');
  const title = [booking.space?.name ?? 'Recursos moviles', resources].filter(Boolean).join(' + ');
  const colors = {
    PENDING: { backgroundColor: '#f59e0b', borderColor: '#f59e0b', textColor: '#ffffff' },
    ACTIVE: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9', textColor: '#ffffff' },
    COMPLETED: { backgroundColor: '#64748b', borderColor: '#64748b', textColor: '#ffffff' },
    CANCELLED: { backgroundColor: '#e11d48', borderColor: '#e11d48', textColor: '#ffffff' }
  }[booking.status];

  return {
    id: String(booking.id),
    title,
    start: booking.startTime,
    end: booking.endTime,
    ...colors
  };
}

export function BookingCalendar({ bookings }: { bookings: Booking[] }) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => bookings.map(toEvent));
  const socketUrl = API_URL === '/api' ? undefined : API_URL;

  const socket = useMemo(() => io(socketUrl, { autoConnect: false }), [socketUrl]);

  useEffect(() => {
    setEvents(bookings.map(toEvent));
  }, [bookings]);

  useEffect(() => {
    socket.connect();
    socket.on('booking.created', (booking: Booking) => {
      setEvents((current) => [...current.filter((event) => event.id !== String(booking.id)), toEvent(booking)]);
    });

    return () => {
      socket.off('booking.created');
      socket.disconnect();
    };
  }, [socket]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      locale={esLocale}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Dia' }}
      events={events}
      height={560}
      contentHeight={500}
      expandRows={false}
      nowIndicator
      selectable
      slotMinTime="07:00:00"
      slotMaxTime="22:00:00"
      allDayText="Todo el dia"
      eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
    />
  );
}
