'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, Send } from 'lucide-react';
import { API_URL, api, type ChatMessage as ApiChatMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

type ChatMessage = {
  id: string | number;
  author: string;
  text: string;
  time: string;
  tone: 'amber' | 'teal' | 'rose' | 'slate';
};

const starterMessages: ChatMessage[] = [
  {
    id: 'welcome',
    author: 'Labranza FM+',
    text: 'Bienvenidos a la senal en vivo.',
    time: 'Ahora',
    tone: 'amber'
  },
  {
    id: 'ranking',
    author: 'Cabina',
    text: 'Pidan sus canciones y comenten el programa.',
    time: 'Ahora',
    tone: 'teal'
  }
];

const toneClasses = {
  amber: 'bg-amber-400 text-slate-950',
  teal: 'bg-teal-300 text-slate-950',
  rose: 'bg-rose-400 text-white',
  slate: 'bg-slate-700 text-white'
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function messageTone(author: string): ChatMessage['tone'] {
  const tones: ChatMessage['tone'][] = ['amber', 'teal', 'rose', 'slate'];
  const index = author.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length;
  return tones[index];
}

function mapApiMessage(message: ApiChatMessage): ChatMessage {
  return {
    id: message.id,
    author: message.author,
    text: message.message,
    time: new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.createdAt)),
    tone: messageTone(message.author)
  };
}

function createOptimisticMessage(author: string, text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    author,
    text,
    time: new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    tone: messageTone(author)
  };
}

export function TvLiveChat() {
  const [author, setAuthor] = useState('Invitado');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const canSend = text.trim().length > 0 && author.trim().length > 0;

  useEffect(() => {
    let active = true;
    api.chatMessages('tv')
      .then((items) => {
        if (active) {
          setMessages(items.length ? items.map(mapApiMessage) : starterMessages);
        }
      })
      .catch(() => {
        if (active) {
          setError('No se pudo conectar el chat en vivo.');
        }
      });

    const socket = io(API_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('chat.message', (message: ApiChatMessage) => {
      if (message.room !== 'tv') {
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        return [...current, mapApiMessage(message)].slice(-100);
      });
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const visibleMessages = useMemo(() => messages.slice(-60), [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) {
      return;
    }

    const cleanAuthor = author.trim();
    const cleanText = text.trim();
    const optimistic = createOptimisticMessage(cleanAuthor, cleanText);
    setMessages((current) => [...current, optimistic].slice(-100));
    setText('');
    setError(null);

    try {
      const saved = await api.sendChatMessage({ author: cleanAuthor, message: cleanText, room: 'tv' });
      setMessages((current) => current.map((item) => (item.id === optimistic.id ? mapApiMessage(saved) : item)));
    } catch {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      setError('No se pudo enviar el mensaje.');
      setText(cleanText);
    }
  }

  return (
    <aside className="radio-panel grid min-h-[420px] overflow-hidden rounded-lg lg:h-full">
      <div className="flex items-center justify-between border-b border-slate-900/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-teal-300">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-950">Chat en vivo</h2>
            <p className="text-xs font-bold text-rose-600">Radio Labranza FM+</p>
          </div>
        </div>
        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black uppercase text-rose-700">
          Vivo
        </span>
      </div>

      <div ref={listRef} className="admin-scroll max-h-[410px] overflow-y-auto px-4 py-3">
        <div className="grid gap-3">
          {visibleMessages.map((message) => (
            <article className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3" key={message.id}>
              <span className={cn('grid h-9 w-9 place-items-center rounded-md text-xs font-black', toneClasses[message.tone])}>
                {getInitials(message.author)}
              </span>
              <div className="min-w-0">
                <div className="flex min-w-0 items-baseline gap-2">
                  <p className="truncate text-sm font-black text-slate-950">{message.author}</p>
                  <span className="shrink-0 text-[11px] font-bold text-slate-400">{message.time}</span>
                </div>
                <p className="break-words text-sm leading-5 text-slate-600">{message.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <form className="mt-auto grid gap-2 border-t border-slate-900/10 bg-white/55 p-3" onSubmit={handleSubmit}>
        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        <input
          aria-label="Nombre"
          className="input h-10 rounded-md"
          maxLength={28}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Nombre"
          value={author}
        />
        <div className="flex gap-2">
          <input
            aria-label="Mensaje"
            className="input h-10 min-w-0 rounded-md"
            maxLength={180}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escribe en el chat"
            value={text}
          />
          <button
            aria-label="Enviar mensaje"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-amber-400 text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSend}
            type="submit"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
