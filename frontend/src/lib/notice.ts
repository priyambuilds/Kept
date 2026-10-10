// A toast from outside React (the API client, session expiry). The root's NoticeToast shows it.
type Listener = (text: string) => void;
const listeners = new Set<Listener>();

export function notify(text: string): void { listeners.forEach((l) => l(text)); }
export function onNotice(l: Listener): () => void { listeners.add(l); return () => { listeners.delete(l); }; }
