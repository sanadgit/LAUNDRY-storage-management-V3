package com.google.android.gms.measurement.internal;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSocketFactory;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzes extends zzke {
    private final SSLSocketFactory zza;

    public zzes(zzkn zzknVar) {
        super(zzknVar);
        this.zza = null;
    }

    @Override // com.google.android.gms.measurement.internal.zzke
    protected final boolean zzaA() {
        return false;
    }

    public final boolean zzb() {
        zzZ();
        ConnectivityManager connectivityManager = (ConnectivityManager) this.zzs.zzax().getSystemService("connectivity");
        NetworkInfo activeNetworkInfo = null;
        if (connectivityManager != null) {
            try {
                activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
            } catch (SecurityException e) {
            }
        }
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }

    protected final HttpURLConnection zzc(URL url) throws IOException {
        URLConnection uRLConnectionOpenConnection = url.openConnection();
        if (!(uRLConnectionOpenConnection instanceof HttpURLConnection)) {
            throw new IOException("Failed to obtain HTTP connection");
        }
        SSLSocketFactory sSLSocketFactory = this.zza;
        if (sSLSocketFactory != null && (uRLConnectionOpenConnection instanceof HttpsURLConnection)) {
            ((HttpsURLConnection) uRLConnectionOpenConnection).setSSLSocketFactory(sSLSocketFactory);
        }
        HttpURLConnection httpURLConnection = (HttpURLConnection) uRLConnectionOpenConnection;
        httpURLConnection.setDefaultUseCaches(false);
        this.zzs.zzc();
        httpURLConnection.setConnectTimeout(60000);
        this.zzs.zzc();
        httpURLConnection.setReadTimeout(61000);
        httpURLConnection.setInstanceFollowRedirects(false);
        httpURLConnection.setDoInput(true);
        return httpURLConnection;
    }
}
