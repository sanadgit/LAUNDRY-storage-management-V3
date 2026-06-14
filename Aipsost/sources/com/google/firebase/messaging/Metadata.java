package com.google.firebase.messaging;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.util.Log;
import com.google.firebase.FirebaseApp;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
class Metadata {
    private String appVersionCode;
    private String appVersionName;
    private final Context context;
    private int gmsVersionCode;
    private int iidImplementation = 0;

    Metadata(Context context) {
        this.context = context;
    }

    static String getDefaultSenderId(FirebaseApp firebaseApp) {
        String gcmSenderId = firebaseApp.getOptions().getGcmSenderId();
        if (gcmSenderId != null) {
            return gcmSenderId;
        }
        String applicationId = firebaseApp.getOptions().getApplicationId();
        if (!applicationId.startsWith("1:")) {
            return applicationId;
        }
        String[] strArrSplit = applicationId.split(":");
        if (strArrSplit.length < 2) {
            return null;
        }
        String str = strArrSplit[1];
        if (str.isEmpty()) {
            return null;
        }
        return str;
    }

    private PackageInfo getPackageInfo(String str) {
        try {
            return this.context.getPackageManager().getPackageInfo(str, 0);
        } catch (PackageManager.NameNotFoundException e) {
            String strValueOf = String.valueOf(e);
            StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 23);
            sb.append("Failed to find package ");
            sb.append(strValueOf);
            Log.w(Constants.TAG, sb.toString());
            return null;
        }
    }

    private synchronized void populateAppVersionInfo() {
        PackageInfo packageInfo = getPackageInfo(this.context.getPackageName());
        if (packageInfo != null) {
            this.appVersionCode = Integer.toString(packageInfo.versionCode);
            this.appVersionName = packageInfo.versionName;
        }
    }

    synchronized String getAppVersionCode() {
        if (this.appVersionCode == null) {
            populateAppVersionInfo();
        }
        return this.appVersionCode;
    }

    synchronized String getAppVersionName() {
        if (this.appVersionName == null) {
            populateAppVersionInfo();
        }
        return this.appVersionName;
    }

    synchronized int getGmsVersionCode() {
        PackageInfo packageInfo;
        if (this.gmsVersionCode == 0 && (packageInfo = getPackageInfo("com.google.android.gms")) != null) {
            this.gmsVersionCode = packageInfo.versionCode;
        }
        return this.gmsVersionCode;
    }

    /* JADX WARN: Removed duplicated region for block: B:22:0x0046 A[Catch: all -> 0x0078, TRY_ENTER, TryCatch #0 {, blocks: (B:3:0x0001, B:7:0x0007, B:9:0x0019, B:12:0x0022, B:14:0x0029, B:16:0x003b, B:19:0x0042, B:22:0x0046, B:24:0x0059, B:27:0x0060, B:30:0x0064, B:32:0x0071, B:33:0x0075), top: B:38:0x0001 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    synchronized int getIidImplementation() {
        /*
            r5 = this;
            monitor-enter(r5)
            int r0 = r5.iidImplementation     // Catch: java.lang.Throwable -> L78
            if (r0 == 0) goto L7
            monitor-exit(r5)
            return r0
        L7:
            android.content.Context r0 = r5.context     // Catch: java.lang.Throwable -> L78
            android.content.pm.PackageManager r0 = r0.getPackageManager()     // Catch: java.lang.Throwable -> L78
            java.lang.String r1 = "com.google.android.c2dm.permission.SEND"
            java.lang.String r2 = "com.google.android.gms"
            int r1 = r0.checkPermission(r1, r2)     // Catch: java.lang.Throwable -> L78
            r2 = -1
            r3 = 0
            if (r1 != r2) goto L22
            java.lang.String r0 = "FirebaseMessaging"
            java.lang.String r1 = "Google Play services missing or without correct permission."
            android.util.Log.e(r0, r1)     // Catch: java.lang.Throwable -> L78
            monitor-exit(r5)
            return r3
        L22:
            boolean r1 = com.google.android.gms.common.util.PlatformVersion.isAtLeastO()     // Catch: java.lang.Throwable -> L78
            r2 = 1
            if (r1 != 0) goto L46
            android.content.Intent r1 = new android.content.Intent     // Catch: java.lang.Throwable -> L78
            java.lang.String r4 = "com.google.android.c2dm.intent.REGISTER"
            r1.<init>(r4)     // Catch: java.lang.Throwable -> L78
            java.lang.String r4 = "com.google.android.gms"
            r1.setPackage(r4)     // Catch: java.lang.Throwable -> L78
            java.util.List r1 = r0.queryIntentServices(r1, r3)     // Catch: java.lang.Throwable -> L78
            if (r1 == 0) goto L46
            int r1 = r1.size()     // Catch: java.lang.Throwable -> L78
            if (r1 > 0) goto L42
            goto L46
        L42:
            r5.iidImplementation = r2     // Catch: java.lang.Throwable -> L78
        L44:
            monitor-exit(r5)
            return r2
        L46:
            android.content.Intent r1 = new android.content.Intent     // Catch: java.lang.Throwable -> L78
            java.lang.String r4 = "com.google.iid.TOKEN_REQUEST"
            r1.<init>(r4)     // Catch: java.lang.Throwable -> L78
            java.lang.String r4 = "com.google.android.gms"
            r1.setPackage(r4)     // Catch: java.lang.Throwable -> L78
            java.util.List r0 = r0.queryBroadcastReceivers(r1, r3)     // Catch: java.lang.Throwable -> L78
            r1 = 2
            if (r0 == 0) goto L64
            int r0 = r0.size()     // Catch: java.lang.Throwable -> L78
            if (r0 > 0) goto L60
            goto L64
        L60:
            r5.iidImplementation = r1     // Catch: java.lang.Throwable -> L78
            monitor-exit(r5)
            return r1
        L64:
            java.lang.String r0 = "FirebaseMessaging"
            java.lang.String r3 = "Failed to resolve IID implementation package, falling back"
            android.util.Log.w(r0, r3)     // Catch: java.lang.Throwable -> L78
            boolean r0 = com.google.android.gms.common.util.PlatformVersion.isAtLeastO()     // Catch: java.lang.Throwable -> L78
            if (r0 == 0) goto L75
            r5.iidImplementation = r1     // Catch: java.lang.Throwable -> L78
            r2 = 2
            goto L44
        L75:
            r5.iidImplementation = r2     // Catch: java.lang.Throwable -> L78
            goto L44
        L78:
            r0 = move-exception
            monitor-exit(r5)
            throw r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.firebase.messaging.Metadata.getIidImplementation():int");
    }

    boolean isGmscorePresent() {
        return getIidImplementation() != 0;
    }
}
