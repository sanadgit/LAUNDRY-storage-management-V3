import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Brain,
  CalendarClock,
  CheckCircle2,
  Headphones,
  ImagePlus,
  MessageCircle,
  Mic,
  PackageSearch,
  PhoneCall,
  Send,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Order, SiteConfig } from '../types';
import { localize, SiteLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface AIOperationsDashboardProps {
  config: SiteConfig;
  orders: Order[];
  language?: SiteLanguage;
}

type AssistantState = 'collapsed' | 'expanded' | 'typing' | 'response' | 'human';

const automations = [
  { id: 'pickup', ar: 'استخراج طلبات الاستلام من واتساب', en: 'WhatsApp pickup extraction', status: 'running', confidence: { ar: 'ثقة عالية', en: 'High confidence' } },
  { id: 'delay', ar: 'اكتشاف احتمالية التأخير', en: 'Delay-risk detection', status: 'watching', confidence: { ar: 'ثقة متوسطة', en: 'Medium confidence' } },
  { id: 'routing', ar: 'اقتراح توزيع السائقين', en: 'Driver allocation suggestions', status: 'running', confidence: { ar: 'ثقة عالية', en: 'High confidence' } },
  { id: 'reply', ar: 'ردود العملاء الطبيعية', en: 'Natural customer replies', status: 'paused', confidence: { ar: 'تحتاج مراجعة', en: 'Needs review' } },
];

const suggestions = [
  { ar: 'توقع زيادة طلبات العبايات بعد 6 مساءً.', en: 'Expect higher abaya-care demand after 6 PM.' },
  { ar: 'فرع المصفح يحتاج سائقًا إضافيًا خلال ساعة.', en: 'Mussaffah branch may need one more driver within an hour.' },
  { ar: '3 طلبات جاهزة يمكن دمجها في خط توصيل واحد.', en: '3 ready orders can be combined into one delivery route.' },
];

export const AIOperationsDashboard: React.FC<AIOperationsDashboardProps> = ({ config, orders, language = 'ar' }) => {
  const [assistantState, setAssistantState] = useState<AssistantState>('expanded');
  const [message, setMessage] = useState('');
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  const insightStats = useMemo(() => {
    const active = orders.filter((order) => !['delivered', 'completed', 'cancelled'].includes(order.status)).length;
    const risk = orders.filter((order) => order.priority === 'urgent' || order.status === 'delivery').length;
    const unpaid = orders.filter((order) => order.paymentStatus !== 'paid').length;
    return { active, risk, unpaid, automation: config.ai_settings?.auto_pickup_enabled ? t('مفعّل', 'Enabled') : t('متوقف', 'Paused') };
  }, [config.ai_settings?.auto_pickup_enabled, orders, t]);

  const askAI = () => {
    setAssistantState('typing');
    window.setTimeout(() => setAssistantState('response'), 650);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(140,35,112,0.12),transparent_34%),linear-gradient(180deg,#F2F2F2,#ffffff)] text-foreground">
      <section className="border-b border-white/70 bg-gradient-to-br from-primary via-[#8f4fda] to-secondary text-white shadow-high">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1fr_.82fr] md:items-center lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <Badge variant="accent" className="mb-4 border-white/20 bg-white/10 text-white">
              <Sparkles aria-hidden="true" className="size-3.5" />
              {t('AI Operations', 'AI Operations')}
            </Badge>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              {t('ذكاء تشغيلي يساعد ولا يستبدل الحكم البشري.', 'Operational intelligence that assists, not replaces, human judgment.')}
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-white/75">
              {t('تنبيهات، توقعات، ومراقبة automation بلغة واضحة ومسار دائم للتصعيد إلى إنسان.', 'Alerts, predictions, and automation monitoring in plain language with a clear human escalation path.')}
            </p>
          </motion.div>

          <div className="grid gap-3 rounded-2xl border border-white/20 bg-white/12 p-4 shadow-glass backdrop-blur-3xl">
            <MiniMetric icon={PackageSearch} label={t('طلبات نشطة', 'Active orders')} value={String(insightStats.active)} />
            <MiniMetric icon={AlertTriangle} label={t('مخاطر تأخير', 'Delay risks')} value={String(insightStats.risk)} />
            <MiniMetric icon={Zap} label={t('Automation', 'Automation')} value={insightStats.automation} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[1.15fr_.85fr] lg:px-8">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <InsightCard icon={Brain} title={t('توقع الطلب', 'Demand forecast')} value="+18%" text={t('غالبًا أعلى من المعتاد مساءً.', 'Likely above normal this evening.')} variant="info" />
            <InsightCard icon={AlertTriangle} title={t('تنبيه شذوذ', 'Anomaly alert')} value={String(insightStats.risk)} text={t('طلبات تحتاج متابعة قبل التأخير.', 'Orders need attention before delay.')} variant="warning" />
            <InsightCard icon={Headphones} title={t('تصعيد إنساني', 'Human escalation')} value="1-click" text={t('المسار البشري ظاهر دائمًا.', 'Human path remains always visible.')} variant="success" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('حالة الأتمتة', 'Automation status')}</CardTitle>
              <CardDescription>{t('ما يعمل الآن، وما يحتاج مراجعة.', 'What is running now and what needs review.')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {automations.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 place-items-center rounded-md bg-primary text-white">
                      <Bot aria-hidden="true" className="size-5" />
                    </div>
                    <div>
                      <p className="font-black">{localize(language, item.ar, item.en)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{localize(language, item.confidence.ar, item.confidence.en)}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'running' ? 'success' : item.status === 'watching' ? 'warning' : 'neutral'} withIcon>
                    {item.status}
                  </Badge>
                  <Button variant="secondary" size="sm">{t('مراجعة', 'Review')}</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('توصيات قابلة للتنفيذ', 'Actionable recommendations')}</CardTitle>
              <CardDescription>{t('بدون raw scores أو مصطلحات تقنية.', 'No raw scores or technical jargon.')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {suggestions.map((item, index) => (
                <div key={localize(language, item.ar, item.en)} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp aria-hidden="true" className="size-5 text-accent" />
                    <p className="font-bold">{localize(language, item.ar, item.en)}</p>
                  </div>
                  <Badge variant={index === 1 ? 'warning' : 'info'}>{index === 1 ? t('مهم', 'Important') : t('اقتراح', 'Suggestion')}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle>{t('Layla Assistant', 'Layla Assistant')}</CardTitle>
              <CardDescription>{t('نموذج حالة المحادثة والاقتراحات والتصعيد.', 'Conversation state, suggestions, and escalation model.')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-4">
              <div className="flex gap-2">
                {(['collapsed', 'expanded', 'typing', 'response', 'human'] as AssistantState[]).map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setAssistantState(state)}
                    className={cn('min-h-9 rounded-md border px-2 text-xs font-bold', assistantState === state ? 'border-primary bg-primary text-white' : 'border-border bg-surface')}
                  >
                    {state}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-muted p-4">
                {assistantState === 'collapsed' ? (
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-pill bg-primary text-white">
                      <Sparkles aria-hidden="true" className="size-6" />
                    </div>
                    <p className="font-black">{t('فقاعة عائمة غير مزعجة', 'Lightweight floating bubble')}</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <Message role="ai" text={t('مرحبًا، أستطيع مساعدتك في تتبع طلب أو اقتراح إجراء تشغيلي.', 'Hi, I can help track an order or suggest an operational action.')} language={language} />
                    {assistantState === 'typing' ? (
                      <div className="flex items-center gap-2 rounded-lg bg-surface p-3 text-sm text-muted-foreground">
                        <span className="size-2 animate-pulse rounded-pill bg-accent" />
                        <span className="size-2 animate-pulse rounded-pill bg-accent [animation-delay:120ms]" />
                        <span className="size-2 animate-pulse rounded-pill bg-accent [animation-delay:240ms]" />
                        {t('Layla تفكر بهدوء...', 'Layla is thinking calmly...')}
                      </div>
                    ) : null}
                    {assistantState === 'response' ? (
                      <Message role="ai" text={t('يوجد طلب واحد قد يتأخر. الأفضل مراجعة خط توصيل فرع المصفح الآن.', 'One order may be delayed. Review the Mussaffah delivery route now.')} language={language} />
                    ) : null}
                    {assistantState === 'human' ? (
                      <Message role="human" text={t('تم تحويل المحادثة إلى موظف خدمة العملاء.', 'The conversation has been escalated to a human agent.')} language={language} />
                    ) : null}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex flex-wrap gap-2">
                  {[t('تتبع طلب', 'Track order'), t('احجز استلام', 'Book pickup'), t('تحدث مع إنسان', 'Talk to human')].map((chip) => (
                    <button key={chip} type="button" className="min-h-10 rounded-pill border border-border px-3 text-sm font-bold hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {chip}
                    </button>
                  ))}
                </div>
                <div className="grid gap-2 md:grid-cols-[auto_auto_1fr_auto]">
                  <Button variant="ghost" size="icon" aria-label={t('صوت', 'Voice')}><Mic aria-hidden="true" className="size-5" /></Button>
                  <Button variant="ghost" size="icon" aria-label={t('صورة', 'Image')}><ImagePlus aria-hidden="true" className="size-5" /></Button>
                  <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t('اسأل Layla...', 'Ask Layla...')} />
                  <Button variant="accent" onClick={askAI}><Send aria-hidden="true" className="size-5" /></Button>
                </div>
                <Button variant="secondary" onClick={() => setAssistantState('human')}>
                  <PhoneCall aria-hidden="true" className="size-5" />
                  {t('تصعيد إلى إنسان', 'Escalate to human')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('تنبيهات اليوم', 'Today alerts')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {orders.slice(0, 4).map((order, index) => (
                <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3">
                  <div>
                    <p className="font-black" dir="ltr">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.serviceType}</p>
                  </div>
                  <Badge variant={index === 0 ? 'warning' : 'info'}>{index === 0 ? t('تأخير محتمل', 'Likely delay') : t('مراقبة', 'Watching')}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

const MiniMetric = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
    <Icon aria-hidden="true" className="size-5 text-accent" />
    <div>
      <p className="text-xs text-white/65">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  </div>
);

const InsightCard = ({ icon: Icon, title, value, text, variant }: { icon: React.ElementType; title: string; value: string; text: string; variant: 'info' | 'warning' | 'success' }) => (
  <Card>
    <CardContent className="p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="grid size-11 place-items-center rounded-md bg-primary text-white">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <Badge variant={variant} withIcon>{title}</Badge>
      </div>
      <p className="text-3xl font-black text-primary">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </CardContent>
  </Card>
);

const Message = ({ role, text, language }: { role: 'ai' | 'human'; text: string; language: SiteLanguage }) => (
  <div className={cn('rounded-lg p-3 text-sm leading-6', role === 'ai' ? 'bg-surface' : 'bg-primary text-white')}>
    <div className="mb-1 flex items-center gap-2 text-xs font-black">
      {role === 'ai' ? <Sparkles aria-hidden="true" className="size-4 text-accent" /> : <MessageCircle aria-hidden="true" className="size-4" />}
      {role === 'ai' ? localize(language, 'AI generated', 'AI generated') : localize(language, 'Human support', 'Human support')}
    </div>
    {text}
  </div>
);
