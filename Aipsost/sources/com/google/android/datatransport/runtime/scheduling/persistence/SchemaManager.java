package com.google.android.datatransport.runtime.scheduling.persistence;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import java.util.Arrays;
import java.util.List;
import javax.inject.Inject;
import javax.inject.Named;

/* JADX INFO: loaded from: classes.dex */
final class SchemaManager extends SQLiteOpenHelper {
    private static final String CREATE_CONTEXTS_SQL_V1 = "CREATE TABLE transport_contexts (_id INTEGER PRIMARY KEY, backend_name TEXT NOT NULL, priority INTEGER NOT NULL, next_request_ms INTEGER NOT NULL)";
    private static final String CREATE_CONTEXT_BACKEND_PRIORITY_INDEX_V1 = "CREATE UNIQUE INDEX contexts_backend_priority on transport_contexts(backend_name, priority)";
    private static final String CREATE_EVENTS_SQL_V1 = "CREATE TABLE events (_id INTEGER PRIMARY KEY, context_id INTEGER NOT NULL, transport_name TEXT NOT NULL, timestamp_ms INTEGER NOT NULL, uptime_ms INTEGER NOT NULL, payload BLOB NOT NULL, code INTEGER, num_attempts INTEGER NOT NULL,FOREIGN KEY (context_id) REFERENCES transport_contexts(_id) ON DELETE CASCADE)";
    private static final String CREATE_EVENT_BACKEND_INDEX_V1 = "CREATE INDEX events_backend_id on events(context_id)";
    private static final String CREATE_EVENT_METADATA_SQL_V1 = "CREATE TABLE event_metadata (_id INTEGER PRIMARY KEY, event_id INTEGER NOT NULL, name TEXT NOT NULL, value TEXT NOT NULL,FOREIGN KEY (event_id) REFERENCES events(_id) ON DELETE CASCADE)";
    private static final String CREATE_PAYLOADS_TABLE_V4 = "CREATE TABLE event_payloads (sequence_num INTEGER NOT NULL, event_id INTEGER NOT NULL, bytes BLOB NOT NULL,FOREIGN KEY (event_id) REFERENCES events(_id) ON DELETE CASCADE,PRIMARY KEY (sequence_num, event_id))";
    static final String DB_NAME = "com.google.android.datatransport.events";
    private static final String DROP_CONTEXTS_SQL = "DROP TABLE transport_contexts";
    private static final String DROP_EVENTS_SQL = "DROP TABLE events";
    private static final String DROP_EVENT_METADATA_SQL = "DROP TABLE event_metadata";
    private static final String DROP_PAYLOADS_SQL = "DROP TABLE IF EXISTS event_payloads";
    private static final List<Migration> INCREMENTAL_MIGRATIONS;
    private static final Migration MIGRATE_TO_V1;
    private static final Migration MIGRATE_TO_V2;
    private static final Migration MIGRATE_TO_V3;
    private static final Migration MIGRATE_TO_V4;
    static int SCHEMA_VERSION = 4;
    private boolean configured;
    private final int schemaVersion;

    public interface Migration {
        void upgrade(SQLiteDatabase sQLiteDatabase);
    }

    static {
        Migration migration = new Migration() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager$$ExternalSyntheticLambda0
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager.Migration
            public final void upgrade(SQLiteDatabase sQLiteDatabase) {
                SchemaManager.lambda$static$0(sQLiteDatabase);
            }
        };
        MIGRATE_TO_V1 = migration;
        Migration migration2 = new Migration() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager$$ExternalSyntheticLambda1
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager.Migration
            public final void upgrade(SQLiteDatabase sQLiteDatabase) {
                SchemaManager.lambda$static$1(sQLiteDatabase);
            }
        };
        MIGRATE_TO_V2 = migration2;
        Migration migration3 = new Migration() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager$$ExternalSyntheticLambda2
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager.Migration
            public final void upgrade(SQLiteDatabase sQLiteDatabase) {
                sQLiteDatabase.execSQL("ALTER TABLE events ADD COLUMN payload_encoding TEXT");
            }
        };
        MIGRATE_TO_V3 = migration3;
        Migration migration4 = new Migration() { // from class: com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager$$ExternalSyntheticLambda3
            @Override // com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager.Migration
            public final void upgrade(SQLiteDatabase sQLiteDatabase) {
                SchemaManager.lambda$static$3(sQLiteDatabase);
            }
        };
        MIGRATE_TO_V4 = migration4;
        INCREMENTAL_MIGRATIONS = Arrays.asList(migration, migration2, migration3, migration4);
    }

    static /* synthetic */ void lambda$static$0(SQLiteDatabase db) {
        db.execSQL(CREATE_EVENTS_SQL_V1);
        db.execSQL(CREATE_EVENT_METADATA_SQL_V1);
        db.execSQL(CREATE_CONTEXTS_SQL_V1);
        db.execSQL(CREATE_EVENT_BACKEND_INDEX_V1);
        db.execSQL(CREATE_CONTEXT_BACKEND_PRIORITY_INDEX_V1);
    }

    static /* synthetic */ void lambda$static$1(SQLiteDatabase db) {
        db.execSQL("ALTER TABLE transport_contexts ADD COLUMN extras BLOB");
        db.execSQL("CREATE UNIQUE INDEX contexts_backend_priority_extras on transport_contexts(backend_name, priority, extras)");
        db.execSQL("DROP INDEX contexts_backend_priority");
    }

    static /* synthetic */ void lambda$static$3(SQLiteDatabase db) {
        db.execSQL("ALTER TABLE events ADD COLUMN inline BOOLEAN NOT NULL DEFAULT 1");
        db.execSQL(DROP_PAYLOADS_SQL);
        db.execSQL(CREATE_PAYLOADS_TABLE_V4);
    }

    @Inject
    SchemaManager(Context context, @Named("SQLITE_DB_NAME") String dbName, @Named("SCHEMA_VERSION") int schemaVersion) {
        super(context, dbName, (SQLiteDatabase.CursorFactory) null, schemaVersion);
        this.configured = false;
        this.schemaVersion = schemaVersion;
    }

    @Override // android.database.sqlite.SQLiteOpenHelper
    public void onConfigure(SQLiteDatabase db) {
        this.configured = true;
        db.rawQuery("PRAGMA busy_timeout=0;", new String[0]).close();
        db.setForeignKeyConstraintsEnabled(true);
    }

    private void ensureConfigured(SQLiteDatabase db) {
        if (!this.configured) {
            onConfigure(db);
        }
    }

    @Override // android.database.sqlite.SQLiteOpenHelper
    public void onCreate(SQLiteDatabase db) {
        onCreate(db, this.schemaVersion);
    }

    private void onCreate(SQLiteDatabase db, int version) {
        ensureConfigured(db);
        upgrade(db, 0, version);
    }

    @Override // android.database.sqlite.SQLiteOpenHelper
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        ensureConfigured(db);
        upgrade(db, oldVersion, newVersion);
    }

    @Override // android.database.sqlite.SQLiteOpenHelper
    public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL(DROP_EVENTS_SQL);
        db.execSQL(DROP_EVENT_METADATA_SQL);
        db.execSQL(DROP_CONTEXTS_SQL);
        db.execSQL(DROP_PAYLOADS_SQL);
        onCreate(db, newVersion);
    }

    @Override // android.database.sqlite.SQLiteOpenHelper
    public void onOpen(SQLiteDatabase db) {
        ensureConfigured(db);
    }

    private void upgrade(SQLiteDatabase db, int fromVersion, int toVersion) {
        List<Migration> list = INCREMENTAL_MIGRATIONS;
        if (toVersion > list.size()) {
            throw new IllegalArgumentException("Migration from " + fromVersion + " to " + toVersion + " was requested, but cannot be performed. Only " + list.size() + " migrations are provided");
        }
        for (int version = fromVersion; version < toVersion; version++) {
            INCREMENTAL_MIGRATIONS.get(version).upgrade(db);
        }
    }
}
