package com.google.android.gms.internal.measurement;

import android.content.Context;
import android.database.ContentObserver;
import android.util.Log;
import androidx.core.content.PermissionChecker;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhh implements zzhe {
    private static zzhh zza;

    @Nullable
    private final Context zzb;

    @Nullable
    private final ContentObserver zzc;

    private zzhh() {
        this.zzb = null;
        this.zzc = null;
    }

    private zzhh(Context context) {
        this.zzb = context;
        zzhg zzhgVar = new zzhg(this, null);
        this.zzc = zzhgVar;
        context.getContentResolver().registerContentObserver(zzgv.zza, true, zzhgVar);
    }

    static zzhh zza(Context context) {
        zzhh zzhhVar;
        synchronized (zzhh.class) {
            if (zza == null) {
                zza = PermissionChecker.checkSelfPermission(context, "com.google.android.providers.gsf.permission.READ_GSERVICES") == 0 ? new zzhh(context) : new zzhh();
            }
            zzhhVar = zza;
        }
        return zzhhVar;
    }

    static synchronized void zzc() {
        Context context;
        zzhh zzhhVar = zza;
        if (zzhhVar != null && (context = zzhhVar.zzb) != null && zzhhVar.zzc != null) {
            context.getContentResolver().unregisterContentObserver(zza.zzc);
        }
        zza = null;
    }

    @Override // com.google.android.gms.internal.measurement.zzhe
    /* JADX INFO: renamed from: zzb, reason: merged with bridge method [inline-methods] */
    public final String zze(final String str) {
        if (this.zzb == null) {
            return null;
        }
        try {
            return (String) zzhc.zza(new zzhd(this, str) { // from class: com.google.android.gms.internal.measurement.zzhf
                private final zzhh zza;
                private final String zzb;

                {
                    this.zza = this;
                    this.zzb = str;
                }

                @Override // com.google.android.gms.internal.measurement.zzhd
                public final Object zza() {
                    return this.zza.zzd(this.zzb);
                }
            });
        } catch (IllegalStateException | SecurityException e) {
            String strValueOf = String.valueOf(str);
            Log.e("GservicesLoader", strValueOf.length() != 0 ? "Unable to read GServices for: ".concat(strValueOf) : new String("Unable to read GServices for: "), e);
            return null;
        }
    }

    final /* synthetic */ String zzd(String str) {
        return zzgv.zza(this.zzb.getContentResolver(), str, null);
    }
}
