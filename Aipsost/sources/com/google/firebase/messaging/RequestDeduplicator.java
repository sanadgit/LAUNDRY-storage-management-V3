package com.google.firebase.messaging;

import android.util.Log;
import androidx.collection.ArrayMap;
import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.Task;
import java.util.Map;
import java.util.concurrent.Executor;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
class RequestDeduplicator {
    private final Executor executor;
    private final Map<String, Task<String>> getTokenRequests = new ArrayMap();

    /* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
    interface GetTokenRequest {
        Task<String> start();
    }

    RequestDeduplicator(Executor executor) {
        this.executor = executor;
    }

    synchronized Task<String> getOrStartGetTokenRequest(final String str, GetTokenRequest getTokenRequest) {
        Task<String> task = this.getTokenRequests.get(str);
        if (task != null) {
            if (Log.isLoggable(Constants.TAG, 3)) {
                String strValueOf = String.valueOf(str);
                Log.d(Constants.TAG, strValueOf.length() != 0 ? "Joining ongoing request for: ".concat(strValueOf) : new String("Joining ongoing request for: "));
            }
            return task;
        }
        if (Log.isLoggable(Constants.TAG, 3)) {
            String strValueOf2 = String.valueOf(str);
            Log.d(Constants.TAG, strValueOf2.length() != 0 ? "Making new request for: ".concat(strValueOf2) : new String("Making new request for: "));
        }
        Task taskContinueWithTask = getTokenRequest.start().continueWithTask(this.executor, new Continuation(this, str) { // from class: com.google.firebase.messaging.RequestDeduplicator$$Lambda$0
            private final RequestDeduplicator arg$1;
            private final String arg$2;

            {
                this.arg$1 = this;
                this.arg$2 = str;
            }

            @Override // com.google.android.gms.tasks.Continuation
            public Object then(Task task2) throws Exception {
                this.arg$1.lambda$getOrStartGetTokenRequest$0$RequestDeduplicator(this.arg$2, task2);
                return task2;
            }
        });
        this.getTokenRequests.put(str, (Task<String>) taskContinueWithTask);
        return taskContinueWithTask;
    }

    final /* synthetic */ Task lambda$getOrStartGetTokenRequest$0$RequestDeduplicator(String str, Task task) throws Exception {
        synchronized (this) {
            this.getTokenRequests.remove(str);
        }
        return task;
    }
}
