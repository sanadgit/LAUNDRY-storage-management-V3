package com.google.android.gms.internal.measurement;

import android.content.ContentResolver;
import android.database.ContentObserver;
import android.database.Cursor;
import android.database.sqlite.SQLiteException;
import android.net.Uri;
import android.os.StrictMode;
import android.util.Log;
import androidx.collection.ArrayMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzha implements zzhe {
    private final ContentResolver zzc;
    private final Uri zzd;
    private final ContentObserver zze;
    private final Object zzf;
    private volatile Map<String, String> zzg;
    private final List<zzhb> zzh;
    private static final Map<Uri, zzha> zzb = new ArrayMap();
    public static final String[] zza = {"key", "value"};

    private zzha(ContentResolver contentResolver, Uri uri) {
        zzgz zzgzVar = new zzgz(this, null);
        this.zze = zzgzVar;
        this.zzf = new Object();
        this.zzh = new ArrayList();
        if (contentResolver == null || uri == null) {
            throw null;
        }
        this.zzc = contentResolver;
        this.zzd = uri;
        contentResolver.registerContentObserver(uri, false, zzgzVar);
    }

    public static zzha zza(ContentResolver contentResolver, Uri uri) {
        zzha zzhaVar;
        synchronized (zzha.class) {
            Map<Uri, zzha> map = zzb;
            zzhaVar = map.get(uri);
            if (zzhaVar == null) {
                try {
                    zzha zzhaVar2 = new zzha(contentResolver, uri);
                    try {
                        map.put(uri, zzhaVar2);
                    } catch (SecurityException e) {
                    }
                    zzhaVar = zzhaVar2;
                } catch (SecurityException e2) {
                }
            }
        }
        return zzhaVar;
    }

    static synchronized void zzd() {
        for (zzha zzhaVar : zzb.values()) {
            zzhaVar.zzc.unregisterContentObserver(zzhaVar.zze);
        }
        zzb.clear();
    }

    /* JADX WARN: Multi-variable type inference failed */
    /* JADX WARN: Type inference failed for: r0v1, types: [java.util.Map<java.lang.String, java.lang.String>] */
    /* JADX WARN: Type inference failed for: r0v10 */
    /* JADX WARN: Type inference failed for: r0v11 */
    /* JADX WARN: Type inference failed for: r0v12 */
    /* JADX WARN: Type inference failed for: r0v5 */
    /* JADX WARN: Type inference failed for: r0v6, types: [android.os.StrictMode$ThreadPolicy] */
    /* JADX WARN: Type inference failed for: r0v7, types: [android.os.StrictMode$ThreadPolicy] */
    /* JADX WARN: Type inference failed for: r0v8 */
    /* JADX WARN: Type inference failed for: r0v9 */
    public final Map<String, String> zzb() {
        ?? r0;
        Map<String, String> map;
        Map<String, String> map2 = this.zzg;
        ?? r02 = map2;
        if (map2 == null) {
            synchronized (this.zzf) {
                Map<String, String> map3 = this.zzg;
                r0 = map3;
                if (map3 == null) {
                    ?? AllowThreadDiskReads = StrictMode.allowThreadDiskReads();
                    try {
                        try {
                            map = (Map) zzhc.zza(new zzhd(this) { // from class: com.google.android.gms.internal.measurement.zzgy
                                private final zzha zza;

                                {
                                    this.zza = this;
                                }

                                @Override // com.google.android.gms.internal.measurement.zzhd
                                public final Object zza() {
                                    return this.zza.zzf();
                                }
                            });
                        } catch (SQLiteException | IllegalStateException | SecurityException e) {
                            Log.e("ConfigurationContentLoader", "PhenotypeFlag unable to load ContentProvider, using default values");
                            StrictMode.setThreadPolicy(AllowThreadDiskReads);
                            map = null;
                        }
                        this.zzg = map;
                        AllowThreadDiskReads = map;
                        r0 = AllowThreadDiskReads;
                    } finally {
                        StrictMode.setThreadPolicy(AllowThreadDiskReads);
                    }
                }
            }
            r02 = r0;
        }
        return r02 != 0 ? r02 : Collections.emptyMap();
    }

    public final void zzc() {
        synchronized (this.zzf) {
            this.zzg = null;
            zzht.zzc();
        }
        synchronized (this) {
            Iterator<zzhb> it = this.zzh.iterator();
            while (it.hasNext()) {
                it.next().zza();
            }
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzhe
    public final /* bridge */ /* synthetic */ Object zze(String str) {
        return zzb().get(str);
    }

    final /* synthetic */ Map zzf() {
        Cursor cursorQuery = this.zzc.query(this.zzd, zza, null, null, null);
        if (cursorQuery == null) {
            return Collections.emptyMap();
        }
        try {
            int count = cursorQuery.getCount();
            if (count == 0) {
                return Collections.emptyMap();
            }
            Map arrayMap = count <= 256 ? new ArrayMap(count) : new HashMap(count, 1.0f);
            while (cursorQuery.moveToNext()) {
                arrayMap.put(cursorQuery.getString(0), cursorQuery.getString(1));
            }
            return arrayMap;
        } finally {
            cursorQuery.close();
        }
    }
}
