package com.google.android.gms.measurement.internal;

import android.content.ComponentName;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;
import android.os.RemoteException;
import android.text.TextUtils;
import androidx.core.app.NotificationCompat;
import androidx.recyclerview.widget.ItemTouchHelper;
import com.google.android.gms.common.GoogleApiAvailabilityLight;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.CollectionUtils;
import com.google.android.gms.common.wrappers.Wrappers;
import com.google.android.gms.internal.measurement.zzov;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import com.google.firebase.analytics.FirebaseAnalytics;
import java.io.ByteArrayInputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.TreeSet;
import java.util.concurrent.atomic.AtomicLong;
import javax.security.auth.x500.X500Principal;
import kotlinx.coroutines.DebugKt;
import org.checkerframework.checker.nullness.qual.EnsuresNonNull;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzku extends zzgo {
    public static final /* synthetic */ int zza = 0;
    private static final String[] zzb = {"firebase_", "google_", "ga_"};
    private static final String[] zzc = {"_err"};
    private SecureRandom zzd;
    private final AtomicLong zze;
    private int zzf;
    private Integer zzg;

    zzku(zzfu zzfuVar) {
        super(zzfuVar);
        this.zzg = null;
        this.zze = new AtomicLong(0L);
    }

    static MessageDigest zzN() {
        MessageDigest messageDigest;
        for (int i = 0; i < 2; i++) {
            try {
                messageDigest = MessageDigest.getInstance("MD5");
            } catch (NoSuchAlgorithmException e) {
            }
            if (messageDigest != null) {
                return messageDigest;
            }
        }
        return null;
    }

    static long zzO(byte[] bArr) {
        Preconditions.checkNotNull(bArr);
        int length = bArr.length;
        int i = 0;
        Preconditions.checkState(length > 0);
        long j = 0;
        for (int i2 = length - 1; i2 >= 0 && i2 >= bArr.length - 8; i2--) {
            j += (((long) bArr[i2]) & 255) << i;
            i += 8;
        }
        return j;
    }

    static boolean zzP(Context context, boolean z) {
        Preconditions.checkNotNull(context);
        return Build.VERSION.SDK_INT >= 24 ? zzar(context, "com.google.android.gms.measurement.AppMeasurementJobService") : zzar(context, "com.google.android.gms.measurement.AppMeasurementService");
    }

    static boolean zzR(String str) {
        return !TextUtils.isEmpty(str) && str.startsWith("_");
    }

    static boolean zzS(String str, String str2) {
        if (str == null && str2 == null) {
            return true;
        }
        if (str == null) {
            return false;
        }
        return str.equals(str2);
    }

    public static boolean zzY(String str) {
        return !zzc[0].equals(str);
    }

    public static ArrayList<Bundle> zzak(List<zzaa> list) {
        if (list == null) {
            return new ArrayList<>(0);
        }
        ArrayList<Bundle> arrayList = new ArrayList<>(list.size());
        for (zzaa zzaaVar : list) {
            Bundle bundle = new Bundle();
            bundle.putString("app_id", zzaaVar.zza);
            bundle.putString("origin", zzaaVar.zzb);
            bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP, zzaaVar.zzd);
            bundle.putString(AppMeasurementSdk.ConditionalUserProperty.NAME, zzaaVar.zzc.zzb);
            zzgq.zza(bundle, zzaaVar.zzc.zza());
            bundle.putBoolean(AppMeasurementSdk.ConditionalUserProperty.ACTIVE, zzaaVar.zze);
            String str = zzaaVar.zzf;
            if (str != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME, str);
            }
            zzas zzasVar = zzaaVar.zzg;
            if (zzasVar != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_NAME, zzasVar.zza);
                zzaq zzaqVar = zzaaVar.zzg.zzb;
                if (zzaqVar != null) {
                    bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_PARAMS, zzaqVar.zzf());
                }
            }
            bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT, zzaaVar.zzh);
            zzas zzasVar2 = zzaaVar.zzi;
            if (zzasVar2 != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_NAME, zzasVar2.zza);
                zzaq zzaqVar2 = zzaaVar.zzi.zzb;
                if (zzaqVar2 != null) {
                    bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_PARAMS, zzaqVar2.zzf());
                }
            }
            bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_TIMESTAMP, zzaaVar.zzc.zzc);
            bundle.putLong(AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE, zzaaVar.zzj);
            zzas zzasVar3 = zzaaVar.zzk;
            if (zzasVar3 != null) {
                bundle.putString(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME, zzasVar3.zza);
                zzaq zzaqVar3 = zzaaVar.zzk.zzb;
                if (zzaqVar3 != null) {
                    bundle.putBundle(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS, zzaqVar3.zzf());
                }
            }
            arrayList.add(bundle);
        }
        return arrayList;
    }

    static boolean zzam(Context context) {
        ActivityInfo receiverInfo;
        Preconditions.checkNotNull(context);
        try {
            PackageManager packageManager = context.getPackageManager();
            if (packageManager != null && (receiverInfo = packageManager.getReceiverInfo(new ComponentName(context, "com.google.android.gms.measurement.AppMeasurementReceiver"), 0)) != null) {
                if (receiverInfo.enabled) {
                    return true;
                }
            }
        } catch (PackageManager.NameNotFoundException e) {
        }
        return false;
    }

    static final boolean zzan(Bundle bundle, int i) {
        if (bundle.getLong("_err") != 0) {
            return false;
        }
        bundle.putLong("_err", i);
        return true;
    }

    static final boolean zzao(String str) {
        Preconditions.checkNotNull(str);
        return str.matches("^(1:\\d+:android:[a-f0-9]+|ca-app-pub-.*)$");
    }

    private final Object zzap(int i, Object obj, boolean z, boolean z2) {
        if (obj == null) {
            return null;
        }
        if ((obj instanceof Long) || (obj instanceof Double)) {
            return obj;
        }
        if (obj instanceof Integer) {
            return Long.valueOf(((Integer) obj).intValue());
        }
        if (obj instanceof Byte) {
            return Long.valueOf(((Byte) obj).byteValue());
        }
        if (obj instanceof Short) {
            return Long.valueOf(((Short) obj).shortValue());
        }
        if (obj instanceof Boolean) {
            return Long.valueOf(true != ((Boolean) obj).booleanValue() ? 0L : 1L);
        }
        if (obj instanceof Float) {
            return Double.valueOf(((Float) obj).doubleValue());
        }
        if ((obj instanceof String) || (obj instanceof Character) || (obj instanceof CharSequence)) {
            return zzC(String.valueOf(obj), i, z);
        }
        if (!z2 || (!(obj instanceof Bundle[]) && !(obj instanceof Parcelable[]))) {
            return null;
        }
        ArrayList arrayList = new ArrayList();
        for (Parcelable parcelable : (Parcelable[]) obj) {
            if (parcelable instanceof Bundle) {
                Bundle bundleZzU = zzU((Bundle) parcelable);
                if (!bundleZzU.isEmpty()) {
                    arrayList.add(bundleZzU);
                }
            }
        }
        return arrayList.toArray(new Bundle[arrayList.size()]);
    }

    private final int zzaq(String str) {
        if ("_ldl".equals(str)) {
            this.zzs.zzc();
            return 2048;
        }
        if ("_id".equals(str)) {
            this.zzs.zzc();
            return 256;
        }
        if (this.zzs.zzc().zzn(null, zzea.zzae) && "_lgclid".equals(str)) {
            this.zzs.zzc();
            return 100;
        }
        this.zzs.zzc();
        return 36;
    }

    private static boolean zzar(Context context, String str) {
        ServiceInfo serviceInfo;
        try {
            PackageManager packageManager = context.getPackageManager();
            if (packageManager != null && (serviceInfo = packageManager.getServiceInfo(new ComponentName(context, str), 0)) != null) {
                if (serviceInfo.enabled) {
                    return true;
                }
            }
        } catch (PackageManager.NameNotFoundException e) {
        }
        return false;
    }

    private static boolean zzas(String str, String[] strArr) {
        Preconditions.checkNotNull(strArr);
        for (String str2 : strArr) {
            if (zzS(str, str2)) {
                return true;
            }
        }
        return false;
    }

    static boolean zzh(String str) {
        Preconditions.checkNotEmpty(str);
        return str.charAt(0) != '_' || str.equals("_ep");
    }

    final boolean zzA(String str, String str2, String str3) {
        if (!TextUtils.isEmpty(str)) {
            if (zzao(str)) {
                return true;
            }
            if (this.zzs.zzq()) {
                this.zzs.zzau().zzd().zzb("Invalid google_app_id. Firebase Analytics disabled. See https://goo.gl/NAOOOI. provided id", zzem.zzl(str));
            }
            return false;
        }
        zzov.zzb();
        if (this.zzs.zzc().zzn(null, zzea.zzag) && !TextUtils.isEmpty(str3)) {
            return true;
        }
        if (TextUtils.isEmpty(str2)) {
            if (this.zzs.zzq()) {
                this.zzs.zzau().zzd().zza("Missing google_app_id. Firebase Analytics disabled. See https://goo.gl/NAOOOI");
            }
            return false;
        }
        if (zzao(str2)) {
            return true;
        }
        this.zzs.zzau().zzd().zzb("Invalid admob_app_id. Analytics disabled.", zzem.zzl(str2));
        return false;
    }

    final boolean zzB(String str, String str2, String str3, String str4) {
        boolean zIsEmpty = TextUtils.isEmpty(str);
        boolean zIsEmpty2 = TextUtils.isEmpty(str2);
        if (!zIsEmpty && !zIsEmpty2) {
            Preconditions.checkNotNull(str);
            return !str.equals(str2);
        }
        if (zIsEmpty && zIsEmpty2) {
            return (TextUtils.isEmpty(str3) || TextUtils.isEmpty(str4)) ? !TextUtils.isEmpty(str4) : !str3.equals(str4);
        }
        if (zIsEmpty) {
            return TextUtils.isEmpty(str3) || !str3.equals(str4);
        }
        if (TextUtils.isEmpty(str4)) {
            return false;
        }
        return TextUtils.isEmpty(str3) || !str3.equals(str4);
    }

    public final String zzC(String str, int i, boolean z) {
        if (str == null) {
            return null;
        }
        if (str.codePointCount(0, str.length()) <= i) {
            return str;
        }
        if (z) {
            return String.valueOf(str.substring(0, str.offsetByCodePoints(0, i))).concat("...");
        }
        return null;
    }

    final int zzD(String str, String str2, String str3, Object obj, Bundle bundle, List<String> list, boolean z, boolean z2) {
        int i;
        int i2;
        int size;
        zzg();
        if (!zzs(obj)) {
            i = 0;
        } else {
            if (!z2) {
                return 21;
            }
            if (!zzas(str3, zzgs.zzc)) {
                return 20;
            }
            zzjk zzjkVarZzy = this.zzs.zzy();
            zzjkVarZzy.zzg();
            zzjkVarZzy.zzb();
            if (zzjkVarZzy.zzD() && zzjkVarZzy.zzs.zzl().zzZ() < 200900) {
                return 25;
            }
            this.zzs.zzc();
            boolean z3 = obj instanceof Parcelable[];
            if (z3) {
                size = ((Parcelable[]) obj).length;
            } else if (obj instanceof ArrayList) {
                size = ((ArrayList) obj).size();
            } else {
                i = 0;
            }
            if (size > 200) {
                this.zzs.zzau().zzh().zzd("Parameter array is too long; discarded. Value kind, name, array length", "param", str3, Integer.valueOf(size));
                this.zzs.zzc();
                if (z3) {
                    Parcelable[] parcelableArr = (Parcelable[]) obj;
                    if (parcelableArr.length > 200) {
                        bundle.putParcelableArray(str3, (Parcelable[]) Arrays.copyOf(parcelableArr, ItemTouchHelper.Callback.DEFAULT_DRAG_ANIMATION_DURATION));
                        i = 17;
                    } else {
                        i = 17;
                    }
                } else {
                    if (obj instanceof ArrayList) {
                        ArrayList arrayList = (ArrayList) obj;
                        if (arrayList.size() > 200) {
                            bundle.putParcelableArrayList(str3, new ArrayList<>(arrayList.subList(0, ItemTouchHelper.Callback.DEFAULT_DRAG_ANIMATION_DURATION)));
                        }
                    }
                    i = 17;
                }
            } else {
                i = 0;
            }
        }
        if ((this.zzs.zzc().zzn(str, zzea.zzR) && zzR(str2)) || zzR(str3)) {
            this.zzs.zzc();
            i2 = 256;
        } else {
            this.zzs.zzc();
            i2 = 100;
        }
        if (zzt("param", str3, i2, obj)) {
            return i;
        }
        if (!z2) {
            return 4;
        }
        if (obj instanceof Bundle) {
            zzz(str, str2, str3, (Bundle) obj, list, z);
        } else if (obj instanceof Parcelable[]) {
            for (Parcelable parcelable : (Parcelable[]) obj) {
                if (!(parcelable instanceof Bundle)) {
                    this.zzs.zzau().zzh().zzc("All Parcelable[] elements must be of type Bundle. Value type, name", parcelable.getClass(), str3);
                    return 4;
                }
                zzz(str, str2, str3, (Bundle) parcelable, list, z);
            }
        } else {
            if (!(obj instanceof ArrayList)) {
                return 4;
            }
            ArrayList arrayList2 = (ArrayList) obj;
            int size2 = arrayList2.size();
            for (int i3 = 0; i3 < size2; i3++) {
                Object obj2 = arrayList2.get(i3);
                if (!(obj2 instanceof Bundle)) {
                    this.zzs.zzau().zzh().zzc("All ArrayList elements must be of type Bundle. Value type, name", obj2 != null ? obj2.getClass() : "null", str3);
                    return 4;
                }
                zzz(str, str2, str3, (Bundle) obj2, list, z);
            }
        }
        return i;
    }

    final Object zzE(String str, Object obj) {
        int i = 256;
        if ("_ev".equals(str)) {
            this.zzs.zzc();
            return zzap(256, obj, true, true);
        }
        if (zzR(str)) {
            this.zzs.zzc();
        } else {
            this.zzs.zzc();
            i = 100;
        }
        return zzap(i, obj, false, true);
    }

    final Bundle zzF(String str, String str2, Bundle bundle, List<String> list, boolean z) {
        int iZzr;
        String str3;
        boolean zZzas = zzas(str2, zzgr.zzd);
        Bundle bundle2 = new Bundle(bundle);
        int iZzc = this.zzs.zzc().zzc();
        int i = 0;
        for (String str4 : this.zzs.zzc().zzn(str, zzea.zzW) ? new TreeSet<>(bundle.keySet()) : bundle.keySet()) {
            if (list == null || !list.contains(str4)) {
                int iZzq = z ? zzq(str4) : 0;
                iZzr = iZzq == 0 ? zzr(str4) : iZzq;
            } else {
                iZzr = 0;
            }
            if (iZzr != 0) {
                zzI(bundle2, iZzr, str4, str4, iZzr == 3 ? str4 : null);
                bundle2.remove(str4);
            } else {
                int iZzD = zzD(str, str2, str4, bundle.get(str4), bundle2, list, z, zZzas);
                if (iZzD == 17) {
                    zzI(bundle2, 17, str4, str4, false);
                    str3 = str4;
                } else if (iZzD != 0) {
                    str3 = str4;
                    if (!"_ev".equals(str3)) {
                        zzI(bundle2, iZzD, iZzD == 21 ? str2 : str3, str3, bundle.get(str3));
                        bundle2.remove(str3);
                    }
                } else {
                    str3 = str4;
                }
                if (zzh(str3)) {
                    int i2 = i + 1;
                    if (i2 > iZzc) {
                        StringBuilder sb = new StringBuilder(48);
                        sb.append("Event can't contain more than ");
                        sb.append(iZzc);
                        sb.append(" params");
                        this.zzs.zzau().zzd().zzc(sb.toString(), this.zzs.zzm().zzc(str2), this.zzs.zzm().zzf(bundle));
                        zzan(bundle2, 5);
                        bundle2.remove(str3);
                    }
                    i = i2;
                }
            }
        }
        return bundle2;
    }

    final void zzG(zzen zzenVar, int i) {
        int i2 = 0;
        for (String str : new TreeSet(zzenVar.zzd.keySet())) {
            if (zzh(str) && (i2 = i2 + 1) > i) {
                StringBuilder sb = new StringBuilder(48);
                sb.append("Event can't contain more than ");
                sb.append(i);
                sb.append(" params");
                this.zzs.zzau().zzd().zzc(sb.toString(), this.zzs.zzm().zzc(zzenVar.zza), this.zzs.zzm().zzf(zzenVar.zzd));
                zzan(zzenVar.zzd, 5);
                zzenVar.zzd.remove(str);
            }
        }
    }

    final void zzH(Bundle bundle, Bundle bundle2) {
        if (bundle2 == null) {
            return;
        }
        for (String str : bundle2.keySet()) {
            if (!bundle.containsKey(str)) {
                this.zzs.zzl().zzL(bundle, str, bundle2.get(str));
            }
        }
    }

    final void zzI(Bundle bundle, int i, String str, String str2, Object obj) {
        if (zzan(bundle, i)) {
            this.zzs.zzc();
            bundle.putString("_ev", zzC(str, 40, true));
            if (obj != null) {
                Preconditions.checkNotNull(bundle);
                if ((obj instanceof String) || (obj instanceof CharSequence)) {
                    bundle.putLong("_el", String.valueOf(obj).length());
                }
            }
        }
    }

    final int zzJ(String str, Object obj) {
        return "_ldl".equals(str) ? zzt("user property referrer", str, zzaq(str), obj) : zzt("user property", str, zzaq(str), obj) ? 0 : 7;
    }

    final Object zzK(String str, Object obj) {
        return "_ldl".equals(str) ? zzap(zzaq(str), obj, true, false) : zzap(zzaq(str), obj, false, false);
    }

    final void zzL(Bundle bundle, String str, Object obj) {
        if (bundle == null) {
            return;
        }
        if (obj instanceof Long) {
            bundle.putLong(str, ((Long) obj).longValue());
            return;
        }
        if (obj instanceof String) {
            bundle.putString(str, String.valueOf(obj));
            return;
        }
        if (obj instanceof Double) {
            bundle.putDouble(str, ((Double) obj).doubleValue());
        } else if (obj instanceof Bundle[]) {
            bundle.putParcelableArray(str, (Bundle[]) obj);
        } else if (str != null) {
            this.zzs.zzau().zzh().zzc("Not putting event parameter. Invalid value type. name, type", this.zzs.zzm().zzd(str), obj != null ? obj.getClass().getSimpleName() : null);
        }
    }

    final void zzM(zzkt zzktVar, String str, int i, String str2, String str3, int i2, boolean z) {
        Bundle bundle = new Bundle();
        zzan(bundle, i);
        if (!TextUtils.isEmpty(str2) && !TextUtils.isEmpty(str3)) {
            bundle.putString(str2, str3);
        }
        if (i == 6 || i == 7 || i == 2) {
            bundle.putLong("_el", i2);
        }
        if (z) {
            zzktVar.zza(str, "_err", bundle);
        } else {
            this.zzs.zzat();
            this.zzs.zzk().zzs(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_err", bundle);
        }
    }

    final boolean zzQ(String str) {
        zzg();
        if (Wrappers.packageManager(this.zzs.zzax()).checkCallingOrSelfPermission(str) == 0) {
            return true;
        }
        this.zzs.zzau().zzj().zzb("Permission not granted", str);
        return false;
    }

    final boolean zzT(String str) {
        if (TextUtils.isEmpty(str)) {
            return false;
        }
        String strZzu = this.zzs.zzc().zzu();
        this.zzs.zzat();
        return strZzu.equals(str);
    }

    final Bundle zzU(Bundle bundle) {
        Bundle bundle2 = new Bundle();
        if (bundle != null) {
            for (String str : bundle.keySet()) {
                Object objZzE = zzE(str, bundle.get(str));
                if (objZzE == null) {
                    this.zzs.zzau().zzh().zzb("Param value can't be null", this.zzs.zzm().zzd(str));
                } else {
                    zzL(bundle2, str, objZzE);
                }
            }
        }
        return bundle2;
    }

    final zzas zzV(String str, String str2, Bundle bundle, String str3, long j, boolean z, boolean z2) {
        if (TextUtils.isEmpty(str2)) {
            return null;
        }
        if (zzn(str2) != 0) {
            this.zzs.zzau().zzb().zzb("Invalid conditional property event name", this.zzs.zzm().zze(str2));
            throw new IllegalArgumentException();
        }
        Bundle bundle2 = bundle != null ? new Bundle(bundle) : new Bundle();
        bundle2.putString("_o", str3);
        Bundle bundleZzF = zzF(str, str2, bundle2, CollectionUtils.listOf("_o"), false);
        if (z) {
            bundleZzF = zzU(bundleZzF);
        }
        Preconditions.checkNotNull(bundleZzF);
        return new zzas(str2, new zzaq(bundleZzF), str3, j);
    }

    final boolean zzW(Context context, String str) {
        X500Principal x500Principal = new X500Principal("CN=Android Debug,O=Android,C=US");
        try {
            PackageInfo packageInfo = Wrappers.packageManager(context).getPackageInfo(str, 64);
            if (packageInfo == null || packageInfo.signatures == null || packageInfo.signatures.length <= 0) {
                return true;
            }
            return ((X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(new ByteArrayInputStream(packageInfo.signatures[0].toByteArray()))).getSubjectX500Principal().equals(x500Principal);
        } catch (PackageManager.NameNotFoundException e) {
            this.zzs.zzau().zzb().zzb("Package name not found", e);
            return true;
        } catch (CertificateException e2) {
            this.zzs.zzau().zzb().zzb("Error obtaining certificate", e2);
            return true;
        }
    }

    final byte[] zzX(Parcelable parcelable) {
        if (parcelable == null) {
            return null;
        }
        Parcel parcelObtain = Parcel.obtain();
        try {
            parcelable.writeToParcel(parcelObtain, 0);
            return parcelObtain.marshall();
        } finally {
            parcelObtain.recycle();
        }
    }

    @EnsuresNonNull({"this.apkVersion"})
    public final int zzZ() {
        if (this.zzg == null) {
            this.zzg = Integer.valueOf(GoogleApiAvailabilityLight.getInstance().getApkVersion(this.zzs.zzax()) / 1000);
        }
        return this.zzg.intValue();
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    protected final boolean zza() {
        return true;
    }

    public final int zzaa(int i) {
        return GoogleApiAvailabilityLight.getInstance().isGooglePlayServicesAvailable(this.zzs.zzax(), 12451000);
    }

    public final long zzab(long j, long j2) {
        return (j + (j2 * 60000)) / 86400000;
    }

    final void zzac(Bundle bundle, long j) {
        long j2 = bundle.getLong("_et");
        if (j2 != 0) {
            this.zzs.zzau().zze().zzb("Params already contained engagement", Long.valueOf(j2));
        }
        bundle.putLong("_et", j + j2);
    }

    public final void zzad(com.google.android.gms.internal.measurement.zzcf zzcfVar, String str) {
        Bundle bundle = new Bundle();
        bundle.putString("r", str);
        try {
            zzcfVar.zzb(bundle);
        } catch (RemoteException e) {
            this.zzs.zzau().zze().zzb("Error returning string value to wrapper", e);
        }
    }

    public final void zzae(com.google.android.gms.internal.measurement.zzcf zzcfVar, long j) {
        Bundle bundle = new Bundle();
        bundle.putLong("r", j);
        try {
            zzcfVar.zzb(bundle);
        } catch (RemoteException e) {
            this.zzs.zzau().zze().zzb("Error returning long value to wrapper", e);
        }
    }

    public final void zzaf(com.google.android.gms.internal.measurement.zzcf zzcfVar, int i) {
        Bundle bundle = new Bundle();
        bundle.putInt("r", i);
        try {
            zzcfVar.zzb(bundle);
        } catch (RemoteException e) {
            this.zzs.zzau().zze().zzb("Error returning int value to wrapper", e);
        }
    }

    public final void zzag(com.google.android.gms.internal.measurement.zzcf zzcfVar, byte[] bArr) {
        Bundle bundle = new Bundle();
        bundle.putByteArray("r", bArr);
        try {
            zzcfVar.zzb(bundle);
        } catch (RemoteException e) {
            this.zzs.zzau().zze().zzb("Error returning byte array to wrapper", e);
        }
    }

    public final void zzah(com.google.android.gms.internal.measurement.zzcf zzcfVar, boolean z) {
        Bundle bundle = new Bundle();
        bundle.putBoolean("r", z);
        try {
            zzcfVar.zzb(bundle);
        } catch (RemoteException e) {
            this.zzs.zzau().zze().zzb("Error returning boolean value to wrapper", e);
        }
    }

    public final void zzai(com.google.android.gms.internal.measurement.zzcf zzcfVar, Bundle bundle) {
        try {
            zzcfVar.zzb(bundle);
        } catch (RemoteException e) {
            this.zzs.zzau().zze().zzb("Error returning bundle value to wrapper", e);
        }
    }

    public final void zzaj(com.google.android.gms.internal.measurement.zzcf zzcfVar, ArrayList<Bundle> arrayList) {
        Bundle bundle = new Bundle();
        bundle.putParcelableArrayList("r", arrayList);
        try {
            zzcfVar.zzb(bundle);
        } catch (RemoteException e) {
            this.zzs.zzau().zze().zzb("Error returning bundle list to wrapper", e);
        }
    }

    public final URL zzal(long j, String str, String str2, long j2) {
        try {
            Preconditions.checkNotEmpty(str2);
            Preconditions.checkNotEmpty(str);
            String strConcat = String.format("https://www.googleadservices.com/pagead/conversion/app/deeplink?id_type=adid&sdk_version=%s&rdid=%s&bundleid=%s&retry=%s", String.format("v%s.%s", 42004L, Integer.valueOf(zzZ())), str2, str, Long.valueOf(j2));
            if (str.equals(this.zzs.zzc().zzv())) {
                strConcat = strConcat.concat("&ddl_test=1");
            }
            return new URL(strConcat);
        } catch (IllegalArgumentException | MalformedURLException e) {
            this.zzs.zzau().zzb().zzb("Failed to create BOW URL for Deferred Deep Link. exception", e.getMessage());
            return null;
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    protected final void zzaz() {
        zzg();
        SecureRandom secureRandom = new SecureRandom();
        long jNextLong = secureRandom.nextLong();
        if (jNextLong == 0) {
            jNextLong = secureRandom.nextLong();
            if (jNextLong == 0) {
                this.zzs.zzau().zze().zza("Utils falling back to Random for random id");
            }
        }
        this.zze.set(jNextLong);
    }

    public final long zzd() {
        long andIncrement;
        long j;
        if (this.zze.get() != 0) {
            synchronized (this.zze) {
                this.zze.compareAndSet(-1L, 1L);
                andIncrement = this.zze.getAndIncrement();
            }
            return andIncrement;
        }
        synchronized (this.zze) {
            long jNextLong = new Random(System.nanoTime() ^ this.zzs.zzay().currentTimeMillis()).nextLong();
            int i = this.zzf + 1;
            this.zzf = i;
            j = jNextLong + ((long) i);
        }
        return j;
    }

    @EnsuresNonNull({"this.secureRandom"})
    final SecureRandom zzf() {
        zzg();
        if (this.zzd == null) {
            this.zzd = new SecureRandom();
        }
        return this.zzd;
    }

    final Bundle zzi(Uri uri) {
        String queryParameter;
        String queryParameter2;
        String queryParameter3;
        String queryParameter4;
        if (uri == null) {
            return null;
        }
        try {
            if (uri.isHierarchical()) {
                queryParameter = uri.getQueryParameter("utm_campaign");
                queryParameter2 = uri.getQueryParameter("utm_source");
                queryParameter3 = uri.getQueryParameter("utm_medium");
                queryParameter4 = uri.getQueryParameter("gclid");
            } else {
                queryParameter = null;
                queryParameter2 = null;
                queryParameter3 = null;
                queryParameter4 = null;
            }
            if (TextUtils.isEmpty(queryParameter) && TextUtils.isEmpty(queryParameter2) && TextUtils.isEmpty(queryParameter3) && TextUtils.isEmpty(queryParameter4)) {
                return null;
            }
            Bundle bundle = new Bundle();
            if (!TextUtils.isEmpty(queryParameter)) {
                bundle.putString("campaign", queryParameter);
            }
            if (!TextUtils.isEmpty(queryParameter2)) {
                bundle.putString("source", queryParameter2);
            }
            if (!TextUtils.isEmpty(queryParameter3)) {
                bundle.putString("medium", queryParameter3);
            }
            if (!TextUtils.isEmpty(queryParameter4)) {
                bundle.putString("gclid", queryParameter4);
            }
            String queryParameter5 = uri.getQueryParameter("utm_term");
            if (!TextUtils.isEmpty(queryParameter5)) {
                bundle.putString(FirebaseAnalytics.Param.TERM, queryParameter5);
            }
            String queryParameter6 = uri.getQueryParameter("utm_content");
            if (!TextUtils.isEmpty(queryParameter6)) {
                bundle.putString(FirebaseAnalytics.Param.CONTENT, queryParameter6);
            }
            String queryParameter7 = uri.getQueryParameter(FirebaseAnalytics.Param.ACLID);
            if (!TextUtils.isEmpty(queryParameter7)) {
                bundle.putString(FirebaseAnalytics.Param.ACLID, queryParameter7);
            }
            String queryParameter8 = uri.getQueryParameter(FirebaseAnalytics.Param.CP1);
            if (!TextUtils.isEmpty(queryParameter8)) {
                bundle.putString(FirebaseAnalytics.Param.CP1, queryParameter8);
            }
            String queryParameter9 = uri.getQueryParameter("anid");
            if (!TextUtils.isEmpty(queryParameter9)) {
                bundle.putString("anid", queryParameter9);
            }
            return bundle;
        } catch (UnsupportedOperationException e) {
            this.zzs.zzau().zze().zzb("Install referrer url isn't a hierarchical URI", e);
            return null;
        }
    }

    final boolean zzj(String str, String str2) {
        if (str2 == null) {
            this.zzs.zzau().zzd().zzb("Name is required and can't be null. Type", str);
            return false;
        }
        if (str2.length() == 0) {
            this.zzs.zzau().zzd().zzb("Name is required and can't be empty. Type", str);
            return false;
        }
        int iCodePointAt = str2.codePointAt(0);
        if (!Character.isLetter(iCodePointAt)) {
            this.zzs.zzau().zzd().zzc("Name must start with a letter. Type, name", str, str2);
            return false;
        }
        int length = str2.length();
        int iCharCount = Character.charCount(iCodePointAt);
        while (iCharCount < length) {
            int iCodePointAt2 = str2.codePointAt(iCharCount);
            if (iCodePointAt2 != 95 && !Character.isLetterOrDigit(iCodePointAt2)) {
                this.zzs.zzau().zzd().zzc("Name must consist of letters, digits or _ (underscores). Type, name", str, str2);
                return false;
            }
            iCharCount += Character.charCount(iCodePointAt2);
        }
        return true;
    }

    final boolean zzk(String str, String str2) {
        if (str2 == null) {
            this.zzs.zzau().zzd().zzb("Name is required and can't be null. Type", str);
            return false;
        }
        if (str2.length() == 0) {
            this.zzs.zzau().zzd().zzb("Name is required and can't be empty. Type", str);
            return false;
        }
        int iCodePointAt = str2.codePointAt(0);
        if (!Character.isLetter(iCodePointAt)) {
            if (iCodePointAt != 95) {
                this.zzs.zzau().zzd().zzc("Name must start with a letter or _ (underscore). Type, name", str, str2);
                return false;
            }
            iCodePointAt = 95;
        }
        int length = str2.length();
        int iCharCount = Character.charCount(iCodePointAt);
        while (iCharCount < length) {
            int iCodePointAt2 = str2.codePointAt(iCharCount);
            if (iCodePointAt2 != 95 && !Character.isLetterOrDigit(iCodePointAt2)) {
                this.zzs.zzau().zzd().zzc("Name must consist of letters, digits or _ (underscores). Type, name", str, str2);
                return false;
            }
            iCharCount += Character.charCount(iCodePointAt2);
        }
        return true;
    }

    final boolean zzl(String str, String[] strArr, String[] strArr2, String str2) {
        if (str2 == null) {
            this.zzs.zzau().zzd().zzb("Name is required and can't be null. Type", str);
            return false;
        }
        Preconditions.checkNotNull(str2);
        String[] strArr3 = zzb;
        for (int i = 0; i < 3; i++) {
            if (str2.startsWith(strArr3[i])) {
                this.zzs.zzau().zzd().zzc("Name starts with reserved prefix. Type, name", str, str2);
                return false;
            }
        }
        if (strArr == null || !zzas(str2, strArr)) {
            return true;
        }
        if (strArr2 != null && zzas(str2, strArr2)) {
            return true;
        }
        this.zzs.zzau().zzd().zzc("Name is reserved. Type, name", str, str2);
        return false;
    }

    final boolean zzm(String str, int i, String str2) {
        if (str2 == null) {
            this.zzs.zzau().zzd().zzb("Name is required and can't be null. Type", str);
            return false;
        }
        if (str2.codePointCount(0, str2.length()) <= i) {
            return true;
        }
        this.zzs.zzau().zzd().zzd("Name is too long. Type, maximum supported length, name", str, Integer.valueOf(i), str2);
        return false;
    }

    final int zzn(String str) {
        if (!zzk(NotificationCompat.CATEGORY_EVENT, str)) {
            return 2;
        }
        if (!zzl(NotificationCompat.CATEGORY_EVENT, zzgr.zza, zzgr.zzb, str)) {
            return 13;
        }
        this.zzs.zzc();
        return !zzm(NotificationCompat.CATEGORY_EVENT, 40, str) ? 2 : 0;
    }

    final int zzo(String str) {
        if (!zzk("user property", str)) {
            return 6;
        }
        if (!zzl("user property", zzgt.zza, null, str)) {
            return 15;
        }
        this.zzs.zzc();
        return !zzm("user property", 24, str) ? 6 : 0;
    }

    final int zzq(String str) {
        if (!zzj("event param", str)) {
            return 3;
        }
        if (!zzl("event param", null, null, str)) {
            return 14;
        }
        this.zzs.zzc();
        return !zzm("event param", 40, str) ? 3 : 0;
    }

    final int zzr(String str) {
        if (!zzk("event param", str)) {
            return 3;
        }
        if (!zzl("event param", null, null, str)) {
            return 14;
        }
        this.zzs.zzc();
        return !zzm("event param", 40, str) ? 3 : 0;
    }

    final boolean zzs(Object obj) {
        return (obj instanceof Parcelable[]) || (obj instanceof ArrayList) || (obj instanceof Bundle);
    }

    final boolean zzt(String str, String str2, int i, Object obj) {
        if (obj == null || (obj instanceof Long) || (obj instanceof Float) || (obj instanceof Integer) || (obj instanceof Byte) || (obj instanceof Short) || (obj instanceof Boolean) || (obj instanceof Double)) {
            return true;
        }
        if (!(obj instanceof String) && !(obj instanceof Character) && !(obj instanceof CharSequence)) {
            return false;
        }
        String strValueOf = String.valueOf(obj);
        if (strValueOf.codePointCount(0, strValueOf.length()) <= i) {
            return true;
        }
        this.zzs.zzau().zzh().zzd("Value is too long; discarded. Value kind, name, value length", str, str2, Integer.valueOf(strValueOf.length()));
        return false;
    }

    final void zzz(String str, String str2, String str3, Bundle bundle, List<String> list, boolean z) {
        int iZzr;
        String str4;
        int iZzD;
        if (bundle == null) {
            return;
        }
        this.zzs.zzc();
        int i = 0;
        for (String str5 : new TreeSet(bundle.keySet())) {
            if (list == null || !list.contains(str5)) {
                int iZzq = z ? zzq(str5) : 0;
                iZzr = iZzq == 0 ? zzr(str5) : iZzq;
            } else {
                iZzr = 0;
            }
            if (iZzr != 0) {
                zzI(bundle, iZzr, str5, str5, iZzr == 3 ? str5 : null);
                bundle.remove(str5);
            } else {
                if (zzs(bundle.get(str5))) {
                    this.zzs.zzau().zzh().zzd("Nested Bundle parameters are not allowed; discarded. event name, param name, child param name", str2, str3, str5);
                    str4 = str5;
                    iZzD = 22;
                } else {
                    str4 = str5;
                    iZzD = zzD(str, str2, str5, bundle.get(str5), bundle, list, z, false);
                }
                if (iZzD != 0 && !"_ev".equals(str4)) {
                    zzI(bundle, iZzD, str4, str4, bundle.get(str4));
                    bundle.remove(str4);
                } else if (zzh(str4) && !zzas(str4, zzgs.zzd) && (i = i + 1) > 0) {
                    this.zzs.zzau().zzd().zzc("Item cannot contain custom parameters", this.zzs.zzm().zzc(str2), this.zzs.zzm().zzf(bundle));
                    zzan(bundle, 23);
                    bundle.remove(str4);
                }
            }
        }
    }
}
