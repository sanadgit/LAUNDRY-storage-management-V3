package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public enum zzagd {
    DOUBLE(zzage.DOUBLE, 1),
    FLOAT(zzage.FLOAT, 5),
    INT64(zzage.LONG, 0),
    UINT64(zzage.LONG, 0),
    INT32(zzage.INT, 0),
    FIXED64(zzage.LONG, 1),
    FIXED32(zzage.INT, 5),
    BOOL(zzage.BOOLEAN, 0),
    STRING(zzage.STRING, 2),
    GROUP(zzage.MESSAGE, 3),
    MESSAGE(zzage.MESSAGE, 2),
    BYTES(zzage.BYTE_STRING, 2),
    UINT32(zzage.INT, 0),
    ENUM(zzage.ENUM, 0),
    SFIXED32(zzage.INT, 5),
    SFIXED64(zzage.LONG, 1),
    SINT32(zzage.INT, 0),
    SINT64(zzage.LONG, 0);

    private final zzage zzt;

    zzagd(zzage zzageVar, int i) {
        this.zzt = zzageVar;
    }

    public final zzage zza() {
        return this.zzt;
    }
}
