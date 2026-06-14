package com.google.android.datatransport.runtime.backends;

import com.google.android.datatransport.runtime.EventInternal;
import com.google.android.datatransport.runtime.backends.BackendRequest;
import java.util.Arrays;

/* JADX INFO: loaded from: classes.dex */
final class AutoValue_BackendRequest extends BackendRequest {
    private final Iterable<EventInternal> events;
    private final byte[] extras;

    private AutoValue_BackendRequest(Iterable<EventInternal> events, byte[] extras) {
        this.events = events;
        this.extras = extras;
    }

    @Override // com.google.android.datatransport.runtime.backends.BackendRequest
    public Iterable<EventInternal> getEvents() {
        return this.events;
    }

    @Override // com.google.android.datatransport.runtime.backends.BackendRequest
    public byte[] getExtras() {
        return this.extras;
    }

    public String toString() {
        return "BackendRequest{events=" + this.events + ", extras=" + Arrays.toString(this.extras) + "}";
    }

    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof BackendRequest)) {
            return false;
        }
        BackendRequest that = (BackendRequest) o;
        if (this.events.equals(that.getEvents())) {
            if (Arrays.equals(this.extras, that instanceof AutoValue_BackendRequest ? ((AutoValue_BackendRequest) that).extras : that.getExtras())) {
                return true;
            }
        }
        return false;
    }

    public int hashCode() {
        int h$ = 1 * 1000003;
        return ((h$ ^ this.events.hashCode()) * 1000003) ^ Arrays.hashCode(this.extras);
    }

    static final class Builder extends BackendRequest.Builder {
        private Iterable<EventInternal> events;
        private byte[] extras;

        Builder() {
        }

        @Override // com.google.android.datatransport.runtime.backends.BackendRequest.Builder
        public BackendRequest.Builder setEvents(Iterable<EventInternal> events) {
            if (events == null) {
                throw new NullPointerException("Null events");
            }
            this.events = events;
            return this;
        }

        @Override // com.google.android.datatransport.runtime.backends.BackendRequest.Builder
        public BackendRequest.Builder setExtras(byte[] extras) {
            this.extras = extras;
            return this;
        }

        @Override // com.google.android.datatransport.runtime.backends.BackendRequest.Builder
        public BackendRequest build() {
            String missing = this.events == null ? " events" : "";
            if (!missing.isEmpty()) {
                throw new IllegalStateException("Missing required properties:" + missing);
            }
            return new AutoValue_BackendRequest(this.events, this.extras);
        }
    }
}
