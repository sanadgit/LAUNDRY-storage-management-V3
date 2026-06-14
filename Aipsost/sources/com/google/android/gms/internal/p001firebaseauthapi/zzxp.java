package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import android.util.Log;
import com.google.android.gms.common.internal.Preconditions;
import com.google.firebase.FirebaseApp;
import java.lang.reflect.InvocationTargetException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzxp extends zzyh implements zzyy {
    zzxq zza;
    private zzxj zzb;
    private zzxk zzc;
    private zzym zzd;
    private final zzxo zze;
    private final FirebaseApp zzf;
    private final String zzg;

    zzxp(FirebaseApp firebaseApp, zzxo zzxoVar, zzym zzymVar, zzxj zzxjVar, zzxk zzxkVar) {
        this.zzf = firebaseApp;
        String apiKey = firebaseApp.getOptions().getApiKey();
        this.zzg = apiKey;
        this.zze = (zzxo) Preconditions.checkNotNull(zzxoVar);
        zzw(null, null, null);
        zzyz.zze(apiKey, this);
    }

    private final zzxq zzv() {
        if (this.zza == null) {
            FirebaseApp firebaseApp = this.zzf;
            this.zza = new zzxq(firebaseApp.getApplicationContext(), firebaseApp, this.zze.zzb());
        }
        return this.zza;
    }

    private final void zzw(zzym zzymVar, zzxj zzxjVar, zzxk zzxkVar) {
        this.zzd = null;
        this.zzb = null;
        this.zzc = null;
        String strZza = zzyw.zza("firebear.secureToken");
        if (TextUtils.isEmpty(strZza)) {
            strZza = zzyz.zzd(this.zzg);
        } else {
            Log.e("LocalClient", "Found hermetic configuration for secureToken URL: ".concat(String.valueOf(strZza)));
        }
        if (this.zzd == null) {
            this.zzd = new zzym(strZza, zzv());
        }
        String strZza2 = zzyw.zza("firebear.identityToolkit");
        if (TextUtils.isEmpty(strZza2)) {
            strZza2 = zzyz.zzb(this.zzg);
        } else {
            Log.e("LocalClient", "Found hermetic configuration for identityToolkit URL: ".concat(String.valueOf(strZza2)));
        }
        if (this.zzb == null) {
            this.zzb = new zzxj(strZza2, zzv());
        }
        String strZza3 = zzyw.zza("firebear.identityToolkitV2");
        if (TextUtils.isEmpty(strZza3)) {
            strZza3 = zzyz.zzc(this.zzg);
        } else {
            Log.e("LocalClient", "Found hermetic configuration for identityToolkitV2 URL: ".concat(String.valueOf(strZza3)));
        }
        if (this.zzc == null) {
            this.zzc = new zzxk(strZza3, zzv());
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zza(zzzc zzzcVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzzcVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/createAuthUri", this.zzg), zzzcVar, zzygVar, zzzd.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzb(zzzf zzzfVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzzfVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/deleteAccount", this.zzg), zzzfVar, zzygVar, Void.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzc(zzzg zzzgVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzzgVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/emailLinkSignin", this.zzg), zzzgVar, zzygVar, zzzh.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzd(zzzi zzziVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzziVar);
        Preconditions.checkNotNull(zzygVar);
        zzxk zzxkVar = this.zzc;
        zzyj.zza(zzxkVar.zza("/accounts/mfaEnrollment:finalize", this.zzg), zzziVar, zzygVar, zzzj.class, zzxkVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zze(zzzk zzzkVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzzkVar);
        Preconditions.checkNotNull(zzygVar);
        zzxk zzxkVar = this.zzc;
        zzyj.zza(zzxkVar.zza("/accounts/mfaSignIn:finalize", this.zzg), zzzkVar, zzygVar, zzzl.class, zzxkVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzf(zzzn zzznVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzznVar);
        Preconditions.checkNotNull(zzygVar);
        zzym zzymVar = this.zzd;
        zzyj.zza(zzymVar.zza("/token", this.zzg), zzznVar, zzygVar, zzzy.class, zzymVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzg(zzzo zzzoVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzzoVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/getAccountInfo", this.zzg), zzzoVar, zzygVar, zzzp.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzh(zzzv zzzvVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzzvVar);
        Preconditions.checkNotNull(zzygVar);
        if (zzzvVar.zzb() != null) {
            zzv().zzc(zzzvVar.zzb().zze());
        }
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/getOobConfirmationCode", this.zzg), zzzvVar, zzygVar, zzzw.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyy
    public final void zzi() {
        zzw(null, null, null);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzj(zzaai zzaaiVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzaaiVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/resetPassword", this.zzg), zzaaiVar, zzygVar, zzaaj.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzk(zzaal zzaalVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzaalVar);
        Preconditions.checkNotNull(zzygVar);
        if (!TextUtils.isEmpty(zzaalVar.zzc())) {
            zzv().zzc(zzaalVar.zzc());
        }
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/sendVerificationCode", this.zzg), zzaalVar, zzygVar, zzaan.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzl(zzaao zzaaoVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzaaoVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/setAccountInfo", this.zzg), zzaaoVar, zzygVar, zzaap.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzm(String str, zzyg zzygVar) {
        Preconditions.checkNotNull(zzygVar);
        zzv().zzb(str);
        ((zzuw) zzygVar).zza.zzm();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzn(zzaaq zzaaqVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzaaqVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/signupNewUser", this.zzg), zzaaqVar, zzygVar, zzaar.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzo(zzaas zzaasVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzaasVar);
        Preconditions.checkNotNull(zzygVar);
        if (!TextUtils.isEmpty(zzaasVar.zzc())) {
            zzv().zzc(zzaasVar.zzc());
        }
        zzxk zzxkVar = this.zzc;
        zzyj.zza(zzxkVar.zza("/accounts/mfaEnrollment:start", this.zzg), zzaasVar, zzygVar, zzaat.class, zzxkVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzp(zzaau zzaauVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzaauVar);
        Preconditions.checkNotNull(zzygVar);
        if (!TextUtils.isEmpty(zzaauVar.zzc())) {
            zzv().zzc(zzaauVar.zzc());
        }
        zzxk zzxkVar = this.zzc;
        zzyj.zza(zzxkVar.zza("/accounts/mfaSignIn:start", this.zzg), zzaauVar, zzygVar, zzaav.class, zzxkVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzq(zzaay zzaayVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzaayVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/verifyAssertion", this.zzg), zzaayVar, zzygVar, zzaba.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzr(zzabb zzabbVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzabbVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/verifyCustomToken", this.zzg), zzabbVar, zzygVar, zzabc.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzs(zzabe zzabeVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzabeVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/verifyPassword", this.zzg), zzabeVar, zzygVar, zzabf.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzt(zzabg zzabgVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzabgVar);
        Preconditions.checkNotNull(zzygVar);
        zzxj zzxjVar = this.zzb;
        zzyj.zza(zzxjVar.zza("/verifyPhoneNumber", this.zzg), zzabgVar, zzygVar, zzabh.class, zzxjVar.zzb);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyh
    public final void zzu(zzabi zzabiVar, zzyg zzygVar) throws IllegalAccessException, InvocationTargetException {
        Preconditions.checkNotNull(zzabiVar);
        Preconditions.checkNotNull(zzygVar);
        zzxk zzxkVar = this.zzc;
        zzyj.zza(zzxkVar.zza("/accounts/mfaEnrollment:withdraw", this.zzg), zzabiVar, zzygVar, zzabj.class, zzxkVar.zzb);
    }
}
