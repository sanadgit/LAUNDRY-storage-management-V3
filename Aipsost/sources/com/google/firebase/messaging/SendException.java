package com.google.firebase.messaging;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes11.dex */
public final class SendException extends Exception {
    public static final int ERROR_INVALID_PARAMETERS = 1;
    public static final int ERROR_SIZE = 2;
    public static final int ERROR_TOO_MANY_MESSAGES = 4;
    public static final int ERROR_TTL_EXCEEDED = 3;
    public static final int ERROR_UNKNOWN = 0;
    private final int errorCode;

    SendException(String str) {
        super(str);
        this.errorCode = parseErrorCode(str);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:23:0x0048  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private int parseErrorCode(java.lang.String r7) {
        /*
            r6 = this;
            r0 = 0
            if (r7 != 0) goto L4
            return r0
        L4:
            java.util.Locale r1 = java.util.Locale.US
            java.lang.String r7 = r7.toLowerCase(r1)
            int r1 = r7.hashCode()
            r2 = 1
            r3 = 2
            r4 = 4
            r5 = 3
            switch(r1) {
                case -1743242157: goto L3e;
                case -1290953729: goto L34;
                case -920906446: goto L2a;
                case -617027085: goto L20;
                case -95047692: goto L16;
                default: goto L15;
            }
        L15:
            goto L48
        L16:
            java.lang.String r1 = "missing_to"
            boolean r7 = r7.equals(r1)
            if (r7 == 0) goto L15
            r7 = 1
            goto L49
        L20:
            java.lang.String r1 = "messagetoobig"
            boolean r7 = r7.equals(r1)
            if (r7 == 0) goto L15
            r7 = 2
            goto L49
        L2a:
            java.lang.String r1 = "invalid_parameters"
            boolean r7 = r7.equals(r1)
            if (r7 == 0) goto L15
            r7 = 0
            goto L49
        L34:
            java.lang.String r1 = "toomanymessages"
            boolean r7 = r7.equals(r1)
            if (r7 == 0) goto L15
            r7 = 4
            goto L49
        L3e:
            java.lang.String r1 = "service_not_available"
            boolean r7 = r7.equals(r1)
            if (r7 == 0) goto L15
            r7 = 3
            goto L49
        L48:
            r7 = -1
        L49:
            switch(r7) {
                case 0: goto L50;
                case 1: goto L50;
                case 2: goto L4f;
                case 3: goto L4e;
                case 4: goto L4d;
                default: goto L4c;
            }
        L4c:
            return r0
        L4d:
            return r4
        L4e:
            return r5
        L4f:
            return r3
        L50:
            return r2
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.firebase.messaging.SendException.parseErrorCode(java.lang.String):int");
    }

    public int getErrorCode() {
        return this.errorCode;
    }
}
