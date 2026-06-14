package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public enum zzacy {
    DOUBLE(0, 1, zzado.DOUBLE),
    FLOAT(1, 1, zzado.FLOAT),
    INT64(2, 1, zzado.LONG),
    UINT64(3, 1, zzado.LONG),
    INT32(4, 1, zzado.INT),
    FIXED64(5, 1, zzado.LONG),
    FIXED32(6, 1, zzado.INT),
    BOOL(7, 1, zzado.BOOLEAN),
    STRING(8, 1, zzado.STRING),
    MESSAGE(9, 1, zzado.MESSAGE),
    BYTES(10, 1, zzado.BYTE_STRING),
    UINT32(11, 1, zzado.INT),
    ENUM(12, 1, zzado.ENUM),
    SFIXED32(13, 1, zzado.INT),
    SFIXED64(14, 1, zzado.LONG),
    SINT32(15, 1, zzado.INT),
    SINT64(16, 1, zzado.LONG),
    GROUP(17, 1, zzado.MESSAGE),
    DOUBLE_LIST(18, 2, zzado.DOUBLE),
    FLOAT_LIST(19, 2, zzado.FLOAT),
    INT64_LIST(20, 2, zzado.LONG),
    UINT64_LIST(21, 2, zzado.LONG),
    INT32_LIST(22, 2, zzado.INT),
    FIXED64_LIST(23, 2, zzado.LONG),
    FIXED32_LIST(24, 2, zzado.INT),
    BOOL_LIST(25, 2, zzado.BOOLEAN),
    STRING_LIST(26, 2, zzado.STRING),
    MESSAGE_LIST(27, 2, zzado.MESSAGE),
    BYTES_LIST(28, 2, zzado.BYTE_STRING),
    UINT32_LIST(29, 2, zzado.INT),
    ENUM_LIST(30, 2, zzado.ENUM),
    SFIXED32_LIST(31, 2, zzado.INT),
    SFIXED64_LIST(32, 2, zzado.LONG),
    SINT32_LIST(33, 2, zzado.INT),
    SINT64_LIST(34, 2, zzado.LONG),
    DOUBLE_LIST_PACKED(35, 3, zzado.DOUBLE),
    FLOAT_LIST_PACKED(36, 3, zzado.FLOAT),
    INT64_LIST_PACKED(37, 3, zzado.LONG),
    UINT64_LIST_PACKED(38, 3, zzado.LONG),
    INT32_LIST_PACKED(39, 3, zzado.INT),
    FIXED64_LIST_PACKED(40, 3, zzado.LONG),
    FIXED32_LIST_PACKED(41, 3, zzado.INT),
    BOOL_LIST_PACKED(42, 3, zzado.BOOLEAN),
    UINT32_LIST_PACKED(43, 3, zzado.INT),
    ENUM_LIST_PACKED(44, 3, zzado.ENUM),
    SFIXED32_LIST_PACKED(45, 3, zzado.INT),
    SFIXED64_LIST_PACKED(46, 3, zzado.LONG),
    SINT32_LIST_PACKED(47, 3, zzado.INT),
    SINT64_LIST_PACKED(48, 3, zzado.LONG),
    GROUP_LIST(49, 2, zzado.MESSAGE),
    MAP(50, 4, zzado.VOID);

    private static final zzacy[] zzZ;
    private final zzado zzab;
    private final int zzac;
    private final Class zzad;

    static {
        zzacy[] zzacyVarArrValues = values();
        zzZ = new zzacy[zzacyVarArrValues.length];
        for (zzacy zzacyVar : zzacyVarArrValues) {
            zzZ[zzacyVar.zzac] = zzacyVar;
        }
    }

    zzacy(int i, int i2, zzado zzadoVar) {
        this.zzac = i;
        this.zzab = zzadoVar;
        zzado zzadoVar2 = zzado.VOID;
        switch (i2 - 1) {
            case 1:
                this.zzad = zzadoVar.zza();
                break;
            case 2:
            default:
                this.zzad = null;
                break;
            case 3:
                this.zzad = zzadoVar.zza();
                break;
        }
        if (i2 == 1) {
            zzadoVar.ordinal();
        }
    }

    public final int zza() {
        return this.zzac;
    }
}
