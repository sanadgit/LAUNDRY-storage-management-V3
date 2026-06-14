package com.google.android.gms.measurement.internal;

import java.util.Map;
import java.util.Set;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzy extends zzke {
    private String zza;
    private Set<Integer> zzb;
    private Map<Integer, zzt> zzc;
    private Long zzd;
    private Long zze;

    zzy(zzkn zzknVar) {
        super(zzknVar);
    }

    private final zzt zzc(Integer num) {
        if (this.zzc.containsKey(num)) {
            return this.zzc.get(num);
        }
        zzt zztVar = new zzt(this, this.zza, null);
        this.zzc.put(num, zztVar);
        return zztVar;
    }

    private final boolean zzd(int i, int i2) {
        zzt zztVar = this.zzc.get(Integer.valueOf(i));
        if (zztVar == null) {
            return false;
        }
        return zztVar.zze.get(i2);
    }

    @Override // com.google.android.gms.measurement.internal.zzke
    protected final boolean zzaA() {
        return false;
    }

    /* JADX WARN: Code restructure failed: missing block: B:418:0x0a39, code lost:
    
        r7 = r64.zzs.zzau().zze();
        r9 = com.google.android.gms.measurement.internal.zzem.zzl(r64.zza);
     */
    /* JADX WARN: Code restructure failed: missing block: B:419:0x0a4d, code lost:
    
        if (r8.zza() == false) goto L421;
     */
    /* JADX WARN: Code restructure failed: missing block: B:420:0x0a4f, code lost:
    
        r8 = java.lang.Integer.valueOf(r8.zzb());
     */
    /* JADX WARN: Code restructure failed: missing block: B:421:0x0a58, code lost:
    
        r8 = null;
     */
    /* JADX WARN: Code restructure failed: missing block: B:422:0x0a59, code lost:
    
        r7.zzc("Invalid property filter ID. appId, id", r9, java.lang.String.valueOf(r8));
     */
    /* JADX WARN: Removed duplicated region for block: B:100:0x025d  */
    /* JADX WARN: Removed duplicated region for block: B:101:0x0265  */
    /* JADX WARN: Removed duplicated region for block: B:118:0x02de A[PHI: r0 r5
  0x02de: PHI (r0v65 java.util.Map) = (r0v46 java.util.Map), (r0v68 java.util.Map), (r0v40 java.util.Map) binds: [B:132:0x030c, B:121:0x02e7, B:117:0x02dc] A[DONT_GENERATE, DONT_INLINE]
  0x02de: PHI (r5v16 android.database.Cursor) = (r5v9 android.database.Cursor), (r5v17 android.database.Cursor), (r5v17 android.database.Cursor) binds: [B:132:0x030c, B:121:0x02e7, B:117:0x02dc] A[DONT_GENERATE, DONT_INLINE]] */
    /* JADX WARN: Removed duplicated region for block: B:137:0x031d  */
    /* JADX WARN: Removed duplicated region for block: B:166:0x03e7  */
    /* JADX WARN: Removed duplicated region for block: B:172:0x03f6  */
    /* JADX WARN: Removed duplicated region for block: B:244:0x05bb  */
    /* JADX WARN: Removed duplicated region for block: B:245:0x05bf  */
    /* JADX WARN: Removed duplicated region for block: B:293:0x074e A[PHI: r0 r4 r13 r26 r28 r66
  0x074e: PHI (r0v101 java.util.Map) = (r0v104 java.util.Map), (r0v113 java.util.Map) binds: [B:311:0x0787, B:292:0x074c] A[DONT_GENERATE, DONT_INLINE]
  0x074e: PHI (r4v27 android.database.Cursor) = (r4v28 android.database.Cursor), (r4v29 android.database.Cursor) binds: [B:311:0x0787, B:292:0x074c] A[DONT_GENERATE, DONT_INLINE]
  0x074e: PHI (r13v13 java.lang.String) = (r13v14 java.lang.String), (r13v17 java.lang.String) binds: [B:311:0x0787, B:292:0x074c] A[DONT_GENERATE, DONT_INLINE]
  0x074e: PHI (r26v5 java.lang.String) = (r26v6 java.lang.String), (r26v10 java.lang.String) binds: [B:311:0x0787, B:292:0x074c] A[DONT_GENERATE, DONT_INLINE]
  0x074e: PHI (r28v7 java.lang.String) = (r28v8 java.lang.String), (r28v14 java.lang.String) binds: [B:311:0x0787, B:292:0x074c] A[DONT_GENERATE, DONT_INLINE]
  0x074e: PHI (r66v5 java.util.Iterator<com.google.android.gms.internal.measurement.zzfo>) = 
  (r66v6 java.util.Iterator<com.google.android.gms.internal.measurement.zzfo>)
  (r66v8 java.util.Iterator<com.google.android.gms.internal.measurement.zzfo>)
 binds: [B:311:0x0787, B:292:0x074c] A[DONT_GENERATE, DONT_INLINE]] */
    /* JADX WARN: Removed duplicated region for block: B:317:0x0792  */
    /* JADX WARN: Removed duplicated region for block: B:323:0x07ac  */
    /* JADX WARN: Removed duplicated region for block: B:343:0x085b  */
    /* JADX WARN: Removed duplicated region for block: B:372:0x091d A[PHI: r0 r9
  0x091d: PHI (r0v155 java.util.Map) = (r0v158 java.util.Map), (r0v164 java.util.Map) binds: [B:384:0x0944, B:371:0x091b] A[DONT_GENERATE, DONT_INLINE]
  0x091d: PHI (r9v39 android.database.Cursor) = (r9v40 android.database.Cursor), (r9v43 android.database.Cursor) binds: [B:384:0x0944, B:371:0x091b] A[DONT_GENERATE, DONT_INLINE]] */
    /* JADX WARN: Removed duplicated region for block: B:390:0x094f  */
    /* JADX WARN: Removed duplicated region for block: B:429:0x0a8e  */
    /* JADX WARN: Removed duplicated region for block: B:446:0x0b30  */
    /* JADX WARN: Removed duplicated region for block: B:59:0x0182  */
    /* JADX WARN: Removed duplicated region for block: B:66:0x01be A[Catch: all -> 0x022a, SQLiteException -> 0x022e, TRY_LEAVE, TryCatch #11 {all -> 0x022a, blocks: (B:64:0x01b8, B:66:0x01be, B:70:0x01cc, B:71:0x01d1, B:72:0x01dc, B:73:0x01ec, B:78:0x0214, B:75:0x01f9, B:77:0x020d), top: B:462:0x01b8 }] */
    /* JADX WARN: Removed duplicated region for block: B:70:0x01cc A[Catch: all -> 0x022a, SQLiteException -> 0x022e, TRY_ENTER, TryCatch #11 {all -> 0x022a, blocks: (B:64:0x01b8, B:66:0x01be, B:70:0x01cc, B:71:0x01d1, B:72:0x01dc, B:73:0x01ec, B:78:0x0214, B:75:0x01f9, B:77:0x020d), top: B:462:0x01b8 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final java.util.List<com.google.android.gms.internal.measurement.zzfk> zzb(java.lang.String r65, java.util.List<com.google.android.gms.internal.measurement.zzfo> r66, java.util.List<com.google.android.gms.internal.measurement.zzgh> r67, java.lang.Long r68, java.lang.Long r69) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 2868
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzy.zzb(java.lang.String, java.util.List, java.util.List, java.lang.Long, java.lang.Long):java.util.List");
    }
}
