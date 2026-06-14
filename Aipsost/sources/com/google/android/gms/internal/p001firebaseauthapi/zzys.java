package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.api.Status;
import java.util.Iterator;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzys extends zzxa {
    final /* synthetic */ zzyv zza;
    private final String zzb;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public zzys(zzyv zzyvVar, zzxa zzxaVar, String str) {
        super(zzxaVar);
        this.zza = zzyvVar;
        this.zzb = str;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxa
    public final void zzb(String str) {
        zzyv.zza.d("onCodeSent", new Object[0]);
        zzyu zzyuVar = (zzyu) this.zza.zzd.get(this.zzb);
        if (zzyuVar == null) {
            return;
        }
        Iterator it = zzyuVar.zzb.iterator();
        while (it.hasNext()) {
            ((zzxa) it.next()).zzb(str);
        }
        zzyuVar.zzg = true;
        zzyuVar.zzd = str;
        if (zzyuVar.zza <= 0) {
            this.zza.zzh(this.zzb);
        } else if (!zzyuVar.zzc) {
            this.zza.zzn(this.zzb);
        } else {
            if (zzag.zzd(zzyuVar.zze)) {
                return;
            }
            zzyv.zze(this.zza, this.zzb);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxa
    public final void zzh(Status status) {
        zzyv.zza.e("SMS verification code request failed: " + CommonStatusCodes.getStatusCodeString(status.getStatusCode()) + " " + status.getStatusMessage(), new Object[0]);
        zzyu zzyuVar = (zzyu) this.zza.zzd.get(this.zzb);
        if (zzyuVar == null) {
            return;
        }
        Iterator it = zzyuVar.zzb.iterator();
        while (it.hasNext()) {
            ((zzxa) it.next()).zzh(status);
        }
        this.zza.zzj(this.zzb);
    }
}
