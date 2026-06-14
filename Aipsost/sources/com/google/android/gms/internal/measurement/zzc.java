package com.google.android.gms.internal.measurement;

import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.Callable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzc {
    final zzf zza;
    zzg zzb;
    final zzab zzc;
    private final zzz zzd;

    public zzc() {
        zzf zzfVar = new zzf();
        this.zza = zzfVar;
        this.zzb = zzfVar.zzb.zzc();
        this.zzc = new zzab();
        this.zzd = new zzz();
        zzfVar.zzd.zza("internal.registerCallback", new Callable(this) { // from class: com.google.android.gms.internal.measurement.zza
            private final zzc zza;

            {
                this.zza = this;
            }

            @Override // java.util.concurrent.Callable
            public final Object call() {
                return this.zza.zzg();
            }
        });
        zzfVar.zzd.zza("internal.eventLogger", new Callable(this) { // from class: com.google.android.gms.internal.measurement.zzb
            private final zzc zza;

            {
                this.zza = this;
            }

            @Override // java.util.concurrent.Callable
            public final Object call() {
                return new zzk(this.zza.zzc);
            }
        });
    }

    public final void zza(String str, Callable<? extends zzai> callable) {
        this.zza.zzd.zza(str, callable);
    }

    public final boolean zzb(zzaa zzaaVar) throws zzd {
        try {
            this.zzc.zzb(zzaaVar);
            this.zza.zzc.zze("runtime.counter", new zzah(Double.valueOf(0.0d)));
            this.zzd.zzb(this.zzb.zzc(), this.zzc);
            if (zzc()) {
                return true;
            }
            return zzd();
        } catch (Throwable th) {
            throw new zzd(th);
        }
    }

    public final boolean zzc() {
        return !this.zzc.zzc().equals(this.zzc.zza());
    }

    public final boolean zzd() {
        return !this.zzc.zzf().isEmpty();
    }

    public final zzab zze() {
        return this.zzc;
    }

    public final void zzf(zzgo zzgoVar) throws zzd {
        zzai zzaiVar;
        try {
            this.zzb = this.zza.zzb.zzc();
            if (this.zza.zza(this.zzb, (zzgt[]) zzgoVar.zza().toArray(new zzgt[0])) instanceof zzag) {
                throw new IllegalStateException("Program loading failed");
            }
            for (zzgm zzgmVar : zzgoVar.zzb().zza()) {
                List<zzgt> listZzb = zzgmVar.zzb();
                String strZza = zzgmVar.zza();
                Iterator<zzgt> it = listZzb.iterator();
                while (it.hasNext()) {
                    zzap zzapVarZza = this.zza.zza(this.zzb, it.next());
                    if (!(zzapVarZza instanceof zzam)) {
                        throw new IllegalArgumentException("Invalid rule definition");
                    }
                    zzg zzgVar = this.zzb;
                    if (zzgVar.zzd(strZza)) {
                        zzap zzapVarZzh = zzgVar.zzh(strZza);
                        if (!(zzapVarZzh instanceof zzai)) {
                            String strValueOf = String.valueOf(strZza);
                            throw new IllegalStateException(strValueOf.length() != 0 ? "Invalid function name: ".concat(strValueOf) : new String("Invalid function name: "));
                        }
                        zzaiVar = (zzai) zzapVarZzh;
                    } else {
                        zzaiVar = null;
                    }
                    if (zzaiVar == null) {
                        String strValueOf2 = String.valueOf(strZza);
                        throw new IllegalStateException(strValueOf2.length() != 0 ? "Rule function is undefined: ".concat(strValueOf2) : new String("Rule function is undefined: "));
                    }
                    zzaiVar.zza(this.zzb, Collections.singletonList(zzapVarZza));
                }
            }
        } catch (Throwable th) {
            throw new zzd(th);
        }
    }

    final /* synthetic */ zzai zzg() throws Exception {
        return new zzu(this.zzd);
    }
}
