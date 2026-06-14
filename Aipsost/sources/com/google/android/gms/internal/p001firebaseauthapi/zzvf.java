package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.firebase.FirebaseError;
import com.google.firebase.auth.ActionCodeSettings;
import com.google.firebase.auth.EmailAuthCredential;
import com.google.firebase.auth.UserProfileChangeRequest;
import com.google.firebase.auth.internal.zzai;
import com.google.firebase.auth.zze;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzvf {
    private final zzyh zza;

    public zzvf(zzyh zzyhVar) {
        this.zza = (zzyh) Preconditions.checkNotNull(zzyhVar);
    }

    private final void zzM(String str, zzyg zzygVar) {
        Preconditions.checkNotNull(zzygVar);
        Preconditions.checkNotEmpty(str);
        zzzy zzzyVarZzd = zzzy.zzd(str);
        if (zzzyVarZzd.zzj()) {
            zzygVar.zzb(zzzyVarZzd);
        } else {
            this.zza.zzf(new zzzn(zzzyVarZzd.zzf()), new zzve(this, zzygVar));
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzN(zzzg zzzgVar, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzzgVar);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzc(zzzgVar, new zztr(this, zzxaVar));
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzO(zzzy zzzyVar, String str, String str2, Boolean bool, zze zzeVar, zzxa zzxaVar, zzyf zzyfVar) {
        Preconditions.checkNotNull(zzzyVar);
        Preconditions.checkNotNull(zzyfVar);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzg(new zzzo(zzzyVar.zze()), new zztu(this, zzyfVar, str2, str, bool, zzeVar, zzxaVar, zzzyVar));
    }

    private final void zzP(zzzv zzzvVar, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzzvVar);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzh(zzzvVar, new zzux(this, zzxaVar));
    }

    static /* bridge */ /* synthetic */ void zzd(zzvf zzvfVar, zzaba zzabaVar, zzxa zzxaVar, zzyf zzyfVar) {
        if (!zzabaVar.zzp()) {
            zzvfVar.zzO(new zzzy(zzabaVar.zzj(), zzabaVar.zzf(), Long.valueOf(zzabaVar.zzb()), "Bearer"), zzabaVar.zzi(), zzabaVar.zzh(), Boolean.valueOf(zzabaVar.zzo()), zzabaVar.zzc(), zzxaVar, zzyfVar);
            return;
        }
        zzxaVar.zze(new zztk(zzabaVar.zzn() ? new Status(FirebaseError.ERROR_ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL) : zzai.zza(zzabaVar.zze()), zzabaVar.zzc(), zzabaVar.zzd(), zzabaVar.zzk()));
    }

    static /* bridge */ /* synthetic */ void zze(zzvf zzvfVar, zzxa zzxaVar, zzzy zzzyVar, zzaao zzaaoVar, zzyf zzyfVar) {
        Preconditions.checkNotNull(zzxaVar);
        Preconditions.checkNotNull(zzzyVar);
        Preconditions.checkNotNull(zzaaoVar);
        Preconditions.checkNotNull(zzyfVar);
        zzvfVar.zza.zzg(new zzzo(zzzyVar.zze()), new zzts(zzvfVar, zzyfVar, zzxaVar, zzzyVar, zzaaoVar));
    }

    static /* bridge */ /* synthetic */ void zzf(zzvf zzvfVar, zzxa zzxaVar, zzzy zzzyVar, zzzr zzzrVar, zzaao zzaaoVar, zzyf zzyfVar) {
        Preconditions.checkNotNull(zzxaVar);
        Preconditions.checkNotNull(zzzyVar);
        Preconditions.checkNotNull(zzzrVar);
        Preconditions.checkNotNull(zzaaoVar);
        Preconditions.checkNotNull(zzyfVar);
        zzvfVar.zza.zzl(zzaaoVar, new zztt(zzvfVar, zzaaoVar, zzzrVar, zzxaVar, zzzyVar, zzyfVar));
    }

    public final void zzA(zzaay zzaayVar, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzaayVar);
        Preconditions.checkNotNull(zzxaVar);
        zzaayVar.zzd(true);
        this.zza.zzq(zzaayVar, new zzuy(this, zzxaVar));
    }

    public final void zzB(zzabb zzabbVar, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzabbVar);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzr(zzabbVar, new zzun(this, zzxaVar));
    }

    public final void zzC(String str, String str2, String str3, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzs(new zzabe(str, str2, str3), new zztp(this, zzxaVar));
    }

    public final void zzD(EmailAuthCredential emailAuthCredential, zzxa zzxaVar) {
        Preconditions.checkNotNull(emailAuthCredential);
        Preconditions.checkNotNull(zzxaVar);
        if (emailAuthCredential.zzh()) {
            zzM(emailAuthCredential.zzc(), new zztq(this, emailAuthCredential, zzxaVar));
        } else {
            zzN(new zzzg(emailAuthCredential, null), zzxaVar);
        }
    }

    public final void zzE(zzabg zzabgVar, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzabgVar);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzt(zzabgVar, new zzub(this, zzxaVar));
    }

    public final void zzF(zzaas zzaasVar, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzaasVar);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzo(zzaasVar, new zzum(this, zzxaVar));
    }

    public final void zzG(zzaau zzaauVar, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzaauVar);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzp(zzaauVar, new zzur(this, zzxaVar));
    }

    public final void zzH(String str, String str2, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzul(this, str2, zzxaVar));
    }

    public final void zzI(String str, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzuh(this, zzxaVar));
    }

    public final void zzJ(String str, String str2, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str2, new zzuj(this, str, zzxaVar));
    }

    public final void zzK(String str, UserProfileChangeRequest userProfileChangeRequest, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(userProfileChangeRequest);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzva(this, userProfileChangeRequest, zzxaVar));
    }

    public final void zzL(zzzv zzzvVar, zzxa zzxaVar) {
        zzP(zzzvVar, zzxaVar);
    }

    public final void zzg(String str, String str2, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        zzaao zzaaoVar = new zzaao();
        zzaaoVar.zzf(str);
        zzaaoVar.zzi(str2);
        this.zza.zzl(zzaaoVar, new zzvd(this, zzxaVar));
    }

    public final void zzh(String str, String str2, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzvb(this, str2, zzxaVar));
    }

    public final void zzi(String str, String str2, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzvc(this, str2, zzxaVar));
    }

    public final void zzj(String str, String str2, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzj(new zzaai(str, null, str2), new zztx(this, zzxaVar));
    }

    public final void zzk(String str, String str2, String str3, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzj(new zzaai(str, str2, str3), new zztz(this, zzxaVar));
    }

    public final void zzl(String str, String str2, String str3, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzn(new zzaaq(str, str2, null, str3), new zzto(this, zzxaVar));
    }

    public final void zzm(String str, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzuv(this, zzxaVar));
    }

    public final void zzn(zzzi zzziVar, String str, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzziVar);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzup(this, zzziVar, zzxaVar));
    }

    public final void zzo(zzzk zzzkVar, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzzkVar);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zze(zzzkVar, new zzuq(this, zzxaVar));
    }

    public final void zzp(String str, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzf(new zzzn(str), new zzty(this, zzxaVar));
    }

    public final void zzq(String str, String str2, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zza(new zzzc(str, str2), new zztv(this, zzxaVar));
    }

    public final void zzr(String str, String str2, String str3, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotEmpty(str3);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str3, new zzuc(this, str, str2, zzxaVar));
    }

    public final void zzs(String str, zzaay zzaayVar, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzaayVar);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzug(this, zzaayVar, zzxaVar));
    }

    public final void zzt(String str, zzabg zzabgVar, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzabgVar);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzue(this, zzabgVar, zzxaVar));
    }

    public final void zzu(String str, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        zzM(str, new zzut(this, zzxaVar));
    }

    public final void zzv(String str, ActionCodeSettings actionCodeSettings, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        zzzv zzzvVar = new zzzv(4);
        zzzvVar.zzg(str);
        if (actionCodeSettings != null) {
            zzzvVar.zzd(actionCodeSettings);
        }
        zzP(zzzvVar, zzxaVar);
    }

    public final void zzw(String str, ActionCodeSettings actionCodeSettings, String str2, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzxaVar);
        zzzv zzzvVar = new zzzv(actionCodeSettings.zza());
        zzzvVar.zze(str);
        zzzvVar.zzd(actionCodeSettings);
        zzzvVar.zzf(str2);
        this.zza.zzh(zzzvVar, new zztw(this, zzxaVar));
    }

    public final void zzx(zzaal zzaalVar, zzxa zzxaVar) {
        Preconditions.checkNotEmpty(zzaalVar.zzd());
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzk(zzaalVar, new zzua(this, zzxaVar));
    }

    public final void zzy(String str, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzm(str, new zzuw(this, zzxaVar));
    }

    public final void zzz(String str, zzxa zzxaVar) {
        Preconditions.checkNotNull(zzxaVar);
        this.zza.zzn(new zzaaq(str), new zzuz(this, zzxaVar));
    }
}
