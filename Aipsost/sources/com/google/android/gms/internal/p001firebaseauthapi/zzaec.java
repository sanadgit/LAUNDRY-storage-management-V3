package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaec implements zzaex {
    private static final zzaei zza = new zzaea();
    private final zzaei zzb;

    public zzaec() {
        zzaei zzaeiVar;
        zzaei[] zzaeiVarArr = new zzaei[2];
        zzaeiVarArr[0] = zzada.zza();
        try {
            zzaeiVar = (zzaei) Class.forName("com.google.protobuf.DescriptorMessageInfoFactory").getDeclaredMethod("getInstance", new Class[0]).invoke(null, new Object[0]);
        } catch (Exception e) {
            zzaeiVar = zza;
        }
        zzaeiVarArr[1] = zzaeiVar;
        zzaeb zzaebVar = new zzaeb(zzaeiVarArr);
        zzadl.zzf(zzaebVar, "messageInfoFactory");
        this.zzb = zzaebVar;
    }

    private static boolean zzb(zzaeh zzaehVar) {
        return zzaehVar.zzc() == 1;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaex
    public final zzaew zza(Class cls) {
        zzaey.zzG(cls);
        zzaeh zzaehVarZzb = this.zzb.zzb(cls);
        return zzaehVarZzb.zzb() ? zzadf.class.isAssignableFrom(cls) ? zzaeo.zzc(zzaey.zzB(), zzacv.zzb(), zzaehVarZzb.zza()) : zzaeo.zzc(zzaey.zzz(), zzacv.zza(), zzaehVarZzb.zza()) : zzadf.class.isAssignableFrom(cls) ? zzb(zzaehVarZzb) ? zzaen.zzl(cls, zzaehVarZzb, zzaeq.zzb(), zzady.zze(), zzaey.zzB(), zzacv.zzb(), zzaeg.zzb()) : zzaen.zzl(cls, zzaehVarZzb, zzaeq.zzb(), zzady.zze(), zzaey.zzB(), null, zzaeg.zzb()) : zzb(zzaehVarZzb) ? zzaen.zzl(cls, zzaehVarZzb, zzaeq.zza(), zzady.zzd(), zzaey.zzz(), zzacv.zza(), zzaeg.zza()) : zzaen.zzl(cls, zzaehVarZzb, zzaeq.zza(), zzady.zzd(), zzaey.zzA(), null, zzaeg.zza());
    }
}
