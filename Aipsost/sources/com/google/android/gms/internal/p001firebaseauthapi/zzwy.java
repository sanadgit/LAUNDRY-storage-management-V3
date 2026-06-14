package com.google.android.gms.internal.p001firebaseauthapi;

import android.app.Activity;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseError;
import com.google.firebase.auth.ActionCodeSettings;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.EmailAuthCredential;
import com.google.firebase.auth.FirebaseAuthProvider;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.PhoneAuthProvider;
import com.google.firebase.auth.PhoneMultiFactorAssertion;
import com.google.firebase.auth.PhoneMultiFactorInfo;
import com.google.firebase.auth.UserProfileChangeRequest;
import com.google.firebase.auth.internal.zzag;
import com.google.firebase.auth.internal.zzan;
import com.google.firebase.auth.internal.zzba;
import com.google.firebase.auth.internal.zzbk;
import com.google.firebase.auth.internal.zzg;
import com.google.firebase.auth.internal.zzt;
import com.google.firebase.auth.internal.zzx;
import com.google.firebase.auth.internal.zzz;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzwy extends zzye {
    public zzwy(FirebaseApp firebaseApp) {
        this.zza = new zzxb(firebaseApp);
        this.zzb = Executors.newCachedThreadPool();
    }

    static zzx zzN(FirebaseApp firebaseApp, zzzr zzzrVar) {
        Preconditions.checkNotNull(firebaseApp);
        Preconditions.checkNotNull(zzzrVar);
        ArrayList arrayList = new ArrayList();
        arrayList.add(new zzt(zzzrVar, FirebaseAuthProvider.PROVIDER_ID));
        List listZzr = zzzrVar.zzr();
        if (listZzr != null && !listZzr.isEmpty()) {
            for (int i = 0; i < listZzr.size(); i++) {
                arrayList.add(new zzt((zzaae) listZzr.get(i)));
            }
        }
        zzx zzxVar = new zzx(firebaseApp, arrayList);
        zzxVar.zzr(new zzz(zzzrVar.zzb(), zzzrVar.zza()));
        zzxVar.zzq(zzzrVar.zzt());
        zzxVar.zzp(zzzrVar.zzd());
        zzxVar.zzi(zzba.zzb(zzzrVar.zzq()));
        return zzxVar;
    }

    public final Task zzA(FirebaseApp firebaseApp, String str, String str2, String str3, zzg zzgVar) {
        zzwj zzwjVar = new zzwj(str, str2, str3);
        zzwjVar.zzf(firebaseApp);
        zzwjVar.zzd(zzgVar);
        return zzP(zzwjVar);
    }

    public final Task zzB(FirebaseApp firebaseApp, EmailAuthCredential emailAuthCredential, zzg zzgVar) {
        zzwk zzwkVar = new zzwk(emailAuthCredential);
        zzwkVar.zzf(firebaseApp);
        zzwkVar.zzd(zzgVar);
        return zzP(zzwkVar);
    }

    public final Task zzC(FirebaseApp firebaseApp, PhoneAuthCredential phoneAuthCredential, String str, zzg zzgVar) {
        zzyp.zzc();
        zzwl zzwlVar = new zzwl(phoneAuthCredential, str);
        zzwlVar.zzf(firebaseApp);
        zzwlVar.zzd(zzgVar);
        return zzP(zzwlVar);
    }

    public final Task zzD(zzag zzagVar, String str, String str2, long j, boolean z, boolean z2, String str3, String str4, boolean z3, PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Executor executor, Activity activity) {
        zzwm zzwmVar = new zzwm(zzagVar, str, str2, j, z, z2, str3, str4, z3);
        zzwmVar.zzh(onVerificationStateChangedCallbacks, activity, executor, str);
        return zzP(zzwmVar);
    }

    public final Task zzE(zzag zzagVar, PhoneMultiFactorInfo phoneMultiFactorInfo, String str, long j, boolean z, boolean z2, String str2, String str3, boolean z3, PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Executor executor, Activity activity) {
        zzwn zzwnVar = new zzwn(phoneMultiFactorInfo, Preconditions.checkNotEmpty(zzagVar.zzd()), str, j, z, z2, str2, str3, z3);
        zzwnVar.zzh(onVerificationStateChangedCallbacks, activity, executor, phoneMultiFactorInfo.getUid());
        return zzP(zzwnVar);
    }

    public final Task zzF(FirebaseApp firebaseApp, FirebaseUser firebaseUser, String str, zzbk zzbkVar) {
        zzwo zzwoVar = new zzwo(firebaseUser.zzf(), str);
        zzwoVar.zzf(firebaseApp);
        zzwoVar.zzg(firebaseUser);
        zzwoVar.zzd(zzbkVar);
        zzwoVar.zze(zzbkVar);
        return zzP(zzwoVar);
    }

    public final Task zzG(FirebaseApp firebaseApp, FirebaseUser firebaseUser, String str, zzbk zzbkVar) {
        Preconditions.checkNotNull(firebaseApp);
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(zzbkVar);
        List listZzg = firebaseUser.zzg();
        if ((listZzg != null && !listZzg.contains(str)) || firebaseUser.isAnonymous()) {
            return Tasks.forException(zzxc.zza(new Status(FirebaseError.ERROR_NO_SUCH_PROVIDER, str)));
        }
        switch (str) {
            case "password":
                zzwp zzwpVar = new zzwp();
                zzwpVar.zzf(firebaseApp);
                zzwpVar.zzg(firebaseUser);
                zzwpVar.zzd(zzbkVar);
                zzwpVar.zze(zzbkVar);
                return zzP(zzwpVar);
            default:
                zzwq zzwqVar = new zzwq(str);
                zzwqVar.zzf(firebaseApp);
                zzwqVar.zzg(firebaseUser);
                zzwqVar.zzd(zzbkVar);
                zzwqVar.zze(zzbkVar);
                return zzP(zzwqVar);
        }
    }

    public final Task zzH(FirebaseApp firebaseApp, FirebaseUser firebaseUser, String str, zzbk zzbkVar) {
        zzwr zzwrVar = new zzwr(str);
        zzwrVar.zzf(firebaseApp);
        zzwrVar.zzg(firebaseUser);
        zzwrVar.zzd(zzbkVar);
        zzwrVar.zze(zzbkVar);
        return zzP(zzwrVar);
    }

    public final Task zzI(FirebaseApp firebaseApp, FirebaseUser firebaseUser, String str, zzbk zzbkVar) {
        zzws zzwsVar = new zzws(str);
        zzwsVar.zzf(firebaseApp);
        zzwsVar.zzg(firebaseUser);
        zzwsVar.zzd(zzbkVar);
        zzwsVar.zze(zzbkVar);
        return zzP(zzwsVar);
    }

    public final Task zzJ(FirebaseApp firebaseApp, FirebaseUser firebaseUser, PhoneAuthCredential phoneAuthCredential, zzbk zzbkVar) {
        zzyp.zzc();
        zzwt zzwtVar = new zzwt(phoneAuthCredential);
        zzwtVar.zzf(firebaseApp);
        zzwtVar.zzg(firebaseUser);
        zzwtVar.zzd(zzbkVar);
        zzwtVar.zze(zzbkVar);
        return zzP(zzwtVar);
    }

    public final Task zzK(FirebaseApp firebaseApp, FirebaseUser firebaseUser, UserProfileChangeRequest userProfileChangeRequest, zzbk zzbkVar) {
        zzwu zzwuVar = new zzwu(userProfileChangeRequest);
        zzwuVar.zzf(firebaseApp);
        zzwuVar.zzg(firebaseUser);
        zzwuVar.zzd(zzbkVar);
        zzwuVar.zze(zzbkVar);
        return zzP(zzwuVar);
    }

    public final Task zzL(String str, String str2, ActionCodeSettings actionCodeSettings) {
        actionCodeSettings.zzg(7);
        return zzP(new zzwv(str, str2, actionCodeSettings));
    }

    public final Task zzM(FirebaseApp firebaseApp, String str, String str2) {
        zzww zzwwVar = new zzww(str, str2);
        zzwwVar.zzf(firebaseApp);
        return zzP(zzwwVar);
    }

    public final void zzO(FirebaseApp firebaseApp, zzaal zzaalVar, PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Activity activity, Executor executor) {
        zzwx zzwxVar = new zzwx(zzaalVar);
        zzwxVar.zzf(firebaseApp);
        zzwxVar.zzh(onVerificationStateChangedCallbacks, activity, executor, zzaalVar.zzd());
        zzP(zzwxVar);
    }

    public final Task zza(FirebaseApp firebaseApp, String str, String str2) {
        zzvh zzvhVar = new zzvh(str, str2);
        zzvhVar.zzf(firebaseApp);
        return zzP(zzvhVar);
    }

    public final Task zzb(FirebaseApp firebaseApp, String str, String str2) {
        zzvi zzviVar = new zzvi(str, str2);
        zzviVar.zzf(firebaseApp);
        return zzP(zzviVar);
    }

    public final Task zzc(FirebaseApp firebaseApp, String str, String str2, String str3) {
        zzvj zzvjVar = new zzvj(str, str2, str3);
        zzvjVar.zzf(firebaseApp);
        return zzP(zzvjVar);
    }

    public final Task zzd(FirebaseApp firebaseApp, String str, String str2, String str3, zzg zzgVar) {
        zzvk zzvkVar = new zzvk(str, str2, str3);
        zzvkVar.zzf(firebaseApp);
        zzvkVar.zzd(zzgVar);
        return zzP(zzvkVar);
    }

    public final Task zze(FirebaseUser firebaseUser, zzan zzanVar) {
        zzvl zzvlVar = new zzvl();
        zzvlVar.zzg(firebaseUser);
        zzvlVar.zzd(zzanVar);
        zzvlVar.zze(zzanVar);
        return zzP(zzvlVar);
    }

    public final Task zzf(FirebaseApp firebaseApp, String str, String str2) {
        zzvm zzvmVar = new zzvm(str, str2);
        zzvmVar.zzf(firebaseApp);
        return zzP(zzvmVar);
    }

    public final Task zzg(FirebaseApp firebaseApp, PhoneMultiFactorAssertion phoneMultiFactorAssertion, FirebaseUser firebaseUser, String str, zzg zzgVar) {
        zzyp.zzc();
        zzvn zzvnVar = new zzvn(phoneMultiFactorAssertion, firebaseUser.zzf(), str);
        zzvnVar.zzf(firebaseApp);
        zzvnVar.zzd(zzgVar);
        return zzP(zzvnVar);
    }

    public final Task zzh(FirebaseApp firebaseApp, FirebaseUser firebaseUser, PhoneMultiFactorAssertion phoneMultiFactorAssertion, String str, zzg zzgVar) {
        zzyp.zzc();
        zzvo zzvoVar = new zzvo(phoneMultiFactorAssertion, str);
        zzvoVar.zzf(firebaseApp);
        zzvoVar.zzd(zzgVar);
        if (firebaseUser != null) {
            zzvoVar.zzg(firebaseUser);
        }
        return zzP(zzvoVar);
    }

    public final Task zzi(FirebaseApp firebaseApp, FirebaseUser firebaseUser, String str, zzbk zzbkVar) {
        zzvp zzvpVar = new zzvp(str);
        zzvpVar.zzf(firebaseApp);
        zzvpVar.zzg(firebaseUser);
        zzvpVar.zzd(zzbkVar);
        zzvpVar.zze(zzbkVar);
        return zzP(zzvpVar);
    }

    public final Task zzj(FirebaseApp firebaseApp, FirebaseUser firebaseUser, AuthCredential authCredential, zzbk zzbkVar) {
        Preconditions.checkNotNull(firebaseApp);
        Preconditions.checkNotNull(authCredential);
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(zzbkVar);
        List listZzg = firebaseUser.zzg();
        if (listZzg != null && listZzg.contains(authCredential.getProvider())) {
            return Tasks.forException(zzxc.zza(new Status(FirebaseError.ERROR_PROVIDER_ALREADY_LINKED)));
        }
        if (authCredential instanceof EmailAuthCredential) {
            EmailAuthCredential emailAuthCredential = (EmailAuthCredential) authCredential;
            if (emailAuthCredential.zzg()) {
                zzvt zzvtVar = new zzvt(emailAuthCredential);
                zzvtVar.zzf(firebaseApp);
                zzvtVar.zzg(firebaseUser);
                zzvtVar.zzd(zzbkVar);
                zzvtVar.zze(zzbkVar);
                return zzP(zzvtVar);
            }
            zzvq zzvqVar = new zzvq(emailAuthCredential);
            zzvqVar.zzf(firebaseApp);
            zzvqVar.zzg(firebaseUser);
            zzvqVar.zzd(zzbkVar);
            zzvqVar.zze(zzbkVar);
            return zzP(zzvqVar);
        }
        if (authCredential instanceof PhoneAuthCredential) {
            zzyp.zzc();
            zzvs zzvsVar = new zzvs((PhoneAuthCredential) authCredential);
            zzvsVar.zzf(firebaseApp);
            zzvsVar.zzg(firebaseUser);
            zzvsVar.zzd(zzbkVar);
            zzvsVar.zze(zzbkVar);
            return zzP(zzvsVar);
        }
        Preconditions.checkNotNull(firebaseApp);
        Preconditions.checkNotNull(authCredential);
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(zzbkVar);
        zzvr zzvrVar = new zzvr(authCredential);
        zzvrVar.zzf(firebaseApp);
        zzvrVar.zzg(firebaseUser);
        zzvrVar.zzd(zzbkVar);
        zzvrVar.zze(zzbkVar);
        return zzP(zzvrVar);
    }

    public final Task zzk(FirebaseApp firebaseApp, FirebaseUser firebaseUser, AuthCredential authCredential, String str, zzbk zzbkVar) {
        zzvu zzvuVar = new zzvu(authCredential, str);
        zzvuVar.zzf(firebaseApp);
        zzvuVar.zzg(firebaseUser);
        zzvuVar.zzd(zzbkVar);
        zzvuVar.zze(zzbkVar);
        return zzP(zzvuVar);
    }

    public final Task zzl(FirebaseApp firebaseApp, FirebaseUser firebaseUser, AuthCredential authCredential, String str, zzbk zzbkVar) {
        zzvv zzvvVar = new zzvv(authCredential, str);
        zzvvVar.zzf(firebaseApp);
        zzvvVar.zzg(firebaseUser);
        zzvvVar.zzd(zzbkVar);
        zzvvVar.zze(zzbkVar);
        return zzP(zzvvVar);
    }

    public final Task zzm(FirebaseApp firebaseApp, FirebaseUser firebaseUser, EmailAuthCredential emailAuthCredential, zzbk zzbkVar) {
        zzvw zzvwVar = new zzvw(emailAuthCredential);
        zzvwVar.zzf(firebaseApp);
        zzvwVar.zzg(firebaseUser);
        zzvwVar.zzd(zzbkVar);
        zzvwVar.zze(zzbkVar);
        return zzP(zzvwVar);
    }

    public final Task zzn(FirebaseApp firebaseApp, FirebaseUser firebaseUser, EmailAuthCredential emailAuthCredential, zzbk zzbkVar) {
        zzvx zzvxVar = new zzvx(emailAuthCredential);
        zzvxVar.zzf(firebaseApp);
        zzvxVar.zzg(firebaseUser);
        zzvxVar.zzd(zzbkVar);
        zzvxVar.zze(zzbkVar);
        return zzP(zzvxVar);
    }

    public final Task zzo(FirebaseApp firebaseApp, FirebaseUser firebaseUser, String str, String str2, String str3, zzbk zzbkVar) {
        zzvy zzvyVar = new zzvy(str, str2, str3);
        zzvyVar.zzf(firebaseApp);
        zzvyVar.zzg(firebaseUser);
        zzvyVar.zzd(zzbkVar);
        zzvyVar.zze(zzbkVar);
        return zzP(zzvyVar);
    }

    public final Task zzp(FirebaseApp firebaseApp, FirebaseUser firebaseUser, String str, String str2, String str3, zzbk zzbkVar) {
        zzvz zzvzVar = new zzvz(str, str2, str3);
        zzvzVar.zzf(firebaseApp);
        zzvzVar.zzg(firebaseUser);
        zzvzVar.zzd(zzbkVar);
        zzvzVar.zze(zzbkVar);
        return zzP(zzvzVar);
    }

    public final Task zzq(FirebaseApp firebaseApp, FirebaseUser firebaseUser, PhoneAuthCredential phoneAuthCredential, String str, zzbk zzbkVar) {
        zzyp.zzc();
        zzwa zzwaVar = new zzwa(phoneAuthCredential, str);
        zzwaVar.zzf(firebaseApp);
        zzwaVar.zzg(firebaseUser);
        zzwaVar.zzd(zzbkVar);
        zzwaVar.zze(zzbkVar);
        return zzP(zzwaVar);
    }

    public final Task zzr(FirebaseApp firebaseApp, FirebaseUser firebaseUser, PhoneAuthCredential phoneAuthCredential, String str, zzbk zzbkVar) {
        zzyp.zzc();
        zzwb zzwbVar = new zzwb(phoneAuthCredential, str);
        zzwbVar.zzf(firebaseApp);
        zzwbVar.zzg(firebaseUser);
        zzwbVar.zzd(zzbkVar);
        zzwbVar.zze(zzbkVar);
        return zzP(zzwbVar);
    }

    public final Task zzs(FirebaseApp firebaseApp, FirebaseUser firebaseUser, zzbk zzbkVar) {
        zzwc zzwcVar = new zzwc();
        zzwcVar.zzf(firebaseApp);
        zzwcVar.zzg(firebaseUser);
        zzwcVar.zzd(zzbkVar);
        zzwcVar.zze(zzbkVar);
        return zzP(zzwcVar);
    }

    public final Task zzt(FirebaseApp firebaseApp, ActionCodeSettings actionCodeSettings, String str) {
        zzwd zzwdVar = new zzwd(str, actionCodeSettings);
        zzwdVar.zzf(firebaseApp);
        return zzP(zzwdVar);
    }

    public final Task zzu(FirebaseApp firebaseApp, String str, ActionCodeSettings actionCodeSettings, String str2) {
        actionCodeSettings.zzg(1);
        zzwe zzweVar = new zzwe(str, actionCodeSettings, str2, "sendPasswordResetEmail");
        zzweVar.zzf(firebaseApp);
        return zzP(zzweVar);
    }

    public final Task zzv(FirebaseApp firebaseApp, String str, ActionCodeSettings actionCodeSettings, String str2) {
        actionCodeSettings.zzg(6);
        zzwe zzweVar = new zzwe(str, actionCodeSettings, str2, "sendSignInLinkToEmail");
        zzweVar.zzf(firebaseApp);
        return zzP(zzweVar);
    }

    public final Task zzw(String str) {
        return zzP(new zzwf(str));
    }

    public final Task zzx(FirebaseApp firebaseApp, zzg zzgVar, String str) {
        zzwg zzwgVar = new zzwg(str);
        zzwgVar.zzf(firebaseApp);
        zzwgVar.zzd(zzgVar);
        return zzP(zzwgVar);
    }

    public final Task zzy(FirebaseApp firebaseApp, AuthCredential authCredential, String str, zzg zzgVar) {
        zzwh zzwhVar = new zzwh(authCredential, str);
        zzwhVar.zzf(firebaseApp);
        zzwhVar.zzd(zzgVar);
        return zzP(zzwhVar);
    }

    public final Task zzz(FirebaseApp firebaseApp, String str, String str2, zzg zzgVar) {
        zzwi zzwiVar = new zzwi(str, str2);
        zzwiVar.zzf(firebaseApp);
        zzwiVar.zzd(zzgVar);
        return zzP(zzwiVar);
    }
}
