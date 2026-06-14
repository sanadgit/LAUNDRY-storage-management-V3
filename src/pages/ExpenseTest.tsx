import { useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  Send,
} from 'lucide-react';

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

type ExpenseAccount = {
  id: string;
  text: string;
};

type PayAccount = {
  id: string;
  name: string;
};

type CreateExpenseResponse = {
  ok: boolean;
  expense_id: string;
  total_tax: number;
  total_amount: number;
  header: Record<string, unknown>;
  lines: Array<Record<string, unknown>>;
  hold_response: Record<string, unknown>;
  detail_responses: Array<Record<string, unknown>>;
  approve_response: Record<string, unknown>;
};

const toDateInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const knownAccounts = [
  { id: '33958', name: 'Miscellaneous Account' },
  { id: '36460', name: 'Chemicals Purchases' },
  { id: '44291', name: 'petrol exp' },
  { id: '44337', name: 'Car Expenses' },
  { id: '44775', name: 'maintenance machine' },
  { id: '46298', name: 'rents' },
  { id: '52253', name: 'Internet+Phone' },
  { id: '54265', name: 'WATER-Electricity' },
  { id: '61639', name: 'IT & Software' },
  { id: '66281', name: 'Trade License Fees' },
  { id: '66287', name: 'Traffic Fines' },
];

const formatMoney = (value: number) =>
  `AED ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ExpenseTest() {
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [apiUserId, setApiUserId] = useState('');
  const [voucher, setVoucher] = useState('');
  const [branchId, setBranchId] = useState('1');
  const [branchName, setBranchName] = useState('AL FALAH');
  const [payAccount, setPayAccount] = useState('');
  const [payAccountName, setPayAccountName] = useState('');
  const [paidBy, setPaidBy] = useState('SAOOD');
  const [paidById, setPaidById] = useState('');
  const [underAccount, setUnderAccount] = useState('Creditors');
  const [partyAccountLabel, setPartyAccountLabel] = useState('Direct Pay / Without party account');
  const [currency, setCurrency] = useState('AED');
  const [projectId, setProjectId] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [expenseType, setExpenseType] = useState<'1' | '2'>('2');
  const [date, setDate] = useState(today);
  const [billDate, setBillDate] = useState(today);
  const [billNo, setBillNo] = useState(`TEST-${Date.now()}`);
  const [remark, setRemark] = useState('POS expense test from Smart Hub');
  const [vendorId, setVendorId] = useState('');
  const [accountHead, setAccountHead] = useState('33958');
  const [accountName, setAccountName] = useState('Miscellaneous Account');
  const [notes, setNotes] = useState('Test expense line from Smart Hub');
  const [amount, setAmount] = useState('1.00');
  const [vatEnabled, setVatEnabled] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
  const [payAccounts, setPayAccounts] = useState<PayAccount[]>([]);
  const [accountStatus, setAccountStatus] = useState<RequestStatus>('idle');
  const [payAccountStatus, setPayAccountStatus] = useState<RequestStatus>('idle');
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateExpenseResponse | null>(null);

  const amountNumber = Number(amount) || 0;
  const taxAmount = vatEnabled ? Math.round(amountNumber * 5) / 100 : 0;
  const total = Math.round((amountNumber + taxAmount) * 100) / 100;
  const canSubmit =
    status !== 'loading' &&
    branchId.trim() &&
    payAccount.trim() &&
    date.trim() &&
    billDate.trim() &&
    accountHead.trim() &&
    amountNumber > 0;

  const searchAccounts = async () => {
    if (!searchText.trim()) return;
    setAccountStatus('loading');
    try {
      const response = await axios.get<{ accounts: ExpenseAccount[] }>('/api/pos/expenses/accounts', {
        params: { q: searchText.trim() },
      });
      setAccounts(response.data.accounts || []);
      setAccountStatus('success');
    } catch {
      setAccounts([]);
      setAccountStatus('error');
    }
  };

  const loadPayAccounts = async () => {
    setPayAccountStatus('loading');
    try {
      const response = await axios.get<{ pay_accounts: PayAccount[] }>('/api/pos/expenses/pay-accounts', {
        params: { branch_id: branchId, api_user_id: apiUserId },
      });
      setPayAccounts(response.data.pay_accounts || []);
      setPayAccountStatus('success');
    } catch {
      setPayAccounts([]);
      setPayAccountStatus('error');
    }
  };

  const createExpense = async () => {
    if (!canSubmit) return;
    setStatus('loading');
    setError(null);
    setResult(null);
    try {
      const response = await axios.post<CreateExpenseResponse>('/api/pos/expenses/test-create', {
        user_id: apiUserId,
        voucher,
        branch_id: branchId,
        branch_name: branchName,
        pay_account: payAccount,
        pay_account_name: payAccountName,
        paid_by: paidBy,
        paid_by_id: paidById,
        under: underAccount,
        party_account_label: partyAccountLabel,
        currency,
        project_id: projectId,
        order_no: orderNo,
        expense_type: expenseType,
        date,
        bill_date: billDate,
        bill_no: billNo,
        remark,
        vendor_id: vendorId,
        lines: [
          {
            account_head: accountHead,
            notes,
            amount: amountNumber,
            tax_amount: taxAmount,
            total,
          },
        ],
      });
      setResult(response.data);
      setStatus('success');
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || requestError?.message || 'Failed to create POS expense.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-700">
                <ReceiptText size={14} />
                POS Expense Write Test
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">تسجيل فاتورة مصروف في POS</h1>
              <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-600">
                هذه الصفحة للاختبار الحقيقي. عند الضغط على Create Expense سيتم إنشاء مصروف فعلي داخل POS.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900">
              <div className="flex gap-2">
                <AlertTriangle size={20} className="shrink-0" />
                <span>استخدم مبلغ صغير ورقم فاتورة TEST حتى تتأكد من الإعدادات.</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Voucher</span>
                <input
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">API User ID</span>
                <input
                  value={apiUserId}
                  onChange={(e) => setApiUserId(e.target.value)}
                  placeholder="Optional if set in .env"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Branch ID</span>
                <input value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Branch</span>
                <input value={branchName} onChange={(e) => setBranchName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Paid By</span>
                <input value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Paid By ID</span>
                <input
                  value={paidById}
                  onChange={(e) => setPaidById(e.target.value)}
                  placeholder="SAOOD user id if known"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Under</span>
                <input value={underAccount} onChange={(e) => setUnderAccount(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Party A/C</span>
                <input value={partyAccountLabel} onChange={(e) => setPartyAccountLabel(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Currency</span>
                <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Date</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Bill Date</span>
                <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Bill No</span>
                <input value={billNo} onChange={(e) => setBillNo(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Order No</span>
                <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Project ID</span>
                <input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Optional" className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Vendor ID</span>
                <input value={vendorId} onChange={(e) => setVendorId(e.target.value)} placeholder="Optional" className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <label className="flex-1 space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-700">Pay Account</span>
                  <select
                    value={payAccount}
                    onChange={(e) => {
                      const selected = payAccounts.find((account) => account.id === e.target.value);
                      setPayAccount(e.target.value);
                      setPayAccountName(selected?.name || '');
                    }}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 font-bold"
                  >
                    <option value="">Select Pay Account</option>
                    {payAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.id})
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => void loadPayAccounts()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white"
                >
                  {payAccountStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Load Pay Accounts
                </button>
              </div>
              <div className="mt-2 text-xs font-bold text-blue-700">
                Current: {payAccountName || 'Manual'} {payAccount ? `(${payAccount})` : ''}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
              إذا لم تظهر الفاتورة في كشف الفواتير المسجلة، أدخل `Paid By ID` الصحيح للمستخدم SAOOD. الاسم وحده قد لا يكفي في POS.
            </div>

            <label className="mt-4 block space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Comments / Remark</span>
              <input value={remark} onChange={(e) => setRemark(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
            </label>

            <div className="mt-4 flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-700">
              <span>Expense Type</span>
              <label className="inline-flex items-center gap-2">
                <input type="radio" checked={expenseType === '1'} onChange={() => setExpenseType('1')} />
                Type 1
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" checked={expenseType === '2'} onChange={() => setExpenseType('2')} />
                Type 2
              </label>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 font-black text-slate-900">
                <Plus size={18} />
                Expense Line
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[9rem_minmax(0,1fr)_9rem]">
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Account ID</span>
                  <input value={accountHead} onChange={(e) => setAccountHead(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Account Name</span>
                  <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Amount</span>
                  <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
                </label>
              </div>
              <label className="mt-4 block space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Line Notes</span>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold" />
              </label>
              <label className="mt-4 inline-flex items-center gap-2 text-sm font-black text-slate-700">
                <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                Add 5% VAT
              </label>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider">
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Amount {formatMoney(amountNumber)}</span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">VAT {formatMoney(taxAmount)}</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">Total {formatMoney(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void createExpense()}
              disabled={!canSubmit}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Create Expense In POS
            </button>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-black text-slate-900">Search Account</h2>
              <div className="mt-3 flex gap-2">
                <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="petrol, chemicals..." className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold" />
                <button type="button" onClick={() => void searchAccounts()} className="rounded-xl bg-slate-900 px-3 text-white">
                  {accountStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {accounts.map((account) => (
                  <button
                    type="button"
                    key={account.id}
                    onClick={() => {
                      setAccountHead(account.id);
                      setAccountName(account.text);
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-bold hover:bg-slate-50"
                  >
                    {account.id} | {account.text}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-black text-slate-900">Known Accounts</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {knownAccounts.map((account) => (
                  <button
                    type="button"
                    key={account.id}
                    onClick={() => {
                      setAccountHead(account.id);
                      setAccountName(account.name);
                    }}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-black text-slate-700 hover:bg-slate-50"
                  >
                    {account.name}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>

        {status === 'error' && error && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 font-bold text-rose-800">{error}</div>
        )}

        {status === 'success' && result && (
          <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={22} />
              <div>
                <div className="font-black text-emerald-900">Expense created successfully in POS</div>
                <div className="mt-1 text-sm font-bold text-emerald-800">
                  Expense ID: {result.expense_id} | Total: {formatMoney(result.total_amount)}
                </div>
              </div>
            </div>
            <pre className="mt-4 max-h-96 overflow-auto rounded-2xl border border-emerald-200 bg-white p-4 text-xs font-semibold text-slate-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
}
