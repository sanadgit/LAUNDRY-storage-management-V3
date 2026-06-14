package com.google.android.gms.measurement.internal;

import com.google.android.gms.internal.measurement.zzog;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzx extends zzw {
    final /* synthetic */ zzy zza;
    private final com.google.android.gms.internal.measurement.zzes zzh;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzx(zzy zzyVar, String str, int i, com.google.android.gms.internal.measurement.zzes zzesVar) {
        super(str, i);
        this.zza = zzyVar;
        this.zzh = zzesVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzw
    final int zza() {
        return this.zzh.zzb();
    }

    @Override // com.google.android.gms.measurement.internal.zzw
    final boolean zzb() {
        return true;
    }

    @Override // com.google.android.gms.measurement.internal.zzw
    final boolean zzc() {
        return false;
    }

    final boolean zzd(Long l, Long l2, com.google.android.gms.internal.measurement.zzgh zzghVar, boolean z) {
        zzog.zzb();
        boolean zZzn = this.zza.zzs.zzc().zzn(this.zzb, zzea.zzX);
        boolean zZze = this.zzh.zze();
        boolean zZzf = this.zzh.zzf();
        boolean zZzh = this.zzh.zzh();
        boolean z2 = zZze || zZzf || zZzh;
        Boolean boolZze = null;
        boolZze = null;
        boolZze = null;
        boolZze = null;
        boolZze = null;
        if (z && !z2) {
            this.zza.zzs.zzau().zzk().zzc("Property filter already evaluated true and it is not associated with an enhanced audience. audience ID, filter ID", Integer.valueOf(this.zzc), this.zzh.zza() ? Integer.valueOf(this.zzh.zzb()) : null);
            return true;
        }
        com.google.android.gms.internal.measurement.zzel zzelVarZzd = this.zzh.zzd();
        boolean zZzf2 = zzelVarZzd.zzf();
        if (zzghVar.zzf()) {
            if (zzelVarZzd.zzc()) {
                boolZze = zze(zzg(zzghVar.zzg(), zzelVarZzd.zzd()), zZzf2);
            } else {
                this.zza.zzs.zzau().zze().zzb("No number filter for long property. property", this.zza.zzs.zzm().zze(zzghVar.zzc()));
            }
        } else if (zzghVar.zzh()) {
            if (zzelVarZzd.zzc()) {
                boolZze = zze(zzh(zzghVar.zzi(), zzelVarZzd.zzd()), zZzf2);
            } else {
                this.zza.zzs.zzau().zze().zzb("No number filter for double property. property", this.zza.zzs.zzm().zze(zzghVar.zzc()));
            }
        } else if (!zzghVar.zzd()) {
            this.zza.zzs.zzau().zze().zzb("User property has no value, property", this.zza.zzs.zzm().zze(zzghVar.zzc()));
        } else if (zzelVarZzd.zza()) {
            boolZze = zze(zzf(zzghVar.zze(), zzelVarZzd.zzb(), this.zza.zzs.zzau()), zZzf2);
        } else if (!zzelVarZzd.zzc()) {
            this.zza.zzs.zzau().zze().zzb("No string or number filter defined. property", this.zza.zzs.zzm().zze(zzghVar.zzc()));
        } else if (zzkp.zzl(zzghVar.zze())) {
            boolZze = zze(zzi(zzghVar.zze(), zzelVarZzd.zzd()), zZzf2);
        } else {
            this.zza.zzs.zzau().zze().zzc("Invalid user property value for Numeric number filter. property, value", this.zza.zzs.zzm().zze(zzghVar.zzc()), zzghVar.zze());
        }
        this.zza.zzs.zzau().zzk().zzb("Property filter result", boolZze == null ? "null" : boolZze);
        if (boolZze == null) {
            return false;
        }
        this.zzd = true;
        if (zZzh && !boolZze.booleanValue()) {
            return true;
        }
        if (!z || this.zzh.zze()) {
            this.zze = boolZze;
        }
        if (boolZze.booleanValue() && z2 && zzghVar.zza()) {
            long jZzb = zzghVar.zzb();
            if (l != null) {
                jZzb = l.longValue();
            }
            if (zZzn && this.zzh.zze() && !this.zzh.zzf() && l2 != null) {
                jZzb = l2.longValue();
            }
            if (this.zzh.zzf()) {
                this.zzg = Long.valueOf(jZzb);
            } else {
                this.zzf = Long.valueOf(jZzb);
            }
        }
        return true;
    }
}
