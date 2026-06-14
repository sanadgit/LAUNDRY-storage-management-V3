package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.SafeParcelReader;
import com.google.android.gms.internal.measurement.zzlh;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.Iterator;
import java.util.List;
import java.util.zip.GZIPOutputStream;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkp extends zzke {
    zzkp(zzkn zzknVar) {
        super(zzknVar);
    }

    static final com.google.android.gms.internal.measurement.zzfs zzA(com.google.android.gms.internal.measurement.zzfo zzfoVar, String str) {
        for (com.google.android.gms.internal.measurement.zzfs zzfsVar : zzfoVar.zza()) {
            if (zzfsVar.zzb().equals(str)) {
                return zzfsVar;
            }
        }
        return null;
    }

    static final Object zzB(com.google.android.gms.internal.measurement.zzfo zzfoVar, String str) {
        com.google.android.gms.internal.measurement.zzfs zzfsVarZzA = zzA(zzfoVar, str);
        if (zzfsVarZzA == null) {
            return null;
        }
        if (zzfsVarZzA.zzc()) {
            return zzfsVarZzA.zzd();
        }
        if (zzfsVarZzA.zze()) {
            return Long.valueOf(zzfsVarZzA.zzf());
        }
        if (zzfsVarZzA.zzi()) {
            return Double.valueOf(zzfsVarZzA.zzj());
        }
        if (zzfsVarZzA.zzm() <= 0) {
            return null;
        }
        List<com.google.android.gms.internal.measurement.zzfs> listZzk = zzfsVarZzA.zzk();
        ArrayList arrayList = new ArrayList();
        for (com.google.android.gms.internal.measurement.zzfs zzfsVar : listZzk) {
            if (zzfsVar != null) {
                Bundle bundle = new Bundle();
                for (com.google.android.gms.internal.measurement.zzfs zzfsVar2 : zzfsVar.zzk()) {
                    if (zzfsVar2.zzc()) {
                        bundle.putString(zzfsVar2.zzb(), zzfsVar2.zzd());
                    } else if (zzfsVar2.zze()) {
                        bundle.putLong(zzfsVar2.zzb(), zzfsVar2.zzf());
                    } else if (zzfsVar2.zzi()) {
                        bundle.putDouble(zzfsVar2.zzb(), zzfsVar2.zzj());
                    }
                }
                if (!bundle.isEmpty()) {
                    arrayList.add(bundle);
                }
            }
        }
        return (Bundle[]) arrayList.toArray(new Bundle[arrayList.size()]);
    }

    private final void zzC(StringBuilder sb, int i, List<com.google.android.gms.internal.measurement.zzfs> list) {
        if (list == null) {
            return;
        }
        int i2 = i + 1;
        for (com.google.android.gms.internal.measurement.zzfs zzfsVar : list) {
            if (zzfsVar != null) {
                zzE(sb, i2);
                sb.append("param {\n");
                zzH(sb, i2, AppMeasurementSdk.ConditionalUserProperty.NAME, zzfsVar.zza() ? this.zzs.zzm().zzd(zzfsVar.zzb()) : null);
                zzH(sb, i2, "string_value", zzfsVar.zzc() ? zzfsVar.zzd() : null);
                zzH(sb, i2, "int_value", zzfsVar.zze() ? Long.valueOf(zzfsVar.zzf()) : null);
                zzH(sb, i2, "double_value", zzfsVar.zzi() ? Double.valueOf(zzfsVar.zzj()) : null);
                if (zzfsVar.zzm() > 0) {
                    zzC(sb, i2, zzfsVar.zzk());
                }
                zzE(sb, i2);
                sb.append("}\n");
            }
        }
    }

    private final void zzD(StringBuilder sb, int i, com.google.android.gms.internal.measurement.zzel zzelVar) {
        if (zzelVar == null) {
            return;
        }
        zzE(sb, i);
        sb.append("filter {\n");
        if (zzelVar.zze()) {
            zzH(sb, i, "complement", Boolean.valueOf(zzelVar.zzf()));
        }
        if (zzelVar.zzg()) {
            zzH(sb, i, "param_name", this.zzs.zzm().zzd(zzelVar.zzh()));
        }
        if (zzelVar.zza()) {
            int i2 = i + 1;
            com.google.android.gms.internal.measurement.zzex zzexVarZzb = zzelVar.zzb();
            if (zzexVarZzb != null) {
                zzE(sb, i2);
                sb.append("string_filter {\n");
                if (zzexVarZzb.zza()) {
                    zzH(sb, i2, "match_type", zzexVarZzb.zzb().name());
                }
                if (zzexVarZzb.zzc()) {
                    zzH(sb, i2, "expression", zzexVarZzb.zzd());
                }
                if (zzexVarZzb.zze()) {
                    zzH(sb, i2, "case_sensitive", Boolean.valueOf(zzexVarZzb.zzf()));
                }
                if (zzexVarZzb.zzh() > 0) {
                    zzE(sb, i2 + 1);
                    sb.append("expression_list {\n");
                    for (String str : zzexVarZzb.zzg()) {
                        zzE(sb, i2 + 2);
                        sb.append(str);
                        sb.append("\n");
                    }
                    sb.append("}\n");
                }
                zzE(sb, i2);
                sb.append("}\n");
            }
        }
        if (zzelVar.zzc()) {
            zzI(sb, i + 1, "number_filter", zzelVar.zzd());
        }
        zzE(sb, i);
        sb.append("}\n");
    }

    private static final void zzE(StringBuilder sb, int i) {
        for (int i2 = 0; i2 < i; i2++) {
            sb.append("  ");
        }
    }

    private static final String zzF(boolean z, boolean z2, boolean z3) {
        StringBuilder sb = new StringBuilder();
        if (z) {
            sb.append("Dynamic ");
        }
        if (z2) {
            sb.append("Sequence ");
        }
        if (z3) {
            sb.append("Session-Scoped ");
        }
        return sb.toString();
    }

    private static final void zzG(StringBuilder sb, int i, String str, com.google.android.gms.internal.measurement.zzgd zzgdVar) {
        if (zzgdVar == null) {
            return;
        }
        zzE(sb, 3);
        sb.append(str);
        sb.append(" {\n");
        if (zzgdVar.zzd() != 0) {
            zzE(sb, 4);
            sb.append("results: ");
            int i2 = 0;
            for (Long l : zzgdVar.zzc()) {
                int i3 = i2 + 1;
                if (i2 != 0) {
                    sb.append(", ");
                }
                sb.append(l);
                i2 = i3;
            }
            sb.append('\n');
        }
        if (zzgdVar.zzb() != 0) {
            zzE(sb, 4);
            sb.append("status: ");
            int i4 = 0;
            for (Long l2 : zzgdVar.zza()) {
                int i5 = i4 + 1;
                if (i4 != 0) {
                    sb.append(", ");
                }
                sb.append(l2);
                i4 = i5;
            }
            sb.append('\n');
        }
        if (zzgdVar.zzf() != 0) {
            zzE(sb, 4);
            sb.append("dynamic_filter_timestamps: {");
            int i6 = 0;
            for (com.google.android.gms.internal.measurement.zzfm zzfmVar : zzgdVar.zze()) {
                int i7 = i6 + 1;
                if (i6 != 0) {
                    sb.append(", ");
                }
                sb.append(zzfmVar.zza() ? Integer.valueOf(zzfmVar.zzb()) : null);
                sb.append(":");
                sb.append(zzfmVar.zzc() ? Long.valueOf(zzfmVar.zzd()) : null);
                i6 = i7;
            }
            sb.append("}\n");
        }
        if (zzgdVar.zzi() != 0) {
            zzE(sb, 4);
            sb.append("sequence_filter_timestamps: {");
            int i8 = 0;
            for (com.google.android.gms.internal.measurement.zzgf zzgfVar : zzgdVar.zzh()) {
                int i9 = i8 + 1;
                if (i8 != 0) {
                    sb.append(", ");
                }
                sb.append(zzgfVar.zza() ? Integer.valueOf(zzgfVar.zzb()) : null);
                sb.append(": [");
                Iterator<Long> it = zzgfVar.zzc().iterator();
                int i10 = 0;
                while (it.hasNext()) {
                    long jLongValue = it.next().longValue();
                    int i11 = i10 + 1;
                    if (i10 != 0) {
                        sb.append(", ");
                    }
                    sb.append(jLongValue);
                    i10 = i11;
                }
                sb.append("]");
                i8 = i9;
            }
            sb.append("}\n");
        }
        zzE(sb, 3);
        sb.append("}\n");
    }

    private static final void zzH(StringBuilder sb, int i, String str, Object obj) {
        if (obj == null) {
            return;
        }
        zzE(sb, i + 1);
        sb.append(str);
        sb.append(": ");
        sb.append(obj);
        sb.append('\n');
    }

    private static final void zzI(StringBuilder sb, int i, String str, com.google.android.gms.internal.measurement.zzeq zzeqVar) {
        if (zzeqVar == null) {
            return;
        }
        zzE(sb, i);
        sb.append(str);
        sb.append(" {\n");
        if (zzeqVar.zza()) {
            zzH(sb, i, "comparison_type", zzeqVar.zzb().name());
        }
        if (zzeqVar.zzc()) {
            zzH(sb, i, "match_as_float", Boolean.valueOf(zzeqVar.zzd()));
        }
        if (zzeqVar.zze()) {
            zzH(sb, i, "comparison_value", zzeqVar.zzf());
        }
        if (zzeqVar.zzg()) {
            zzH(sb, i, "min_comparison_value", zzeqVar.zzh());
        }
        if (zzeqVar.zzi()) {
            zzH(sb, i, "max_comparison_value", zzeqVar.zzj());
        }
        zzE(sb, i);
        sb.append("}\n");
    }

    static boolean zzl(String str) {
        return str != null && str.matches("([+-])?([0-9]+\\.?[0-9]*|[0-9]*\\.?[0-9]+)") && str.length() <= 310;
    }

    static boolean zzm(List<Long> list, int i) {
        if (i < list.size() * 64) {
            return ((1 << (i % 64)) & list.get(i / 64).longValue()) != 0;
        }
        return false;
    }

    static List<Long> zzn(BitSet bitSet) {
        int length = (bitSet.length() + 63) / 64;
        ArrayList arrayList = new ArrayList(length);
        for (int i = 0; i < length; i++) {
            long j = 0;
            for (int i2 = 0; i2 < 64; i2++) {
                int i3 = (i * 64) + i2;
                if (i3 >= bitSet.length()) {
                    break;
                }
                if (bitSet.get(i3)) {
                    j |= 1 << i2;
                }
            }
            arrayList.add(Long.valueOf(j));
        }
        return arrayList;
    }

    static <Builder extends zzlh> Builder zzt(Builder builder, byte[] bArr) throws com.google.android.gms.internal.measurement.zzkn {
        com.google.android.gms.internal.measurement.zzjp zzjpVarZzb = com.google.android.gms.internal.measurement.zzjp.zzb();
        return zzjpVarZzb != null ? (Builder) builder.zzav(bArr, zzjpVarZzb) : (Builder) builder.zzaw(bArr);
    }

    static int zzu(com.google.android.gms.internal.measurement.zzfv zzfvVar, String str) {
        for (int i = 0; i < zzfvVar.zzk(); i++) {
            if (str.equals(zzfvVar.zzl(i).zzc())) {
                return i;
            }
        }
        return -1;
    }

    static List<com.google.android.gms.internal.measurement.zzfs> zzv(Bundle[] bundleArr) {
        ArrayList arrayList = new ArrayList();
        for (Bundle bundle : bundleArr) {
            if (bundle != null) {
                com.google.android.gms.internal.measurement.zzfr zzfrVarZzn = com.google.android.gms.internal.measurement.zzfs.zzn();
                for (String str : bundle.keySet()) {
                    com.google.android.gms.internal.measurement.zzfr zzfrVarZzn2 = com.google.android.gms.internal.measurement.zzfs.zzn();
                    zzfrVarZzn2.zza(str);
                    Object obj = bundle.get(str);
                    if (obj instanceof Long) {
                        zzfrVarZzn2.zzd(((Long) obj).longValue());
                    } else if (obj instanceof String) {
                        zzfrVarZzn2.zzb((String) obj);
                    } else if (obj instanceof Double) {
                        zzfrVarZzn2.zzf(((Double) obj).doubleValue());
                    }
                    zzfrVarZzn.zzi(zzfrVarZzn2);
                }
                if (zzfrVarZzn.zzh() > 0) {
                    arrayList.add(zzfrVarZzn.zzaA());
                }
            }
        }
        return arrayList;
    }

    static zzas zzx(com.google.android.gms.internal.measurement.zzaa zzaaVar) {
        Bundle bundle = new Bundle();
        String string = "app";
        for (String str : zzaaVar.zzf().keySet()) {
            Object objZze = zzaaVar.zze(str);
            if ("_o".equals(str) && objZze != null) {
                string = objZze.toString();
            }
            if (objZze == null) {
                bundle.putString(str, null);
            } else if (objZze instanceof Long) {
                bundle.putLong(str, ((Long) objZze).longValue());
            } else if (objZze instanceof Double) {
                bundle.putDouble(str, ((Double) objZze).doubleValue());
            } else {
                bundle.putString(str, objZze.toString());
            }
        }
        String strZzb = zzgr.zzb(zzaaVar.zzb());
        return new zzas(strZzb == null ? zzaaVar.zzb() : strZzb, new zzaq(bundle), string, zzaaVar.zza());
    }

    static final void zzy(com.google.android.gms.internal.measurement.zzfn zzfnVar, String str, Object obj) {
        List<com.google.android.gms.internal.measurement.zzfs> listZza = zzfnVar.zza();
        int i = 0;
        while (true) {
            if (i >= listZza.size()) {
                i = -1;
                break;
            } else if (str.equals(listZza.get(i).zzb())) {
                break;
            } else {
                i++;
            }
        }
        com.google.android.gms.internal.measurement.zzfr zzfrVarZzn = com.google.android.gms.internal.measurement.zzfs.zzn();
        zzfrVarZzn.zza(str);
        if (obj instanceof Long) {
            zzfrVarZzn.zzd(((Long) obj).longValue());
        } else if (obj instanceof String) {
            zzfrVarZzn.zzb((String) obj);
        } else if (obj instanceof Double) {
            zzfrVarZzn.zzf(((Double) obj).doubleValue());
        } else if (obj instanceof Bundle[]) {
            zzfrVarZzn.zzj(zzv((Bundle[]) obj));
        }
        if (i >= 0) {
            zzfnVar.zze(i, zzfrVarZzn);
        } else {
            zzfnVar.zzg(zzfrVarZzn);
        }
    }

    static final boolean zzz(zzas zzasVar, zzp zzpVar) {
        Preconditions.checkNotNull(zzasVar);
        Preconditions.checkNotNull(zzpVar);
        return (TextUtils.isEmpty(zzpVar.zzb) && TextUtils.isEmpty(zzpVar.zzq)) ? false : true;
    }

    @Override // com.google.android.gms.measurement.internal.zzke
    protected final boolean zzaA() {
        return false;
    }

    final void zzc(com.google.android.gms.internal.measurement.zzgg zzggVar, Object obj) {
        Preconditions.checkNotNull(obj);
        zzggVar.zzd();
        zzggVar.zzf();
        zzggVar.zzh();
        if (obj instanceof String) {
            zzggVar.zzc((String) obj);
            return;
        }
        if (obj instanceof Long) {
            zzggVar.zze(((Long) obj).longValue());
        } else if (obj instanceof Double) {
            zzggVar.zzg(((Double) obj).doubleValue());
        } else {
            this.zzs.zzau().zzb().zzb("Ignoring invalid (type) user attribute value", obj);
        }
    }

    final void zzd(com.google.android.gms.internal.measurement.zzfr zzfrVar, Object obj) {
        Preconditions.checkNotNull(obj);
        zzfrVar.zzc();
        zzfrVar.zze();
        zzfrVar.zzg();
        zzfrVar.zzk();
        if (obj instanceof String) {
            zzfrVar.zzb((String) obj);
            return;
        }
        if (obj instanceof Long) {
            zzfrVar.zzd(((Long) obj).longValue());
            return;
        }
        if (obj instanceof Double) {
            zzfrVar.zzf(((Double) obj).doubleValue());
        } else if (obj instanceof Bundle[]) {
            zzfrVar.zzj(zzv((Bundle[]) obj));
        } else {
            this.zzs.zzau().zzb().zzb("Ignoring invalid (type) event param value", obj);
        }
    }

    final com.google.android.gms.internal.measurement.zzfo zzf(zzan zzanVar) {
        com.google.android.gms.internal.measurement.zzfn zzfnVarZzk = com.google.android.gms.internal.measurement.zzfo.zzk();
        zzfnVarZzk.zzq(zzanVar.zze);
        zzap zzapVar = new zzap(zzanVar.zzf);
        while (zzapVar.hasNext()) {
            String next = zzapVar.next();
            com.google.android.gms.internal.measurement.zzfr zzfrVarZzn = com.google.android.gms.internal.measurement.zzfs.zzn();
            zzfrVarZzn.zza(next);
            Object objZza = zzanVar.zzf.zza(next);
            Preconditions.checkNotNull(objZza);
            zzd(zzfrVarZzn, objZza);
            zzfnVarZzk.zzg(zzfrVarZzn);
        }
        return zzfnVarZzk.zzaA();
    }

    final String zzh(com.google.android.gms.internal.measurement.zzfu zzfuVar) {
        if (zzfuVar == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("\nbatch {\n");
        for (com.google.android.gms.internal.measurement.zzfw zzfwVar : zzfuVar.zza()) {
            if (zzfwVar != null) {
                zzE(sb, 1);
                sb.append("bundle {\n");
                if (zzfwVar.zza()) {
                    zzH(sb, 1, "protocol_version", Integer.valueOf(zzfwVar.zzb()));
                }
                zzH(sb, 1, "platform", zzfwVar.zzt());
                if (zzfwVar.zzC()) {
                    zzH(sb, 1, "gmp_version", Long.valueOf(zzfwVar.zzD()));
                }
                if (zzfwVar.zzE()) {
                    zzH(sb, 1, "uploading_gmp_version", Long.valueOf(zzfwVar.zzF()));
                }
                if (zzfwVar.zzae()) {
                    zzH(sb, 1, "dynamite_version", Long.valueOf(zzfwVar.zzaf()));
                }
                if (zzfwVar.zzW()) {
                    zzH(sb, 1, "config_version", Long.valueOf(zzfwVar.zzX()));
                }
                zzH(sb, 1, "gmp_app_id", zzfwVar.zzP());
                zzH(sb, 1, "admob_app_id", zzfwVar.zzad());
                zzH(sb, 1, "app_id", zzfwVar.zzA());
                zzH(sb, 1, "app_version", zzfwVar.zzB());
                if (zzfwVar.zzU()) {
                    zzH(sb, 1, "app_version_major", Integer.valueOf(zzfwVar.zzV()));
                }
                zzH(sb, 1, "firebase_instance_id", zzfwVar.zzT());
                if (zzfwVar.zzK()) {
                    zzH(sb, 1, "dev_cert_hash", Long.valueOf(zzfwVar.zzL()));
                }
                zzH(sb, 1, "app_store", zzfwVar.zzz());
                if (zzfwVar.zzi()) {
                    zzH(sb, 1, "upload_timestamp_millis", Long.valueOf(zzfwVar.zzj()));
                }
                if (zzfwVar.zzk()) {
                    zzH(sb, 1, "start_timestamp_millis", Long.valueOf(zzfwVar.zzm()));
                }
                if (zzfwVar.zzn()) {
                    zzH(sb, 1, "end_timestamp_millis", Long.valueOf(zzfwVar.zzo()));
                }
                if (zzfwVar.zzp()) {
                    zzH(sb, 1, "previous_bundle_start_timestamp_millis", Long.valueOf(zzfwVar.zzq()));
                }
                if (zzfwVar.zzr()) {
                    zzH(sb, 1, "previous_bundle_end_timestamp_millis", Long.valueOf(zzfwVar.zzs()));
                }
                zzH(sb, 1, "app_instance_id", zzfwVar.zzJ());
                zzH(sb, 1, "resettable_device_id", zzfwVar.zzG());
                zzH(sb, 1, "ds_id", zzfwVar.zzaa());
                if (zzfwVar.zzH()) {
                    zzH(sb, 1, "limited_ad_tracking", Boolean.valueOf(zzfwVar.zzI()));
                }
                zzH(sb, 1, "os_version", zzfwVar.zzu());
                zzH(sb, 1, "device_model", zzfwVar.zzv());
                zzH(sb, 1, "user_default_language", zzfwVar.zzw());
                if (zzfwVar.zzx()) {
                    zzH(sb, 1, "time_zone_offset_minutes", Integer.valueOf(zzfwVar.zzy()));
                }
                if (zzfwVar.zzM()) {
                    zzH(sb, 1, "bundle_sequential_index", Integer.valueOf(zzfwVar.zzN()));
                }
                if (zzfwVar.zzQ()) {
                    zzH(sb, 1, "service_upload", Boolean.valueOf(zzfwVar.zzR()));
                }
                zzH(sb, 1, "health_monitor", zzfwVar.zzO());
                if (!this.zzs.zzc().zzn(null, zzea.zzat) && zzfwVar.zzY() && zzfwVar.zzZ() != 0) {
                    zzH(sb, 1, "android_id", Long.valueOf(zzfwVar.zzZ()));
                }
                if (zzfwVar.zzab()) {
                    zzH(sb, 1, "retry_counter", Integer.valueOf(zzfwVar.zzac()));
                }
                if (zzfwVar.zzah()) {
                    zzH(sb, 1, "consent_signals", zzfwVar.zzai());
                }
                List<com.google.android.gms.internal.measurement.zzgh> listZzf = zzfwVar.zzf();
                if (listZzf != null) {
                    for (com.google.android.gms.internal.measurement.zzgh zzghVar : listZzf) {
                        if (zzghVar != null) {
                            zzE(sb, 2);
                            sb.append("user_property {\n");
                            zzH(sb, 2, "set_timestamp_millis", zzghVar.zza() ? Long.valueOf(zzghVar.zzb()) : null);
                            zzH(sb, 2, AppMeasurementSdk.ConditionalUserProperty.NAME, this.zzs.zzm().zze(zzghVar.zzc()));
                            zzH(sb, 2, "string_value", zzghVar.zze());
                            zzH(sb, 2, "int_value", zzghVar.zzf() ? Long.valueOf(zzghVar.zzg()) : null);
                            zzH(sb, 2, "double_value", zzghVar.zzh() ? Double.valueOf(zzghVar.zzi()) : null);
                            zzE(sb, 2);
                            sb.append("}\n");
                        }
                    }
                }
                List<com.google.android.gms.internal.measurement.zzfk> listZzS = zzfwVar.zzS();
                if (listZzS != null) {
                    for (com.google.android.gms.internal.measurement.zzfk zzfkVar : listZzS) {
                        if (zzfkVar != null) {
                            zzE(sb, 2);
                            sb.append("audience_membership {\n");
                            if (zzfkVar.zza()) {
                                zzH(sb, 2, "audience_id", Integer.valueOf(zzfkVar.zzb()));
                            }
                            if (zzfkVar.zzf()) {
                                zzH(sb, 2, "new_audience", Boolean.valueOf(zzfkVar.zzg()));
                            }
                            zzG(sb, 2, "current_data", zzfkVar.zzc());
                            if (zzfkVar.zzd()) {
                                zzG(sb, 2, "previous_data", zzfkVar.zze());
                            }
                            zzE(sb, 2);
                            sb.append("}\n");
                        }
                    }
                }
                List<com.google.android.gms.internal.measurement.zzfo> listZzc = zzfwVar.zzc();
                if (listZzc != null) {
                    for (com.google.android.gms.internal.measurement.zzfo zzfoVar : listZzc) {
                        if (zzfoVar != null) {
                            zzE(sb, 2);
                            sb.append("event {\n");
                            zzH(sb, 2, AppMeasurementSdk.ConditionalUserProperty.NAME, this.zzs.zzm().zzc(zzfoVar.zzd()));
                            if (zzfoVar.zze()) {
                                zzH(sb, 2, "timestamp_millis", Long.valueOf(zzfoVar.zzf()));
                            }
                            if (zzfoVar.zzg()) {
                                zzH(sb, 2, "previous_timestamp_millis", Long.valueOf(zzfoVar.zzh()));
                            }
                            if (zzfoVar.zzi()) {
                                zzH(sb, 2, "count", Integer.valueOf(zzfoVar.zzj()));
                            }
                            if (zzfoVar.zzb() != 0) {
                                zzC(sb, 2, zzfoVar.zza());
                            }
                            zzE(sb, 2);
                            sb.append("}\n");
                        }
                    }
                }
                zzE(sb, 1);
                sb.append("}\n");
            }
        }
        sb.append("}\n");
        return sb.toString();
    }

    final String zzi(com.google.android.gms.internal.measurement.zzej zzejVar) {
        if (zzejVar == null) {
            return "null";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("\nevent_filter {\n");
        if (zzejVar.zza()) {
            zzH(sb, 0, "filter_id", Integer.valueOf(zzejVar.zzb()));
        }
        zzH(sb, 0, "event_name", this.zzs.zzm().zzc(zzejVar.zzc()));
        String strZzF = zzF(zzejVar.zzi(), zzejVar.zzj(), zzejVar.zzm());
        if (!strZzF.isEmpty()) {
            zzH(sb, 0, "filter_type", strZzF);
        }
        if (zzejVar.zzg()) {
            zzI(sb, 1, "event_count_filter", zzejVar.zzh());
        }
        if (zzejVar.zze() > 0) {
            sb.append("  filters {\n");
            Iterator<com.google.android.gms.internal.measurement.zzel> it = zzejVar.zzd().iterator();
            while (it.hasNext()) {
                zzD(sb, 2, it.next());
            }
        }
        zzE(sb, 1);
        sb.append("}\n}\n");
        return sb.toString();
    }

    final String zzj(com.google.android.gms.internal.measurement.zzes zzesVar) {
        if (zzesVar == null) {
            return "null";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("\nproperty_filter {\n");
        if (zzesVar.zza()) {
            zzH(sb, 0, "filter_id", Integer.valueOf(zzesVar.zzb()));
        }
        zzH(sb, 0, "property_name", this.zzs.zzm().zze(zzesVar.zzc()));
        String strZzF = zzF(zzesVar.zze(), zzesVar.zzf(), zzesVar.zzh());
        if (!strZzF.isEmpty()) {
            zzH(sb, 0, "filter_type", strZzF);
        }
        zzD(sb, 1, zzesVar.zzd());
        sb.append("}\n");
        return sb.toString();
    }

    final <T extends Parcelable> T zzk(byte[] bArr, Parcelable.Creator<T> creator) {
        if (bArr == null) {
            return null;
        }
        Parcel parcelObtain = Parcel.obtain();
        try {
            parcelObtain.unmarshall(bArr, 0, bArr.length);
            parcelObtain.setDataPosition(0);
            return creator.createFromParcel(parcelObtain);
        } catch (SafeParcelReader.ParseException e) {
            this.zzs.zzau().zzb().zza("Failed to load parcelable from buffer");
            return null;
        } finally {
            parcelObtain.recycle();
        }
    }

    final List<Long> zzo(List<Long> list, List<Integer> list2) {
        ArrayList arrayList = new ArrayList(list);
        for (Integer num : list2) {
            if (num.intValue() < 0) {
                this.zzs.zzau().zze().zzb("Ignoring negative bit index to be cleared", num);
            } else {
                int iIntValue = num.intValue() / 64;
                if (iIntValue >= arrayList.size()) {
                    this.zzs.zzau().zze().zzc("Ignoring bit index greater than bitSet size", num, Integer.valueOf(arrayList.size()));
                } else {
                    arrayList.set(iIntValue, Long.valueOf(((Long) arrayList.get(iIntValue)).longValue() & (~(1 << (num.intValue() % 64)))));
                }
            }
        }
        int size = arrayList.size();
        for (int size2 = arrayList.size() - 1; size2 >= 0 && ((Long) arrayList.get(size2)).longValue() == 0; size2--) {
            size = size2;
        }
        return arrayList.subList(0, size);
    }

    final boolean zzq(long j, long j2) {
        return j == 0 || j2 <= 0 || Math.abs(this.zzs.zzay().currentTimeMillis() - j) > j2;
    }

    final long zzr(byte[] bArr) {
        Preconditions.checkNotNull(bArr);
        this.zzs.zzl().zzg();
        MessageDigest messageDigestZzN = zzku.zzN();
        if (messageDigestZzN != null) {
            return zzku.zzO(messageDigestZzN.digest(bArr));
        }
        this.zzs.zzau().zzb().zza("Failed to get MD5");
        return 0L;
    }

    final byte[] zzs(byte[] bArr) throws IOException {
        try {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            GZIPOutputStream gZIPOutputStream = new GZIPOutputStream(byteArrayOutputStream);
            gZIPOutputStream.write(bArr);
            gZIPOutputStream.close();
            byteArrayOutputStream.close();
            return byteArrayOutputStream.toByteArray();
        } catch (IOException e) {
            this.zzs.zzau().zzb().zzb("Failed to gzip content", e);
            throw e;
        }
    }
}
