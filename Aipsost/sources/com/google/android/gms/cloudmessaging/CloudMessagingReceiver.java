package com.google.android.gms.cloudmessaging;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Parcelable;
import android.text.TextUtils;
import android.util.Log;
import com.google.android.gms.common.util.concurrent.NamedThreadFactory;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.messaging.Constants;
import com.google.firebase.messaging.ServiceStarter;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-cloud-messaging@@16.0.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class CloudMessagingReceiver extends BroadcastReceiver {
    private final ExecutorService zza = com.google.android.gms.internal.cloudmessaging.zza.zza().zza(new NamedThreadFactory("firebase-iid-executor"), com.google.android.gms.internal.cloudmessaging.zzf.zza);

    /* JADX INFO: compiled from: com.google.android.gms:play-services-cloud-messaging@@16.0.0 */
    public static final class IntentActionKeys {
        public static final String NOTIFICATION_DISMISS = "com.google.firebase.messaging.NOTIFICATION_DISMISS";
        public static final String NOTIFICATION_OPEN = "com.google.firebase.messaging.NOTIFICATION_OPEN";

        private IntentActionKeys() {
        }
    }

    /* JADX INFO: compiled from: com.google.android.gms:play-services-cloud-messaging@@16.0.0 */
    public static final class IntentKeys {
        public static final String PENDING_INTENT = "pending_intent";
        public static final String WRAPPED_INTENT = "wrapped_intent";

        private IntentKeys() {
        }
    }

    protected abstract int onMessageReceive(Context context, CloudMessage cloudMessage);

    protected Executor getBroadcastExecutor() {
        return this.zza;
    }

    protected void onNotificationOpen(Context context, Bundle bundle) {
    }

    protected void onNotificationDismissed(Context context, Bundle bundle) {
    }

    @Override // android.content.BroadcastReceiver
    public final void onReceive(final Context context, final Intent intent) {
        if (intent == null) {
            return;
        }
        final boolean zIsOrderedBroadcast = isOrderedBroadcast();
        final BroadcastReceiver.PendingResult pendingResultGoAsync = goAsync();
        getBroadcastExecutor().execute(new Runnable(this, intent, context, zIsOrderedBroadcast, pendingResultGoAsync) { // from class: com.google.android.gms.cloudmessaging.zzd
            private final CloudMessagingReceiver zza;
            private final Intent zzb;
            private final Context zzc;
            private final boolean zzd;
            private final BroadcastReceiver.PendingResult zze;

            {
                this.zza = this;
                this.zzb = intent;
                this.zzc = context;
                this.zzd = zIsOrderedBroadcast;
                this.zze = pendingResultGoAsync;
            }

            @Override // java.lang.Runnable
            public final void run() {
                this.zza.zza(this.zzb, this.zzc, this.zzd, this.zze);
            }
        });
    }

    private final int zza(Context context, Intent intent) {
        PendingIntent pendingIntent = (PendingIntent) intent.getParcelableExtra(IntentKeys.PENDING_INTENT);
        if (pendingIntent != null) {
            try {
                pendingIntent.send();
            } catch (PendingIntent.CanceledException e) {
                Log.e("CloudMessagingReceiver", "Notification pending intent canceled");
            }
        }
        Bundle extras = intent.getExtras();
        if (extras != null) {
            extras.remove(IntentKeys.PENDING_INTENT);
        } else {
            extras = new Bundle();
        }
        if (IntentActionKeys.NOTIFICATION_OPEN.equals(intent.getAction())) {
            onNotificationOpen(context, extras);
            return -1;
        }
        if (!IntentActionKeys.NOTIFICATION_DISMISS.equals(intent.getAction())) {
            Log.e("CloudMessagingReceiver", "Unknown notification action");
            return ServiceStarter.ERROR_UNKNOWN;
        }
        onNotificationDismissed(context, extras);
        return -1;
    }

    private final int zzb(Context context, Intent intent) {
        Task<Void> taskZza;
        if (intent.getExtras() == null) {
            return ServiceStarter.ERROR_UNKNOWN;
        }
        String stringExtra = intent.getStringExtra(Constants.MessagePayloadKeys.MSGID);
        if (TextUtils.isEmpty(stringExtra)) {
            taskZza = Tasks.forResult(null);
        } else {
            Bundle bundle = new Bundle();
            bundle.putString(Constants.MessagePayloadKeys.MSGID, stringExtra);
            taskZza = zze.zza(context).zza(2, bundle);
        }
        int iOnMessageReceive = onMessageReceive(context, new CloudMessage(intent));
        try {
            Tasks.await(taskZza, TimeUnit.SECONDS.toMillis(1L), TimeUnit.MILLISECONDS);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            String strValueOf = String.valueOf(e);
            Log.w("CloudMessagingReceiver", new StringBuilder(String.valueOf(strValueOf).length() + 20).append("Message ack failed: ").append(strValueOf).toString());
        }
        return iOnMessageReceive;
    }

    final /* synthetic */ void zza(Intent intent, Context context, boolean z, BroadcastReceiver.PendingResult pendingResult) {
        int iZzb;
        try {
            Parcelable parcelableExtra = intent.getParcelableExtra(IntentKeys.WRAPPED_INTENT);
            Intent intent2 = parcelableExtra instanceof Intent ? (Intent) parcelableExtra : null;
            if (intent2 != null) {
                iZzb = zza(context, intent2);
            } else {
                iZzb = zzb(context, intent);
            }
            if (z) {
                pendingResult.setResultCode(iZzb);
            }
        } finally {
            pendingResult.finish();
        }
    }
}
