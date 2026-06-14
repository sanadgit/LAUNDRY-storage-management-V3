package com.google.firebase.iid;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.google.android.gms.cloudmessaging.CloudMessage;
import com.google.android.gms.cloudmessaging.CloudMessagingReceiver;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.messaging.Constants;
import com.google.firebase.messaging.FcmBroadcastProcessor;
import com.google.firebase.messaging.MessagingAnalytics;
import com.google.firebase.messaging.ServiceStarter;
import java.util.concurrent.ExecutionException;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
public final class FirebaseInstanceIdReceiver extends CloudMessagingReceiver {
    @Override // com.google.android.gms.cloudmessaging.CloudMessagingReceiver
    protected final int onMessageReceive(Context context, CloudMessage cloudMessage) {
        try {
            return ((Integer) Tasks.await(new FcmBroadcastProcessor(context).process(cloudMessage.getIntent()))).intValue();
        } catch (InterruptedException | ExecutionException e) {
            Log.e(Constants.TAG, "Failed to send message to service.", e);
            return ServiceStarter.ERROR_UNKNOWN;
        }
    }

    @Override // com.google.android.gms.cloudmessaging.CloudMessagingReceiver
    protected final void onNotificationDismissed(Context context, Bundle bundle) {
        Intent intentPutExtras = new Intent(CloudMessagingReceiver.IntentActionKeys.NOTIFICATION_DISMISS).putExtras(bundle);
        if (MessagingAnalytics.shouldUploadScionMetrics(intentPutExtras)) {
            MessagingAnalytics.logNotificationDismiss(intentPutExtras);
        }
    }
}
