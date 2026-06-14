package com.google.android.gms.measurement.internal;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSocketFactory;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzia extends zzgo {
    private final SSLSocketFactory zza;

    zzia(zzfu zzfuVar) {
        super(zzfuVar);
        this.zza = null;
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    protected final boolean zza() {
        return false;
    }

    protected final HttpURLConnection zzd(URL url) throws IOException {
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
