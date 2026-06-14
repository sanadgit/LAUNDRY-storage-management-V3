import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Loader2, Phone, RefreshCw, Search, Send, ShieldAlert } from 'lucide-react';

type MatchState = 'complete' | 'missing' | 'extra' | 'unknown';
type PhoneAlertSeverity = 'critical' | 'high' | 'medium' | 'low';
type ActiveTab = 'orders' | 'phone';

type StoreSlot = {
  blanket_id: number;
  store: string;
  row: number;
  column: number;
  status: string;
  created_at: string | null;
};

type AlertCandidate = {
  order_number?: string;
  order_no: string;
  customer_name: string;
  phone: string;
  phone_normalized?: string;
  pos_status?: string;
  order_date?: string;
  delivery_date?: string;
  customer_address?: string;
  remark?: string;
  quantity_in_order?: number;
  quantity_in_store?: number;
  qty_in_order: number;
  qty_in_store: number;
  matched: 'yes' | 'no';
  match_state: MatchState;
  total_amount: number;
  first_stored_at: string | null;
  store_slots: StoreSlot[];
  warnings?: string[];
  pos_error?: string;
  last_alert_status: string | null;
  last_alert_at: string | null;
};

type PhoneAlertGroup = {
  id: string;
  phone: string;
  display_phone: string;
  customer_names: string[];
  order_count: number;
  stored_piece_count: number;
  delivered_stored_count: number;
  mismatch_count: number;
  oldest_stored_at: string | null;
  severity: PhoneAlertSeverity;
  alerts: string[];
  orders: AlertCandidate[];
};

type AlertTemplate = {
  id: number;
  name: string;
  channel: string;
  body: string;
  is_active: number;
};

type AlertStorageScanOrder = {
  order_number?: string;
  order_no: string;
  quantity_in_store?: number;
  qty_in_store?: number;
  first_stored_at: string | null;
  store_slots: StoreSlot[];
};

const buildFastAlertCandidate = (order: AlertStorageScanOrder): AlertCandidate => {
  const orderNo = String(order.order_number || order.order_no || '').trim();
  const qtyInStore = Number(order.quantity_in_store ?? order.qty_in_store ?? 0) || 0;
  return {
    order_number: orderNo,
    order_no: orderNo,
    customer_name: '',
    phone: '',
    phone_normalized: '',
    pos_status: '',
    order_date: '',
    delivery_date: '',
    customer_address: '',
    remark: '',
    quantity_in_order: 0,
    quantity_in_store: qtyInStore,
    qty_in_order: 0,
    qty_in_store: qtyInStore,
    matched: 'no',
    match_state: 'unknown',
    total_amount: 0,
    first_stored_at: order.first_stored_at,
    store_slots: Array.isArray(order.store_slots) ? order.store_slots : [],
    warnings: ['جاري تحديث بيانات POS في الخلفية'],
    last_alert_status: null,
    last_alert_at: null,
  };
};

const matchStateLabel: Record<MatchState, string> = {
  complete: 'مكتمل',
  missing: 'ناقص',
  extra: 'زائد',
  unknown: 'غير معروف',
};

const matchStateClass: Record<MatchState, string> = {
  complete: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  missing: 'bg-rose-100 text-rose-700 border-rose-300',
  extra: 'bg-amber-100 text-amber-700 border-amber-300',
  unknown: 'bg-slate-100 text-slate-700 border-slate-300',
};

const alertStateClass = (value: string | null) => {
  if (value === 'sent') return 'bg-emerald-100 text-emerald-700 border-emerald-300';
  if (value === 'failed') return 'bg-rose-100 text-rose-700 border-rose-300';
  return 'bg-slate-100 text-slate-600 border-slate-300';
};

const severityLabel: Record<PhoneAlertSeverity, string> = {
  critical: 'خطر جداً',
  high: 'عالي',
  medium: 'متوسط',
  low: 'منخفض',
};

const severityClass: Record<PhoneAlertSeverity, string> = {
  critical: 'bg-rose-100 text-rose-800 border-rose-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-slate-100 text-slate-700 border-slate-300',
};

export default function CustomerAlertsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [templates, setTemplates] = useState<AlertTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [candidates, setCandidates] = useState<AlertCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneGroups, setPhoneGroups] = useState<PhoneAlertGroup[]>([]);
  const [phoneGroupsLoaded, setPhoneGroupsLoaded] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneSeverityFilter, setPhoneSeverityFilter] = useState<'all' | PhoneAlertSeverity>('all');
  const [phoneStatusFilter, setPhoneStatusFilter] = useState('all');
  const [phoneOldDays, setPhoneOldDays] = useState(7);
  const [busyBulk, setBusyBulk] = useState(false);
  const [busyOrderNos, setBusyOrderNos] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [matchFilter, setMatchFilter] = useState<'all' | MatchState>('all');
  const [sendFilter, setSendFilter] = useState<'all' | 'not_sent' | 'sent' | 'failed'>('all');
  const [activeLocationsCandidate, setActiveLocationsCandidate] = useState<AlertCandidate | null>(null);

  const loadTemplates = useCallback(async () => {
    const response = await axios.get<{ templates: AlertTemplate[] }>('/api/customer-alerts/templates');
    const list = Array.isArray(response.data?.templates) ? response.data.templates : [];
    setTemplates(list);
    if (!selectedTemplateId && list.length > 0) {
      const first = list[0];
      setSelectedTemplateId(first.id);
      setMessage(first.body || '');
    }
  }, [selectedTemplateId]);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fastResponse = await axios.get<{ orders: AlertStorageScanOrder[] }>('/api/customer-alerts/scan-storage', {
        params: { limit: 160 },
      });
      const fastList = Array.isArray(fastResponse.data?.orders)
        ? fastResponse.data.orders.map(buildFastAlertCandidate)
        : [];
      setCandidates(fastList);

      void axios
        .get<{ candidates: AlertCandidate[] }>('/api/customer-alerts/candidates', {
          params: { limit: 160 },
        })
        .then((response) => {
          const list = Array.isArray(response.data?.candidates) ? response.data.candidates : [];
          setCandidates(list);
        })
        .catch((err: any) => {
          setError(err?.response?.data?.error || err?.message || 'Failed to load POS alert details.');
        })
        .finally(() => setLoading(false));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load candidates.');
      setLoading(false);
    }
  }, []);

  const loadPhoneGroups = useCallback(async () => {
    try {
      setPhoneLoading(true);
      setPhoneError(null);
      const response = await axios.get<{ groups: PhoneAlertGroup[] }>('/api/customer-alerts/phone-groups', {
        params: {
          limit: 160,
          q: phoneSearch.trim(),
          severity: phoneSeverityFilter,
          posStatus: phoneStatusFilter,
          oldDays: phoneOldDays,
        },
      });
      const list = Array.isArray(response.data?.groups) ? response.data.groups : [];
      setPhoneGroups(list);
      setPhoneGroupsLoaded(true);
    } catch (err: any) {
      setPhoneError(err?.response?.data?.error || err?.message || 'Failed to load phone alerts.');
      setPhoneGroupsLoaded(true);
    } finally {
      setPhoneLoading(false);
    }
  }, [phoneOldDays, phoneSearch, phoneSeverityFilter, phoneStatusFilter]);

  useEffect(() => {
    if (activeTab === 'phone') {
      setPhoneGroupsLoaded(false);
    }
  }, [phoneSearch, phoneSeverityFilter, phoneStatusFilter, phoneOldDays]);

  useEffect(() => {
    void loadTemplates();
    void loadCandidates();
  }, [loadTemplates, loadCandidates]);

  useEffect(() => {
    if (activeTab === 'phone' && !phoneGroupsLoaded && !phoneLoading) {
      void loadPhoneGroups();
    }
  }, [activeTab, phoneGroupsLoaded, phoneLoading]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      if (matchFilter !== 'all' && candidate.match_state !== matchFilter) return false;
      if (sendFilter === 'sent' && candidate.last_alert_status !== 'sent') return false;
      if (sendFilter === 'failed' && candidate.last_alert_status !== 'failed') return false;
      if (sendFilter === 'not_sent' && candidate.last_alert_status) return false;
      return true;
    });
  }, [candidates, matchFilter, sendFilter]);

  const summary = useMemo(() => {
    return {
      total: candidates.length,
      complete: candidates.filter((item) => item.match_state === 'complete').length,
      missing: candidates.filter((item) => item.match_state === 'missing').length,
      extra: candidates.filter((item) => item.match_state === 'extra').length,
    };
  }, [candidates]);

  const phoneSummary = useMemo(() => {
    return {
      total: phoneGroups.length,
      critical: phoneGroups.filter((item) => item.severity === 'critical').length,
      high: phoneGroups.filter((item) => item.severity === 'high').length,
      deliveredStored: phoneGroups.reduce((sum, item) => sum + Number(item.delivered_stored_count ?? 0), 0),
    };
  }, [phoneGroups]);

  const currentTemplateId = selectedTemplateId === '' ? null : Number(selectedTemplateId);
  const getOrderNo = (candidate: AlertCandidate) => candidate.order_number || candidate.order_no;
  const getQtyInOrder = (candidate: AlertCandidate) => Number(candidate.quantity_in_order ?? candidate.qty_in_order ?? 0);
  const getQtyInStore = (candidate: AlertCandidate) => Number(candidate.quantity_in_store ?? candidate.qty_in_store ?? 0);

  const handleTemplateChange = (value: string) => {
    if (!value) {
      setSelectedTemplateId('');
      return;
    }
    const parsed = Number(value);
    setSelectedTemplateId(parsed);
    const template = templates.find((row) => row.id === parsed);
    if (template) setMessage(template.body || '');
  };

  const withBusyOrder = async (orderNo: string, work: () => Promise<void>) => {
    setBusyOrderNos((prev) => ({ ...prev, [orderNo]: true }));
    try {
      await work();
    } finally {
      setBusyOrderNos((prev) => ({ ...prev, [orderNo]: false }));
    }
  };

  const handleCheckOrder = async (orderNo: string) => {
    await withBusyOrder(orderNo, async () => {
      try {
        const response = await axios.post<{ candidate: AlertCandidate; warnings: string[] }>('/api/customer-alerts/check-order', {
          orderNo,
        });
        const freshCandidate = response.data?.candidate;
        if (!freshCandidate) return;
        setCandidates((prev) =>
          prev.map((item) => ((item.order_number || item.order_no) === orderNo ? freshCandidate : item))
        );
        const warnings = Array.isArray(response.data?.warnings) ? response.data.warnings : [];
        setStatusNote(warnings.length > 0 ? `${orderNo}: ${warnings.join(' | ')}` : `${orderNo}: الطلب مكتمل.`);
      } catch (err: any) {
        setStatusNote(err?.response?.data?.error || err?.message || 'فشل التحقق من الطلب.');
      }
    });
  };

  const handleSendOne = async (candidate: AlertCandidate) => {
    await withBusyOrder(candidate.order_no, async () => {
      try {
        setStatusNote(null);
        await axios.post('/api/customer-alerts/send-one', {
          orderNo: candidate.order_no,
          templateId: currentTemplateId,
          message: message.trim(),
          sendOnlyMatched: true,
        });
        setStatusNote(`تم إرسال التنبيه للطلب ${candidate.order_no}`);
        await loadCandidates();
      } catch (err: any) {
        setStatusNote(err?.response?.data?.error || err?.message || `فشل إرسال الطلب ${candidate.order_no}`);
      }
    });
  };

  const handleSendAll = async () => {
    try {
      setBusyBulk(true);
      setStatusNote(null);
      const orderNos = filteredCandidates.map((item) => getOrderNo(item));
      if (orderNos.length === 0) {
        setStatusNote('لا يوجد طلبات ضمن الفلترة الحالية.');
        return;
      }
      const response = await axios.post<{
        summary?: { total: number; sent: number; failed: number; skipped: number };
      }>('/api/customer-alerts/send-bulk', {
        orderNos,
        templateId: currentTemplateId,
        message: message.trim(),
        sendOnlyMatched: true,
      });
      const summaryPayload = response.data?.summary;
      if (summaryPayload) {
        setStatusNote(
          `الإرسال الجماعي: إجمالي ${summaryPayload.total} | نجاح ${summaryPayload.sent} | فشل ${summaryPayload.failed} | تخطي ${summaryPayload.skipped}`
        );
      } else {
        setStatusNote('تم تنفيذ الإرسال الجماعي.');
      }
      await loadCandidates();
    } catch (err: any) {
      setStatusNote(err?.response?.data?.error || err?.message || 'فشل الإرسال الجماعي.');
    } finally {
      setBusyBulk(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">تنبيه العملاء</h1>
            <p className="text-sm text-slate-500 font-semibold">مطابقة الكميات وتنبيهات رقم الهاتف قبل الإرسال والتسليم</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'orders' ? (
              <>
                <button
                  type="button"
                  onClick={() => void loadCandidates()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  تحديث
                </button>
                <button
                  type="button"
                  onClick={() => void handleSendAll()}
                  disabled={busyBulk || loading || !message.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {busyBulk ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  إرسال للكل
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void loadPhoneGroups()}
                disabled={phoneLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                {phoneLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                تحديث التنبيهات
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black border ${
              activeTab === 'orders'
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 size={16} />
            مطابقة الطلبات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black border ${
              activeTab === 'phone'
                ? 'border-rose-300 bg-rose-50 text-rose-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Phone size={16} />
            تنبيهات رقم الهاتف
          </button>
        </div>

        {activeTab === 'orders' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-black text-slate-500">الإجمالي</div>
                <div className="text-xl font-black text-slate-900">{summary.total}</div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-xs font-black text-emerald-700">مكتمل</div>
                <div className="text-xl font-black text-emerald-800">{summary.complete}</div>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                <div className="text-xs font-black text-rose-700">ناقص</div>
                <div className="text-xl font-black text-rose-800">{summary.missing}</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <div className="text-xs font-black text-amber-700">زائد</div>
                <div className="text-xl font-black text-amber-800">{summary.extra}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">نموذج الرسالة</label>
                <select
                  title="Template"
                  value={selectedTemplateId}
                  onChange={(event) => handleTemplateChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="">نص يدوي</option>
                  {templates
                    .filter((item) => Number(item.is_active ?? 0) === 1)
                    .map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">فلتر المطابقة</label>
                <select
                  title="Match filter"
                  value={matchFilter}
                  onChange={(event) => setMatchFilter(event.target.value as 'all' | MatchState)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="all">الكل</option>
                  <option value="complete">مكتمل</option>
                  <option value="missing">ناقص</option>
                  <option value="extra">زائد</option>
                  <option value="unknown">غير معروف</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">فلتر الإرسال</label>
                <select
                  title="Send filter"
                  value={sendFilter}
                  onChange={(event) => setSendFilter(event.target.value as 'all' | 'not_sent' | 'sent' | 'failed')}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="all">الكل</option>
                  <option value="not_sent">لم يُرسل</option>
                  <option value="sent">تم الإرسال</option>
                  <option value="failed">فشل</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500">نص الرسالة</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="اكتب نموذج الرسالة هنا... يمكنك استخدام {{name}} {{order_no}} {{pieces}} {{total}} {{store}}"
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold"
              />
              <p className="text-xs text-slate-500">
                المتغيرات المتاحة: <code>{'{{name}} {{order_no}} {{pieces}} {{total}} {{store}}'}</code>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-black text-slate-500">مجموعات الهاتف</div>
                <div className="text-xl font-black text-slate-900">{phoneSummary.total}</div>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                <div className="text-xs font-black text-rose-700">خطر جداً</div>
                <div className="text-xl font-black text-rose-800">{phoneSummary.critical}</div>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                <div className="text-xs font-black text-orange-700">عالي</div>
                <div className="text-xl font-black text-orange-800">{phoneSummary.high}</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <div className="text-xs font-black text-amber-700">Delivered داخل الاستور</div>
                <div className="text-xl font-black text-amber-800">{phoneSummary.deliveredStored}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs font-black text-slate-500">بحث</label>
                <div className="flex gap-2">
                  <input
                    value={phoneSearch}
                    onChange={(event) => setPhoneSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void loadPhoneGroups();
                    }}
                    placeholder="رقم هاتف، رقم طلب، اسم عميل، استور..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => void loadPhoneGroups()}
                    disabled={phoneLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60"
                  >
                    <Search size={16} />
                    بحث
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">الخطورة</label>
                <select
                  title="Phone severity filter"
                  value={phoneSeverityFilter}
                  onChange={(event) => setPhoneSeverityFilter(event.target.value as 'all' | PhoneAlertSeverity)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="all">الكل</option>
                  <option value="critical">خطر جداً</option>
                  <option value="high">عالي</option>
                  <option value="medium">متوسط</option>
                  <option value="low">منخفض</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">حالة POS</label>
                <select
                  title="POS status filter"
                  value={phoneStatusFilter}
                  onChange={(event) => setPhoneStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="all">الكل</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Fully Packed">Fully Packed</option>
                  <option value="Partially Packed">Partially Packed</option>
                  <option value="Pending">Pending</option>
                  <option value="Pending/Unpaid">Pending/Unpaid</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">قديم بعد أيام</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={phoneOldDays}
                  onChange={(event) => setPhoneOldDays(Number(event.target.value || 7))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                />
              </div>
            </div>
          </>
        )}

        {statusNote && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            {statusNote}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}
        {phoneError && activeTab === 'phone' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {phoneError}
          </div>
        )}
      </section>

      {activeTab === 'orders' ? (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="text-left p-3 font-black">رقم الطلب</th>
                <th className="text-left p-3 font-black">اسم الزبون</th>
                <th className="text-left p-3 font-black">الكمية (الطلب)</th>
                <th className="text-left p-3 font-black">الكمية (الاستور)</th>
                <th className="text-left p-3 font-black">مطابق</th>
                <th className="text-left p-3 font-black">الحالة</th>
                <th className="text-left p-3 font-black">إرسال</th>
                <th className="text-left p-3 font-black">المواقع</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => {
                const orderNo = getOrderNo(candidate);
                const busy = Boolean(busyOrderNos[orderNo]);
                const quantityInOrder = getQtyInOrder(candidate);
                const quantityInStore = getQtyInStore(candidate);
                return (
                  <tr key={orderNo} className="border-t border-slate-200">
                    <td className="p-3 font-black text-slate-900">{orderNo}</td>
                    <td className="p-3 text-slate-700">
                      <div className="font-semibold">{candidate.customer_name || '-'}</div>
                      <div className="text-xs text-slate-500">{candidate.phone || 'رقم غير متوفر'}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-700">{quantityInOrder}</td>
                    <td className="p-3 font-bold text-slate-700">{quantityInStore}</td>
                    <td className="p-3">
                      {candidate.matched === 'yes' ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700">
                          <CheckCircle2 size={14} />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2 py-1 text-xs font-black text-rose-700">
                          <AlertCircle size={14} />
                          No
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${matchStateClass[candidate.match_state]}`}>
                          {matchStateLabel[candidate.match_state]}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${alertStateClass(
                            candidate.last_alert_status
                          )}`}
                        >
                          {candidate.last_alert_status || 'لم يُرسل'}
                        </span>
                      </div>
                      {candidate.pos_error && (
                        <div className="text-[11px] text-rose-600 font-semibold mt-1">{candidate.pos_error}</div>
                      )}
                      {(candidate.warnings ?? []).length > 0 && (
                        <div className="text-[11px] text-amber-700 font-semibold mt-1">{candidate.warnings?.join(' | ')}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleCheckOrder(orderNo)}
                          disabled={busy}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                        >
                          تحقق
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleSendOne(candidate)}
                          disabled={busy || !message.trim() || candidate.match_state !== 'complete'}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                          {busy ? '...' : 'إرسال'}
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setActiveLocationsCandidate(candidate)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        View Locations
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredCandidates.length === 0 && !loading && (
                <tr>
                  <td className="p-8 text-center text-slate-500 font-semibold" colSpan={8}>
                    لا توجد بيانات مطابقة للفلترة الحالية.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-[1180px] w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left p-3 font-black">رقم الهاتف</th>
                  <th className="text-left p-3 font-black">العميل</th>
                  <th className="text-left p-3 font-black">الخطورة</th>
                  <th className="text-left p-3 font-black">الطلبات</th>
                  <th className="text-left p-3 font-black">قطع الاستور</th>
                  <th className="text-left p-3 font-black">التنبيه</th>
                  <th className="text-left p-3 font-black">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {phoneGroups.map((group) => (
                  <tr key={group.id} className="border-t border-slate-200 align-top">
                    <td className="p-3">
                      <div className="font-black text-slate-900">{group.display_phone || group.phone || 'رقم غير متوفر'}</div>
                      {group.oldest_stored_at && (
                        <div className="text-xs text-slate-500 font-semibold">أقدم تخزين: {group.oldest_stored_at}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="font-semibold">{group.customer_names.join(' / ') || '-'}</div>
                      {group.delivered_stored_count > 0 && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-black text-rose-700">
                          <ShieldAlert size={13} />
                          Delivered داخل الاستور
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${severityClass[group.severity]}`}>
                        {severityLabel[group.severity]}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-700">{group.order_count}</td>
                    <td className="p-3 font-bold text-slate-700">{group.stored_piece_count}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {group.alerts.map((alert) => (
                          <div key={alert} className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                            {alert}
                          </div>
                        ))}
                        {group.alerts.length === 0 && <div className="text-xs font-semibold text-slate-500">لا توجد ملاحظات.</div>}
                      </div>
                    </td>
                    <td className="p-3">
                      <details className="group">
                        <summary className="cursor-pointer rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100">
                          عرض الطلبات
                        </summary>
                        <div className="mt-3 space-y-3 min-w-[460px]">
                          {group.orders.map((order) => {
                            const orderNo = getOrderNo(order);
                            const stores = Array.from(
                              new Set(order.store_slots.map((slot) => `${slot.store || '-'} ${slot.row}/${slot.column}`))
                            );
                            return (
                              <div key={orderNo} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                <div className="flex flex-wrap items-center gap-2 justify-between">
                                  <div className="font-black text-slate-900">{orderNo}</div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-700">
                                      {order.pos_status || 'POS غير معروف'}
                                    </span>
                                    <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${matchStateClass[order.match_state]}`}>
                                      {matchStateLabel[order.match_state]}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                                  <div>POS: <span className="font-bold">{getQtyInOrder(order)}</span></div>
                                  <div>الاستور: <span className="font-bold">{getQtyInStore(order)}</span></div>
                                  <div>تاريخ الطلب: <span className="font-bold">{order.order_date || '-'}</span></div>
                                  <div>تاريخ التوصيل: <span className="font-bold">{order.delivery_date || '-'}</span></div>
                                  <div className="col-span-2">المواقع: <span className="font-bold">{stores.join(', ') || '-'}</span></div>
                                  {order.remark && (
                                    <div className="col-span-2">Remark: <span className="font-bold">{order.remark}</span></div>
                                  )}
                                </div>
                                {(order.warnings ?? []).length > 0 && (
                                  <div className="mt-2 text-[11px] font-semibold text-amber-700">{order.warnings?.join(' | ')}</div>
                                )}
                                {order.pos_error && (
                                  <div className="mt-2 text-[11px] font-semibold text-rose-700">{order.pos_error}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
                {phoneGroups.length === 0 && !phoneLoading && (
                  <tr>
                    <td className="p-8 text-center text-slate-500 font-semibold" colSpan={7}>
                      لا توجد تنبيهات رقم هاتف حسب الفلترة الحالية.
                    </td>
                  </tr>
                )}
                {phoneLoading && (
                  <tr>
                    <td className="p-8 text-center text-slate-500 font-semibold" colSpan={7}>
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        جاري فحص أرقام الهواتف والطلبات...
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeLocationsCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-slate-900">
                  مواقع الطلب {activeLocationsCandidate.order_number || activeLocationsCandidate.order_no}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  عدد المواقع: {activeLocationsCandidate.store_slots.length}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLocationsCandidate(null)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                إغلاق
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="text-left p-3 font-black">Store</th>
                    <th className="text-left p-3 font-black">Row</th>
                    <th className="text-left p-3 font-black">Column</th>
                    <th className="text-left p-3 font-black">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLocationsCandidate.store_slots.map((slot) => (
                    <tr key={slot.blanket_id} className="border-t border-slate-200">
                      <td className="p-3 font-semibold text-slate-800">{slot.store || '-'}</td>
                      <td className="p-3 text-slate-700">{slot.row}</td>
                      <td className="p-3 text-slate-700">{slot.column}</td>
                      <td className="p-3 text-slate-700">{slot.status}</td>
                    </tr>
                  ))}
                  {activeLocationsCandidate.store_slots.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500 font-semibold">
                        لا توجد مواقع مسجلة لهذا الطلب.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
