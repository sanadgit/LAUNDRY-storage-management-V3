package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzach implements zzaev {
    private final zzacg zza;
    private int zzb;
    private int zzc;
    private int zzd = 0;

    private zzach(zzacg zzacgVar) {
        zzadl.zzf(zzacgVar, "input");
        this.zza = zzacgVar;
        zzacgVar.zzc = this;
    }

    private final void zzP(Object obj, zzaew zzaewVar, zzacs zzacsVar) throws IOException {
        int i = this.zzc;
        this.zzc = ((this.zzb >>> 3) << 3) | 4;
        try {
            zzaewVar.zzh(obj, this, zzacsVar);
            if (this.zzb == this.zzc) {
            } else {
                throw zzadn.zzg();
            }
        } finally {
            this.zzc = i;
        }
    }

    private final void zzQ(Object obj, zzaew zzaewVar, zzacs zzacsVar) throws IOException {
        int iZze = ((zzace) this.zza).zze();
        zzacg zzacgVar = this.zza;
        if (zzacgVar.zza >= zzacgVar.zzb) {
            throw new zzadn("Protocol message had too many levels of nesting.  May be malicious.  Use CodedInputStream.setRecursionLimit() to increase the depth limit.");
        }
        int iZzc = zzacgVar.zzc(iZze);
        this.zza.zza++;
        zzaewVar.zzh(obj, this, zzacsVar);
        this.zza.zzm(0);
        r5.zza--;
        this.zza.zzn(iZzc);
    }

    private final void zzR(int i) throws IOException {
        if (this.zza.zzb() != i) {
            throw zzadn.zzi();
        }
    }

    private final void zzS(int i) throws IOException {
        if ((this.zzb & 7) != i) {
            throw zzadn.zza();
        }
    }

    private static final void zzT(int i) throws IOException {
        if ((i & 3) != 0) {
            throw zzadn.zzg();
        }
    }

    private static final void zzU(int i) throws IOException {
        if ((i & 7) != 0) {
            throw zzadn.zzg();
        }
    }

    public static zzach zzq(zzacg zzacgVar) {
        zzach zzachVar = zzacgVar.zzc;
        return zzachVar != null ? zzachVar : new zzach(zzacgVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzA(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadz)) {
            switch (this.zzb & 7) {
                case 1:
                    break;
                case 2:
                    int iZze = ((zzace) this.zza).zze();
                    zzU(iZze);
                    int iZzb = this.zza.zzb() + iZze;
                    do {
                        list.add(Long.valueOf(((zzace) this.zza).zzg()));
                    } while (this.zza.zzb() < iZzb);
                    return;
                default:
                    throw zzadn.zza();
            }
            do {
                list.add(Long.valueOf(((zzace) this.zza).zzg()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadz zzadzVar = (zzadz) list;
        switch (this.zzb & 7) {
            case 1:
                break;
            case 2:
                int iZze2 = ((zzace) this.zza).zze();
                zzU(iZze2);
                int iZzb2 = this.zza.zzb() + iZze2;
                do {
                    zzadzVar.zzf(((zzace) this.zza).zzg());
                } while (this.zza.zzb() < iZzb2);
                return;
            default:
                throw zzadn.zza();
        }
        do {
            zzadzVar.zzf(((zzace) this.zza).zzg());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzB(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzacz)) {
            switch (this.zzb & 7) {
                case 2:
                    int iZze = ((zzace) this.zza).zze();
                    zzT(iZze);
                    int iZzb = this.zza.zzb() + iZze;
                    do {
                        list.add(Float.valueOf(Float.intBitsToFloat(((zzace) this.zza).zzd())));
                    } while (this.zza.zzb() < iZzb);
                    return;
                case 5:
                    break;
                default:
                    throw zzadn.zza();
            }
            do {
                list.add(Float.valueOf(Float.intBitsToFloat(((zzace) this.zza).zzd())));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzacz zzaczVar = (zzacz) list;
        switch (this.zzb & 7) {
            case 2:
                int iZze2 = ((zzace) this.zza).zze();
                zzT(iZze2);
                int iZzb2 = this.zza.zzb() + iZze2;
                do {
                    zzaczVar.zze(Float.intBitsToFloat(((zzace) this.zza).zzd()));
                } while (this.zza.zzb() < iZzb2);
                return;
            case 5:
                break;
            default:
                throw zzadn.zza();
        }
        do {
            zzaczVar.zze(Float.intBitsToFloat(((zzace) this.zza).zzd()));
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    @Deprecated
    public final void zzC(List list, zzaew zzaewVar, zzacs zzacsVar) throws IOException {
        int iZzf;
        int i = this.zzb;
        if ((i & 7) != 3) {
            throw zzadn.zza();
        }
        do {
            Object objZze = zzaewVar.zze();
            zzP(objZze, zzaewVar, zzacsVar);
            zzaewVar.zzf(objZze);
            list.add(objZze);
            zzacg zzacgVar = this.zza;
            if (zzacgVar.zzp() || this.zzd != 0) {
                return;
            } else {
                iZzf = zzacgVar.zzf();
            }
        } while (iZzf == i);
        this.zzd = iZzf;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzD(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadg)) {
            switch (this.zzb & 7) {
                case 0:
                    break;
                case 1:
                default:
                    throw zzadn.zza();
                case 2:
                    int iZzb = this.zza.zzb() + ((zzace) this.zza).zze();
                    do {
                        list.add(Integer.valueOf(((zzace) this.zza).zze()));
                    } while (this.zza.zzb() < iZzb);
                    zzR(iZzb);
                    return;
            }
            do {
                list.add(Integer.valueOf(((zzace) this.zza).zze()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadg zzadgVar = (zzadg) list;
        switch (this.zzb & 7) {
            case 0:
                break;
            case 1:
            default:
                throw zzadn.zza();
            case 2:
                int iZzb2 = this.zza.zzb() + ((zzace) this.zza).zze();
                do {
                    zzadgVar.zzf(((zzace) this.zza).zze());
                } while (this.zza.zzb() < iZzb2);
                zzR(iZzb2);
                return;
        }
        do {
            zzadgVar.zzf(((zzace) this.zza).zze());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzE(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadz)) {
            switch (this.zzb & 7) {
                case 0:
                    break;
                case 1:
                default:
                    throw zzadn.zza();
                case 2:
                    int iZzb = this.zza.zzb() + ((zzace) this.zza).zze();
                    do {
                        list.add(Long.valueOf(((zzace) this.zza).zzh()));
                    } while (this.zza.zzb() < iZzb);
                    zzR(iZzb);
                    return;
            }
            do {
                list.add(Long.valueOf(((zzace) this.zza).zzh()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadz zzadzVar = (zzadz) list;
        switch (this.zzb & 7) {
            case 0:
                break;
            case 1:
            default:
                throw zzadn.zza();
            case 2:
                int iZzb2 = this.zza.zzb() + ((zzace) this.zza).zze();
                do {
                    zzadzVar.zzf(((zzace) this.zza).zzh());
                } while (this.zza.zzb() < iZzb2);
                zzR(iZzb2);
                return;
        }
        do {
            zzadzVar.zzf(((zzace) this.zza).zzh());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzF(List list, zzaew zzaewVar, zzacs zzacsVar) throws IOException {
        int iZzf;
        int i = this.zzb;
        if ((i & 7) != 2) {
            throw zzadn.zza();
        }
        do {
            Object objZze = zzaewVar.zze();
            zzQ(objZze, zzaewVar, zzacsVar);
            zzaewVar.zzf(objZze);
            list.add(objZze);
            zzacg zzacgVar = this.zza;
            if (zzacgVar.zzp() || this.zzd != 0) {
                return;
            } else {
                iZzf = zzacgVar.zzf();
            }
        } while (iZzf == i);
        this.zzd = iZzf;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzG(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadg)) {
            switch (this.zzb & 7) {
                case 2:
                    int iZze = ((zzace) this.zza).zze();
                    zzT(iZze);
                    int iZzb = this.zza.zzb() + iZze;
                    do {
                        list.add(Integer.valueOf(((zzace) this.zza).zzd()));
                    } while (this.zza.zzb() < iZzb);
                    return;
                case 5:
                    break;
                default:
                    throw zzadn.zza();
            }
            do {
                list.add(Integer.valueOf(((zzace) this.zza).zzd()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadg zzadgVar = (zzadg) list;
        switch (this.zzb & 7) {
            case 2:
                int iZze2 = ((zzace) this.zza).zze();
                zzT(iZze2);
                int iZzb2 = this.zza.zzb() + iZze2;
                do {
                    zzadgVar.zzf(((zzace) this.zza).zzd());
                } while (this.zza.zzb() < iZzb2);
                return;
            case 5:
                break;
            default:
                throw zzadn.zza();
        }
        do {
            zzadgVar.zzf(((zzace) this.zza).zzd());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzH(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadz)) {
            switch (this.zzb & 7) {
                case 1:
                    break;
                case 2:
                    int iZze = ((zzace) this.zza).zze();
                    zzU(iZze);
                    int iZzb = this.zza.zzb() + iZze;
                    do {
                        list.add(Long.valueOf(((zzace) this.zza).zzg()));
                    } while (this.zza.zzb() < iZzb);
                    return;
                default:
                    throw zzadn.zza();
            }
            do {
                list.add(Long.valueOf(((zzace) this.zza).zzg()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadz zzadzVar = (zzadz) list;
        switch (this.zzb & 7) {
            case 1:
                break;
            case 2:
                int iZze2 = ((zzace) this.zza).zze();
                zzU(iZze2);
                int iZzb2 = this.zza.zzb() + iZze2;
                do {
                    zzadzVar.zzf(((zzace) this.zza).zzg());
                } while (this.zza.zzb() < iZzb2);
                return;
            default:
                throw zzadn.zza();
        }
        do {
            zzadzVar.zzf(((zzace) this.zza).zzg());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzI(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadg)) {
            switch (this.zzb & 7) {
                case 0:
                    break;
                case 1:
                default:
                    throw zzadn.zza();
                case 2:
                    int iZzb = this.zza.zzb() + ((zzace) this.zza).zze();
                    do {
                        list.add(Integer.valueOf(zzace.zzs(((zzace) this.zza).zze())));
                    } while (this.zza.zzb() < iZzb);
                    zzR(iZzb);
                    return;
            }
            do {
                list.add(Integer.valueOf(zzace.zzs(((zzace) this.zza).zze())));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadg zzadgVar = (zzadg) list;
        switch (this.zzb & 7) {
            case 0:
                break;
            case 1:
            default:
                throw zzadn.zza();
            case 2:
                int iZzb2 = this.zza.zzb() + ((zzace) this.zza).zze();
                do {
                    zzadgVar.zzf(zzace.zzs(((zzace) this.zza).zze()));
                } while (this.zza.zzb() < iZzb2);
                zzR(iZzb2);
                return;
        }
        do {
            zzadgVar.zzf(zzace.zzs(((zzace) this.zza).zze()));
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzJ(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadz)) {
            switch (this.zzb & 7) {
                case 0:
                    break;
                case 1:
                default:
                    throw zzadn.zza();
                case 2:
                    int iZzb = this.zza.zzb() + ((zzace) this.zza).zze();
                    do {
                        list.add(Long.valueOf(zzace.zzt(((zzace) this.zza).zzh())));
                    } while (this.zza.zzb() < iZzb);
                    zzR(iZzb);
                    return;
            }
            do {
                list.add(Long.valueOf(zzace.zzt(((zzace) this.zza).zzh())));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadz zzadzVar = (zzadz) list;
        switch (this.zzb & 7) {
            case 0:
                break;
            case 1:
            default:
                throw zzadn.zza();
            case 2:
                int iZzb2 = this.zza.zzb() + ((zzace) this.zza).zze();
                do {
                    zzadzVar.zzf(zzace.zzt(((zzace) this.zza).zzh()));
                } while (this.zza.zzb() < iZzb2);
                zzR(iZzb2);
                return;
        }
        do {
            zzadzVar.zzf(zzace.zzt(((zzace) this.zza).zzh()));
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    public final void zzK(List list, boolean z) throws IOException {
        int iZzf;
        int iZzf2;
        if ((this.zzb & 7) != 2) {
            throw zzadn.zza();
        }
        if (!(list instanceof zzads) || z) {
            do {
                list.add(z ? zzs() : zzr());
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzads zzadsVar = (zzads) list;
        do {
            zzadsVar.zzi(zzp());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzL(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadg)) {
            switch (this.zzb & 7) {
                case 0:
                    break;
                case 1:
                default:
                    throw zzadn.zza();
                case 2:
                    int iZzb = this.zza.zzb() + ((zzace) this.zza).zze();
                    do {
                        list.add(Integer.valueOf(((zzace) this.zza).zze()));
                    } while (this.zza.zzb() < iZzb);
                    zzR(iZzb);
                    return;
            }
            do {
                list.add(Integer.valueOf(((zzace) this.zza).zze()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadg zzadgVar = (zzadg) list;
        switch (this.zzb & 7) {
            case 0:
                break;
            case 1:
            default:
                throw zzadn.zza();
            case 2:
                int iZzb2 = this.zza.zzb() + ((zzace) this.zza).zze();
                do {
                    zzadgVar.zzf(((zzace) this.zza).zze());
                } while (this.zza.zzb() < iZzb2);
                zzR(iZzb2);
                return;
        }
        do {
            zzadgVar.zzf(((zzace) this.zza).zze());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzM(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadz)) {
            switch (this.zzb & 7) {
                case 0:
                    break;
                case 1:
                default:
                    throw zzadn.zza();
                case 2:
                    int iZzb = this.zza.zzb() + ((zzace) this.zza).zze();
                    do {
                        list.add(Long.valueOf(((zzace) this.zza).zzh()));
                    } while (this.zza.zzb() < iZzb);
                    zzR(iZzb);
                    return;
            }
            do {
                list.add(Long.valueOf(((zzace) this.zza).zzh()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadz zzadzVar = (zzadz) list;
        switch (this.zzb & 7) {
            case 0:
                break;
            case 1:
            default:
                throw zzadn.zza();
            case 2:
                int iZzb2 = this.zza.zzb() + ((zzace) this.zza).zze();
                do {
                    zzadzVar.zzf(((zzace) this.zza).zzh());
                } while (this.zza.zzb() < iZzb2);
                zzR(iZzb2);
                return;
        }
        do {
            zzadzVar.zzf(((zzace) this.zza).zzh());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final boolean zzN() throws IOException {
        zzS(0);
        return this.zza.zzq();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final boolean zzO() throws IOException {
        int i;
        zzacg zzacgVar = this.zza;
        if (zzacgVar.zzp() || (i = this.zzb) == this.zzc) {
            return false;
        }
        return zzacgVar.zzr(i);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final double zza() throws IOException {
        zzS(1);
        return Double.longBitsToDouble(((zzace) this.zza).zzg());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final float zzb() throws IOException {
        zzS(5);
        return Float.intBitsToFloat(((zzace) this.zza).zzd());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final int zzc() throws IOException {
        int iZzf = this.zzd;
        if (iZzf != 0) {
            this.zzb = iZzf;
            this.zzd = 0;
        } else {
            iZzf = this.zza.zzf();
            this.zzb = iZzf;
        }
        if (iZzf == 0 || iZzf == this.zzc) {
            return Integer.MAX_VALUE;
        }
        return iZzf >>> 3;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final int zzd() {
        return this.zzb;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final int zze() throws IOException {
        zzS(0);
        return ((zzace) this.zza).zze();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final int zzf() throws IOException {
        zzS(5);
        return ((zzace) this.zza).zzd();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final int zzg() throws IOException {
        zzS(0);
        return ((zzace) this.zza).zze();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final int zzh() throws IOException {
        zzS(5);
        return ((zzace) this.zza).zzd();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final int zzi() throws IOException {
        zzS(0);
        return zzace.zzs(((zzace) this.zza).zze());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final int zzj() throws IOException {
        zzS(0);
        return ((zzace) this.zza).zze();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final long zzk() throws IOException {
        zzS(1);
        return ((zzace) this.zza).zzg();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final long zzl() throws IOException {
        zzS(0);
        return ((zzace) this.zza).zzh();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final long zzm() throws IOException {
        zzS(1);
        return ((zzace) this.zza).zzg();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final long zzn() throws IOException {
        zzS(0);
        return zzace.zzt(((zzace) this.zza).zzh());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final long zzo() throws IOException {
        zzS(0);
        return ((zzace) this.zza).zzh();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final zzacc zzp() throws IOException {
        zzS(2);
        return this.zza.zzj();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final String zzr() throws IOException {
        zzS(2);
        return this.zza.zzk();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final String zzs() throws IOException {
        zzS(2);
        return this.zza.zzl();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzt(Object obj, zzaew zzaewVar, zzacs zzacsVar) throws IOException {
        zzS(3);
        zzP(obj, zzaewVar, zzacsVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzu(Object obj, zzaew zzaewVar, zzacs zzacsVar) throws IOException {
        zzS(2);
        zzQ(obj, zzaewVar, zzacsVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzv(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzabr)) {
            switch (this.zzb & 7) {
                case 0:
                    break;
                case 1:
                default:
                    throw zzadn.zza();
                case 2:
                    int iZzb = this.zza.zzb() + ((zzace) this.zza).zze();
                    do {
                        list.add(Boolean.valueOf(this.zza.zzq()));
                    } while (this.zza.zzb() < iZzb);
                    zzR(iZzb);
                    return;
            }
            do {
                list.add(Boolean.valueOf(this.zza.zzq()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzabr zzabrVar = (zzabr) list;
        switch (this.zzb & 7) {
            case 0:
                break;
            case 1:
            default:
                throw zzadn.zza();
            case 2:
                int iZzb2 = this.zza.zzb() + ((zzace) this.zza).zze();
                do {
                    zzabrVar.zze(this.zza.zzq());
                } while (this.zza.zzb() < iZzb2);
                zzR(iZzb2);
                return;
        }
        do {
            zzabrVar.zze(this.zza.zzq());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzw(List list) throws IOException {
        int iZzf;
        if ((this.zzb & 7) != 2) {
            throw zzadn.zza();
        }
        do {
            list.add(zzp());
            zzacg zzacgVar = this.zza;
            if (zzacgVar.zzp()) {
                return;
            } else {
                iZzf = zzacgVar.zzf();
            }
        } while (iZzf == this.zzb);
        this.zzd = iZzf;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzx(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzacp)) {
            switch (this.zzb & 7) {
                case 1:
                    break;
                case 2:
                    int iZze = ((zzace) this.zza).zze();
                    zzU(iZze);
                    int iZzb = this.zza.zzb() + iZze;
                    do {
                        list.add(Double.valueOf(Double.longBitsToDouble(((zzace) this.zza).zzg())));
                    } while (this.zza.zzb() < iZzb);
                    return;
                default:
                    throw zzadn.zza();
            }
            do {
                list.add(Double.valueOf(Double.longBitsToDouble(((zzace) this.zza).zzg())));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzacp zzacpVar = (zzacp) list;
        switch (this.zzb & 7) {
            case 1:
                break;
            case 2:
                int iZze2 = ((zzace) this.zza).zze();
                zzU(iZze2);
                int iZzb2 = this.zza.zzb() + iZze2;
                do {
                    zzacpVar.zze(Double.longBitsToDouble(((zzace) this.zza).zzg()));
                } while (this.zza.zzb() < iZzb2);
                return;
            default:
                throw zzadn.zza();
        }
        do {
            zzacpVar.zze(Double.longBitsToDouble(((zzace) this.zza).zzg()));
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzy(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadg)) {
            switch (this.zzb & 7) {
                case 0:
                    break;
                case 1:
                default:
                    throw zzadn.zza();
                case 2:
                    int iZzb = this.zza.zzb() + ((zzace) this.zza).zze();
                    do {
                        list.add(Integer.valueOf(((zzace) this.zza).zze()));
                    } while (this.zza.zzb() < iZzb);
                    zzR(iZzb);
                    return;
            }
            do {
                list.add(Integer.valueOf(((zzace) this.zza).zze()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadg zzadgVar = (zzadg) list;
        switch (this.zzb & 7) {
            case 0:
                break;
            case 1:
            default:
                throw zzadn.zza();
            case 2:
                int iZzb2 = this.zza.zzb() + ((zzace) this.zza).zze();
                do {
                    zzadgVar.zzf(((zzace) this.zza).zze());
                } while (this.zza.zzb() < iZzb2);
                zzR(iZzb2);
                return;
        }
        do {
            zzadgVar.zzf(((zzace) this.zza).zze());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaev
    public final void zzz(List list) throws IOException {
        int iZzf;
        int iZzf2;
        if (!(list instanceof zzadg)) {
            switch (this.zzb & 7) {
                case 2:
                    int iZze = ((zzace) this.zza).zze();
                    zzT(iZze);
                    int iZzb = this.zza.zzb() + iZze;
                    do {
                        list.add(Integer.valueOf(((zzace) this.zza).zzd()));
                    } while (this.zza.zzb() < iZzb);
                    return;
                case 5:
                    break;
                default:
                    throw zzadn.zza();
            }
            do {
                list.add(Integer.valueOf(((zzace) this.zza).zzd()));
                zzacg zzacgVar = this.zza;
                if (zzacgVar.zzp()) {
                    return;
                } else {
                    iZzf = zzacgVar.zzf();
                }
            } while (iZzf == this.zzb);
            this.zzd = iZzf;
            return;
        }
        zzadg zzadgVar = (zzadg) list;
        switch (this.zzb & 7) {
            case 2:
                int iZze2 = ((zzace) this.zza).zze();
                zzT(iZze2);
                int iZzb2 = this.zza.zzb() + iZze2;
                do {
                    zzadgVar.zzf(((zzace) this.zza).zzd());
                } while (this.zza.zzb() < iZzb2);
                return;
            case 5:
                break;
            default:
                throw zzadn.zza();
        }
        do {
            zzadgVar.zzf(((zzace) this.zza).zzd());
            zzacg zzacgVar2 = this.zza;
            if (zzacgVar2.zzp()) {
                return;
            } else {
                iZzf2 = zzacgVar2.zzf();
            }
        } while (iZzf2 == this.zzb);
        this.zzd = iZzf2;
    }
}
