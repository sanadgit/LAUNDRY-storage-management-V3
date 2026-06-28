import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  MessageSquareWarning,
  RefreshCw,
  Search,
  Truck,
  UserRound,
} from 'lucide-react';

type ConversationStatus = 'open' | 'pending' | 'assigned' | 'resolved' | 'closed';
type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';

type AiConversation = {
  id: number;
  contact_id: number;
  channel: string;
  status: ConversationStatus;
  intent: string | null;
  priority: ConversationPriority;
  assigned_to_phone: string | null;
  last_message_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  contact_phone: string;
  contact_name: string | null;
  contact_role: string;
  contact_language: string | null;
  last_message_text: string | null;
  last_message_direction: string | null;
  message_count: number;
};

type AiMessage = {
  id: number;
  conversation_id: number;
  direction: 'inbound' | 'outbound';
  sender_phone: string | null;
  receiver_phone: string | null;
  message_type: string;
  message_text: string | null;
  whatsapp_message_id: string | null;
  ai_response: number | boolean;
  created_at: string | null;
};

type PickupActionDraft = {
  area: string;
  address: string;
  google_maps_url: string;
  preferred_time: string;
  serviceType: string;
  notes: string;
};

const statusOptions: Array<{ value: 'all' | ConversationStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityClass: Record<ConversationPriority, string> = {
  low: 'border-slate-200 bg-slate-50 text-slate-600',
  normal: 'border-blue-200 bg-blue-50 text-blue-700',
  high: 'border-amber-200 bg-amber-50 text-amber-700',
  urgent: 'border-rose-200 bg-rose-50 text-rose-700',
};

const statusClass: Record<ConversationStatus, string> = {
  open: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  assigned: 'border-blue-200 bg-blue-50 text-blue-700',
  resolved: 'border-slate-200 bg-slate-50 text-slate-700',
  closed: 'border-slate-300 bg-slate-100 text-slate-500',
};

const formatDate = (value: string | null) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-AE', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const humanize = (value: string | null | undefined) => {
  const text = String(value || 'unknown').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const emptyPickupDraft = (): PickupActionDraft => ({
  area: '',
  address: '',
  google_maps_url: '',
  preferred_time: '',
  serviceType: 'WhatsApp pickup',
  notes: '',
});

export default function AiConversationsPage() {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | ConversationStatus>('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState<'pickup' | 'complaint' | null>(null);
  const [pickupDraft, setPickupDraft] = useState<PickupActionDraft>(() => emptyPickupDraft());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId]
  );

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<{ conversations: AiConversation[] }>('/api/ai/conversations', {
        params: {
          status: statusFilter,
          q: searchText.trim(),
          limit: 120,
        },
      });
      const list = Array.isArray(response.data?.conversations) ? response.data.conversations : [];
      setConversations(list);
      setSelectedId((current) => {
        if (current && list.some((item) => item.id === current)) return current;
        return list[0]?.id ?? null;
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load AI conversations.');
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter]);

  const loadMessages = useCallback(async (conversationId: number | null) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    try {
      setMessagesLoading(true);
      setError(null);
      const response = await axios.get<{ messages: AiMessage[] }>(`/api/ai/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(response.data?.messages) ? response.data.messages : []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load conversation messages.');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    void loadMessages(selectedId);
    setPickupDraft(emptyPickupDraft());
    setNotice(null);
  }, [loadMessages, selectedId]);

  const updateConversation = async (patch: Partial<Pick<AiConversation, 'status' | 'priority' | 'assigned_to_phone'>>) => {
    if (!selectedConversation) return;
    try {
      setSaving(true);
      setNotice(null);
      const response = await axios.patch<{ conversation: AiConversation }>(
        `/api/ai/conversations/${selectedConversation.id}`,
        patch
      );
      const updated = response.data?.conversation;
      if (updated) {
        setConversations((items) => items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
        setNotice('Conversation updated.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to update conversation.');
    } finally {
      setSaving(false);
    }
  };

  const createPickupFromSelected = async () => {
    if (!selectedConversation) return;
    try {
      setActionBusy('pickup');
      setNotice(null);
      setError(null);
      const response = await axios.post<{ pickup: { id: number } }>(
        `/api/ai/conversations/${selectedConversation.id}/create-pickup`,
        pickupDraft
      );
      const orderId = (response.data as any)?.order?.id;
      setNotice(
        `Pickup request #${response.data?.pickup?.id || ''}${orderId ? ` and customer order #${orderId}` : ''} created.`
      );
      await loadConversations();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to create pickup request.');
    } finally {
      setActionBusy(null);
    }
  };

  const createComplaintFromSelected = async () => {
    if (!selectedConversation) return;
    try {
      setActionBusy('complaint');
      setNotice(null);
      setError(null);
      const response = await axios.post<{ complaint: { id: number } }>(
        `/api/ai/conversations/${selectedConversation.id}/create-complaint`,
        {}
      );
      setNotice(`Complaint ticket #${response.data?.complaint?.id || ''} opened from this conversation.`);
      await loadConversations();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to open complaint ticket.');
    } finally {
      setActionBusy(null);
    }
  };

  const openCount = conversations.filter((item) => item.status === 'open').length;
  const urgentCount = conversations.filter((item) => item.priority === 'urgent' || item.priority === 'high').length;

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <MessageCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">AI Operations</p>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">WhatsApp Conversations</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm font-medium text-slate-500">
              Monitor inbound WhatsApp messages, detected intents, AI replies, and handoff status.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-400">Open</p>
              <p className="text-2xl font-black text-slate-950">{openCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-400">High Priority</p>
              <p className="text-2xl font-black text-slate-950">{urgentCount}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[24rem_minmax(0,1fr)]">
          <aside className="min-h-[34rem] rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <div className="flex gap-2">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search phone, name, intent"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void loadConversations()}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Refresh conversations"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                </button>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {statusOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatusFilter(item.value)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-black transition ${
                      statusFilter === item.value
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[calc(100vh-19rem)] min-h-[28rem] overflow-y-auto p-3">
              {error && (
                <div className="mb-3 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  <AlertCircle className="mt-0.5 shrink-0" size={18} />
                  <span>{error}</span>
                </div>
              )}

              {!loading && conversations.length === 0 && (
                <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <Bot className="text-slate-300" size={42} />
                  <p className="mt-3 text-sm font-black text-slate-700">No conversations yet</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Incoming WhatsApp messages will appear here.</p>
                </div>
              )}

              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const active = conversation.id === selectedId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedId(conversation.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        active
                          ? 'border-blue-300 bg-blue-50 shadow-sm'
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">
                            {conversation.contact_name || conversation.contact_phone}
                          </p>
                          <p className="mt-0.5 truncate text-xs font-bold text-slate-500">{conversation.contact_phone}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${statusClass[conversation.status]}`}>
                          {humanize(conversation.status)}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-medium leading-5 text-slate-600">
                        {conversation.last_message_text || 'No message text'}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-black uppercase tracking-wide text-blue-600">
                          {humanize(conversation.intent)}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                          <Clock3 size={13} />
                          {formatDate(conversation.last_message_at || conversation.updated_at)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="min-h-[34rem] rounded-3xl border border-slate-200 bg-white shadow-sm">
            {!selectedConversation ? (
              <div className="flex min-h-[34rem] flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="text-slate-300" size={48} />
                <p className="mt-3 text-sm font-black text-slate-700">Select a conversation</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">Message history and operations status will appear here.</p>
              </div>
            ) : (
              <div className="flex min-h-[34rem] flex-col">
                <div className="border-b border-slate-100 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                          <UserRound size={22} />
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-black text-slate-950">
                            {selectedConversation.contact_name || selectedConversation.contact_phone}
                          </h2>
                          <p className="truncate text-sm font-bold text-slate-500">
                            {selectedConversation.contact_phone} · {humanize(selectedConversation.contact_role)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${statusClass[selectedConversation.status]}`}>
                          {humanize(selectedConversation.status)}
                        </span>
                        <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${priorityClass[selectedConversation.priority]}`}>
                          {humanize(selectedConversation.priority)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600">
                          {humanize(selectedConversation.intent)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                        <input
                          value={pickupDraft.area}
                          onChange={(event) => setPickupDraft((draft) => ({ ...draft, area: event.target.value }))}
                          placeholder="Area"
                          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-300 focus:bg-white"
                        />
                        <input
                          value={pickupDraft.address}
                          onChange={(event) => setPickupDraft((draft) => ({ ...draft, address: event.target.value }))}
                          placeholder="Address"
                          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-300 focus:bg-white"
                        />
                        <input
                          value={pickupDraft.google_maps_url}
                          onChange={(event) => setPickupDraft((draft) => ({ ...draft, google_maps_url: event.target.value }))}
                          placeholder="Location link"
                          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-300 focus:bg-white"
                        />
                        <input
                          value={pickupDraft.preferred_time}
                          onChange={(event) => setPickupDraft((draft) => ({ ...draft, preferred_time: event.target.value }))}
                          placeholder="Pickup time"
                          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-300 focus:bg-white"
                        />
                        <input
                          value={pickupDraft.serviceType}
                          onChange={(event) => setPickupDraft((draft) => ({ ...draft, serviceType: event.target.value }))}
                          placeholder="Service"
                          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-300 focus:bg-white"
                        />
                      </div>
                      <textarea
                        value={pickupDraft.notes}
                        onChange={(event) => setPickupDraft((draft) => ({ ...draft, notes: event.target.value }))}
                        placeholder="Internal notes for driver and order"
                        className="mt-2 min-h-16 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-300 focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={Boolean(actionBusy)}
                        onClick={() => void createPickupFromSelected()}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionBusy === 'pickup' ? <Loader2 className="animate-spin" size={15} /> : <Truck size={15} />}
                        Create Pickup
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(actionBusy)}
                        onClick={() => void createComplaintFromSelected()}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionBusy === 'complaint' ? <Loader2 className="animate-spin" size={15} /> : <MessageSquareWarning size={15} />}
                        Open Complaint
                      </button>
                      {(['open', 'pending', 'assigned', 'resolved', 'closed'] as ConversationStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={saving || selectedConversation.status === status}
                          onClick={() => void updateConversation({ status })}
                          className={`rounded-xl border px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            selectedConversation.status === status
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {humanize(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {notice && (
                    <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                      <CheckCircle2 size={17} />
                      {notice}
                    </div>
                  )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-5">
                  {messagesLoading ? (
                    <div className="flex min-h-[24rem] items-center justify-center text-sm font-black text-slate-500">
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Loading messages...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const outbound = message.direction === 'outbound';
                        return (
                          <div key={message.id} className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[min(44rem,85%)] rounded-3xl border px-4 py-3 shadow-sm ${
                                outbound
                                  ? 'border-blue-200 bg-blue-600 text-white'
                                  : 'border-slate-200 bg-white text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide opacity-75">
                                {message.ai_response ? <Bot size={14} /> : <MessageCircle size={14} />}
                                <span>{outbound ? 'Outbound' : 'Inbound'}</span>
                                <span>·</span>
                                <span>{formatDate(message.created_at)}</span>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6">
                                {message.message_text || `[${message.message_type}]`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {messages.length === 0 && (
                        <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
                          <MessageCircle className="text-slate-300" size={44} />
                          <p className="mt-3 text-sm font-black text-slate-700">No messages found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}
