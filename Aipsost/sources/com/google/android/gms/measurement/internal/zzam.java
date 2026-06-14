package com.google.android.gms.measurement.internal;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.accounts.AuthenticatorException;
import android.accounts.OperationCanceledException;
import androidx.core.content.ContextCompat;
import com.google.android.gms.common.internal.AccountType;
import java.io.IOException;
import java.util.Calendar;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzam extends zzgo {
    private long zza;
    private String zzb;
    private AccountManager zzc;
    private Boolean zzd;
    private long zze;

    zzam(zzfu zzfuVar) {
        super(zzfuVar);
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    protected final boolean zza() {
        Calendar calendar = Calendar.getInstance();
        this.zza = TimeUnit.MINUTES.convert(calendar.get(15) + calendar.get(16), TimeUnit.MILLISECONDS);
        Locale locale = Locale.getDefault();
        String lowerCase = locale.getLanguage().toLowerCase(Locale.ENGLISH);
        String lowerCase2 = locale.getCountry().toLowerCase(Locale.ENGLISH);
        StringBuilder sb = new StringBuilder(String.valueOf(lowerCase).length() + 1 + String.valueOf(lowerCase2).length());
        sb.append(lowerCase);
        sb.append("-");
        sb.append(lowerCase2);
        this.zzb = sb.toString();
        return false;
    }

    public final long zzb() {
        zzv();
        return this.zza;
    }

    public final String zzc() {
        zzv();
        return this.zzb;
    }

    final long zzd() {
        zzg();
        return this.zze;
    }

    final void zze() {
        zzg();
        this.zzd = null;
        this.zze = 0L;
    }

    final boolean zzf() {
        Account[] result;
        zzg();
        long jCurrentTimeMillis = this.zzs.zzay().currentTimeMillis();
        if (jCurrentTimeMillis - this.zze > 86400000) {
            this.zzd = null;
        }
        Boolean bool = this.zzd;
        if (bool != null) {
            return bool.booleanValue();
        }
        if (ContextCompat.checkSelfPermission(this.zzs.zzax(), "android.permission.GET_ACCOUNTS") != 0) {
            this.zzs.zzau().zzf().zza("Permission error checking for dasher/unicorn accounts");
            this.zze = jCurrentTimeMillis;
            this.zzd = false;
            return false;
        }
        if (this.zzc == null) {
            this.zzc = AccountManager.get(this.zzs.zzax());
        }
        try {
            result = this.zzc.getAccountsByTypeAndFeatures(AccountType.GOOGLE, new String[]{"service_HOSTED"}, null, null).getResult();
        } catch (AuthenticatorException | OperationCanceledException | IOException e) {
            this.zzs.zzau().zzc().zzb("Exception checking account types", e);
        }
        if (result != null && result.length > 0) {
            this.zzd = true;
            this.zze = jCurrentTimeMillis;
            return true;
        }
        Account[] result2 = this.zzc.getAccountsByTypeAndFeatures(AccountType.GOOGLE, new String[]{"service_uca"}, null, null).getResult();
        if (result2 != null && result2.length > 0) {
            this.zzd = true;
            this.zze = jCurrentTimeMillis;
            return true;
        }
        this.zze = jCurrentTimeMillis;
        this.zzd = false;
        return false;
    }
}
