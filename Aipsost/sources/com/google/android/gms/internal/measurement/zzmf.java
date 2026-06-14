package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzmf {
    static String zza(zzjd zzjdVar) {
        StringBuilder sb = new StringBuilder(zzjdVar.zzc());
        for (int i = 0; i < zzjdVar.zzc(); i++) {
            byte bZza = zzjdVar.zza(i);
            switch (bZza) {
                case 7:
                    sb.append("\\a");
                    break;
                case 8:
                    sb.append("\\b");
                    break;
                case 9:
                    sb.append("\\t");
                    break;
                case 10:
                    sb.append("\\n");
                    break;
                case 11:
                    sb.append("\\v");
                    break;
                case 12:
                    sb.append("\\f");
                    break;
                case 13:
                    sb.append("\\r");
                    break;
                case 34:
                    sb.append("\\\"");
                    break;
                case 39:
                    sb.append("\\'");
                    break;
                case 92:
                    sb.append("\\\\");
                    break;
                default:
                    if (bZza < 32 || bZza > 126) {
                        sb.append('\\');
                        sb.append((char) (((bZza >>> 6) & 3) + 48));
                        sb.append((char) (((bZza >>> 3) & 7) + 48));
                        sb.append((char) ((bZza & 7) + 48));
                    } else {
                        sb.append((char) bZza);
                    }
                    break;
            }
        }
        return sb.toString();
    }
}
