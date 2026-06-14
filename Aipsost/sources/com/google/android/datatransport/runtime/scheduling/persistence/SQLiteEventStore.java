package com.google.android.datatransport.runtime.scheduling.persistence;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteDatabaseLockedException;
import android.os.SystemClock;
import android.util.Base64;
import com.google.android.datatransport.Encoding;
import com.google.android.datatransport.runtime.EncodedPayload;
import com.google.android.datatransport.runtime.EventInternal;
import com.google.android.datatransport.runtime.TransportContext;
import com.google.android.datatransport.runtime.logging.Logging;
import com.google.android.datatransport.runtime.synchronization.SynchronizationException;
import com.google.android.datatransport.runtime.synchronization.SynchronizationGuard;
import com.google.android.datatransport.runtime.time.Clock;
import com.google.android.datatransport.runtime.util.PriorityMapping;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import javax.inject.Inject;
import javax.inject.Singleton;

/* JADX INFO: loaded from: classes.dex */
@Singleton
public class SQLiteEventStore implements EventStore, SynchronizationGuard {
    private static final int LOCK_RETRY_BACK_OFF_MILLIS = 50;
    private static final String LOG_TAG = "SQLiteEventStore";
    static final int MAX_RETRIES = 16;
    private static final Encoding PROTOBUF_ENCODING = Encoding.of("proto");
    private final EventStoreConfig config;
    private final Clock monotonicClock;
    private final SchemaManager schemaManager;
    private final Clock wallClock;

    interface Function<T, U> {
        U apply(T t);
    }

    interface Producer<T> {
        T produce();
    }

    @Inject
    SQLiteEventStore(Clock wallClock, Clock clock, EventStoreConfig config, SchemaManager schemaManager) {
        this.schemaManager = schemaManager;
        this.wallClock = wallClock;
        this.monotonicClock = clock;
        this.config = config;
    }

    SQLiteDatabase getDb() {
        final SchemaManager schemaManager = this.schemaManager;
        Objects.requireNonNull(schemaManager);
        return (SQLiteDatabase) retryIfDbLocked(new Producer() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda16
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Producer
            public final Object produce() {
                return schemaManager.getWritableDatabase();
            }
        }, new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda17
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$getDb$0((Throwable) obj);
            }
        });
    }

    static /* synthetic */ SQLiteDatabase lambda$getDb$0(Throwable ex) {
        throw new SynchronizationException("Timed out while trying to open db.", ex);
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public PersistedEvent persist(final TransportContext transportContext, final EventInternal event) {
        Logging.d(LOG_TAG, "Storing event with priority=%s, name=%s for destination %s", transportContext.getPriority(), event.getTransportName(), transportContext.getBackendName());
        long newRowId = ((Long) inTransaction(new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda15
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return this.f$0.m81x42ac2bf1(transportContext, event, (SQLiteDatabase) obj);
            }
        })).longValue();
        if (newRowId < 1) {
            return null;
        }
        return PersistedEvent.create(newRowId, transportContext, event);
    }

    /* JADX INFO: renamed from: lambda$persist$1$com-google-android-datatransport-runtime-scheduling-persistence-SQLiteEventStore, reason: not valid java name */
    /* synthetic */ Long m81x42ac2bf1(TransportContext transportContext, EventInternal event, SQLiteDatabase db) {
        long newEventId;
        if (!isStorageAtLimit()) {
            long contextId = ensureTransportContext(db, transportContext);
            int maxBlobSizePerRow = this.config.getMaxBlobByteSizePerRow();
            byte[] payloadBytes = event.getEncodedPayload().getBytes();
            boolean inline = payloadBytes.length <= maxBlobSizePerRow;
            ContentValues values = new ContentValues();
            values.put("context_id", Long.valueOf(contextId));
            values.put("transport_name", event.getTransportName());
            values.put("timestamp_ms", Long.valueOf(event.getEventMillis()));
            values.put("uptime_ms", Long.valueOf(event.getUptimeMillis()));
            values.put("payload_encoding", event.getEncodedPayload().getEncoding().getName());
            values.put("code", event.getCode());
            values.put("num_attempts", (Integer) 0);
            values.put("inline", Boolean.valueOf(inline));
            values.put("payload", inline ? payloadBytes : new byte[0]);
            long newEventId2 = db.insert("events", null, values);
            if (inline) {
                newEventId = newEventId2;
            } else {
                newEventId = newEventId2;
                int numChunks = (int) Math.ceil(((double) payloadBytes.length) / ((double) maxBlobSizePerRow));
                for (int chunk = 1; chunk <= numChunks; chunk++) {
                    byte[] chunkBytes = Arrays.copyOfRange(payloadBytes, (chunk - 1) * maxBlobSizePerRow, Math.min(chunk * maxBlobSizePerRow, payloadBytes.length));
                    ContentValues payloadValues = new ContentValues();
                    payloadValues.put("event_id", Long.valueOf(newEventId));
                    payloadValues.put("sequence_num", Integer.valueOf(chunk));
                    payloadValues.put("bytes", chunkBytes);
                    db.insert("event_payloads", null, payloadValues);
                }
            }
            for (Map.Entry<String, String> entry : event.getMetadata().entrySet()) {
                ContentValues metadata = new ContentValues();
                metadata.put("event_id", Long.valueOf(newEventId));
                metadata.put(AppMeasurementSdk.ConditionalUserProperty.NAME, entry.getKey());
                metadata.put("value", entry.getValue());
                db.insert("event_metadata", null, metadata);
            }
            return Long.valueOf(newEventId);
        }
        return -1L;
    }

    private long ensureTransportContext(SQLiteDatabase db, TransportContext transportContext) {
        Long existingId = getTransportContextId(db, transportContext);
        if (existingId != null) {
            return existingId.longValue();
        }
        ContentValues record = new ContentValues();
        record.put("backend_name", transportContext.getBackendName());
        record.put("priority", Integer.valueOf(PriorityMapping.toInt(transportContext.getPriority())));
        record.put("next_request_ms", (Integer) 0);
        if (transportContext.getExtras() != null) {
            record.put("extras", Base64.encodeToString(transportContext.getExtras(), 0));
        }
        return db.insert("transport_contexts", null, record);
    }

    private Long getTransportContextId(SQLiteDatabase db, TransportContext transportContext) {
        StringBuilder selection = new StringBuilder("backend_name = ? and priority = ?");
        ArrayList<String> selectionArgs = new ArrayList<>(Arrays.asList(transportContext.getBackendName(), String.valueOf(PriorityMapping.toInt(transportContext.getPriority()))));
        if (transportContext.getExtras() != null) {
            selection.append(" and extras = ?");
            selectionArgs.add(Base64.encodeToString(transportContext.getExtras(), 0));
        } else {
            selection.append(" and extras is null");
        }
        return (Long) tryWithCursor(db.query("transport_contexts", new String[]{"_id"}, selection.toString(), (String[]) selectionArgs.toArray(new String[0]), null, null, null), new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda8
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$getTransportContextId$2((Cursor) obj);
            }
        });
    }

    static /* synthetic */ Long lambda$getTransportContextId$2(Cursor cursor) {
        if (!cursor.moveToNext()) {
            return null;
        }
        return Long.valueOf(cursor.getLong(0));
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public void recordFailure(Iterable<PersistedEvent> events) {
        if (!events.iterator().hasNext()) {
            return;
        }
        final String query = "UPDATE events SET num_attempts = num_attempts + 1 WHERE _id in " + toIdList(events);
        inTransaction(new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda6
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$recordFailure$3(query, (SQLiteDatabase) obj);
            }
        });
    }

    static /* synthetic */ Object lambda$recordFailure$3(String query, SQLiteDatabase db) {
        db.compileStatement(query).execute();
        db.compileStatement("DELETE FROM events WHERE num_attempts >= 16").execute();
        return null;
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public void recordSuccess(Iterable<PersistedEvent> events) {
        if (!events.iterator().hasNext()) {
            return;
        }
        String query = "DELETE FROM events WHERE _id in " + toIdList(events);
        getDb().compileStatement(query).execute();
    }

    private static String toIdList(Iterable<PersistedEvent> events) {
        StringBuilder idList = new StringBuilder("(");
        Iterator<PersistedEvent> iterator = events.iterator();
        while (iterator.hasNext()) {
            idList.append(iterator.next().getId());
            if (iterator.hasNext()) {
                idList.append(',');
            }
        }
        idList.append(')');
        return idList.toString();
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public long getNextCallTime(TransportContext transportContext) {
        return ((Long) tryWithCursor(getDb().rawQuery("SELECT next_request_ms FROM transport_contexts WHERE backend_name = ? and priority = ?", new String[]{transportContext.getBackendName(), String.valueOf(PriorityMapping.toInt(transportContext.getPriority()))}), new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda18
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$getNextCallTime$4((Cursor) obj);
            }
        })).longValue();
    }

    static /* synthetic */ Long lambda$getNextCallTime$4(Cursor cursor) {
        if (cursor.moveToNext()) {
            return Long.valueOf(cursor.getLong(0));
        }
        return 0L;
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public boolean hasPendingEventsFor(final TransportContext transportContext) {
        return ((Boolean) inTransaction(new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda14
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return this.f$0.m78x9bcc988e(transportContext, (SQLiteDatabase) obj);
            }
        })).booleanValue();
    }

    /* JADX INFO: renamed from: lambda$hasPendingEventsFor$5$com-google-android-datatransport-runtime-scheduling-persistence-SQLiteEventStore, reason: not valid java name */
    /* synthetic */ Boolean m78x9bcc988e(TransportContext transportContext, SQLiteDatabase db) {
        Long contextId = getTransportContextId(db, transportContext);
        if (contextId == null) {
            return false;
        }
        return (Boolean) tryWithCursor(getDb().rawQuery("SELECT 1 FROM events WHERE context_id = ? LIMIT 1", new String[]{contextId.toString()}), new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda9
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return Boolean.valueOf(((Cursor) obj).moveToNext());
            }
        });
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public void recordNextCallTime(final TransportContext transportContext, final long timestampMs) {
        inTransaction(new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda1
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$recordNextCallTime$6(timestampMs, transportContext, (SQLiteDatabase) obj);
            }
        });
    }

    static /* synthetic */ Object lambda$recordNextCallTime$6(long timestampMs, TransportContext transportContext, SQLiteDatabase db) {
        ContentValues values = new ContentValues();
        values.put("next_request_ms", Long.valueOf(timestampMs));
        int rowsUpdated = db.update("transport_contexts", values, "backend_name = ? and priority = ?", new String[]{transportContext.getBackendName(), String.valueOf(PriorityMapping.toInt(transportContext.getPriority()))});
        if (rowsUpdated < 1) {
            values.put("backend_name", transportContext.getBackendName());
            values.put("priority", Integer.valueOf(PriorityMapping.toInt(transportContext.getPriority())));
            db.insert("transport_contexts", null, values);
        }
        return null;
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public Iterable<PersistedEvent> loadBatch(final TransportContext transportContext) {
        return (Iterable) inTransaction(new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda5
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return this.f$0.m79xf30e214b(transportContext, (SQLiteDatabase) obj);
            }
        });
    }

    /* JADX INFO: renamed from: lambda$loadBatch$7$com-google-android-datatransport-runtime-scheduling-persistence-SQLiteEventStore, reason: not valid java name */
    /* synthetic */ List m79xf30e214b(TransportContext transportContext, SQLiteDatabase db) {
        List<PersistedEvent> events = loadEvents(db, transportContext);
        return join(events, loadMetadata(db, events));
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public Iterable<TransportContext> loadActiveContexts() {
        return (Iterable) inTransaction(new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda13
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$loadActiveContexts$9((SQLiteDatabase) obj);
            }
        });
    }

    static /* synthetic */ List lambda$loadActiveContexts$9(SQLiteDatabase db) {
        return (List) tryWithCursor(db.rawQuery("SELECT distinct t._id, t.backend_name, t.priority, t.extras FROM transport_contexts AS t, events AS e WHERE e.context_id = t._id", new String[0]), new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda7
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$loadActiveContexts$8((Cursor) obj);
            }
        });
    }

    static /* synthetic */ List lambda$loadActiveContexts$8(Cursor cursor) {
        List<TransportContext> results = new ArrayList<>();
        while (cursor.moveToNext()) {
            results.add(TransportContext.builder().setBackendName(cursor.getString(1)).setPriority(PriorityMapping.valueOf(cursor.getInt(2))).setExtras(maybeBase64Decode(cursor.getString(3))).build());
        }
        return results;
    }

    @Override // com.google.android.datatransport.runtime.scheduling.persistence.EventStore
    public int cleanUp() {
        final long oneWeekAgo = this.wallClock.getTime() - this.config.getEventCleanUpAge();
        return ((Integer) inTransaction(new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda2
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return Integer.valueOf(((SQLiteDatabase) obj).delete("events", "timestamp_ms < ?", new String[]{String.valueOf(oneWeekAgo)}));
            }
        })).intValue();
    }

    @Override // java.io.Closeable, java.lang.AutoCloseable
    public void close() {
        this.schemaManager.close();
    }

    public void clearDb() {
        inTransaction(new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda0
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$clearDb$11((SQLiteDatabase) obj);
            }
        });
    }

    static /* synthetic */ Object lambda$clearDb$11(SQLiteDatabase db) {
        db.delete("events", null, new String[0]);
        db.delete("transport_contexts", null, new String[0]);
        return null;
    }

    private static byte[] maybeBase64Decode(String value) {
        if (value == null) {
            return null;
        }
        return Base64.decode(value, 0);
    }

    private List<PersistedEvent> loadEvents(SQLiteDatabase db, final TransportContext transportContext) {
        final List<PersistedEvent> events = new ArrayList<>();
        Long contextId = getTransportContextId(db, transportContext);
        if (contextId == null) {
            return events;
        }
        tryWithCursor(db.query("events", new String[]{"_id", "transport_name", "timestamp_ms", "uptime_ms", "payload_encoding", "payload", "code", "inline"}, "context_id = ?", new String[]{contextId.toString()}, null, null, null, String.valueOf(this.config.getLoadBatchSize())), new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda12
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return this.f$0.m80xbdd0a62c(events, transportContext, (Cursor) obj);
            }
        });
        return events;
    }

    /* JADX INFO: renamed from: lambda$loadEvents$12$com-google-android-datatransport-runtime-scheduling-persistence-SQLiteEventStore, reason: not valid java name */
    /* synthetic */ Object m80xbdd0a62c(List events, TransportContext transportContext, Cursor cursor) {
        while (cursor.moveToNext()) {
            long id = cursor.getLong(0);
            boolean inline = cursor.getInt(7) != 0;
            EventInternal.Builder event = EventInternal.builder().setTransportName(cursor.getString(1)).setEventMillis(cursor.getLong(2)).setUptimeMillis(cursor.getLong(3));
            if (inline) {
                event.setEncodedPayload(new EncodedPayload(toEncoding(cursor.getString(4)), cursor.getBlob(5)));
            } else {
                event.setEncodedPayload(new EncodedPayload(toEncoding(cursor.getString(4)), readPayload(id)));
            }
            if (!cursor.isNull(6)) {
                event.setCode(Integer.valueOf(cursor.getInt(6)));
            }
            events.add(PersistedEvent.create(id, transportContext, event.build()));
        }
        return null;
    }

    private byte[] readPayload(long eventId) {
        return (byte[]) tryWithCursor(getDb().query("event_payloads", new String[]{"bytes"}, "event_id = ?", new String[]{String.valueOf(eventId)}, null, null, "sequence_num"), new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda11
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$readPayload$13((Cursor) obj);
            }
        });
    }

    static /* synthetic */ byte[] lambda$readPayload$13(Cursor cursor) {
        List<byte[]> chunks = new ArrayList<>();
        int totalLength = 0;
        while (cursor.moveToNext()) {
            byte[] chunk = cursor.getBlob(0);
            chunks.add(chunk);
            totalLength += chunk.length;
        }
        byte[] payloadBytes = new byte[totalLength];
        int offset = 0;
        for (int i = 0; i < chunks.size(); i++) {
            byte[] chunk2 = chunks.get(i);
            System.arraycopy(chunk2, 0, payloadBytes, offset, chunk2.length);
            offset += chunk2.length;
        }
        return payloadBytes;
    }

    private static Encoding toEncoding(String value) {
        if (value == null) {
            return PROTOBUF_ENCODING;
        }
        return Encoding.of(value);
    }

    private Map<Long, Set<Metadata>> loadMetadata(SQLiteDatabase db, List<PersistedEvent> events) {
        final Map<Long, Set<Metadata>> metadataIndex = new HashMap<>();
        StringBuilder whereClause = new StringBuilder("event_id IN (");
        for (int i = 0; i < events.size(); i++) {
            whereClause.append(events.get(i).getId());
            if (i < events.size() - 1) {
                whereClause.append(',');
            }
        }
        whereClause.append(')');
        tryWithCursor(db.query("event_metadata", new String[]{"event_id", AppMeasurementSdk.ConditionalUserProperty.NAME, "value"}, whereClause.toString(), null, null, null, null), new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda10
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$loadMetadata$14(metadataIndex, (Cursor) obj);
            }
        });
        return metadataIndex;
    }

    static /* synthetic */ Object lambda$loadMetadata$14(Map metadataIndex, Cursor cursor) {
        while (true) {
            if (!cursor.moveToNext()) {
                return null;
            }
            long eventId = cursor.getLong(0);
            Set<Metadata> currentSet = (Set) metadataIndex.get(Long.valueOf(eventId));
            if (currentSet == null) {
                currentSet = new HashSet<>();
                metadataIndex.put(Long.valueOf(eventId), currentSet);
            }
            currentSet.add(new Metadata(cursor.getString(1), cursor.getString(2)));
        }
    }

    private List<PersistedEvent> join(List<PersistedEvent> events, Map<Long, Set<Metadata>> metadataIndex) {
        ListIterator<PersistedEvent> iterator = events.listIterator();
        while (iterator.hasNext()) {
            PersistedEvent current = iterator.next();
            if (metadataIndex.containsKey(Long.valueOf(current.getId()))) {
                EventInternal.Builder newEvent = current.getEvent().toBuilder();
                for (Metadata metadata : metadataIndex.get(Long.valueOf(current.getId()))) {
                    newEvent.addMetadata(metadata.key, metadata.value);
                }
                iterator.set(PersistedEvent.create(current.getId(), current.getTransportContext(), newEvent.build()));
            }
        }
        return events;
    }

    private <T> T retryIfDbLocked(Producer<T> retriable, Function<Throwable, T> failureHandler) {
        long startTime = this.monotonicClock.getTime();
        while (true) {
            try {
                return retriable.produce();
            } catch (SQLiteDatabaseLockedException ex) {
                if (this.monotonicClock.getTime() >= ((long) this.config.getCriticalSectionEnterTimeoutMs()) + startTime) {
                    return failureHandler.apply(ex);
                }
                SystemClock.sleep(50L);
            }
        }
    }

    private void ensureBeginTransaction(final SQLiteDatabase db) {
        retryIfDbLocked(new Producer() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda3
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Producer
            public final Object produce() {
                return SQLiteEventStore.lambda$ensureBeginTransaction$15(db);
            }
        }, new Function() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore$$ExternalSyntheticLambda4
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SQLiteEventStore.Function
            public final Object apply(Object obj) {
                return SQLiteEventStore.lambda$ensureBeginTransaction$16((Throwable) obj);
            }
        });
    }

    static /* synthetic */ Object lambda$ensureBeginTransaction$15(SQLiteDatabase db) {
        db.beginTransaction();
        return null;
    }

    static /* synthetic */ Object lambda$ensureBeginTransaction$16(Throwable ex) {
        throw new SynchronizationException("Timed out while trying to acquire the lock.", ex);
    }

    @Override // com.google.android.datatransport.runtime.synchronization.SynchronizationGuard
    public <T> T runCriticalSection(SynchronizationGuard.CriticalSection<T> criticalSection) {
        SQLiteDatabase db = getDb();
        ensureBeginTransaction(db);
        try {
            T result = criticalSection.execute();
            db.setTransactionSuccessful();
            return result;
        } finally {
            db.endTransaction();
        }
    }

    <T> T inTransaction(Function<SQLiteDatabase, T> function) {
        SQLiteDatabase db = getDb();
        db.beginTransaction();
        try {
            T result = function.apply(db);
            db.setTransactionSuccessful();
            return result;
        } finally {
            db.endTransaction();
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    static class Metadata {
        final String key;
        final String value;

        private Metadata(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }

    private boolean isStorageAtLimit() {
        long byteSize = getPageCount() * getPageSize();
        return byteSize >= this.config.getMaxStorageSizeInBytes();
    }

    long getByteSize() {
        return getPageCount() * getPageSize();
    }

    private long getPageSize() {
        return getDb().compileStatement("PRAGMA page_size").simpleQueryForLong();
    }

    private long getPageCount() {
        return getDb().compileStatement("PRAGMA page_count").simpleQueryForLong();
    }

    static <T> T tryWithCursor(Cursor c, Function<Cursor, T> function) {
        try {
            return function.apply(c);
        } finally {
            c.close();
        }
    }
}
