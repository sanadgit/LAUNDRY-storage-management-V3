package com.google.android.datatransport.runtime.backends;

import com.google.android.datatransport.runtime.backends.BackendResponse;

/* JADX INFO: loaded from: classes.dex */
final class AutoValue_BackendResponse extends BackendResponse {
    private final long nextRequestWaitMillis;
    private final BackendResponse.Status status;

    AutoValue_BackendResponse(BackendResponse.Status status, long nextRequestWaitMillis) {
        if (status == null) {
            throw new NullPointerException("Null status");
        }
        this.status = status;
        this.nextRequestWaitMillis = nextRequestWaitMillis;
    }

    @Override // com.google.android.datatransport.runtime.backends.BackendResponse
    public BackendResponse.Status getStatus() {
        return this.status;
    }

    @Override // com.google.android.datatransport.runtime.backends.BackendResponse
    public long getNextRequestWaitMillis() {
        return this.nextRequestWaitMillis;
    }

    public String toString() {
        return "BackendResponse{status=" + this.status + ", nextRequestWaitMillis=" + this.nextRequestWaitMillis + "}";
    }

    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof BackendResponse)) {
            return false;
        }
        BackendResponse that = (BackendResponse) o;
        return this.status.equals(that.getStatus()) && this.nextRequestWaitMillis == that.getNextRequestWaitMillis();
    }

    public int hashCode() {
        int h$ = 1 * 1000003;
        int h$2 = (h$ ^ this.status.hashCode()) * 1000003;
        long j = this.nextRequestWaitMillis;
        return h$2 ^ ((int) (j ^ (j >>> 32)));
    }
}
