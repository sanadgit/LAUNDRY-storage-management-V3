package com.google.android.gms.cloudmessaging;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.Parcelable;
import android.util.Log;
import androidx.collection.SimpleArrayMap;
import com.google.android.gms.cloudmessaging.zza;
import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.messaging.Constants;
import com.google.zxing.client.android.Intents;
import java.io.IOException;
import java.util.concurrent.Executor;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/* JADX INFO: compiled from: com.google.android.gms:play-services-cloud-messaging@@16.0.0 */
/* JADX INFO: loaded from: classes.dex */
public class Rpc {
    private static PendingIntent zzb;
    private final Context zze;
    private final zzr zzf;
    private final ScheduledExecutorService zzg;
    private Messenger zzi;
    private zza zzj;
    private static int zza = 0;
    private static final Executor zzc = zzz.zza;
    private final SimpleArrayMap<String, TaskCompletionSource<Bundle>> zzd = new SimpleArrayMap<>();
    private Messenger zzh = new Messenger(new zzy(this, Looper.getMainLooper()));

    public Rpc(Context context) {
        this.zze = context;
        this.zzf = new zzr(context);
        ScheduledThreadPoolExecutor scheduledThreadPoolExecutor = new ScheduledThreadPoolExecutor(1);
        scheduledThreadPoolExecutor.setKeepAliveTime(60L, TimeUnit.SECONDS);
        scheduledThreadPoolExecutor.allowCoreThreadTimeOut(true);
        this.zzg = scheduledThreadPoolExecutor;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zza(Message message) {
        if (message != null && (message.obj instanceof Intent)) {
            Intent intent = (Intent) message.obj;
            intent.setExtrasClassLoader(new zza.C0008zza());
            if (intent.hasExtra("google.messenger")) {
                Parcelable parcelableExtra = intent.getParcelableExtra("google.messenger");
                if (parcelableExtra instanceof zza) {
                    this.zzj = (zza) parcelableExtra;
                }
                if (parcelableExtra instanceof Messenger) {
                    this.zzi = (Messenger) parcelableExtra;
                }
            }
            Intent intent2 = (Intent) message.obj;
            String action = intent2.getAction();
            if (!"com.google.android.c2dm.intent.REGISTRATION".equals(action)) {
                if (Log.isLoggable("Rpc", 3)) {
                    String strValueOf = String.valueOf(action);
                    Log.d("Rpc", strValueOf.length() != 0 ? "Unexpected response action: ".concat(strValueOf) : new String("Unexpected response action: "));
                    return;
                }
                return;
            }
            String stringExtra = intent2.getStringExtra("registration_id");
            if (stringExtra == null) {
                stringExtra = intent2.getStringExtra("unregistered");
            }
            if (stringExtra == null) {
                String stringExtra2 = intent2.getStringExtra(Constants.IPC_BUNDLE_KEY_SEND_ERROR);
                if (stringExtra2 == null) {
                    String strValueOf2 = String.valueOf(intent2.getExtras());
                    Log.w("Rpc", new StringBuilder(String.valueOf(strValueOf2).length() + 49).append("Unexpected response, no error or registration id ").append(strValueOf2).toString());
                    return;
                }
                if (Log.isLoggable("Rpc", 3)) {
                    String strValueOf3 = String.valueOf(stringExtra2);
                    Log.d("Rpc", strValueOf3.length() != 0 ? "Received InstanceID error ".concat(strValueOf3) : new String("Received InstanceID error "));
                }
                if (stringExtra2.startsWith("|")) {
                    String[] strArrSplit = stringExtra2.split("\\|");
                    if (strArrSplit.length <= 2 || !"ID".equals(strArrSplit[1])) {
                        String strValueOf4 = String.valueOf(stringExtra2);
                        Log.w("Rpc", strValueOf4.length() != 0 ? "Unexpected structured response ".concat(strValueOf4) : new String("Unexpected structured response "));
                        return;
                    }
                    String str = strArrSplit[2];
                    String strSubstring = strArrSplit[3];
                    if (strSubstring.startsWith(":")) {
                        strSubstring = strSubstring.substring(1);
                    }
                    zza(str, intent2.putExtra(Constants.IPC_BUNDLE_KEY_SEND_ERROR, strSubstring).getExtras());
                    return;
                }
                synchronized (this.zzd) {
                    for (int i = 0; i < this.zzd.size(); i++) {
                        zza(this.zzd.keyAt(i), intent2.getExtras());
                    }
                }
                return;
            }
            Matcher matcher = Pattern.compile("\\|ID\\|([^|]+)\\|:?+(.*)").matcher(stringExtra);
            if (!matcher.matches()) {
                if (Log.isLoggable("Rpc", 3)) {
                    String strValueOf5 = String.valueOf(stringExtra);
                    Log.d("Rpc", strValueOf5.length() != 0 ? "Unexpected response string: ".concat(strValueOf5) : new String("Unexpected response string: "));
                    return;
                }
                return;
            }
            String strGroup = matcher.group(1);
            String strGroup2 = matcher.group(2);
            if (strGroup != null) {
                Bundle extras = intent2.getExtras();
                extras.putString("registration_id", strGroup2);
                zza(strGroup, extras);
                return;
            }
            return;
        }
        Log.w("Rpc", "Dropping invalid message");
    }

    private static synchronized void zza(Context context, Intent intent) {
        if (zzb == null) {
            Intent intent2 = new Intent();
            intent2.setPackage("com.google.example.invalidpackage");
            zzb = PendingIntent.getBroadcast(context, 0, intent2, 0);
        }
        intent.putExtra("app", zzb);
    }

    private final void zza(String str, Bundle bundle) {
        synchronized (this.zzd) {
            TaskCompletionSource<Bundle> taskCompletionSourceRemove = this.zzd.remove(str);
            if (taskCompletionSourceRemove == null) {
                String strValueOf = String.valueOf(str);
                Log.w("Rpc", strValueOf.length() != 0 ? "Missing callback for ".concat(strValueOf) : new String("Missing callback for "));
            } else {
                taskCompletionSourceRemove.setResult(bundle);
            }
        }
    }

    public Task<Bundle> send(final Bundle bundle) {
        if (this.zzf.zzb() >= 12000000) {
            return zze.zza(this.zze).zzb(1, bundle).continueWith(zzc, zzt.zza);
        }
        if (!(this.zzf.zza() != 0)) {
            return Tasks.forException(new IOException("MISSING_INSTANCEID_SERVICE"));
        }
        return zzc(bundle).continueWithTask(zzc, new Continuation(this, bundle) { // from class: com.google.android.gms.cloudmessaging.zzv
            private final Rpc zza;
            private final Bundle zzb;

            {
                this.zza = this;
                this.zzb = bundle;
            }

            @Override // com.google.android.gms.tasks.Continuation
            public final Object then(Task task) {
                return this.zza.zza(this.zzb, task);
            }
        });
    }

    private static boolean zzb(Bundle bundle) {
        return bundle != null && bundle.containsKey("google.messenger");
    }

    private static synchronized String zza() {
        int i;
        i = zza;
        zza = i + 1;
        return Integer.toString(i);
    }

    /* JADX WARN: Removed duplicated region for block: B:29:0x00d0  */
    /* JADX WARN: Removed duplicated region for block: B:30:0x00d6  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private final com.google.android.gms.tasks.Task<android.os.Bundle> zzc(android.os.Bundle r9) {
        /*
            Method dump skipped, instruction units count: 257
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.cloudmessaging.Rpc.zzc(android.os.Bundle):com.google.android.gms.tasks.Task");
    }

    final /* synthetic */ void zza(String str, ScheduledFuture scheduledFuture, Task task) {
        synchronized (this.zzd) {
            this.zzd.remove(str);
        }
        scheduledFuture.cancel(false);
    }

    static final /* synthetic */ void zza(TaskCompletionSource taskCompletionSource) {
        if (taskCompletionSource.trySetException(new IOException(Intents.Scan.TIMEOUT))) {
            Log.w("Rpc", "No response");
        }
    }

    final /* synthetic */ Task zza(Bundle bundle, Task task) throws Exception {
        if (!task.isSuccessful() || !zzb((Bundle) task.getResult())) {
            return task;
        }
        return zzc(bundle).onSuccessTask(zzc, zzw.zza);
    }

    static final /* synthetic */ Task zza(Bundle bundle) throws Exception {
        if (zzb(bundle)) {
            return Tasks.forResult(null);
        }
        return Tasks.forResult(bundle);
    }

    static final /* synthetic */ Bundle zza(Task task) throws Exception {
        if (task.isSuccessful()) {
            return (Bundle) task.getResult();
        }
        if (Log.isLoggable("Rpc", 3)) {
            String strValueOf = String.valueOf(task.getException());
            Log.d("Rpc", new StringBuilder(String.valueOf(strValueOf).length() + 22).append("Error making request: ").append(strValueOf).toString());
        }
        throw new IOException("SERVICE_NOT_AVAILABLE", task.getException());
    }
}
