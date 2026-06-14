package com.google.firebase.messaging;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import com.google.firebase.messaging.Constants;
import java.util.ArrayDeque;
import java.util.Queue;
import java.util.concurrent.ExecutorService;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
public class FirebaseMessagingService extends EnhancedIntentService {
    public static final String ACTION_DIRECT_BOOT_REMOTE_INTENT = "com.google.firebase.messaging.RECEIVE_DIRECT_BOOT";
    private static final Queue<String> recentlyReceivedMessageIds = new ArrayDeque(10);

    private boolean alreadyReceivedMessage(String str) {
        if (TextUtils.isEmpty(str)) {
            return false;
        }
        Queue<String> queue = recentlyReceivedMessageIds;
        if (!queue.contains(str)) {
            if (queue.size() >= 10) {
                queue.remove();
            }
            queue.add(str);
            return false;
        }
        if (!Log.isLoggable(Constants.TAG, 3)) {
            return true;
        }
        String strValueOf = String.valueOf(str);
        Log.d(Constants.TAG, strValueOf.length() != 0 ? "Received duplicate message: ".concat(strValueOf) : new String("Received duplicate message: "));
        return true;
    }

    private void dispatchMessage(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras == null) {
            extras = new Bundle();
        }
        extras.remove("androidx.content.wakelockid");
        if (NotificationParams.isNotification(extras)) {
            NotificationParams notificationParams = new NotificationParams(extras);
            ExecutorService executorServiceNewNetworkIOExecutor = FcmExecutors.newNetworkIOExecutor();
            try {
                if (new DisplayNotification(this, notificationParams, executorServiceNewNetworkIOExecutor).handleNotification()) {
                    return;
                }
                executorServiceNewNetworkIOExecutor.shutdown();
                if (MessagingAnalytics.shouldUploadScionMetrics(intent)) {
                    MessagingAnalytics.logNotificationForeground(intent);
                }
            } finally {
                executorServiceNewNetworkIOExecutor.shutdown();
            }
        }
        onMessageReceived(new RemoteMessage(extras));
    }

    private String getMessageId(Intent intent) {
        String stringExtra = intent.getStringExtra(Constants.MessagePayloadKeys.MSGID);
        return stringExtra == null ? intent.getStringExtra(Constants.MessagePayloadKeys.MSGID_SERVER) : stringExtra;
    }

    private void handleMessageIntent(Intent intent) {
        if (alreadyReceivedMessage(intent.getStringExtra(Constants.MessagePayloadKeys.MSGID))) {
            return;
        }
        passMessageIntentToSdk(intent);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:20:0x0039  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private void passMessageIntentToSdk(android.content.Intent r4) {
        /*
            r3 = this;
            java.lang.String r0 = "message_type"
            java.lang.String r0 = r4.getStringExtra(r0)
            java.lang.String r1 = "gcm"
            if (r0 != 0) goto Lb
            r0 = r1
        Lb:
            int r2 = r0.hashCode()
            switch(r2) {
                case -2062414158: goto L2f;
                case 102161: goto L27;
                case 814694033: goto L1d;
                case 814800675: goto L13;
                default: goto L12;
            }
        L12:
            goto L39
        L13:
            java.lang.String r1 = "send_event"
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L39
            r1 = 2
            goto L3a
        L1d:
            java.lang.String r1 = "send_error"
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L39
            r1 = 3
            goto L3a
        L27:
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L39
            r1 = 0
            goto L3a
        L2f:
            java.lang.String r1 = "deleted_messages"
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L39
            r1 = 1
            goto L3a
        L39:
            r1 = -1
        L3a:
            switch(r1) {
                case 0: goto L6c;
                case 1: goto L68;
                case 2: goto L5d;
                case 3: goto L4a;
                default: goto L3d;
            }
        L3d:
            int r4 = r0.length()
            java.lang.String r1 = "Received message with unknown type: "
            if (r4 == 0) goto L73
            java.lang.String r4 = r1.concat(r0)
            goto L78
        L4a:
            java.lang.String r0 = r3.getMessageId(r4)
            com.google.firebase.messaging.SendException r1 = new com.google.firebase.messaging.SendException
            java.lang.String r2 = "error"
            java.lang.String r4 = r4.getStringExtra(r2)
            r1.<init>(r4)
            r3.onSendError(r0, r1)
            return
        L5d:
            java.lang.String r0 = "google.message_id"
            java.lang.String r4 = r4.getStringExtra(r0)
            r3.onMessageSent(r4)
            return
        L68:
            r3.onDeletedMessages()
            return
        L6c:
            com.google.firebase.messaging.MessagingAnalytics.logNotificationReceived(r4)
            r3.dispatchMessage(r4)
            return
        L73:
            java.lang.String r4 = new java.lang.String
            r4.<init>(r1)
        L78:
            java.lang.String r0 = "FirebaseMessaging"
            android.util.Log.w(r0, r4)
            return
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.firebase.messaging.FirebaseMessagingService.passMessageIntentToSdk(android.content.Intent):void");
    }

    @Override // com.google.firebase.messaging.EnhancedIntentService
    protected Intent getStartCommandIntent(Intent intent) {
        return ServiceStarter.getInstance().getMessagingEvent();
    }

    @Override // com.google.firebase.messaging.EnhancedIntentService
    public void handleIntent(Intent intent) {
        String action = intent.getAction();
        if ("com.google.android.c2dm.intent.RECEIVE".equals(action) || ACTION_DIRECT_BOOT_REMOTE_INTENT.equals(action)) {
            handleMessageIntent(intent);
        } else if ("com.google.firebase.messaging.NEW_TOKEN".equals(action)) {
            onNewToken(intent.getStringExtra("token"));
        } else {
            String strValueOf = String.valueOf(intent.getAction());
            Log.d(Constants.TAG, strValueOf.length() != 0 ? "Unknown intent action: ".concat(strValueOf) : new String("Unknown intent action: "));
        }
    }

    public void onDeletedMessages() {
    }

    public void onMessageReceived(RemoteMessage remoteMessage) {
    }

    public void onMessageSent(String str) {
    }

    public void onNewToken(String str) {
    }

    public void onSendError(String str, Exception exc) {
    }
}
