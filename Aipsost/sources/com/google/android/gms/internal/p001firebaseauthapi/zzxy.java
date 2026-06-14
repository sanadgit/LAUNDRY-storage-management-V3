package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.RemoteException;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.internal.zzai;
import com.google.firebase.auth.internal.zzao;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzxy implements zzwz {
    final /* synthetic */ zzyb zza;

    zzxy(zzyb zzybVar) {
        this.zza = zzybVar;
    }

    private final void zzp(zzxz zzxzVar) {
        this.zza.zzi.execute(new zzxx(this, zzxzVar));
    }

    private final void zzq(Status status, AuthCredential authCredential, String str, String str2) {
        zzyb.zzk(this.zza, status);
        zzyb zzybVar = this.zza;
        zzybVar.zzp = authCredential;
        zzybVar.zzq = str;
        zzybVar.zzr = str2;
        zzao zzaoVar = zzybVar.zzg;
        if (zzaoVar != null) {
            zzaoVar.zzb(status);
        }
        this.zza.zzl(status);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zza(String str) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 8, "Unexpected response type " + i);
        zzyb zzybVar = this.zza;
        zzybVar.zzo = str;
        zzybVar.zza = true;
        zzp(new zzxv(this, str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzb(String str) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 8, "Unexpected response type " + i);
        this.zza.zzo = str;
        zzp(new zzxt(this, str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzc(zzzd zzzdVar) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 3, "Unexpected response type " + i);
        zzyb zzybVar = this.zza;
        zzybVar.zzl = zzzdVar;
        zzyb.zzj(zzybVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzd() throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 5, "Unexpected response type " + i);
        zzyb.zzj(this.zza);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zze(zztk zztkVar) {
        zzq(zztkVar.zza(), zztkVar.zzb(), zztkVar.zzc(), zztkVar.zzd());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzf(zztm zztmVar) {
        zzyb zzybVar = this.zza;
        zzybVar.zzs = zztmVar;
        zzybVar.zzl(zzai.zza("REQUIRES_SECOND_FACTOR_AUTH"));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzg(Status status, PhoneAuthCredential phoneAuthCredential) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 2, "Unexpected response type " + i);
        zzq(status, phoneAuthCredential, null, null);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzh(Status status) throws RemoteException {
        String statusMessage = status.getStatusMessage();
        if (statusMessage != null) {
            if (statusMessage.contains("MISSING_MFA_PENDING_CREDENTIAL")) {
                status = new Status(17081);
            } else if (statusMessage.contains("MISSING_MFA_ENROLLMENT_ID")) {
                status = new Status(17082);
            } else if (statusMessage.contains("INVALID_MFA_PENDING_CREDENTIAL")) {
                status = new Status(17083);
            } else if (statusMessage.contains("MFA_ENROLLMENT_NOT_FOUND")) {
                status = new Status(17084);
            } else if (statusMessage.contains("ADMIN_ONLY_OPERATION")) {
                status = new Status(17085);
            } else if (statusMessage.contains("UNVERIFIED_EMAIL")) {
                status = new Status(17086);
            } else if (statusMessage.contains("SECOND_FACTOR_EXISTS")) {
                status = new Status(17087);
            } else if (statusMessage.contains("SECOND_FACTOR_LIMIT_EXCEEDED")) {
                status = new Status(17088);
            } else if (statusMessage.contains("UNSUPPORTED_FIRST_FACTOR")) {
                status = new Status(17089);
            } else if (statusMessage.contains("EMAIL_CHANGE_NEEDS_VERIFICATION")) {
                status = new Status(17090);
            }
        }
        zzyb zzybVar = this.zza;
        if (zzybVar.zzb == 8) {
            zzybVar.zza = true;
            zzp(new zzxw(this, status));
        } else {
            zzyb.zzk(zzybVar, status);
            this.zza.zzl(status);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzi(zzzy zzzyVar, zzzr zzzrVar) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 2, "Unexpected response type: " + i);
        zzyb zzybVar = this.zza;
        zzybVar.zzj = zzzyVar;
        zzybVar.zzk = zzzrVar;
        zzyb.zzj(zzybVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzj(zzaaj zzaajVar) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 4, "Unexpected response type " + i);
        zzyb zzybVar = this.zza;
        zzybVar.zzm = zzaajVar;
        zzyb.zzj(zzybVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzk() throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 6, "Unexpected response type " + i);
        zzyb.zzj(this.zza);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzl(String str) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 7, "Unexpected response type " + i);
        zzyb zzybVar = this.zza;
        zzybVar.zzn = str;
        zzyb.zzj(zzybVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzm() throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 9, "Unexpected response type " + i);
        zzyb.zzj(this.zza);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzn(zzzy zzzyVar) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 1, "Unexpected response type: " + i);
        zzyb zzybVar = this.zza;
        zzybVar.zzj = zzzyVar;
        zzyb.zzj(zzybVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzwz
    public final void zzo(PhoneAuthCredential phoneAuthCredential) throws RemoteException {
        int i = this.zza.zzb;
        Preconditions.checkState(i == 8, "Unexpected response type " + i);
        this.zza.zza = true;
        zzp(new zzxu(this, phoneAuthCredential));
    }
}
