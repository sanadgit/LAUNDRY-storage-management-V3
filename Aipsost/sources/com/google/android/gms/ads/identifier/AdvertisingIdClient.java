package com.google.android.gms.ads.identifier;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.RemoteException;
import android.os.SystemClock;
import android.util.Log;
import com.google.android.gms.common.BlockingServiceConnection;
import com.google.android.gms.common.GoogleApiAvailabilityLight;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.stats.ConnectionTracker;
import com.google.android.gms.internal.ads_identifier.zze;
import com.google.android.gms.internal.ads_identifier.zzf;
import com.google.firebase.messaging.Constants;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import javax.annotation.ParametersAreNonnullByDefault;

/* JADX INFO: loaded from: classes.dex */
@ParametersAreNonnullByDefault
public class AdvertisingIdClient {
    private final Context mContext;
    private BlockingServiceConnection zze;
    private zze zzf;
    private boolean zzg;
    private final Object zzh;
    private zza zzi;
    private final boolean zzj;
    private final long zzk;

    public static final class Info {
        private final String zzq;
        private final boolean zzr;

        public Info(String str, boolean z) {
            this.zzq = str;
            this.zzr = z;
        }

        public final String getId() {
            return this.zzq;
        }

        public final boolean isLimitAdTrackingEnabled() {
            return this.zzr;
        }

        public final String toString() {
            String str = this.zzq;
            return new StringBuilder(String.valueOf(str).length() + 7).append("{").append(str).append("}").append(this.zzr).toString();
        }
    }

    static class zza extends Thread {
        private WeakReference<AdvertisingIdClient> zzm;
        private long zzn;
        CountDownLatch zzo = new CountDownLatch(1);
        boolean zzp = false;

        public zza(AdvertisingIdClient advertisingIdClient, long j) {
            this.zzm = new WeakReference<>(advertisingIdClient);
            this.zzn = j;
            start();
        }

        private final void disconnect() {
            AdvertisingIdClient advertisingIdClient = this.zzm.get();
            if (advertisingIdClient != null) {
                advertisingIdClient.finish();
                this.zzp = true;
            }
        }

        @Override // java.lang.Thread, java.lang.Runnable
        public final void run() {
            try {
                if (this.zzo.await(this.zzn, TimeUnit.MILLISECONDS)) {
                    return;
                }
                disconnect();
            } catch (InterruptedException e) {
                disconnect();
            }
        }
    }

    public AdvertisingIdClient(Context context) {
        this(context, 30000L, false, false);
    }

    private AdvertisingIdClient(Context context, long j, boolean z, boolean z2) {
        Context applicationContext;
        this.zzh = new Object();
        Preconditions.checkNotNull(context);
        if (z && (applicationContext = context.getApplicationContext()) != null) {
            context = applicationContext;
        }
        this.mContext = context;
        this.zzg = false;
        this.zzk = j;
        this.zzj = z2;
    }

    public static Info getAdvertisingIdInfo(Context context) throws GooglePlayServicesRepairableException, IllegalStateException, GooglePlayServicesNotAvailableException, IOException {
        zzb zzbVar = new zzb(context);
        boolean z = zzbVar.getBoolean("gads:ad_id_app_context:enabled", false);
        float f = zzbVar.getFloat("gads:ad_id_app_context:ping_ratio", 0.0f);
        String string = zzbVar.getString("gads:ad_id_use_shared_preference:experiment_id", "");
        AdvertisingIdClient advertisingIdClient = new AdvertisingIdClient(context, -1L, z, zzbVar.getBoolean("gads:ad_id_use_persistent_service:enabled", false));
        try {
            long jElapsedRealtime = SystemClock.elapsedRealtime();
            advertisingIdClient.zza(false);
            Info info = advertisingIdClient.getInfo();
            advertisingIdClient.zza(info, z, f, SystemClock.elapsedRealtime() - jElapsedRealtime, string, null);
            return info;
        } finally {
        }
    }

    public static boolean getIsAdIdFakeForDebugLogging(Context context) throws GooglePlayServicesRepairableException, GooglePlayServicesNotAvailableException, IOException {
        zzb zzbVar = new zzb(context);
        AdvertisingIdClient advertisingIdClient = new AdvertisingIdClient(context, -1L, zzbVar.getBoolean("gads:ad_id_app_context:enabled", false), zzbVar.getBoolean("com.google.android.gms.ads.identifier.service.PERSISTENT_START", false));
        try {
            advertisingIdClient.zza(false);
            return advertisingIdClient.zzb();
        } finally {
            advertisingIdClient.finish();
        }
    }

    public static void setShouldSkipGmsCoreVersionCheck(boolean z) {
    }

    private static BlockingServiceConnection zza(Context context, boolean z) throws GooglePlayServicesRepairableException, GooglePlayServicesNotAvailableException, IOException {
        try {
            context.getPackageManager().getPackageInfo("com.android.vending", 0);
            switch (GoogleApiAvailabilityLight.getInstance().isGooglePlayServicesAvailable(context, 12451000)) {
                case 0:
                case 2:
                    String str = z ? "com.google.android.gms.ads.identifier.service.PERSISTENT_START" : "com.google.android.gms.ads.identifier.service.START";
                    BlockingServiceConnection blockingServiceConnection = new BlockingServiceConnection();
                    Intent intent = new Intent(str);
                    intent.setPackage("com.google.android.gms");
                    try {
                        if (ConnectionTracker.getInstance().bindService(context, intent, blockingServiceConnection, 1)) {
                            return blockingServiceConnection;
                        }
                        throw new IOException("Connection failure");
                    } catch (Throwable th) {
                        throw new IOException(th);
                    }
                case 1:
                default:
                    throw new IOException("Google Play services not available");
            }
        } catch (PackageManager.NameNotFoundException e) {
            throw new GooglePlayServicesNotAvailableException(9);
        }
    }

    private static zze zza(Context context, BlockingServiceConnection blockingServiceConnection) throws IOException {
        try {
            return zzf.zza(blockingServiceConnection.getServiceWithTimeout(10000L, TimeUnit.MILLISECONDS));
        } catch (InterruptedException e) {
            throw new IOException("Interrupted exception");
        } catch (Throwable th) {
            throw new IOException(th);
        }
    }

    private final void zza() {
        synchronized (this.zzh) {
            zza zzaVar = this.zzi;
            if (zzaVar != null) {
                zzaVar.zzo.countDown();
                try {
                    this.zzi.join();
                } catch (InterruptedException e) {
                }
            }
            if (this.zzk > 0) {
                this.zzi = new zza(this, this.zzk);
            }
        }
    }

    private final void zza(boolean z) throws GooglePlayServicesRepairableException, IllegalStateException, GooglePlayServicesNotAvailableException, IOException {
        Preconditions.checkNotMainThread("Calling this from your main thread can lead to deadlock");
        synchronized (this) {
            if (this.zzg) {
                finish();
            }
            BlockingServiceConnection blockingServiceConnectionZza = zza(this.mContext, this.zzj);
            this.zze = blockingServiceConnectionZza;
            this.zzf = zza(this.mContext, blockingServiceConnectionZza);
            this.zzg = true;
            if (z) {
                zza();
            }
        }
    }

    private final boolean zza(Info info, boolean z, float f, long j, String str, Throwable th) {
        if (Math.random() > f) {
            return false;
        }
        HashMap map = new HashMap();
        map.put("app_context", z ? "1" : "0");
        if (info != null) {
            map.put("limit_ad_tracking", info.isLimitAdTrackingEnabled() ? "1" : "0");
        }
        if (info != null && info.getId() != null) {
            map.put("ad_id_size", Integer.toString(info.getId().length()));
        }
        if (th != null) {
            map.put(Constants.IPC_BUNDLE_KEY_SEND_ERROR, th.getClass().getName());
        }
        if (str != null && !str.isEmpty()) {
            map.put("experiment_id", str);
        }
        map.put("tag", "AdvertisingIdClient");
        map.put("time_spent", Long.toString(j));
        new com.google.android.gms.ads.identifier.zza(this, map).start();
        return true;
    }

    private final boolean zzb() throws IOException {
        boolean zZzc;
        Preconditions.checkNotMainThread("Calling this from your main thread can lead to deadlock");
        synchronized (this) {
            if (this.zzg) {
                Preconditions.checkNotNull(this.zze);
                Preconditions.checkNotNull(this.zzf);
                zZzc = this.zzf.zzc();
            } else {
                synchronized (this.zzh) {
                    zza zzaVar = this.zzi;
                    if (zzaVar == null || !zzaVar.zzp) {
                        throw new IOException("AdvertisingIdClient is not connected.");
                    }
                }
                try {
                    zza(false);
                    if (!this.zzg) {
                        throw new IOException("AdvertisingIdClient cannot reconnect.");
                    }
                    Preconditions.checkNotNull(this.zze);
                    Preconditions.checkNotNull(this.zzf);
                    try {
                        zZzc = this.zzf.zzc();
                    } catch (RemoteException e) {
                        Log.i("AdvertisingIdClient", "GMS remote exception ", e);
                        throw new IOException("Remote exception");
                    }
                } catch (Exception e2) {
                    throw new IOException("AdvertisingIdClient cannot reconnect.", e2);
                }
            }
        }
        zza();
        return zZzc;
    }

    protected void finalize() throws Throwable {
        finish();
        super.finalize();
    }

    public final void finish() {
        Preconditions.checkNotMainThread("Calling this from your main thread can lead to deadlock");
        synchronized (this) {
            if (this.mContext == null || this.zze == null) {
                return;
            }
            try {
                if (this.zzg) {
                    ConnectionTracker.getInstance().unbindService(this.mContext, this.zze);
                }
            } catch (Throwable th) {
                Log.i("AdvertisingIdClient", "AdvertisingIdClient unbindService failed.", th);
            }
            this.zzg = false;
            this.zzf = null;
            this.zze = null;
        }
    }

    public Info getInfo() throws IOException {
        Info info;
        Preconditions.checkNotMainThread("Calling this from your main thread can lead to deadlock");
        synchronized (this) {
            if (this.zzg) {
                Preconditions.checkNotNull(this.zze);
                Preconditions.checkNotNull(this.zzf);
                info = new Info(this.zzf.getId(), this.zzf.zzb(true));
            } else {
                synchronized (this.zzh) {
                    zza zzaVar = this.zzi;
                    if (zzaVar == null || !zzaVar.zzp) {
                        throw new IOException("AdvertisingIdClient is not connected.");
                    }
                }
                try {
                    zza(false);
                    if (!this.zzg) {
                        throw new IOException("AdvertisingIdClient cannot reconnect.");
                    }
                    Preconditions.checkNotNull(this.zze);
                    Preconditions.checkNotNull(this.zzf);
                    try {
                        info = new Info(this.zzf.getId(), this.zzf.zzb(true));
                    } catch (RemoteException e) {
                        Log.i("AdvertisingIdClient", "GMS remote exception ", e);
                        throw new IOException("Remote exception");
                    }
                } catch (Exception e2) {
                    throw new IOException("AdvertisingIdClient cannot reconnect.", e2);
                }
            }
        }
        zza();
        return info;
    }

    public void start() throws GooglePlayServicesRepairableException, IllegalStateException, GooglePlayServicesNotAvailableException, IOException {
        zza(true);
    }
}
