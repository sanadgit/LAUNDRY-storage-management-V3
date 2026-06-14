package com.google.android.gms.internal.p001firebaseauthapi;

import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.logging.Logger;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.internal.zzai;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.ref.WeakReference;
import java.net.HttpURLConnection;
import java.net.URL;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzxe extends AsyncTask {
    private static final Logger zza = new Logger("FirebaseAuth", "GetAuthDomainTask");
    private final String zzb;
    private final String zzc;
    private final WeakReference zzd;
    private final Uri.Builder zze;
    private final String zzf;
    private final FirebaseApp zzg;

    public zzxe(String str, String str2, Intent intent, FirebaseApp firebaseApp, zzxg zzxgVar) {
        this.zzb = Preconditions.checkNotEmpty(str);
        this.zzg = (FirebaseApp) Preconditions.checkNotNull(firebaseApp);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(intent);
        String strCheckNotEmpty = Preconditions.checkNotEmpty(intent.getStringExtra("com.google.firebase.auth.KEY_API_KEY"));
        Uri.Builder builderBuildUpon = Uri.parse(zzxgVar.zzc(strCheckNotEmpty)).buildUpon();
        builderBuildUpon.appendPath("getProjectConfig").appendQueryParameter("key", strCheckNotEmpty).appendQueryParameter("androidPackageName", str).appendQueryParameter("sha1Cert", (String) Preconditions.checkNotNull(str2));
        this.zzc = builderBuildUpon.build().toString();
        this.zzd = new WeakReference(zzxgVar);
        this.zze = zzxgVar.zzb(intent, str, str2);
        this.zzf = intent.getStringExtra("com.google.firebase.auth.KEY_CUSTOM_AUTH_DOMAIN");
    }

    /* JADX INFO: Access modifiers changed from: private */
    @Override // android.os.AsyncTask
    /* JADX INFO: renamed from: zza, reason: merged with bridge method [inline-methods] */
    public final void onPostExecute(zzxd zzxdVar) {
        String strZzc;
        String strZzd;
        Uri.Builder builder;
        zzxg zzxgVar = (zzxg) this.zzd.get();
        if (zzxdVar != null) {
            strZzc = zzxdVar.zzc();
            strZzd = zzxdVar.zzd();
        } else {
            strZzc = null;
            strZzd = null;
        }
        if (zzxgVar == null) {
            zza.e("An error has occurred: the handler reference has returned null.", new Object[0]);
        } else if (TextUtils.isEmpty(strZzc) || (builder = this.zze) == null) {
            zzxgVar.zze(this.zzb, zzai.zza(strZzd));
        } else {
            builder.authority(strZzc);
            zzxgVar.zzf(this.zze.build(), this.zzb);
        }
    }

    private static byte[] zzb(InputStream inputStream, int i) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            byte[] bArr = new byte[128];
            while (true) {
                int i2 = inputStream.read(bArr);
                if (i2 == -1) {
                    return byteArrayOutputStream.toByteArray();
                }
                byteArrayOutputStream.write(bArr, 0, i2);
            }
        } finally {
            byteArrayOutputStream.close();
        }
    }

    @Override // android.os.AsyncTask
    protected final /* bridge */ /* synthetic */ Object doInBackground(Object[] objArr) {
        String str;
        if (!TextUtils.isEmpty(this.zzf)) {
            return zzxd.zza(this.zzf);
        }
        try {
            try {
                URL url = new URL(this.zzc);
                zzxg zzxgVar = (zzxg) this.zzd.get();
                HttpURLConnection httpURLConnectionZzd = zzxgVar.zzd(url);
                httpURLConnectionZzd.addRequestProperty("Content-Type", "application/json; charset=UTF-8");
                httpURLConnectionZzd.setConnectTimeout(60000);
                new zzxq(zzxgVar.zza(), this.zzg, zzxo.zza().zzb()).zza(httpURLConnectionZzd);
                int responseCode = httpURLConnectionZzd.getResponseCode();
                if (responseCode == 200) {
                    zzzx zzzxVar = new zzzx();
                    zzzxVar.zzb(new String(zzb(httpURLConnectionZzd.getInputStream(), 128)));
                    for (String str2 : zzzxVar.zzc()) {
                        if (str2.endsWith("firebaseapp.com") || str2.endsWith("web.app")) {
                            return zzxd.zza(str2);
                        }
                    }
                    return null;
                }
                try {
                    if (httpURLConnectionZzd.getResponseCode() >= 400) {
                        InputStream errorStream = httpURLConnectionZzd.getErrorStream();
                        str = errorStream == null ? "WEB_INTERNAL_ERROR:Could not retrieve the authDomain for this project but did not receive an error response from the network request. Please try again." : (String) zzxl.zza(new String(zzb(errorStream, 128)), String.class);
                    } else {
                        str = null;
                    }
                } catch (IOException e) {
                    zza.w("Error parsing error message from response body in getErrorMessageFromBody. ".concat(e.toString()), new Object[0]);
                    str = null;
                }
                zza.e(String.format("Error getting project config. Failed with %s %s", str, Integer.valueOf(responseCode)), new Object[0]);
                return zzxd.zzb(str);
            } catch (zzvg e2) {
                zza.e("ConversionException encountered: ".concat(String.valueOf(e2.getMessage())), new Object[0]);
                return null;
            } catch (NullPointerException e3) {
                zza.e("Null pointer encountered: ".concat(String.valueOf(e3.getMessage())), new Object[0]);
                return null;
            }
        } catch (IOException e4) {
            zza.e("IOException occurred: ".concat(String.valueOf(e4.getMessage())), new Object[0]);
            return null;
        }
    }

    @Override // android.os.AsyncTask
    protected final /* synthetic */ void onCancelled(Object obj) {
        onPostExecute(null);
    }
}
