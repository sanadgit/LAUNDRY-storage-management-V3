package com.google.android.gms.internal.p001firebaseauthapi;

import android.app.Activity;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.PhoneAuthProvider;
import com.google.firebase.auth.internal.zzao;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzyb implements zzyd {
    private boolean zza;
    protected final int zzb;
    protected FirebaseApp zzd;
    protected FirebaseUser zze;
    protected Object zzf;
    protected zzao zzg;
    protected Executor zzi;
    protected zzzy zzj;
    protected zzzr zzk;
    protected zzzd zzl;
    protected zzaaj zzm;
    protected String zzn;
    protected String zzo;
    protected AuthCredential zzp;
    protected String zzq;
    protected String zzr;
    protected zztm zzs;
    Object zzt;
    Status zzu;
    protected zzya zzv;
    final zzxy zzc = new zzxy(this);
    protected final List zzh = new ArrayList();

    public zzyb(int i) {
        this.zzb = i;
    }

    static /* bridge */ /* synthetic */ void zzj(zzyb zzybVar) {
        zzybVar.zzb();
        Preconditions.checkState(zzybVar.zza, "no success or failure set on method implementation");
    }

    static /* bridge */ /* synthetic */ void zzk(zzyb zzybVar, Status status) {
        zzao zzaoVar = zzybVar.zzg;
        if (zzaoVar != null) {
            zzaoVar.zzb(status);
        }
    }

    public abstract void zzb();

    public final zzyb zzd(Object obj) {
        this.zzf = Preconditions.checkNotNull(obj, "external callback cannot be null");
        return this;
    }

    public final zzyb zze(zzao zzaoVar) {
        this.zzg = (zzao) Preconditions.checkNotNull(zzaoVar, "external failure callback cannot be null");
        return this;
    }

    public final zzyb zzf(FirebaseApp firebaseApp) {
        this.zzd = (FirebaseApp) Preconditions.checkNotNull(firebaseApp, "firebaseApp cannot be null");
        return this;
    }

    public final zzyb zzg(FirebaseUser firebaseUser) {
        this.zze = (FirebaseUser) Preconditions.checkNotNull(firebaseUser, "firebaseUser cannot be null");
        return this;
    }

    public final zzyb zzh(PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Activity activity, Executor executor, String str) {
        PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacksZza = zzyp.zza(str, onVerificationStateChangedCallbacks, this);
        synchronized (this.zzh) {
            this.zzh.add((PhoneAuthProvider.OnVerificationStateChangedCallbacks) Preconditions.checkNotNull(onVerificationStateChangedCallbacksZza));
        }
        if (activity != null) {
            zzxs.zza(activity, this.zzh);
        }
        this.zzi = (Executor) Preconditions.checkNotNull(executor);
        return this;
    }

    public final void zzl(Status status) {
        this.zza = true;
        this.zzu = status;
        this.zzv.zza(null, status);
    }

    public final void zzm(Object obj) {
        this.zza = true;
        this.zzt = obj;
        this.zzv.zza(obj, null);
    }
}
