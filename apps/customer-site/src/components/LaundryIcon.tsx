import React from 'react';

const ICON_BASE = '/IN_OUT_LAUNDRY_ICONS';
const ITEM_ICON_BASE = '/items_Icons';

const LAUNDRY_ICON_NAMES = new Set([
  'bubbles',
  'calendar_pickup',
  'camera_photo',
  'delivery_scooter',
  'dry_cleaning_suit',
  'folded_laundry',
  'garment_tag',
  'laundry_bag',
  'laundry_basket',
  'location_pin',
  'order_tracking',
  'package_box',
  'payment_card',
  'pickup_van',
  'settings_gear',
  'sorting_rack',
  'steam_iron',
  'user_account',
  'washing_machine',
  'whatsapp_message',
]);

const ICON_ALIASES: Record<string, string> = {
  '👕': 'folded_laundry',
  '🧺': 'laundry_basket',
  '♨️': 'steam_iron',
  '📦': 'package_box',
  '🏷️': 'garment_tag',
  '🚿': 'dry_cleaning_suit',
  '🧑': 'user_account',
  '💻': 'order_tracking',
  '🫧': 'bubbles',
  '🗂️': 'sorting_rack',
  '🚗': 'delivery_scooter',
  '👗': 'laundry_bag',
  '🧕': 'dry_cleaning_suit',
  '👔': 'dry_cleaning_suit',
  '🛏️': 'folded_laundry',
  '🧣': 'folded_laundry',
  '🥼': 'dry_cleaning_suit',
  '🧴': 'laundry_bag',
  '📋': 'order_tracking',
  '👤': 'user_account',
  '⚙️': 'settings_gear',
  '📷': 'camera_photo',
};

const PRICING_ICON_BY_BARCODE: Record<string, string> = {
  '3': 'women_abaya',
  '4': 'men_army_uniform',
  '5': 'home_bedsheet_big',
  '14': 'home_bedsheet_small',
  '19': 'men_bisht',
  '23': 'home_blanket_big',
  '24': 'home_blanket_small',
  '26': 'women_blouse',
  '2': 'men_fanela',
  '58': 'home_curtain_big',
  '62': 'home_curtain_medium',
  '63': 'home_curtain_small',
  '6': 'men_gutra',
  '7': 'men_gutra_wool',
  '8': 'men_jacket',
  '9': 'men_jacket_leather',
  '10': 'women_jallabiya',
  '11': 'men_jujitsu_uniform',
  '12': 'men_kandoora',
  '13': 'men_kandoora_tarbosh',
  '15': 'men_kandoora_wool',
  '16': 'men_overholl',
  '17': 'men_overcoat',
  '18': 'men_pants',
  '20': 'home_pillow_case',
  '21': 'men_police_uniform',
  '22': 'women_sheela',
  '25': 'men_shirt',
  '27': 'men_short',
  '29': 'men_socks',
  '30': 'men_suit',
  '31': 'men_sweater_wool',
  '32': 'men_special_takeya',
  '33': 'men_t_shirt',
  '37': 'men_takeya',
  '59': 'men_tie',
  '60': 'home_towel',
  '61': 'men_underwear',
  '889913': 'home_bedsheet_single',
  '889914': 'home_dovet',
  '889915': 'home_pillow',
  '889916': 'women_niqab',
  '889917': 'home_sofa_cover',
  '889909': 'men_wezar',
};

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  men: 'dry_cleaning_suit',
  women: 'women_abaya',
  kids: 'folded_laundry',
  home: 'home_towel',
};

const OUTTY_ICON_NAMES = new Set([
  'outty-branch-map',
  'outty-delivery',
  'outty-empty-state',
  'outty-hero',
  'outty-ironing',
  'outty-order-basket',
  'outty-packaging',
  'outty-support',
  'outty-tracking-phone',
  'outty-washing-machine',
]);

interface LaundryIconProps {
  name?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  fallback?: React.ReactNode;
}

const isItemIconName = (name?: string) => Boolean(name && /^(men|women|kids|home)_[a-z0-9_]+$/.test(name));
const isOuttyIconName = (name?: string) => Boolean(name && OUTTY_ICON_NAMES.has(name));

export const resolveLaundryIconName = (name?: string) => {
  if (!name) return undefined;
  return ICON_ALIASES[name] || name;
};

export const isLaundryIconName = (name?: string) => {
  const resolvedName = resolveLaundryIconName(name);
  return Boolean(resolvedName && LAUNDRY_ICON_NAMES.has(resolvedName));
};

export const laundryIconSrc = (name: string) => `${ICON_BASE}/${name}.png`;
export const itemIconSrc = (name: string) => {
  if (name.startsWith('women_')) return `${ITEM_ICON_BASE}/Women/${name}.png`;
  if (name.startsWith('home_')) return `${ITEM_ICON_BASE}/Home/${name}.png`;
  if (name.startsWith('kids_')) return `${ITEM_ICON_BASE}/Kids/${name}.png`;
  return `${ITEM_ICON_BASE}/${name}.png`;
};
export const outtyIconSrc = (name: string) => `${ITEM_ICON_BASE}/OUTTY/${name}.png`;

export const resolvePricingItemIcon = (item: { barcode?: string; icon?: string; category?: string }) => {
  return item.icon || (item.barcode ? PRICING_ICON_BY_BARCODE[item.barcode] : undefined) || DEFAULT_CATEGORY_ICONS[item.category || ''];
};

export const LaundryIcon: React.FC<LaundryIconProps> = ({
  name,
  alt = '',
  className = '',
  imageClassName = 'h-full w-full object-contain',
  fallback,
}) => {
  const resolvedName = resolveLaundryIconName(name);

  if (isOuttyIconName(resolvedName)) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center ${className}`}>
        <img
          src={outtyIconSrc(resolvedName as string)}
          alt={alt}
          className={imageClassName}
          loading="lazy"
          draggable={false}
        />
      </span>
    );
  }

  if (isItemIconName(resolvedName)) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center ${className}`}>
        <img
          src={itemIconSrc(resolvedName as string)}
          alt={alt}
          className={imageClassName}
          loading="lazy"
          draggable={false}
        />
      </span>
    );
  }

  if (isLaundryIconName(resolvedName)) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center ${className}`}>
        <img
          src={laundryIconSrc(resolvedName as string)}
          alt={alt}
          className={imageClassName}
          loading="lazy"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`}>
      {fallback ?? name}
    </span>
  );
};
