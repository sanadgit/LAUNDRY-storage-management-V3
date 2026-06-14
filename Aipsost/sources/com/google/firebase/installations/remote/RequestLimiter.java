package com.google.firebase.installations.remote;

import com.google.firebase.installations.Utils;
import java.util.concurrent.TimeUnit;

/* JADX INFO: loaded from: classes11.dex */
class RequestLimiter {
    private static final long MAXIMUM_BACKOFF_DURATION_FOR_CONFIGURATION_ERRORS = TimeUnit.HOURS.toMillis(24);
    private static final long MAXIMUM_BACKOFF_DURATION_FOR_SERVER_ERRORS = TimeUnit.MINUTES.toMillis(30);
    private int attemptCount;
    private long nextRequestTime;
    private final Utils utils;

    RequestLimiter(Utils utils) {
        this.utils = utils;
    }

    RequestLimiter() {
        this.utils = Utils.getInstance();
    }

    public synchronized void setNextRequestTime(int responseCode) {
        if (isSuccessfulOrRequiresNewFidCreation(responseCode)) {
            resetBackoffStrategy();
            return;
        }
        this.attemptCount++;
        long backOffTime = getBackoffDuration(responseCode);
        this.nextRequestTime = this.utils.currentTimeInMillis() + backOffTime;
    }

    private synchronized void resetBackoffStrategy() {
        this.attemptCount = 0;
    }

    private synchronized long getBackoffDuration(int responseCode) {
        if (!isRetryableError(responseCode)) {
            return MAXIMUM_BACKOFF_DURATION_FOR_CONFIGURATION_ERRORS;
        }
        return (long) Math.min(Math.pow(2.0d, this.attemptCount) + this.utils.getRandomDelayForSyncPrevention(), MAXIMUM_BACKOFF_DURATION_FOR_SERVER_ERRORS);
    }

    private static boolean isRetryableError(int responseCode) {
        return responseCode == 429 || (responseCode >= 500 && responseCode < 600);
    }

    private static boolean isSuccessfulOrRequiresNewFidCreation(int responseCode) {
        return (responseCode >= 200 && responseCode < 300) || responseCode == 401 || responseCode == 404;
    }

    /* JADX WARN: Removed duplicated region for block: B:10:0x0014  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public synchronized boolean isRequestAllowed() {
        /*
            r5 = this;
            monitor-enter(r5)
            int r0 = r5.attemptCount     // Catch: java.lang.Throwable -> L17
            if (r0 == 0) goto L14
            com.google.firebase.installations.Utils r0 = r5.utils     // Catch: java.lang.Throwable -> L17
            long r0 = r0.currentTimeInMillis()     // Catch: java.lang.Throwable -> L17
            long r2 = r5.nextRequestTime     // Catch: java.lang.Throwable -> L17
            int r4 = (r0 > r2 ? 1 : (r0 == r2 ? 0 : -1))
            if (r4 <= 0) goto L12
            goto L14
        L12:
            r0 = 0
            goto L15
        L14:
            r0 = 1
        L15:
            monitor-exit(r5)
            return r0
        L17:
            r0 = move-exception
            monitor-exit(r5)
            throw r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.firebase.installations.remote.RequestLimiter.isRequestAllowed():boolean");
    }
}
