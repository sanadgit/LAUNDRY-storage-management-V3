package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.RemoteException;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.logging.Logger;
import com.google.firebase.auth.PhoneAuthCredential;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class zzxa {
    private final zzwz zza;
    private final Logger zzb;

    public zzxa(zzwz zzwzVar, Logger logger) {
        this.zza = (zzwz) Preconditions.checkNotNull(zzwzVar);
        this.zzb = (Logger) Preconditions.checkNotNull(logger);
    }

    public final void zza(String str) {
        try {
            this.zza.zza(str);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending auto retrieval timeout response.", e, new Object[0]);
        }
    }

    public void zzb(String str) {
        try {
            this.zza.zzb(str);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending send verification code response.", e, new Object[0]);
        }
    }

    public final void zzc(zzzd zzzdVar) {
        try {
            this.zza.zzc(zzzdVar);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending create auth uri response.", e, new Object[0]);
        }
    }

    public final void zzd() {
        try {
            this.zza.zzd();
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending delete account response.", e, new Object[0]);
        }
    }

    public final void zze(zztk zztkVar) {
        try {
            this.zza.zze(zztkVar);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending failure result with credential", e, new Object[0]);
        }
    }

    public final void zzf(zztm zztmVar) {
        try {
            this.zza.zzf(zztmVar);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending failure result for mfa", e, new Object[0]);
        }
    }

    public final void zzg(Status status, PhoneAuthCredential phoneAuthCredential) {
        try {
            this.zza.zzg(status, phoneAuthCredential);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending failure result.", e, new Object[0]);
        }
    }

    public void zzh(Status status) {
        try {
            this.zza.zzh(status);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending failure result.", e, new Object[0]);
        }
    }

    public final void zzi(zzzy zzzyVar, zzzr zzzrVar) {
        try {
            this.zza.zzi(zzzyVar, zzzrVar);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending get token and account info user response", e, new Object[0]);
        }
    }

    public final void zzj(zzaaj zzaajVar) {
        try {
            this.zza.zzj(zzaajVar);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending password reset response.", e, new Object[0]);
        }
    }

    public final void zzk() {
        try {
            this.zza.zzk();
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending email verification response.", e, new Object[0]);
        }
    }

    public final void zzl(String str) {
        try {
            this.zza.zzl(str);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending set account info response.", e, new Object[0]);
        }
    }

    public final void zzm() {
        try {
            this.zza.zzm();
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when setting FirebaseUI Version", e, new Object[0]);
        }
    }

    public final void zzn(zzzy zzzyVar) {
        try {
            this.zza.zzn(zzzyVar);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending token result.", e, new Object[0]);
        }
    }

    public final void zzo(PhoneAuthCredential phoneAuthCredential) {
        try {
            this.zza.zzo(phoneAuthCredential);
        } catch (RemoteException e) {
            this.zzb.e("RemoteException when sending verification completed response.", e, new Object[0]);
        }
    }

    public zzxa(zzxa zzxaVar) {
        this(zzxaVar.zza, zzxaVar.zzb);
    }
}
