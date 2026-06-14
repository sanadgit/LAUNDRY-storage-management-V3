package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzls implements zzlf {
    private final zzli zza;
    private final String zzb;
    private final Object[] zzc;
    private final int zzd;

    zzls(zzli zzliVar, String str, Object[] objArr) {
        char cCharAt;
        this.zza = zzliVar;
        this.zzb = str;
        this.zzc = objArr;
        int i = 1;
        try {
            cCharAt = str.charAt(0);
        } catch (StringIndexOutOfBoundsException e) {
            char[] charArray = str.toCharArray();
            String str2 = new String(charArray);
            try {
                cCharAt = str2.charAt(0);
                str = str2;
            } catch (StringIndexOutOfBoundsException e2) {
                try {
                    char[] cArr = new char[str2.length()];
                    str2.getChars(0, str2.length(), cArr, 0);
                    String str3 = new String(cArr);
                    try {
                        cCharAt = str3.charAt(0);
                        str = str3;
                    } catch (ArrayIndexOutOfBoundsException | StringIndexOutOfBoundsException e3) {
                        e = e3;
                        str2 = str3;
                        throw new IllegalStateException(String.format("Failed parsing '%s' with charArray.length of %d", str2, Integer.valueOf(charArray.length)), e);
                    }
                } catch (ArrayIndexOutOfBoundsException e4) {
                    e = e4;
                } catch (StringIndexOutOfBoundsException e5) {
                    e = e5;
                }
            }
        }
        if (cCharAt < 55296) {
            this.zzd = cCharAt;
            return;
        }
        int i2 = cCharAt & 8191;
        int i3 = 13;
        while (true) {
            int i4 = i + 1;
            char cCharAt2 = str.charAt(i);
            if (cCharAt2 < 55296) {
                this.zzd = (cCharAt2 << i3) | i2;
                return;
            } else {
                i2 |= (cCharAt2 & 8191) << i3;
                i3 += 13;
                i = i4;
            }
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzlf
    public final boolean zza() {
        return (this.zzd & 2) == 2;
    }

    @Override // com.google.android.gms.internal.measurement.zzlf
    public final zzli zzb() {
        return this.zza;
    }

    @Override // com.google.android.gms.internal.measurement.zzlf
    public final int zzc() {
        return (this.zzd & 1) == 1 ? 1 : 2;
    }

    final String zzd() {
        return this.zzb;
    }

    final Object[] zze() {
        return this.zzc;
    }
}
