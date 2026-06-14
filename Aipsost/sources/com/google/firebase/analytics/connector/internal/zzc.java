package com.google.firebase.analytics.connector.internal;

import android.os.Bundle;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.ArrayUtils;
import com.google.android.gms.measurement.AppMeasurement;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import com.google.android.gms.measurement.internal.zzgq;
import com.google.android.gms.measurement.internal.zzgr;
import com.google.android.gms.measurement.internal.zzgt;
import com.google.android.gms.measurement.internal.zzic;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.analytics.connector.AnalyticsConnector;
import com.google.firebase.messaging.Constants;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzc {
    private static final Set<String> zza = new HashSet(Arrays.asList("_in", "_xa", "_xu", "_aq", "_aa", "_ai", "_ac", FirebaseAnalytics.Event.CAMPAIGN_DETAILS, "_ug", "_iapx", "_exp_set", "_exp_clear", "_exp_activate", "_exp_timeout", "_exp_expire"));
    private static final List<String> zzb = Arrays.asList("_e", "_f", "_iap", "_s", "_au", "_ui", "_cd");
    private static final List<String> zzc = Arrays.asList(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "app", "am");
    private static final List<String> zzd = Arrays.asList("_r", "_dbg");
    private static final List<String> zze = Arrays.asList((String[]) ArrayUtils.concat(zzgt.zza, zzgt.zzb));
    private static final List<String> zzf = Arrays.asList("^_ltv_[A-Z]{3}$", "^_cc[1-5]{1}$");

    public static boolean zza(String str) {
        return !zzc.contains(str);
    }

    public static boolean zzb(String str, Bundle bundle) {
        if (zzb.contains(str)) {
            return false;
        }
        if (bundle == null) {
            return true;
        }
        Iterator<String> it = zzd.iterator();
        while (it.hasNext()) {
            if (bundle.containsKey(it.next())) {
                return false;
            }
        }
        return true;
    }

    public static boolean zzc(String str) {
        return !zza.contains(str);
    }

    public static boolean zzd(String str, String str2) {
        if ("_ce1".equals(str2) || "_ce2".equals(str2)) {
            return str.equals("fcm") || str.equals("frc");
        }
        if (Constants.ScionAnalytics.USER_PROPERTY_FIREBASE_LAST_NOTIFICATION.equals(str2)) {
            return str.equals("fcm") || str.equals(AppMeasurement.FIAM_ORIGIN);
        }
        if (zze.contains(str2)) {
            return false;
        }
        Iterator<String> it = zzf.iterator();
        while (it.hasNext()) {
            if (str2.matches(it.next())) {
                return false;
            }
        }
        return true;
    }

    public static boolean zze(AnalyticsConnector.ConditionalUserProperty conditionalUserProperty) {
        String str;
        if (conditionalUserProperty == null || (str = conditionalUserProperty.origin) == null || str.isEmpty()) {
            return false;
        }
        if ((conditionalUserProperty.value != null && zzic.zzb(conditionalUserProperty.value) == null) || !zza(str) || !zzd(str, conditionalUserProperty.name)) {
            return false;
        }
        if (conditionalUserProperty.expiredEventName != null && (!zzb(conditionalUserProperty.expiredEventName, conditionalUserProperty.expiredEventParams) || !zzf(str, conditionalUserProperty.expiredEventName, conditionalUserProperty.expiredEventParams))) {
            return false;
        }
        if (conditionalUserProperty.triggeredEventName != null && (!zzb(conditionalUserProperty.triggeredEventName, conditionalUserProperty.triggeredEventParams) || !zzf(str, conditionalUserProperty.triggeredEventName, conditionalUserProperty.triggeredEventParams))) {
            return false;
        }
        if (conditionalUserProperty.timedOutEventName != null) {
            return zzb(conditionalUserProperty.timedOutEventName, conditionalUserProperty.timedOutEventParams) && zzf(str, conditionalUserProperty.timedOutEventName, conditionalUserProperty.timedOutEventParams);
        }
        return true;
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:28:0x0055  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public static boolean zzf(java.lang.String r3, java.lang.String r4, android.os.Bundle r5) {
        /*
            java.lang.String r0 = "_cmp"
            boolean r4 = r0.equals(r4)
            r0 = 1
            if (r4 != 0) goto La
            return r0
        La:
            boolean r4 = zza(r3)
            r1 = 0
            if (r4 != 0) goto L12
            return r1
        L12:
            if (r5 != 0) goto L15
            return r1
        L15:
            java.util.List<java.lang.String> r4 = com.google.firebase.analytics.connector.internal.zzc.zzd
            java.util.Iterator r4 = r4.iterator()
        L1b:
            boolean r2 = r4.hasNext()
            if (r2 == 0) goto L2e
            java.lang.Object r2 = r4.next()
            java.lang.String r2 = (java.lang.String) r2
            boolean r2 = r5.containsKey(r2)
            if (r2 == 0) goto L1b
            return r1
        L2e:
            int r4 = r3.hashCode()
            switch(r4) {
                case 101200: goto L4b;
                case 101230: goto L41;
                case 3142703: goto L36;
                default: goto L35;
            }
        L35:
            goto L55
        L36:
            java.lang.String r4 = "fiam"
            boolean r3 = r3.equals(r4)
            if (r3 == 0) goto L35
            r3 = 2
            goto L56
        L41:
            java.lang.String r4 = "fdl"
            boolean r3 = r3.equals(r4)
            if (r3 == 0) goto L35
            r3 = 1
            goto L56
        L4b:
            java.lang.String r4 = "fcm"
            boolean r3 = r3.equals(r4)
            if (r3 == 0) goto L35
            r3 = 0
            goto L56
        L55:
            r3 = -1
        L56:
            java.lang.String r4 = "_cis"
            switch(r3) {
                case 0: goto L69;
                case 1: goto L62;
                case 2: goto L5c;
                default: goto L5b;
            }
        L5b:
            return r1
        L5c:
            java.lang.String r3 = "fiam_integration"
            r5.putString(r4, r3)
            return r0
        L62:
            java.lang.String r3 = "fdl_integration"
            r5.putString(r4, r3)
            return r0
        L69:
            java.lang.String r3 = "fcm_integration"
            r5.putString(r4, r3)
            return r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.firebase.analytics.connector.internal.zzc.zzf(java.lang.String, java.lang.String, android.os.Bundle):boolean");
    }

    public static Bundle zzg(AnalyticsConnector.ConditionalUserProperty conditionalUserProperty) {
        Bundle bundle = new Bundle();
        if (conditionalUserProperty.origin != null) {
            bundle.putString("origin", conditionalUserProperty.origin);
        }
        if (conditionalUserProperty.name != null) {
            bundle.putString(AppMeasurementSdk.ConditionalUserProperty.NAME, conditionalUserProperty.name);
        }
        if (conditionalUserProperty.value != null) {
            zzgq.zza(bundle, conditionalUserProperty.value);
        }
        if (conditionalUserProperty.triggerEventName != null) {
            bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME, conditionalUserProperty.triggerEventName);
        }
        bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT, conditionalUserProperty.triggerTimeout);
        if (conditionalUserProperty.timedOutEventName != null) {
            bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_NAME, conditionalUserProperty.timedOutEventName);
        }
        if (conditionalUserProperty.timedOutEventParams != null) {
            bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_PARAMS, conditionalUserProperty.timedOutEventParams);
        }
        if (conditionalUserProperty.triggeredEventName != null) {
            bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_NAME, conditionalUserProperty.triggeredEventName);
        }
        if (conditionalUserProperty.triggeredEventParams != null) {
            bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_PARAMS, conditionalUserProperty.triggeredEventParams);
        }
        bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE, conditionalUserProperty.timeToLive);
        if (conditionalUserProperty.expiredEventName != null) {
            bundle.putString(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME, conditionalUserProperty.expiredEventName);
        }
        if (conditionalUserProperty.expiredEventParams != null) {
            bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS, conditionalUserProperty.expiredEventParams);
        }
        bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP, conditionalUserProperty.creationTimestamp);
        bundle.putBoolean(AppMeasurementSdk.ConditionalUserProperty.ACTIVE, conditionalUserProperty.active);
        bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_TIMESTAMP, conditionalUserProperty.triggeredTimestamp);
        return bundle;
    }

    public static AnalyticsConnector.ConditionalUserProperty zzh(Bundle bundle) {
        Preconditions.checkNotNull(bundle);
        AnalyticsConnector.ConditionalUserProperty conditionalUserProperty = new AnalyticsConnector.ConditionalUserProperty();
        conditionalUserProperty.origin = (String) Preconditions.checkNotNull((String) zzgq.zzb(bundle, "origin", String.class, null));
        conditionalUserProperty.name = (String) Preconditions.checkNotNull((String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.NAME, String.class, null));
        conditionalUserProperty.value = zzgq.zzb(bundle, "value", Object.class, null);
        conditionalUserProperty.triggerEventName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME, String.class, null);
        conditionalUserProperty.triggerTimeout = ((Long) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT, Long.class, 0L)).longValue();
        conditionalUserProperty.timedOutEventName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_NAME, String.class, null);
        conditionalUserProperty.timedOutEventParams = (Bundle) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_PARAMS, Bundle.class, null);
        conditionalUserProperty.triggeredEventName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_NAME, String.class, null);
        conditionalUserProperty.triggeredEventParams = (Bundle) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_PARAMS, Bundle.class, null);
        conditionalUserProperty.timeToLive = ((Long) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE, Long.class, 0L)).longValue();
        conditionalUserProperty.expiredEventName = (String) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME, String.class, null);
        conditionalUserProperty.expiredEventParams = (Bundle) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS, Bundle.class, null);
        conditionalUserProperty.active = ((Boolean) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.ACTIVE, Boolean.class, false)).booleanValue();
        conditionalUserProperty.creationTimestamp = ((Long) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP, Long.class, 0L)).longValue();
        conditionalUserProperty.triggeredTimestamp = ((Long) zzgq.zzb(bundle, AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_TIMESTAMP, Long.class, 0L)).longValue();
        return conditionalUserProperty;
    }

    public static boolean zzi(String str) {
        if (str == null || str.length() == 0) {
            return false;
        }
        int iCodePointAt = str.codePointAt(0);
        if (!Character.isLetter(iCodePointAt)) {
            return false;
        }
        int length = str.length();
        int iCharCount = Character.charCount(iCodePointAt);
        while (iCharCount < length) {
            int iCodePointAt2 = str.codePointAt(iCharCount);
            if (iCodePointAt2 != 95 && !Character.isLetterOrDigit(iCodePointAt2)) {
                return false;
            }
            iCharCount += Character.charCount(iCodePointAt2);
        }
        return true;
    }

    public static boolean zzj(String str) {
        if (str == null || str.length() == 0) {
            return false;
        }
        int iCodePointAt = str.codePointAt(0);
        if (!Character.isLetter(iCodePointAt) && iCodePointAt != 95) {
            return false;
        }
        int length = str.length();
        int iCharCount = Character.charCount(iCodePointAt);
        while (iCharCount < length) {
            int iCodePointAt2 = str.codePointAt(iCharCount);
            if (iCodePointAt2 != 95 && !Character.isLetterOrDigit(iCodePointAt2)) {
                return false;
            }
            iCharCount += Character.charCount(iCodePointAt2);
        }
        return true;
    }

    public static String zzk(String str) {
        String strZza = zzgr.zza(str);
        return strZza != null ? strZza : str;
    }

    public static String zzl(String str) {
        String strZzb = zzgr.zzb(str);
        return strZzb != null ? strZzb : str;
    }

    public static void zzm(String str, String str2, Bundle bundle) {
        if ("clx".equals(str) && "_ae".equals(str2)) {
            bundle.putLong("_r", 1L);
        }
    }
}
