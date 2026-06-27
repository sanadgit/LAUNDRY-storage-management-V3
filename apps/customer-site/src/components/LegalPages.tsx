import React from 'react';
import { FileText, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { SiteConfig } from '../types';

type LegalPageKind = 'privacy' | 'terms';

interface LegalPagesProps {
  kind: LegalPageKind;
  config: SiteConfig;
  onNavigate: (route: string) => void;
}

interface LegalSection {
  title: string;
  body?: string;
  bullets?: string[];
}

const privacySections: LegalSection[] = [
  {
    title: '1. Information We Collect',
    body: 'We collect information that is needed to receive, process, track, deliver, and support laundry and dry-cleaning orders.',
    bullets: [
      'Contact details such as name, phone number, email address, and delivery address.',
      'Order details such as selected services, garment notes, pickup and delivery preferences, invoices, payment status, and order history.',
      'Customer support messages, complaints, feedback, and service instructions shared through our website, phone, email, WhatsApp, or branches.',
      'Basic technical information such as browser, device, IP address, page activity, and cookies when you use the website.',
    ],
  },
  {
    title: '2. How We Use Information',
    bullets: [
      'To create, confirm, process, track, and deliver customer orders.',
      'To contact customers about pickup, delivery, payment, invoices, and service updates.',
      'To respond to support requests, complaints, and operational questions.',
      'To improve our website, services, pricing visibility, branch operations, and customer experience.',
      'To protect our systems, prevent misuse, and maintain accurate business records.',
    ],
  },
  {
    title: '3. WhatsApp Business API Communications',
    body: 'In & Out Laundry may use WhatsApp Business API to send order confirmations, order status updates, delivery notifications, invoices, and customer support messages. These messages are intended to help customers receive timely information about their orders and service requests.',
  },
  {
    title: '4. Sharing Information',
    body: 'We do not sell customer personal information. We may share limited information only when needed to provide the service or operate the business.',
    bullets: [
      'With branch staff, drivers, and operations team members who need the information to complete an order.',
      'With technology providers that support hosting, messaging, customer communications, payments, analytics, or business systems.',
      'With public authorities or other parties when disclosure is required by applicable law, a valid legal request, or to protect our legitimate business interests.',
    ],
  },
  {
    title: '5. Data Retention',
    body: 'We keep customer and order information for as long as reasonably needed to provide services, manage support requests, maintain accounting and operational records, resolve disputes, and meet applicable legal or business requirements.',
  },
  {
    title: '6. Security',
    body: 'We use reasonable administrative and technical measures to protect customer information. No website, messaging channel, or electronic storage method can be guaranteed to be completely secure.',
  },
  {
    title: '7. Customer Choices',
    bullets: [
      'Customers may contact us to request correction of inaccurate details.',
      'Customers may request that we stop sending non-essential marketing messages.',
      'Some service messages, such as order confirmations or delivery updates, may still be required to complete active orders.',
    ],
  },
  {
    title: '8. Cookies and Website Tools',
    body: 'The website may use cookies or similar tools to improve browsing, remember preferences, and understand website performance. Customers can manage cookies through their browser settings.',
  },
  {
    title: '9. Third-Party Links',
    body: 'The website may link to third-party services such as maps, payment providers, WhatsApp, or social media platforms. Those services have their own privacy practices and are not controlled by In & Out Laundry.',
  },
  {
    title: '10. Updates to This Policy',
    body: 'We may update this Privacy Policy from time to time. The latest version will be published on this page with the updated date.',
  },
];

const termsSections: LegalSection[] = [
  {
    title: '1. Services',
    body: 'In & Out Laundry provides laundry, ironing, dry-cleaning, garment care, household textile cleaning, pickup, delivery, order tracking, and customer support services. Service availability may vary by branch, location, garment type, order volume, and operational capacity.',
  },
  {
    title: '2. Orders and Customer Details',
    bullets: [
      'Customers are responsible for providing accurate contact details, pickup and delivery addresses, service selections, and garment instructions.',
      'We may contact the customer to confirm order details, clarify garment care requirements, or request additional information.',
      'If customer details are incomplete or unreachable, pickup, delivery, or processing may be delayed.',
    ],
  },
  {
    title: '3. WhatsApp Business API Messages',
    body: 'By placing an order or contacting us through WhatsApp, customers understand that In & Out Laundry may use WhatsApp Business API to send order confirmations, order status updates, delivery notifications, invoices, and customer support messages related to their service.',
  },
  {
    title: '4. Garment Inspection and Care',
    bullets: [
      'We may inspect items before processing and may refuse or request approval for items that require special handling.',
      'Customers should remove cash, cards, keys, pens, documents, jewelry, electronics, and other personal items from pockets before pickup or drop-off.',
      'We are not responsible for damage caused by pre-existing defects, weak fabric, unstable dyes, missing or incorrect care labels, previous chemical treatment, poor stitching, or fragile trims and accessories.',
    ],
  },
  {
    title: '5. Pricing, VAT, and Payment',
    bullets: [
      'Prices may vary by item, fabric, service type, branch, offer, and special handling requirements.',
      'Displayed prices may be updated from time to time.',
      'VAT may be applied where applicable and shown on invoices when required.',
      'Orders may need to be paid before or at delivery, depending on the selected service and branch policy.',
    ],
  },
  {
    title: '6. Pickup and Delivery',
    body: 'Pickup and delivery times are estimates. We try to meet scheduled times, but delays may occur due to traffic, weather, branch workload, driver availability, customer availability, or other operational reasons.',
  },
  {
    title: '7. Cancellations and Changes',
    body: 'Customers may request order changes or cancellation before processing begins. Once cleaning, ironing, dry-cleaning, packing, or delivery preparation has started, cancellation may not be possible or charges may apply for work already completed.',
  },
  {
    title: '8. Complaints and Order Issues',
    body: 'Customers should report order issues as soon as possible after delivery or collection and provide the order number, invoice, photos, and a clear description of the issue where available. We will review each case based on the order record and the condition of the item.',
  },
  {
    title: '9. Limitation of Responsibility',
    body: 'To the maximum extent permitted by applicable law, In & Out Laundry is not responsible for indirect losses, loss of use, sentimental value, business interruption, or issues caused by inaccurate customer instructions, unsuitable garments, or circumstances outside our reasonable control.',
  },
  {
    title: '10. Website Use',
    bullets: [
      'Customers may use the website for lawful purposes only.',
      'Users must not attempt unauthorized access, interfere with website operations, submit false information, or misuse order tracking and account features.',
      'Website content, branding, images, text, and design may not be copied or reused commercially without written permission.',
    ],
  },
  {
    title: '11. Updates to These Terms',
    body: 'We may update these Terms from time to time. The latest version will be published on this page with the updated date.',
  },
];

const pageMeta = {
  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'Privacy Policy',
    description:
      'How In & Out Laundry collects, uses, protects, and communicates customer information while providing laundry, pickup, delivery, and support services.',
    icon: ShieldCheck,
    sections: privacySections,
  },
  terms: {
    eyebrow: 'Terms of Service',
    title: 'Terms & Conditions',
    description:
      'The service terms that apply when customers use the In & Out Laundry website, branches, pickup and delivery, order tracking, and customer support channels.',
    icon: FileText,
    sections: termsSections,
  },
} satisfies Record<LegalPageKind, {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  sections: LegalSection[];
}>;

export const LegalPage: React.FC<LegalPagesProps> = ({ kind, config, onNavigate }) => {
  const meta = pageMeta[kind];
  const Icon = meta.icon;
  const alternateRoute = kind === 'privacy' ? '/terms' : '/privacy';
  const alternateLabel = kind === 'privacy' ? 'Read Terms & Conditions' : 'Read Privacy Policy';

  return (
    <div className="pt-24 pb-20 md:pt-32 min-h-screen bg-brand-bg px-4 text-left" dir="ltr">
      <div className="max-w-5xl mx-auto">
        <section className="bg-secondary text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[110px] translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-primary px-4 py-2 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-widest mb-6">
              <Icon size={16} />
              {meta.eyebrow}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5 break-words">{meta.title}</h1>
            <p className="text-white/65 text-sm md:text-base leading-relaxed max-w-2xl">{meta.description}</p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-8">Last updated: June 27, 2026</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[0.78fr_1.22fr] gap-8 mt-10">
          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-5">Company</h2>
              <div className="space-y-5 text-sm text-gray-600">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Business</p>
                  <p className="font-bold text-gray-900">{config.site_name || 'In & Out Laundry'}</p>
                </div>
                <div className="flex gap-3">
                  <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <p>{config.business_address}</p>
                </div>
                <div className="flex gap-3">
                  <MessageCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <p dir="ltr">{config.whatsapp_number}</p>
                </div>
                <div className="flex gap-3">
                  <Mail size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <p>{config.contact_email}</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate(alternateRoute)}
                className="mt-8 w-full rounded-2xl bg-secondary text-white px-5 py-4 text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer"
              >
                {alternateLabel}
              </button>
            </div>
          </aside>

          <article className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            {meta.sections.map((section) => (
              <section key={section.title} className="p-6 md:p-8 border-b border-gray-100 last:border-b-0 min-w-0">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-4 break-words">{section.title}</h2>
                {section.body && <p className="text-sm md:text-base text-gray-600 leading-relaxed">{section.body}</p>}
                {section.bullets && (
                  <ul className="mt-4 space-y-3 text-sm md:text-base text-gray-600 leading-relaxed list-disc pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
};
