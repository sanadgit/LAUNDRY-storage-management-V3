package com.google.android.gms.internal.p001firebaseauthapi;

import android.content.Context;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.logging.Logger;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.PhoneAuthCredential;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzxb {
    private static final Logger zza = new Logger("FirebaseAuth", "FirebaseAuthFallback:");
    private final zzvf zzb;
    private final zzyv zzc;

    zzxb(FirebaseApp firebaseApp) {
        Preconditions.checkNotNull(firebaseApp);
        Context applicationContext = firebaseApp.getApplicationContext();
        Preconditions.checkNotNull(applicationContext);
        this.zzb = new zzvf(new zzxp(firebaseApp, zzxo.zza(), null, null, null));
        this.zzc = new zzyv(applicationContext);
    }

    private static boolean zzG(long j, boolean z) {
        if (j > 0 && z) {
            return true;
        }
        zza.w("App hash will not be appended to the request.", new Object[0]);
        return false;
    }

    public final void zzA(zzsy zzsyVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzsyVar);
        Preconditions.checkNotNull(zzwzVar);
        String phoneNumber = zzsyVar.zzb().getPhoneNumber();
        zzxa zzxaVar = new zzxa(zzwzVar, zza);
        if (this.zzc.zzl(phoneNumber)) {
            if (!zzsyVar.zzg()) {
                this.zzc.zzi(zzxaVar, phoneNumber);
                return;
            }
            this.zzc.zzj(phoneNumber);
        }
        long jZza = zzsyVar.zza();
        boolean zZzh = zzsyVar.zzh();
        zzaau zzaauVarZzb = zzaau.zzb(zzsyVar.zzd(), zzsyVar.zzb().getUid(), zzsyVar.zzb().getPhoneNumber(), zzsyVar.zzc(), zzsyVar.zze(), zzsyVar.zzf());
        if (zzG(jZza, zZzh)) {
            zzaauVarZzb.zzd(new zzza(this.zzc.zzc()));
        }
        this.zzc.zzk(phoneNumber, zzxaVar, jZza, zZzh);
        this.zzb.zzG(zzaauVarZzb, new zzys(this.zzc, zzxaVar, phoneNumber));
    }

    public final void zzB(zzta zztaVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zztaVar);
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzH(zztaVar.zza(), zztaVar.zzb(), new zzxa(zzwzVar, zza));
    }

    public final void zzC(zztc zztcVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zztcVar);
        Preconditions.checkNotEmpty(zztcVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzI(zztcVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzD(zzte zzteVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzteVar);
        Preconditions.checkNotEmpty(zzteVar.zzb());
        Preconditions.checkNotEmpty(zzteVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzJ(zzteVar.zzb(), zzteVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzE(zztg zztgVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zztgVar);
        Preconditions.checkNotEmpty(zztgVar.zzb());
        Preconditions.checkNotNull(zztgVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzK(zztgVar.zzb(), zztgVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzF(zzti zztiVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zztiVar);
        this.zzb.zzL(zzzv.zzc(zztiVar.zza(), zztiVar.zzb(), zztiVar.zzc()), new zzxa(zzwzVar, zza));
    }

    public final void zza(zzqy zzqyVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzqyVar);
        Preconditions.checkNotEmpty(zzqyVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzg(zzqyVar.zza(), zzqyVar.zzb(), new zzxa(zzwzVar, zza));
    }

    public final void zzb(zzra zzraVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzraVar);
        Preconditions.checkNotEmpty(zzraVar.zza());
        Preconditions.checkNotEmpty(zzraVar.zzb());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzh(zzraVar.zza(), zzraVar.zzb(), new zzxa(zzwzVar, zza));
    }

    public final void zzc(zzrc zzrcVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzrcVar);
        Preconditions.checkNotEmpty(zzrcVar.zza());
        Preconditions.checkNotEmpty(zzrcVar.zzb());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzi(zzrcVar.zza(), zzrcVar.zzb(), new zzxa(zzwzVar, zza));
    }

    public final void zzd(zzre zzreVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzreVar);
        Preconditions.checkNotEmpty(zzreVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzj(zzreVar.zza(), zzreVar.zzb(), new zzxa(zzwzVar, zza));
    }

    public final void zze(zzrg zzrgVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzrgVar);
        Preconditions.checkNotEmpty(zzrgVar.zza());
        Preconditions.checkNotEmpty(zzrgVar.zzb());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzk(zzrgVar.zza(), zzrgVar.zzb(), zzrgVar.zzc(), new zzxa(zzwzVar, zza));
    }

    public final void zzf(zzri zzriVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzriVar);
        Preconditions.checkNotEmpty(zzriVar.zza());
        Preconditions.checkNotEmpty(zzriVar.zzb());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzl(zzriVar.zza(), zzriVar.zzb(), zzriVar.zzc(), new zzxa(zzwzVar, zza));
    }

    public final void zzg(zzrk zzrkVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzrkVar);
        Preconditions.checkNotEmpty(zzrkVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzm(zzrkVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzh(zzrm zzrmVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzrmVar);
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzn(zzzi.zzb(zzrmVar.zzb(), (String) Preconditions.checkNotNull(zzrmVar.zza().zzg()), (String) Preconditions.checkNotNull(zzrmVar.zza().getSmsCode()), zzrmVar.zzc()), zzrmVar.zzb(), new zzxa(zzwzVar, zza));
    }

    public final void zzi(zzro zzroVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzroVar);
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzo(zzzk.zzb(zzroVar.zzb(), (String) Preconditions.checkNotNull(zzroVar.zza().zzg()), (String) Preconditions.checkNotNull(zzroVar.zza().getSmsCode())), new zzxa(zzwzVar, zza));
    }

    public final void zzj(zzrq zzrqVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzrqVar);
        Preconditions.checkNotNull(zzwzVar);
        Preconditions.checkNotEmpty(zzrqVar.zza());
        this.zzb.zzp(zzrqVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzk(zzrs zzrsVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzrsVar);
        Preconditions.checkNotEmpty(zzrsVar.zza());
        this.zzb.zzq(zzrsVar.zza(), zzrsVar.zzb(), new zzxa(zzwzVar, zza));
    }

    public final void zzl(zzru zzruVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzruVar);
        Preconditions.checkNotEmpty(zzruVar.zzb());
        Preconditions.checkNotEmpty(zzruVar.zzc());
        Preconditions.checkNotEmpty(zzruVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzr(zzruVar.zzb(), zzruVar.zzc(), zzruVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzm(zzrw zzrwVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzrwVar);
        Preconditions.checkNotEmpty(zzrwVar.zzb());
        Preconditions.checkNotNull(zzrwVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzs(zzrwVar.zzb(), zzrwVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzn(zzry zzryVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzwzVar);
        Preconditions.checkNotNull(zzryVar);
        PhoneAuthCredential phoneAuthCredential = (PhoneAuthCredential) Preconditions.checkNotNull(zzryVar.zza());
        this.zzb.zzt(Preconditions.checkNotEmpty(zzryVar.zzb()), zzyl.zza(phoneAuthCredential), new zzxa(zzwzVar, zza));
    }

    public final void zzo(zzsa zzsaVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzsaVar);
        Preconditions.checkNotEmpty(zzsaVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzu(zzsaVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzp(zzsc zzscVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzscVar);
        Preconditions.checkNotEmpty(zzscVar.zzb());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzv(zzscVar.zzb(), zzscVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzq(zzse zzseVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzseVar);
        Preconditions.checkNotEmpty(zzseVar.zzb());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzw(zzseVar.zzb(), zzseVar.zza(), zzseVar.zzc(), new zzxa(zzwzVar, zza));
    }

    public final void zzr(zzsg zzsgVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzwzVar);
        Preconditions.checkNotNull(zzsgVar);
        zzaal zzaalVar = (zzaal) Preconditions.checkNotNull(zzsgVar.zza());
        String strZzd = zzaalVar.zzd();
        zzxa zzxaVar = new zzxa(zzwzVar, zza);
        if (this.zzc.zzl(strZzd)) {
            if (!zzaalVar.zzf()) {
                this.zzc.zzi(zzxaVar, strZzd);
                return;
            }
            this.zzc.zzj(strZzd);
        }
        long jZzb = zzaalVar.zzb();
        boolean zZzg = zzaalVar.zzg();
        if (zzG(jZzb, zZzg)) {
            zzaalVar.zze(new zzza(this.zzc.zzc()));
        }
        this.zzc.zzk(strZzd, zzxaVar, jZzb, zZzg);
        this.zzb.zzx(zzaalVar, new zzys(this.zzc, zzxaVar, strZzd));
    }

    public final void zzs(zzsi zzsiVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzsiVar);
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzy(zzsiVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzt(zzsk zzskVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzskVar);
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzz(zzskVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzu(zzsm zzsmVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzsmVar);
        Preconditions.checkNotNull(zzsmVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzA(zzsmVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzv(zzso zzsoVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzsoVar);
        Preconditions.checkNotEmpty(zzsoVar.zzb());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzB(new zzabb(zzsoVar.zzb(), zzsoVar.zza()), new zzxa(zzwzVar, zza));
    }

    public final void zzw(zzsq zzsqVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzsqVar);
        Preconditions.checkNotEmpty(zzsqVar.zza());
        Preconditions.checkNotEmpty(zzsqVar.zzb());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzC(zzsqVar.zza(), zzsqVar.zzb(), zzsqVar.zzc(), new zzxa(zzwzVar, zza));
    }

    public final void zzx(zzss zzssVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzssVar);
        Preconditions.checkNotNull(zzssVar.zza());
        Preconditions.checkNotNull(zzwzVar);
        this.zzb.zzD(zzssVar.zza(), new zzxa(zzwzVar, zza));
    }

    public final void zzy(zzsu zzsuVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzwzVar);
        Preconditions.checkNotNull(zzsuVar);
        this.zzb.zzE(zzyl.zza((PhoneAuthCredential) Preconditions.checkNotNull(zzsuVar.zza())), new zzxa(zzwzVar, zza));
    }

    public final void zzz(zzsw zzswVar, zzwz zzwzVar) {
        Preconditions.checkNotNull(zzswVar);
        Preconditions.checkNotNull(zzwzVar);
        String strZzd = zzswVar.zzd();
        zzxa zzxaVar = new zzxa(zzwzVar, zza);
        if (this.zzc.zzl(strZzd)) {
            if (!zzswVar.zzg()) {
                this.zzc.zzi(zzxaVar, strZzd);
                return;
            }
            this.zzc.zzj(strZzd);
        }
        long jZza = zzswVar.zza();
        boolean zZzh = zzswVar.zzh();
        zzaas zzaasVarZzb = zzaas.zzb(zzswVar.zzb(), zzswVar.zzd(), zzswVar.zzc(), zzswVar.zze(), zzswVar.zzf());
        if (zzG(jZza, zZzh)) {
            zzaasVarZzb.zzd(new zzza(this.zzc.zzc()));
        }
        this.zzc.zzk(strZzd, zzxaVar, jZza, zZzh);
        this.zzb.zzF(zzaasVarZzb, new zzys(this.zzc, zzxaVar, strZzd));
    }
}
