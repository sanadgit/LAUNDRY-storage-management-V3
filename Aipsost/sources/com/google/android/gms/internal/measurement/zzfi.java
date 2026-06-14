package com.google.android.gms.internal.measurement;

import kotlin.text.Typography;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public enum zzfi implements zzkf {
    AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_UNKNOWN(0),
    AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_RESTRICTED(1),
    AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_DENIED(2),
    AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_AUTHORIZED(3),
    AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_NOT_DETERMINED(4),
    AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_NOT_CONFIGURED(5);

    private static final zzkg<zzfi> zzg = new zzkg<zzfi>() { // from class: com.google.android.gms.internal.measurement.zzfg
    };
    private final int zzh;

    zzfi(int i) {
        this.zzh = i;
    }

    public static zzfi zza(int i) {
        switch (i) {
            case 0:
                return AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_UNKNOWN;
            case 1:
                return AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_RESTRICTED;
            case 2:
                return AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_DENIED;
            case 3:
                return AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_AUTHORIZED;
            case 4:
                return AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_NOT_DETERMINED;
            case 5:
                return AT_TRACKING_MANAGER_AUTHORIZATION_STATUS_NOT_CONFIGURED;
            default:
                return null;
        }
    }

    public static zzkh zzb() {
        return zzfh.zza;
    }

    @Override // java.lang.Enum
    public final String toString() {
        return "<" + getClass().getName() + '@' + Integer.toHexString(System.identityHashCode(this)) + " number=" + this.zzh + " name=" + name() + Typography.greater;
    }
}
