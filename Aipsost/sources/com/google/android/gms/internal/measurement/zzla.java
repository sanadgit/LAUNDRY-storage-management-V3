package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzla implements zzlu {
    private static final zzlg zzb = new zzky();
    private final zzlg zza;

    public zzla() {
        zzlg zzlgVar;
        zzlg[] zzlgVarArr = new zzlg[2];
        zzlgVarArr[0] = zzjy.zza();
        try {
            zzlgVar = (zzlg) Class.forName("com.google.protobuf.DescriptorMessageInfoFactory").getDeclaredMethod("getInstance", new Class[0]).invoke(null, new Object[0]);
        } catch (Exception e) {
            zzlgVar = zzb;
        }
        zzlgVarArr[1] = zzlgVar;
        zzkz zzkzVar = new zzkz(zzlgVarArr);
        zzkl.zzb(zzkzVar, "messageInfoFactory");
        this.zza = zzkzVar;
    }

    private static boolean zzb(zzlf zzlfVar) {
        return zzlfVar.zzc() == 1;
    }

    @Override // com.google.android.gms.internal.measurement.zzlu
    public final <T> zzlt<T> zza(Class<T> cls) {
        zzlv.zza(cls);
        zzlf zzlfVarZzc = this.zza.zzc(cls);
        return zzlfVarZzc.zza() ? zzkd.class.isAssignableFrom(cls) ? zzlm.zzf(zzlv.zzC(), zzjs.zza(), zzlfVarZzc.zzb()) : zzlm.zzf(zzlv.zzA(), zzjs.zzb(), zzlfVarZzc.zzb()) : zzkd.class.isAssignableFrom(cls) ? zzb(zzlfVarZzc) ? zzll.zzk(cls, zzlfVarZzc, zzlo.zzb(), zzkw.zzd(), zzlv.zzC(), zzjs.zza(), zzle.zzb()) : zzll.zzk(cls, zzlfVarZzc, zzlo.zzb(), zzkw.zzd(), zzlv.zzC(), null, zzle.zzb()) : zzb(zzlfVarZzc) ? zzll.zzk(cls, zzlfVarZzc, zzlo.zza(), zzkw.zzc(), zzlv.zzA(), zzjs.zzb(), zzle.zza()) : zzll.zzk(cls, zzlfVarZzc, zzlo.zza(), zzkw.zzc(), zzlv.zzB(), null, zzle.zza());
    }
}
