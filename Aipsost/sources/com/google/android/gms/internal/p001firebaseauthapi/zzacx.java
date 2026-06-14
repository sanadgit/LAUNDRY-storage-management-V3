package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzacx {
    private static final zzacx zzb = new zzacx(true);
    final zzafj zza = new zzaez(16);
    private boolean zzc;
    private boolean zzd;

    private zzacx() {
    }

    public static zzacx zza() {
        throw null;
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:32:? A[RETURN, SYNTHETIC] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private static final void zzd(com.google.android.gms.internal.p001firebaseauthapi.zzacw r4, java.lang.Object r5) {
        /*
            com.google.android.gms.internal.firebase-auth-api.zzagd r0 = r4.zzb()
            com.google.android.gms.internal.p001firebaseauthapi.zzadl.zze(r5)
            com.google.android.gms.internal.firebase-auth-api.zzagd r1 = com.google.android.gms.internal.p001firebaseauthapi.zzagd.DOUBLE
            com.google.android.gms.internal.firebase-auth-api.zzage r1 = com.google.android.gms.internal.p001firebaseauthapi.zzage.INT
            com.google.android.gms.internal.firebase-auth-api.zzage r0 = r0.zza()
            int r0 = r0.ordinal()
            switch(r0) {
                case 0: goto L41;
                case 1: goto L3e;
                case 2: goto L3b;
                case 3: goto L38;
                case 4: goto L35;
                case 5: goto L32;
                case 6: goto L29;
                case 7: goto L20;
                case 8: goto L17;
                default: goto L16;
            }
        L16:
            goto L46
        L17:
            boolean r0 = r5 instanceof com.google.android.gms.internal.p001firebaseauthapi.zzaek
            if (r0 != 0) goto L45
            boolean r0 = r5 instanceof com.google.android.gms.internal.p001firebaseauthapi.zzadp
            if (r0 == 0) goto L46
            goto L45
        L20:
            boolean r0 = r5 instanceof java.lang.Integer
            if (r0 != 0) goto L45
            boolean r0 = r5 instanceof com.google.android.gms.internal.p001firebaseauthapi.zzadh
            if (r0 == 0) goto L46
            goto L45
        L29:
            boolean r0 = r5 instanceof com.google.android.gms.internal.p001firebaseauthapi.zzacc
            if (r0 != 0) goto L45
            boolean r0 = r5 instanceof byte[]
            if (r0 == 0) goto L46
            goto L45
        L32:
            boolean r0 = r5 instanceof java.lang.String
            goto L43
        L35:
            boolean r0 = r5 instanceof java.lang.Boolean
            goto L43
        L38:
            boolean r0 = r5 instanceof java.lang.Double
            goto L43
        L3b:
            boolean r0 = r5 instanceof java.lang.Float
            goto L43
        L3e:
            boolean r0 = r5 instanceof java.lang.Long
            goto L43
        L41:
            boolean r0 = r5 instanceof java.lang.Integer
        L43:
            if (r0 == 0) goto L46
        L45:
            return
        L46:
            java.lang.IllegalArgumentException r0 = new java.lang.IllegalArgumentException
            r1 = 3
            java.lang.Object[] r1 = new java.lang.Object[r1]
            int r2 = r4.zza()
            java.lang.Integer r2 = java.lang.Integer.valueOf(r2)
            r3 = 0
            r1[r3] = r2
            com.google.android.gms.internal.firebase-auth-api.zzagd r4 = r4.zzb()
            com.google.android.gms.internal.firebase-auth-api.zzage r4 = r4.zza()
            r2 = 1
            r1[r2] = r4
            java.lang.Class r4 = r5.getClass()
            java.lang.String r4 = r4.getName()
            r5 = 2
            r1[r5] = r4
            java.lang.String r4 = "Wrong object type used with protocol message reflection.\nField number: %d, field java type: %s, value type: %s\n"
            java.lang.String r4 = java.lang.String.format(r4, r1)
            r0.<init>(r4)
            throw r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzacx.zzd(com.google.android.gms.internal.firebase-auth-api.zzacw, java.lang.Object):void");
    }

    public final /* bridge */ /* synthetic */ Object clone() throws CloneNotSupportedException {
        zzacx zzacxVar = new zzacx();
        for (int i = 0; i < this.zza.zzb(); i++) {
            Map.Entry entryZzg = this.zza.zzg(i);
            zzacxVar.zzc((zzacw) entryZzg.getKey(), entryZzg.getValue());
        }
        for (Map.Entry entry : this.zza.zzc()) {
            zzacxVar.zzc((zzacw) entry.getKey(), entry.getValue());
        }
        zzacxVar.zzd = this.zzd;
        return zzacxVar;
    }

    public final boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof zzacx) {
            return this.zza.equals(((zzacx) obj).zza);
        }
        return false;
    }

    public final int hashCode() {
        return this.zza.hashCode();
    }

    public final void zzb() {
        if (this.zzc) {
            return;
        }
        for (int i = 0; i < this.zza.zzb(); i++) {
            Map.Entry entryZzg = this.zza.zzg(i);
            if (entryZzg.getValue() instanceof zzadf) {
                ((zzadf) entryZzg.getValue()).zzE();
            }
        }
        this.zza.zza();
        this.zzc = true;
    }

    public final void zzc(zzacw zzacwVar, Object obj) {
        if (!zzacwVar.zzc()) {
            zzd(zzacwVar, obj);
        } else {
            if (!(obj instanceof List)) {
                throw new IllegalArgumentException("Wrong object type used with protocol message reflection.");
            }
            ArrayList arrayList = new ArrayList();
            arrayList.addAll((List) obj);
            int size = arrayList.size();
            for (int i = 0; i < size; i++) {
                zzd(zzacwVar, arrayList.get(i));
            }
            obj = arrayList;
        }
        if (obj instanceof zzadp) {
            this.zzd = true;
        }
        this.zza.put(zzacwVar, obj);
    }

    private zzacx(boolean z) {
        zzb();
        zzb();
    }
}
