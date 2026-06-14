package com.google.android.gms.measurement.internal;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.internal.measurement.zzov;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import kotlinx.coroutines.scheduling.WorkQueueKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzai extends zzke {
    private static final String[] zza = {"last_bundled_timestamp", "ALTER TABLE events ADD COLUMN last_bundled_timestamp INTEGER;", "last_bundled_day", "ALTER TABLE events ADD COLUMN last_bundled_day INTEGER;", "last_sampled_complex_event_id", "ALTER TABLE events ADD COLUMN last_sampled_complex_event_id INTEGER;", "last_sampling_rate", "ALTER TABLE events ADD COLUMN last_sampling_rate INTEGER;", "last_exempt_from_sampling", "ALTER TABLE events ADD COLUMN last_exempt_from_sampling INTEGER;", "current_session_count", "ALTER TABLE events ADD COLUMN current_session_count INTEGER;"};
    private static final String[] zzb = {"origin", "ALTER TABLE user_attributes ADD COLUMN origin TEXT;"};
    private static final String[] zzc = {"app_version", "ALTER TABLE apps ADD COLUMN app_version TEXT;", "app_store", "ALTER TABLE apps ADD COLUMN app_store TEXT;", "gmp_version", "ALTER TABLE apps ADD COLUMN gmp_version INTEGER;", "dev_cert_hash", "ALTER TABLE apps ADD COLUMN dev_cert_hash INTEGER;", "measurement_enabled", "ALTER TABLE apps ADD COLUMN measurement_enabled INTEGER;", "last_bundle_start_timestamp", "ALTER TABLE apps ADD COLUMN last_bundle_start_timestamp INTEGER;", "day", "ALTER TABLE apps ADD COLUMN day INTEGER;", "daily_public_events_count", "ALTER TABLE apps ADD COLUMN daily_public_events_count INTEGER;", "daily_events_count", "ALTER TABLE apps ADD COLUMN daily_events_count INTEGER;", "daily_conversions_count", "ALTER TABLE apps ADD COLUMN daily_conversions_count INTEGER;", "remote_config", "ALTER TABLE apps ADD COLUMN remote_config BLOB;", "config_fetched_time", "ALTER TABLE apps ADD COLUMN config_fetched_time INTEGER;", "failed_config_fetch_time", "ALTER TABLE apps ADD COLUMN failed_config_fetch_time INTEGER;", "app_version_int", "ALTER TABLE apps ADD COLUMN app_version_int INTEGER;", "firebase_instance_id", "ALTER TABLE apps ADD COLUMN firebase_instance_id TEXT;", "daily_error_events_count", "ALTER TABLE apps ADD COLUMN daily_error_events_count INTEGER;", "daily_realtime_events_count", "ALTER TABLE apps ADD COLUMN daily_realtime_events_count INTEGER;", "health_monitor_sample", "ALTER TABLE apps ADD COLUMN health_monitor_sample TEXT;", "android_id", "ALTER TABLE apps ADD COLUMN android_id INTEGER;", "adid_reporting_enabled", "ALTER TABLE apps ADD COLUMN adid_reporting_enabled INTEGER;", "ssaid_reporting_enabled", "ALTER TABLE apps ADD COLUMN ssaid_reporting_enabled INTEGER;", "admob_app_id", "ALTER TABLE apps ADD COLUMN admob_app_id TEXT;", "linked_admob_app_id", "ALTER TABLE apps ADD COLUMN linked_admob_app_id TEXT;", "dynamite_version", "ALTER TABLE apps ADD COLUMN dynamite_version INTEGER;", "safelisted_events", "ALTER TABLE apps ADD COLUMN safelisted_events TEXT;", "ga_app_id", "ALTER TABLE apps ADD COLUMN ga_app_id TEXT;", "config_last_modified_time", "ALTER TABLE apps ADD COLUMN config_last_modified_time TEXT;"};
    private static final String[] zzd = {"realtime", "ALTER TABLE raw_events ADD COLUMN realtime INTEGER;"};
    private static final String[] zze = {"has_realtime", "ALTER TABLE queue ADD COLUMN has_realtime INTEGER;", "retry_count", "ALTER TABLE queue ADD COLUMN retry_count INTEGER;"};
    private static final String[] zzg = {"session_scoped", "ALTER TABLE event_filters ADD COLUMN session_scoped BOOLEAN;"};
    private static final String[] zzh = {"session_scoped", "ALTER TABLE property_filters ADD COLUMN session_scoped BOOLEAN;"};
    private static final String[] zzi = {"previous_install_count", "ALTER TABLE app2 ADD COLUMN previous_install_count INTEGER;"};
    private final zzah zzj;
    private final zzka zzk;

    zzai(zzkn zzknVar) {
        super(zzknVar);
        this.zzk = new zzka(this.zzs.zzay());
        this.zzs.zzc();
        this.zzj = new zzah(this, this.zzs.zzax(), "google_app_measurement.db");
    }

    static final void zzX(ContentValues contentValues, String str, Object obj) {
        Preconditions.checkNotEmpty("value");
        Preconditions.checkNotNull(obj);
        if (obj instanceof String) {
            contentValues.put("value", (String) obj);
        } else if (obj instanceof Long) {
            contentValues.put("value", (Long) obj);
        } else {
            if (!(obj instanceof Double)) {
                throw new IllegalArgumentException("Invalid value type");
            }
            contentValues.put("value", (Double) obj);
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:23:0x003c  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private final long zzab(java.lang.String r4, java.lang.String[] r5) throws java.lang.Throwable {
        /*
            r3 = this;
            android.database.sqlite.SQLiteDatabase r0 = r3.zze()
            r1 = 0
            android.database.Cursor r1 = r0.rawQuery(r4, r5)     // Catch: java.lang.Throwable -> L26 android.database.sqlite.SQLiteException -> L28
            boolean r5 = r1.moveToFirst()     // Catch: java.lang.Throwable -> L22 android.database.sqlite.SQLiteException -> L24
            if (r5 == 0) goto L1a
            r5 = 0
            long r4 = r1.getLong(r5)     // Catch: java.lang.Throwable -> L22 android.database.sqlite.SQLiteException -> L24
            if (r1 == 0) goto L19
            r1.close()
        L19:
            return r4
        L1a:
            android.database.sqlite.SQLiteException r5 = new android.database.sqlite.SQLiteException     // Catch: java.lang.Throwable -> L22 android.database.sqlite.SQLiteException -> L24
            java.lang.String r0 = "Database returned empty set"
            r5.<init>(r0)     // Catch: java.lang.Throwable -> L22 android.database.sqlite.SQLiteException -> L24
            throw r5     // Catch: java.lang.Throwable -> L22 android.database.sqlite.SQLiteException -> L24
        L22:
            r4 = move-exception
            goto L3a
        L24:
            r5 = move-exception
            goto L29
        L26:
            r4 = move-exception
            goto L3a
        L28:
            r5 = move-exception
        L29:
            com.google.android.gms.measurement.internal.zzfu r0 = r3.zzs     // Catch: java.lang.Throwable -> L39
            com.google.android.gms.measurement.internal.zzem r0 = r0.zzau()     // Catch: java.lang.Throwable -> L39
            com.google.android.gms.measurement.internal.zzek r0 = r0.zzb()     // Catch: java.lang.Throwable -> L39
            java.lang.String r2 = "Database error"
            r0.zzc(r2, r4, r5)     // Catch: java.lang.Throwable -> L39
            throw r5     // Catch: java.lang.Throwable -> L39
        L39:
            r4 = move-exception
        L3a:
            if (r1 == 0) goto L3f
            r1.close()
        L3f:
            throw r4
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzab(java.lang.String, java.lang.String[]):long");
    }

    /* JADX WARN: Removed duplicated region for block: B:23:0x0039  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private final long zzac(java.lang.String r3, java.lang.String[] r4, long r5) throws java.lang.Throwable {
        /*
            r2 = this;
            android.database.sqlite.SQLiteDatabase r0 = r2.zze()
            r1 = 0
            android.database.Cursor r1 = r0.rawQuery(r3, r4)     // Catch: java.lang.Throwable -> L24 android.database.sqlite.SQLiteException -> L26
            boolean r4 = r1.moveToFirst()     // Catch: java.lang.Throwable -> L20 android.database.sqlite.SQLiteException -> L22
            if (r4 == 0) goto L1a
            r4 = 0
            long r3 = r1.getLong(r4)     // Catch: java.lang.Throwable -> L20 android.database.sqlite.SQLiteException -> L22
            if (r1 == 0) goto L19
            r1.close()
        L19:
            return r3
        L1a:
            if (r1 == 0) goto L1f
            r1.close()
        L1f:
            return r5
        L20:
            r3 = move-exception
            goto L37
        L22:
            r4 = move-exception
            goto L27
        L24:
            r3 = move-exception
            goto L37
        L26:
            r4 = move-exception
        L27:
            com.google.android.gms.measurement.internal.zzfu r5 = r2.zzs     // Catch: java.lang.Throwable -> L20
            com.google.android.gms.measurement.internal.zzem r5 = r5.zzau()     // Catch: java.lang.Throwable -> L20
            com.google.android.gms.measurement.internal.zzek r5 = r5.zzb()     // Catch: java.lang.Throwable -> L20
            java.lang.String r6 = "Database error"
            r5.zzc(r6, r3, r4)     // Catch: java.lang.Throwable -> L20
            throw r4     // Catch: java.lang.Throwable -> L20
        L37:
            if (r1 == 0) goto L3c
            r1.close()
        L3c:
            throw r3
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzac(java.lang.String, java.lang.String[], long):long");
    }

    final void zzA() {
        zzg();
        zzZ();
        if (zzM()) {
            long jZza = this.zzf.zzn().zza.zza();
            long jElapsedRealtime = this.zzs.zzay().elapsedRealtime();
            long jAbs = Math.abs(jElapsedRealtime - jZza);
            this.zzs.zzc();
            if (jAbs > zzea.zzx.zzb(null).longValue()) {
                this.zzf.zzn().zza.zzb(jElapsedRealtime);
                zzg();
                zzZ();
                if (zzM()) {
                    SQLiteDatabase sQLiteDatabaseZze = zze();
                    String strValueOf = String.valueOf(this.zzs.zzay().currentTimeMillis());
                    this.zzs.zzc();
                    int iDelete = sQLiteDatabaseZze.delete("queue", "abs(bundle_end_timestamp - ?) > cast(? as integer)", new String[]{strValueOf, String.valueOf(zzae.zzA())});
                    if (iDelete > 0) {
                        this.zzs.zzau().zzk().zzb("Deleted stale rows. rowsDeleted", Integer.valueOf(iDelete));
                    }
                }
            }
        }
    }

    final void zzB(List<Long> list) {
        zzg();
        zzZ();
        Preconditions.checkNotNull(list);
        Preconditions.checkNotZero(list.size());
        if (zzM()) {
            String strJoin = TextUtils.join(",", list);
            StringBuilder sb = new StringBuilder(String.valueOf(strJoin).length() + 2);
            sb.append("(");
            sb.append(strJoin);
            sb.append(")");
            String string = sb.toString();
            StringBuilder sb2 = new StringBuilder(String.valueOf(string).length() + 80);
            sb2.append("SELECT COUNT(1) FROM queue WHERE rowid IN ");
            sb2.append(string);
            sb2.append(" AND retry_count =  2147483647 LIMIT 1");
            if (zzab(sb2.toString(), null) > 0) {
                this.zzs.zzau().zze().zza("The number of upload retries exceeds the limit. Will remain unchanged.");
            }
            try {
                SQLiteDatabase sQLiteDatabaseZze = zze();
                StringBuilder sb3 = new StringBuilder(String.valueOf(string).length() + WorkQueueKt.MASK);
                sb3.append("UPDATE queue SET retry_count = IFNULL(retry_count, 0) + 1 WHERE rowid IN ");
                sb3.append(string);
                sb3.append(" AND (retry_count IS NULL OR retry_count < ");
                sb3.append(Integer.MAX_VALUE);
                sb3.append(")");
                sQLiteDatabaseZze.execSQL(sb3.toString());
            } catch (SQLiteException e) {
                this.zzs.zzau().zzb().zzb("Error incrementing retry count. error", e);
            }
        }
    }

    final Object zzC(Cursor cursor, int i) {
        int type = cursor.getType(i);
        switch (type) {
            case 0:
                this.zzs.zzau().zzb().zza("Loaded invalid null value from database");
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                this.zzs.zzau().zzb().zza("Loaded invalid blob type value, ignoring it");
                break;
            default:
                this.zzs.zzau().zzb().zzb("Loaded invalid unknown value type, ignoring it", Integer.valueOf(type));
                break;
        }
        return null;
    }

    public final long zzD() {
        return zzac("select max(bundle_end_timestamp) from queue", null, 0L);
    }

    /* JADX WARN: Can't wrap try/catch for region: R(10:0|2|29|3|4|(5:6|(3:8|9|10)(1:11)|23|24|25)|28|13|(3:15|9|10)(3:16|17|31)|(1:(0))) */
    /* JADX WARN: Code restructure failed: missing block: B:18:0x00b9, code lost:
    
        r0 = e;
     */
    /* JADX WARN: Code restructure failed: missing block: B:19:0x00ba, code lost:
    
        r5 = r10;
     */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    protected final long zzE(java.lang.String r16, java.lang.String r17) {
        /*
            Method dump skipped, instruction units count: 219
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzE(java.lang.String, java.lang.String):long");
    }

    public final long zzF() {
        return zzac("select max(timestamp) from raw_events", null, 0L);
    }

    public final boolean zzG() {
        return zzab("select count(1) > 0 from raw_events", null) != 0;
    }

    public final boolean zzH() {
        return zzab("select count(1) > 0 from raw_events where realtime = 1", null) != 0;
    }

    public final long zzI(String str) {
        Preconditions.checkNotEmpty(str);
        return zzac("select count(1) from events where app_id=? and name not like '!_%' escape '!'", new String[]{str}, 0L);
    }

    public final boolean zzJ(String str, Long l, long j, com.google.android.gms.internal.measurement.zzfo zzfoVar) {
        zzg();
        zzZ();
        Preconditions.checkNotNull(zzfoVar);
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(l);
        byte[] bArrZzbp = zzfoVar.zzbp();
        this.zzs.zzau().zzk().zzc("Saving complex main event, appId, data size", this.zzs.zzm().zzc(str), Integer.valueOf(bArrZzbp.length));
        ContentValues contentValues = new ContentValues();
        contentValues.put("app_id", str);
        contentValues.put("event_id", l);
        contentValues.put("children_to_process", Long.valueOf(j));
        contentValues.put("main_event", bArrZzbp);
        try {
            if (zze().insertWithOnConflict("main_event_params", null, contentValues, 5) != -1) {
                return true;
            }
            this.zzs.zzau().zzb().zzb("Failed to insert complex main event (got -1). appId", zzem.zzl(str));
            return false;
        } catch (SQLiteException e) {
            this.zzs.zzau().zzb().zzc("Error storing complex main event. appId", zzem.zzl(str), e);
            return false;
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:52:0x00e2  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final android.os.Bundle zzK(java.lang.String r8) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 230
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzK(java.lang.String):android.os.Bundle");
    }

    /* JADX WARN: Code restructure failed: missing block: B:100:0x0349, code lost:
    
        r0 = null;
     */
    /* JADX WARN: Code restructure failed: missing block: B:101:0x034a, code lost:
    
        r11.put("session_scoped", r0);
        r11.put(com.google.firebase.messaging.Constants.ScionAnalytics.MessageType.DATA_MESSAGE, r10);
     */
    /* JADX WARN: Code restructure failed: missing block: B:103:0x035e, code lost:
    
        if (zze().insertWithOnConflict("property_filters", null, r11, 5) != (-1)) goto L106;
     */
    /* JADX WARN: Code restructure failed: missing block: B:104:0x0360, code lost:
    
        r24.zzs.zzau().zzb().zzb("Failed to insert property filter (got -1). appId", com.google.android.gms.measurement.internal.zzem.zzl(r25));
     */
    /* JADX WARN: Code restructure failed: missing block: B:106:0x0374, code lost:
    
        r0 = r23;
     */
    /* JADX WARN: Code restructure failed: missing block: B:107:0x0378, code lost:
    
        r0 = move-exception;
     */
    /* JADX WARN: Code restructure failed: missing block: B:108:0x0379, code lost:
    
        r24.zzs.zzau().zzb().zzc("Error storing property filter. appId", com.google.android.gms.measurement.internal.zzem.zzl(r25), r0);
     */
    /* JADX WARN: Code restructure failed: missing block: B:109:0x038c, code lost:
    
        zzZ();
        zzg();
        com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r25);
        r0 = zze();
        r3 = r17;
        r0.delete("property_filters", r3, new java.lang.String[]{r4, java.lang.String.valueOf(r9)});
        r0.delete("event_filters", r3, new java.lang.String[]{r4, java.lang.String.valueOf(r9)});
        r17 = r3;
        r4 = r22;
     */
    /* JADX WARN: Code restructure failed: missing block: B:110:0x03c3, code lost:
    
        r4 = r22;
     */
    /* JADX WARN: Code restructure failed: missing block: B:50:0x0185, code lost:
    
        r10 = r0.zzc().iterator();
     */
    /* JADX WARN: Code restructure failed: missing block: B:52:0x0191, code lost:
    
        if (r10.hasNext() == false) goto L163;
     */
    /* JADX WARN: Code restructure failed: missing block: B:54:0x019d, code lost:
    
        if (r10.next().zza() != false) goto L176;
     */
    /* JADX WARN: Code restructure failed: missing block: B:55:0x019f, code lost:
    
        r24.zzs.zzau().zze().zzc("Property filter with no ID. Audience definition ignored. appId, audienceId", com.google.android.gms.measurement.internal.zzem.zzl(r25), java.lang.Integer.valueOf(r9));
     */
    /* JADX WARN: Code restructure failed: missing block: B:56:0x01b8, code lost:
    
        r10 = r0.zzf().iterator();
     */
    /* JADX WARN: Code restructure failed: missing block: B:59:0x01ce, code lost:
    
        if (r10.hasNext() == false) goto L178;
     */
    /* JADX WARN: Code restructure failed: missing block: B:60:0x01d0, code lost:
    
        r11 = r10.next();
        zzZ();
        zzg();
        com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r25);
        com.google.android.gms.common.internal.Preconditions.checkNotNull(r11);
     */
    /* JADX WARN: Code restructure failed: missing block: B:61:0x01ea, code lost:
    
        if (android.text.TextUtils.isEmpty(r11.zzc()) == false) goto L67;
     */
    /* JADX WARN: Code restructure failed: missing block: B:62:0x01ec, code lost:
    
        r0 = r24.zzs.zzau().zze();
        r8 = com.google.android.gms.measurement.internal.zzem.zzl(r25);
        r10 = java.lang.Integer.valueOf(r9);
     */
    /* JADX WARN: Code restructure failed: missing block: B:63:0x0204, code lost:
    
        if (r11.zza() == false) goto L65;
     */
    /* JADX WARN: Code restructure failed: missing block: B:64:0x0206, code lost:
    
        r20 = java.lang.Integer.valueOf(r11.zzb());
     */
    /* JADX WARN: Code restructure failed: missing block: B:65:0x0211, code lost:
    
        r20 = null;
     */
    /* JADX WARN: Code restructure failed: missing block: B:66:0x0213, code lost:
    
        r0.zzd("Event filter had no event name. Audience definition ignored. appId, audienceId, filterId", r8, r10, java.lang.String.valueOf(r20));
        r22 = r4;
        r4 = r25;
     */
    /* JADX WARN: Code restructure failed: missing block: B:67:0x0220, code lost:
    
        r14 = r11.zzbp();
        r3 = new android.content.ContentValues();
        r22 = r4;
        r4 = r25;
        r3.put("app_id", r4);
        r3.put("audience_id", java.lang.Integer.valueOf(r9));
     */
    /* JADX WARN: Code restructure failed: missing block: B:68:0x023b, code lost:
    
        if (r11.zza() == false) goto L70;
     */
    /* JADX WARN: Code restructure failed: missing block: B:69:0x023d, code lost:
    
        r8 = java.lang.Integer.valueOf(r11.zzb());
     */
    /* JADX WARN: Code restructure failed: missing block: B:70:0x0246, code lost:
    
        r8 = null;
     */
    /* JADX WARN: Code restructure failed: missing block: B:71:0x0247, code lost:
    
        r3.put("filter_id", r8);
        r3.put("event_name", r11.zzc());
     */
    /* JADX WARN: Code restructure failed: missing block: B:72:0x0257, code lost:
    
        if (r11.zzk() == false) goto L74;
     */
    /* JADX WARN: Code restructure failed: missing block: B:73:0x0259, code lost:
    
        r8 = java.lang.Boolean.valueOf(r11.zzm());
     */
    /* JADX WARN: Code restructure failed: missing block: B:74:0x0262, code lost:
    
        r8 = null;
     */
    /* JADX WARN: Code restructure failed: missing block: B:75:0x0263, code lost:
    
        r3.put("session_scoped", r8);
        r3.put(com.google.firebase.messaging.Constants.ScionAnalytics.MessageType.DATA_MESSAGE, r14);
     */
    /* JADX WARN: Code restructure failed: missing block: B:77:0x0277, code lost:
    
        if (zze().insertWithOnConflict("event_filters", null, r3, 5) != (-1)) goto L177;
     */
    /* JADX WARN: Code restructure failed: missing block: B:78:0x0279, code lost:
    
        r24.zzs.zzau().zzb().zzb("Failed to insert event filter (got -1). appId", com.google.android.gms.measurement.internal.zzem.zzl(r25));
     */
    /* JADX WARN: Code restructure failed: missing block: B:79:0x028c, code lost:
    
        r4 = r22;
     */
    /* JADX WARN: Code restructure failed: missing block: B:80:0x0292, code lost:
    
        r4 = r22;
     */
    /* JADX WARN: Code restructure failed: missing block: B:81:0x0298, code lost:
    
        r0 = move-exception;
     */
    /* JADX WARN: Code restructure failed: missing block: B:82:0x0299, code lost:
    
        r24.zzs.zzau().zzb().zzc("Error storing event filter. appId", com.google.android.gms.measurement.internal.zzem.zzl(r25), r0);
     */
    /* JADX WARN: Code restructure failed: missing block: B:83:0x02ae, code lost:
    
        r22 = r4;
        r4 = r25;
        r0 = r0.zzc().iterator();
     */
    /* JADX WARN: Code restructure failed: missing block: B:85:0x02be, code lost:
    
        if (r0.hasNext() == false) goto L165;
     */
    /* JADX WARN: Code restructure failed: missing block: B:86:0x02c0, code lost:
    
        r3 = r0.next();
        zzZ();
        zzg();
        com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r25);
        com.google.android.gms.common.internal.Preconditions.checkNotNull(r3);
     */
    /* JADX WARN: Code restructure failed: missing block: B:87:0x02da, code lost:
    
        if (android.text.TextUtils.isEmpty(r3.zzc()) == false) goto L93;
     */
    /* JADX WARN: Code restructure failed: missing block: B:88:0x02dc, code lost:
    
        r0 = r24.zzs.zzau().zze();
        r8 = com.google.android.gms.measurement.internal.zzem.zzl(r25);
        r10 = java.lang.Integer.valueOf(r9);
     */
    /* JADX WARN: Code restructure failed: missing block: B:89:0x02f4, code lost:
    
        if (r3.zza() == false) goto L91;
     */
    /* JADX WARN: Code restructure failed: missing block: B:90:0x02f6, code lost:
    
        r3 = java.lang.Integer.valueOf(r3.zzb());
     */
    /* JADX WARN: Code restructure failed: missing block: B:91:0x02ff, code lost:
    
        r3 = null;
     */
    /* JADX WARN: Code restructure failed: missing block: B:92:0x0300, code lost:
    
        r0.zzd("Property filter had no property name. Audience definition ignored. appId, audienceId, filterId", r8, r10, java.lang.String.valueOf(r3));
     */
    /* JADX WARN: Code restructure failed: missing block: B:93:0x0309, code lost:
    
        r10 = r3.zzbp();
        r11 = new android.content.ContentValues();
        r11.put("app_id", r4);
        r11.put("audience_id", java.lang.Integer.valueOf(r9));
     */
    /* JADX WARN: Code restructure failed: missing block: B:94:0x0320, code lost:
    
        if (r3.zza() == false) goto L96;
     */
    /* JADX WARN: Code restructure failed: missing block: B:95:0x0322, code lost:
    
        r14 = java.lang.Integer.valueOf(r3.zzb());
     */
    /* JADX WARN: Code restructure failed: missing block: B:96:0x032b, code lost:
    
        r14 = null;
     */
    /* JADX WARN: Code restructure failed: missing block: B:97:0x032c, code lost:
    
        r11.put("filter_id", r14);
        r23 = r0;
        r11.put("property_name", r3.zzc());
     */
    /* JADX WARN: Code restructure failed: missing block: B:98:0x033e, code lost:
    
        if (r3.zzg() == false) goto L100;
     */
    /* JADX WARN: Code restructure failed: missing block: B:99:0x0340, code lost:
    
        r0 = java.lang.Boolean.valueOf(r3.zzh());
     */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final void zzL(java.lang.String r25, java.util.List<com.google.android.gms.internal.measurement.zzeh> r26) {
        /*
            Method dump skipped, instruction units count: 1223
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzL(java.lang.String, java.util.List):void");
    }

    protected final boolean zzM() {
        Context contextZzax = this.zzs.zzax();
        this.zzs.zzc();
        return contextZzax.getDatabasePath("google_app_measurement.db").exists();
    }

    /* JADX WARN: Removed duplicated region for block: B:118:0x0258  */
    /* JADX WARN: Removed duplicated region for block: B:123:0x0260  */
    /* JADX WARN: Removed duplicated region for block: B:148:? A[RETURN, SYNTHETIC] */
    /* JADX WARN: Removed duplicated region for block: B:45:0x00fc A[Catch: all -> 0x022d, SQLiteException -> 0x0231, TRY_LEAVE, TryCatch #11 {SQLiteException -> 0x0231, all -> 0x022d, blocks: (B:43:0x00f6, B:45:0x00fc, B:50:0x0116, B:51:0x011a, B:52:0x012a, B:54:0x0130, B:55:0x0143, B:57:0x0152, B:59:0x016c, B:58:0x0164), top: B:138:0x00f6 }] */
    /* JADX WARN: Removed duplicated region for block: B:50:0x0116 A[Catch: all -> 0x022d, SQLiteException -> 0x0231, TRY_ENTER, TRY_LEAVE, TryCatch #11 {SQLiteException -> 0x0231, all -> 0x022d, blocks: (B:43:0x00f6, B:45:0x00fc, B:50:0x0116, B:51:0x011a, B:52:0x012a, B:54:0x0130, B:55:0x0143, B:57:0x0152, B:59:0x016c, B:58:0x0164), top: B:138:0x00f6 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void zzW(java.lang.String r21, long r22, long r24, com.google.android.gms.measurement.internal.zzkm r26) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 612
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzW(java.lang.String, long, long, com.google.android.gms.measurement.internal.zzkm):void");
    }

    @Override // com.google.android.gms.measurement.internal.zzke
    protected final boolean zzaA() {
        return false;
    }

    public final void zzb() {
        zzZ();
        zze().beginTransaction();
    }

    public final void zzc() {
        zzZ();
        zze().setTransactionSuccessful();
    }

    public final void zzd() {
        zzZ();
        zze().endTransaction();
    }

    final SQLiteDatabase zze() {
        zzg();
        try {
            return this.zzj.getWritableDatabase();
        } catch (SQLiteException e) {
            this.zzs.zzau().zze().zzb("Error opening database", e);
            throw e;
        }
    }

    public final zzao zzf(String str, String str2) {
        Cursor cursorQuery;
        Boolean boolValueOf;
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        zzg();
        zzZ();
        Cursor cursor = null;
        try {
            cursorQuery = zze().query("events", (String[]) new ArrayList(Arrays.asList("lifetime_count", "current_bundle_count", "last_fire_timestamp", "last_bundled_timestamp", "last_bundled_day", "last_sampled_complex_event_id", "last_sampling_rate", "last_exempt_from_sampling", "current_session_count")).toArray(new String[0]), "app_id=? and name=?", new String[]{str, str2}, null, null, null);
        } catch (SQLiteException e) {
            e = e;
            cursorQuery = null;
        } catch (Throwable th) {
            th = th;
        }
        try {
            try {
                if (!cursorQuery.moveToFirst()) {
                    if (cursorQuery != null) {
                        cursorQuery.close();
                    }
                    return null;
                }
                long j = cursorQuery.getLong(0);
                long j2 = cursorQuery.getLong(1);
                long j3 = cursorQuery.getLong(2);
                long j4 = cursorQuery.isNull(3) ? 0L : cursorQuery.getLong(3);
                Long lValueOf = cursorQuery.isNull(4) ? null : Long.valueOf(cursorQuery.getLong(4));
                Long lValueOf2 = cursorQuery.isNull(5) ? null : Long.valueOf(cursorQuery.getLong(5));
                Long lValueOf3 = cursorQuery.isNull(6) ? null : Long.valueOf(cursorQuery.getLong(6));
                if (cursorQuery.isNull(7)) {
                    boolValueOf = null;
                } else {
                    boolValueOf = Boolean.valueOf(cursorQuery.getLong(7) == 1);
                }
                zzao zzaoVar = new zzao(str, str2, j, j2, cursorQuery.isNull(8) ? 0L : cursorQuery.getLong(8), j3, j4, lValueOf, lValueOf2, lValueOf3, boolValueOf);
                if (cursorQuery.moveToNext()) {
                    this.zzs.zzau().zzb().zzb("Got multiple records for event aggregates, expected one. appId", zzem.zzl(str));
                }
                if (cursorQuery != null) {
                    cursorQuery.close();
                }
                return zzaoVar;
            } catch (Throwable th2) {
                th = th2;
                cursor = cursorQuery;
            }
        } catch (SQLiteException e2) {
            e = e2;
            this.zzs.zzau().zzb().zzd("Error querying events. appId", zzem.zzl(str), this.zzs.zzm().zzc(str2), e);
            if (cursorQuery != null) {
                cursorQuery.close();
            }
            return null;
        }
        th = th2;
        cursor = cursorQuery;
        if (cursor != null) {
            cursor.close();
        }
        throw th;
    }

    public final void zzh(zzao zzaoVar) {
        Preconditions.checkNotNull(zzaoVar);
        zzg();
        zzZ();
        ContentValues contentValues = new ContentValues();
        contentValues.put("app_id", zzaoVar.zza);
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.NAME, zzaoVar.zzb);
        contentValues.put("lifetime_count", Long.valueOf(zzaoVar.zzc));
        contentValues.put("current_bundle_count", Long.valueOf(zzaoVar.zzd));
        contentValues.put("last_fire_timestamp", Long.valueOf(zzaoVar.zzf));
        contentValues.put("last_bundled_timestamp", Long.valueOf(zzaoVar.zzg));
        contentValues.put("last_bundled_day", zzaoVar.zzh);
        contentValues.put("last_sampled_complex_event_id", zzaoVar.zzi);
        contentValues.put("last_sampling_rate", zzaoVar.zzj);
        contentValues.put("current_session_count", Long.valueOf(zzaoVar.zze));
        Boolean bool = zzaoVar.zzk;
        contentValues.put("last_exempt_from_sampling", (bool == null || !bool.booleanValue()) ? null : 1L);
        try {
            if (zze().insertWithOnConflict("events", null, contentValues, 5) == -1) {
                this.zzs.zzau().zzb().zzb("Failed to insert/update event aggregates (got -1). appId", zzem.zzl(zzaoVar.zza));
            }
        } catch (SQLiteException e) {
            this.zzs.zzau().zzb().zzc("Error storing event aggregates. appId", zzem.zzl(zzaoVar.zza), e);
        }
    }

    public final void zzi(String str, String str2) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        zzg();
        zzZ();
        try {
            zze().delete("user_attributes", "app_id=? and name=?", new String[]{str, str2});
        } catch (SQLiteException e) {
            this.zzs.zzau().zzb().zzd("Error deleting user property. appId", zzem.zzl(str), this.zzs.zzm().zze(str2), e);
        }
    }

    public final boolean zzj(zzks zzksVar) {
        Preconditions.checkNotNull(zzksVar);
        zzg();
        zzZ();
        if (zzk(zzksVar.zza, zzksVar.zzc) == null) {
            if (zzku.zzh(zzksVar.zzc)) {
                if (zzab("select count(1) from user_attributes where app_id=? and name not like '!_%' escape '!'", new String[]{zzksVar.zza}) >= this.zzs.zzc().zzl(zzksVar.zza, zzea.zzF, 25, 100)) {
                    return false;
                }
            } else if (!"_npa".equals(zzksVar.zzc)) {
                long jZzab = zzab("select count(1) from user_attributes where app_id=? and origin=? AND name like '!_%' escape '!'", new String[]{zzksVar.zza, zzksVar.zzb});
                this.zzs.zzc();
                if (jZzab >= 25) {
                    return false;
                }
            }
        }
        ContentValues contentValues = new ContentValues();
        contentValues.put("app_id", zzksVar.zza);
        contentValues.put("origin", zzksVar.zzb);
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.NAME, zzksVar.zzc);
        contentValues.put("set_timestamp", Long.valueOf(zzksVar.zzd));
        zzX(contentValues, "value", zzksVar.zze);
        try {
            if (zze().insertWithOnConflict("user_attributes", null, contentValues, 5) != -1) {
                return true;
            }
            this.zzs.zzau().zzb().zzb("Failed to insert/update user property (got -1). appId", zzem.zzl(zzksVar.zza));
            return true;
        } catch (SQLiteException e) {
            this.zzs.zzau().zzb().zzc("Error storing user property. appId", zzem.zzl(zzksVar.zza), e);
            return true;
        }
    }

    /* JADX WARN: Not initialized variable reg: 3, insn: 0x00a9: MOVE (r2 I:??[OBJECT, ARRAY]) = (r3 I:??[OBJECT, ARRAY]), block:B:33:0x00a9 */
    /* JADX WARN: Removed duplicated region for block: B:35:0x00ac  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final com.google.android.gms.measurement.internal.zzks zzk(java.lang.String r15, java.lang.String r16) {
        /*
            r14 = this;
            r1 = r14
            com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r15)
            com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r16)
            r14.zzg()
            r14.zzZ()
            r2 = 0
            android.database.sqlite.SQLiteDatabase r3 = r14.zze()     // Catch: java.lang.Throwable -> L7f android.database.sqlite.SQLiteException -> L81
            r0 = 3
            java.lang.String[] r5 = new java.lang.String[r0]     // Catch: java.lang.Throwable -> L7f android.database.sqlite.SQLiteException -> L81
            java.lang.String r0 = "set_timestamp"
            r11 = 0
            r5[r11] = r0     // Catch: java.lang.Throwable -> L7f android.database.sqlite.SQLiteException -> L81
            java.lang.String r0 = "value"
            r12 = 1
            r5[r12] = r0     // Catch: java.lang.Throwable -> L7f android.database.sqlite.SQLiteException -> L81
            java.lang.String r0 = "origin"
            r13 = 2
            r5[r13] = r0     // Catch: java.lang.Throwable -> L7f android.database.sqlite.SQLiteException -> L81
            java.lang.String[] r7 = new java.lang.String[]{r15, r16}     // Catch: java.lang.Throwable -> L7f android.database.sqlite.SQLiteException -> L81
            java.lang.String r4 = "user_attributes"
            java.lang.String r6 = "app_id=? and name=?"
            r8 = 0
            r9 = 0
            r10 = 0
            android.database.Cursor r3 = r3.query(r4, r5, r6, r7, r8, r9, r10)     // Catch: java.lang.Throwable -> L7f android.database.sqlite.SQLiteException -> L81
            boolean r0 = r3.moveToFirst()     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            if (r0 != 0) goto L3f
            if (r3 == 0) goto L3e
            r3.close()
        L3e:
            return r2
        L3f:
            long r8 = r3.getLong(r11)     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            java.lang.Object r10 = r14.zzC(r3, r12)     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            if (r10 != 0) goto L50
            if (r3 == 0) goto L4f
            r3.close()
        L4f:
            return r2
        L50:
            java.lang.String r6 = r3.getString(r13)     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            com.google.android.gms.measurement.internal.zzks r0 = new com.google.android.gms.measurement.internal.zzks     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            r4 = r0
            r5 = r15
            r7 = r16
            r4.<init>(r5, r6, r7, r8, r10)     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            boolean r4 = r3.moveToNext()     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            if (r4 == 0) goto L77
            com.google.android.gms.measurement.internal.zzfu r4 = r1.zzs     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            com.google.android.gms.measurement.internal.zzem r4 = r4.zzau()     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            com.google.android.gms.measurement.internal.zzek r4 = r4.zzb()     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            java.lang.String r5 = "Got multiple records for user property, expected one. appId"
            java.lang.Object r6 = com.google.android.gms.measurement.internal.zzem.zzl(r15)     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
            r4.zzb(r5, r6)     // Catch: android.database.sqlite.SQLiteException -> L7d java.lang.Throwable -> La8
        L77:
            if (r3 == 0) goto L7c
            r3.close()
        L7c:
            return r0
        L7d:
            r0 = move-exception
            goto L83
        L7f:
            r0 = move-exception
            goto Laa
        L81:
            r0 = move-exception
            r3 = r2
        L83:
            com.google.android.gms.measurement.internal.zzfu r4 = r1.zzs     // Catch: java.lang.Throwable -> La8
            com.google.android.gms.measurement.internal.zzem r4 = r4.zzau()     // Catch: java.lang.Throwable -> La8
            com.google.android.gms.measurement.internal.zzek r4 = r4.zzb()     // Catch: java.lang.Throwable -> La8
            java.lang.String r5 = "Error querying user property. appId"
            java.lang.Object r6 = com.google.android.gms.measurement.internal.zzem.zzl(r15)     // Catch: java.lang.Throwable -> La8
            com.google.android.gms.measurement.internal.zzfu r7 = r1.zzs     // Catch: java.lang.Throwable -> La8
            com.google.android.gms.measurement.internal.zzeh r7 = r7.zzm()     // Catch: java.lang.Throwable -> La8
            r8 = r16
            java.lang.String r7 = r7.zze(r8)     // Catch: java.lang.Throwable -> La8
            r4.zzd(r5, r6, r7, r0)     // Catch: java.lang.Throwable -> La8
            if (r3 == 0) goto La7
            r3.close()
        La7:
            return r2
        La8:
            r0 = move-exception
            r2 = r3
        Laa:
            if (r2 == 0) goto Laf
            r2.close()
        Laf:
            throw r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzk(java.lang.String, java.lang.String):com.google.android.gms.measurement.internal.zzks");
    }

    /* JADX WARN: Removed duplicated region for block: B:33:0x00b7  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final java.util.List<com.google.android.gms.measurement.internal.zzks> zzl(java.lang.String r17) throws java.lang.Throwable {
        /*
            r16 = this;
            r1 = r16
            com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r17)
            r16.zzg()
            r16.zzZ()
            java.util.ArrayList r0 = new java.util.ArrayList
            r0.<init>()
            java.lang.String r10 = "1000"
            r11 = 0
            android.database.sqlite.SQLiteDatabase r2 = r16.zze()     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            java.lang.String r3 = "user_attributes"
            r4 = 4
            java.lang.String[] r4 = new java.lang.String[r4]     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            java.lang.String r5 = "name"
            r12 = 0
            r4[r12] = r5     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            java.lang.String r5 = "origin"
            r13 = 1
            r4[r13] = r5     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            java.lang.String r5 = "set_timestamp"
            r14 = 2
            r4[r14] = r5     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            java.lang.String r5 = "value"
            r15 = 3
            r4[r15] = r5     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            java.lang.String r5 = "app_id=?"
            java.lang.String[] r6 = new java.lang.String[]{r17}     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            java.lang.String r9 = "rowid"
            com.google.android.gms.measurement.internal.zzfu r7 = r1.zzs     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            r7.zzc()     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            r7 = 0
            r8 = 0
            android.database.Cursor r11 = r2.query(r3, r4, r5, r6, r7, r8, r9, r10)     // Catch: java.lang.Throwable -> L94 android.database.sqlite.SQLiteException -> L96
            boolean r2 = r11.moveToFirst()     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            if (r2 == 0) goto L8c
        L49:
        L4a:
            java.lang.String r6 = r11.getString(r12)     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            java.lang.String r2 = r11.getString(r13)     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            if (r2 != 0) goto L56
            java.lang.String r2 = ""
        L56:
            r5 = r2
            long r7 = r11.getLong(r14)     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            java.lang.Object r9 = r1.zzC(r11, r15)     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            if (r9 != 0) goto L75
            com.google.android.gms.measurement.internal.zzfu r2 = r1.zzs     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            com.google.android.gms.measurement.internal.zzem r2 = r2.zzau()     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            com.google.android.gms.measurement.internal.zzek r2 = r2.zzb()     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            java.lang.String r3 = "Read invalid user property value, ignoring it. appId"
            java.lang.Object r4 = com.google.android.gms.measurement.internal.zzem.zzl(r17)     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            r2.zzb(r3, r4)     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            goto L80
        L75:
            com.google.android.gms.measurement.internal.zzks r2 = new com.google.android.gms.measurement.internal.zzks     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            r3 = r2
            r4 = r17
            r3.<init>(r4, r5, r6, r7, r9)     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            r0.add(r2)     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
        L80:
            boolean r2 = r11.moveToNext()     // Catch: android.database.sqlite.SQLiteException -> L92 java.lang.Throwable -> Lb4
            if (r2 != 0) goto L49
            if (r11 == 0) goto L8b
            r11.close()
        L8b:
            return r0
        L8c:
            if (r11 == 0) goto L91
            r11.close()
        L91:
            return r0
        L92:
            r0 = move-exception
            goto L97
        L94:
            r0 = move-exception
            goto Lb5
        L96:
            r0 = move-exception
        L97:
            com.google.android.gms.measurement.internal.zzfu r2 = r1.zzs     // Catch: java.lang.Throwable -> Lb4
            com.google.android.gms.measurement.internal.zzem r2 = r2.zzau()     // Catch: java.lang.Throwable -> Lb4
            com.google.android.gms.measurement.internal.zzek r2 = r2.zzb()     // Catch: java.lang.Throwable -> Lb4
            java.lang.String r3 = "Error querying user properties. appId"
            java.lang.Object r4 = com.google.android.gms.measurement.internal.zzem.zzl(r17)     // Catch: java.lang.Throwable -> Lb4
            r2.zzc(r3, r4, r0)     // Catch: java.lang.Throwable -> Lb4
            java.util.List r0 = java.util.Collections.emptyList()     // Catch: java.lang.Throwable -> Lb4
            if (r11 == 0) goto Lb3
            r11.close()
        Lb3:
            return r0
        Lb4:
            r0 = move-exception
        Lb5:
            if (r11 == 0) goto Lba
            r11.close()
        Lba:
            throw r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzl(java.lang.String):java.util.List");
    }

    /* JADX WARN: Code restructure failed: missing block: B:21:0x00af, code lost:
    
        r3 = r19.zzs.zzau().zzb();
        r19.zzs.zzc();
        r3.zzb("Read more than the max allowed user properties, ignoring excess", 1000);
     */
    /* JADX WARN: Removed duplicated region for block: B:48:0x0138  */
    /* JADX WARN: Removed duplicated region for block: B:52:0x013f  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final java.util.List<com.google.android.gms.measurement.internal.zzks> zzm(java.lang.String r20, java.lang.String r21, java.lang.String r22) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 323
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzm(java.lang.String, java.lang.String, java.lang.String):java.util.List");
    }

    public final boolean zzn(zzaa zzaaVar) throws Throwable {
        Preconditions.checkNotNull(zzaaVar);
        zzg();
        zzZ();
        String str = zzaaVar.zza;
        Preconditions.checkNotNull(str);
        if (zzk(str, zzaaVar.zzc.zzb) == null) {
            long jZzab = zzab("SELECT COUNT(1) FROM conditional_properties WHERE app_id=?", new String[]{str});
            this.zzs.zzc();
            if (jZzab >= 1000) {
                return false;
            }
        }
        ContentValues contentValues = new ContentValues();
        contentValues.put("app_id", str);
        contentValues.put("origin", zzaaVar.zzb);
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.NAME, zzaaVar.zzc.zzb);
        zzX(contentValues, "value", Preconditions.checkNotNull(zzaaVar.zzc.zza()));
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.ACTIVE, Boolean.valueOf(zzaaVar.zze));
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME, zzaaVar.zzf);
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT, Long.valueOf(zzaaVar.zzh));
        contentValues.put("timed_out_event", this.zzs.zzl().zzX(zzaaVar.zzg));
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP, Long.valueOf(zzaaVar.zzd));
        contentValues.put("triggered_event", this.zzs.zzl().zzX(zzaaVar.zzi));
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_TIMESTAMP, Long.valueOf(zzaaVar.zzc.zzc));
        contentValues.put(AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE, Long.valueOf(zzaaVar.zzj));
        contentValues.put("expired_event", this.zzs.zzl().zzX(zzaaVar.zzk));
        try {
            if (zze().insertWithOnConflict("conditional_properties", null, contentValues, 5) != -1) {
                return true;
            }
            this.zzs.zzau().zzb().zzb("Failed to insert/update conditional user property (got -1)", zzem.zzl(str));
            return true;
        } catch (SQLiteException e) {
            this.zzs.zzau().zzb().zzc("Error storing conditional user property", zzem.zzl(str), e);
            return true;
        }
    }

    /* JADX WARN: Not initialized variable reg: 10, insn: 0x0156: MOVE (r9 I:??[OBJECT, ARRAY]) = (r10 I:??[OBJECT, ARRAY]), block:B:31:0x0156 */
    /* JADX WARN: Removed duplicated region for block: B:33:0x0159  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final com.google.android.gms.measurement.internal.zzaa zzo(java.lang.String r37, java.lang.String r38) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 349
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzo(java.lang.String, java.lang.String):com.google.android.gms.measurement.internal.zzaa");
    }

    public final int zzp(String str, String str2) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        zzg();
        zzZ();
        try {
            return zze().delete("conditional_properties", "app_id=? and name=?", new String[]{str, str2});
        } catch (SQLiteException e) {
            this.zzs.zzau().zzb().zzd("Error deleting conditional property", zzem.zzl(str), this.zzs.zzm().zze(str2), e);
            return 0;
        }
    }

    public final List<zzaa> zzq(String str, String str2, String str3) {
        Preconditions.checkNotEmpty(str);
        zzg();
        zzZ();
        ArrayList arrayList = new ArrayList(3);
        arrayList.add(str);
        StringBuilder sb = new StringBuilder("app_id=?");
        if (!TextUtils.isEmpty(str2)) {
            arrayList.add(str2);
            sb.append(" and origin=?");
        }
        if (!TextUtils.isEmpty(str3)) {
            arrayList.add(String.valueOf(str3).concat("*"));
            sb.append(" and name glob ?");
        }
        return zzr(sb.toString(), (String[]) arrayList.toArray(new String[arrayList.size()]));
    }

    /* JADX WARN: Code restructure failed: missing block: B:8:0x008f, code lost:
    
        r3 = r43.zzs.zzau().zzb();
        r43.zzs.zzc();
        r3.zzb("Read more than the max allowed conditional properties, ignoring extra", 1000);
     */
    /* JADX WARN: Removed duplicated region for block: B:36:0x0195  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final java.util.List<com.google.android.gms.measurement.internal.zzaa> zzr(java.lang.String r44, java.lang.String[] r45) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 409
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzr(java.lang.String, java.lang.String[]):java.util.List");
    }

    /* JADX WARN: Not initialized variable reg: 4, insn: 0x028d: MOVE (r3 I:??[OBJECT, ARRAY]) = (r4 I:??[OBJECT, ARRAY]), block:B:61:0x028d */
    /* JADX WARN: Removed duplicated region for block: B:63:0x0290  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final com.google.android.gms.measurement.internal.zzg zzs(java.lang.String r25) {
        /*
            Method dump skipped, instruction units count: 660
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzs(java.lang.String):com.google.android.gms.measurement.internal.zzg");
    }

    public final void zzt(zzg zzgVar) {
        Preconditions.checkNotNull(zzgVar);
        zzg();
        zzZ();
        String strZzc = zzgVar.zzc();
        Preconditions.checkNotNull(strZzc);
        ContentValues contentValues = new ContentValues();
        contentValues.put("app_id", strZzc);
        contentValues.put("app_instance_id", zzgVar.zzd());
        contentValues.put("gmp_app_id", zzgVar.zzf());
        contentValues.put("resettable_device_id_hash", zzgVar.zzl());
        contentValues.put("last_bundle_index", Long.valueOf(zzgVar.zzI()));
        contentValues.put("last_bundle_start_timestamp", Long.valueOf(zzgVar.zzp()));
        contentValues.put("last_bundle_end_timestamp", Long.valueOf(zzgVar.zzr()));
        contentValues.put("app_version", zzgVar.zzt());
        contentValues.put("app_store", zzgVar.zzx());
        contentValues.put("gmp_version", Long.valueOf(zzgVar.zzz()));
        contentValues.put("dev_cert_hash", Long.valueOf(zzgVar.zzB()));
        contentValues.put("measurement_enabled", Boolean.valueOf(zzgVar.zzF()));
        contentValues.put("day", Long.valueOf(zzgVar.zzO()));
        contentValues.put("daily_public_events_count", Long.valueOf(zzgVar.zzQ()));
        contentValues.put("daily_events_count", Long.valueOf(zzgVar.zzS()));
        contentValues.put("daily_conversions_count", Long.valueOf(zzgVar.zzU()));
        contentValues.put("config_fetched_time", Long.valueOf(zzgVar.zzJ()));
        contentValues.put("failed_config_fetch_time", Long.valueOf(zzgVar.zzL()));
        contentValues.put("app_version_int", Long.valueOf(zzgVar.zzv()));
        contentValues.put("firebase_instance_id", zzgVar.zzn());
        contentValues.put("daily_error_events_count", Long.valueOf(zzgVar.zzY()));
        contentValues.put("daily_realtime_events_count", Long.valueOf(zzgVar.zzW()));
        contentValues.put("health_monitor_sample", zzgVar.zzaa());
        contentValues.put("android_id", Long.valueOf(zzgVar.zzad()));
        contentValues.put("adid_reporting_enabled", Boolean.valueOf(zzgVar.zzaf()));
        contentValues.put("admob_app_id", zzgVar.zzh());
        contentValues.put("dynamite_version", Long.valueOf(zzgVar.zzD()));
        List<String> listZzaj = zzgVar.zzaj();
        if (listZzaj != null) {
            if (listZzaj.size() == 0) {
                this.zzs.zzau().zze().zzb("Safelisted events should not be an empty list. appId", strZzc);
            } else {
                contentValues.put("safelisted_events", TextUtils.join(",", listZzaj));
            }
        }
        zzov.zzb();
        if (this.zzs.zzc().zzn(strZzc, zzea.zzag)) {
            contentValues.put("ga_app_id", zzgVar.zzj());
        }
        try {
            SQLiteDatabase sQLiteDatabaseZze = zze();
            if (sQLiteDatabaseZze.update("apps", contentValues, "app_id = ?", new String[]{strZzc}) == 0 && sQLiteDatabaseZze.insertWithOnConflict("apps", null, contentValues, 5) == -1) {
                this.zzs.zzau().zzb().zzb("Failed to insert/update app (got -1). appId", zzem.zzl(strZzc));
            }
        } catch (SQLiteException e) {
            this.zzs.zzau().zzb().zzc("Error storing app. appId", zzem.zzl(strZzc), e);
        }
    }

    public final zzag zzu(long j, String str, boolean z, boolean z2, boolean z3, boolean z4, boolean z5) {
        return zzv(j, str, 1L, false, false, z3, false, z5);
    }

    /* JADX WARN: Removed duplicated region for block: B:42:0x0140  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final com.google.android.gms.measurement.internal.zzag zzv(long r24, java.lang.String r26, long r27, boolean r29, boolean r30, boolean r31, boolean r32, boolean r33) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 324
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzv(long, java.lang.String, long, boolean, boolean, boolean, boolean, boolean):com.google.android.gms.measurement.internal.zzag");
    }

    public final void zzw(String str, byte[] bArr, String str2) {
        Preconditions.checkNotEmpty(str);
        zzg();
        zzZ();
        ContentValues contentValues = new ContentValues();
        contentValues.put("remote_config", bArr);
        contentValues.put("config_last_modified_time", str2);
        try {
            if (zze().update("apps", contentValues, "app_id = ?", new String[]{str}) == 0) {
                this.zzs.zzau().zzb().zzb("Failed to update remote config (got 0). appId", zzem.zzl(str));
            }
        } catch (SQLiteException e) {
            this.zzs.zzau().zzb().zzc("Error storing remote config. appId", zzem.zzl(str), e);
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:6:0x0049  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final boolean zzx(com.google.android.gms.internal.measurement.zzfw r8, boolean r9) {
        /*
            Method dump skipped, instruction units count: 296
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzai.zzx(com.google.android.gms.internal.measurement.zzfw, boolean):boolean");
    }

    public final String zzy() throws Throwable {
        SQLiteException e;
        Cursor cursorRawQuery;
        Cursor cursor = null;
        try {
            cursorRawQuery = zze().rawQuery("select app_id from queue order by has_realtime desc, rowid asc limit 1;", null);
        } catch (SQLiteException e2) {
            e = e2;
            cursorRawQuery = null;
        } catch (Throwable th) {
            th = th;
        }
        try {
            try {
                if (!cursorRawQuery.moveToFirst()) {
                    if (cursorRawQuery != null) {
                        cursorRawQuery.close();
                    }
                    return null;
                }
                String string = cursorRawQuery.getString(0);
                if (cursorRawQuery != null) {
                    cursorRawQuery.close();
                }
                return string;
            } catch (Throwable th2) {
                cursor = cursorRawQuery;
                th = th2;
            }
        } catch (SQLiteException e3) {
            e = e3;
            this.zzs.zzau().zzb().zzb("Database error getting next bundle app id", e);
            if (cursorRawQuery != null) {
                cursorRawQuery.close();
            }
            return null;
        }
        cursor = cursorRawQuery;
        th = th2;
        if (cursor != null) {
            cursor.close();
        }
        throw th;
    }

    public final boolean zzz() {
        return zzab("select count(1) > 0 from queue where has_realtime = 1", null) != 0;
    }
}
