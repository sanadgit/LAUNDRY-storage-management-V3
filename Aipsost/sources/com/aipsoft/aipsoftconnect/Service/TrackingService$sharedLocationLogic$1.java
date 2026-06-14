package com.aipsoft.aipsoftconnect.Service;

import android.location.Location;
import android.util.Log;
import androidx.constraintlayout.widget.ConstraintLayout;
import com.google.firebase.analytics.FirebaseAnalytics;
import kotlin.Metadata;
import kotlin.Unit;
import kotlin.jvm.functions.Function1;
import kotlin.jvm.internal.Intrinsics;
import kotlin.jvm.internal.Lambda;

/* JADX INFO: compiled from: TrackingService.kt */
/* JADX INFO: loaded from: classes6.dex */
@Metadata(d1 = {"\u0000\u000e\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u0003H\n¢\u0006\u0002\b\u0004"}, d2 = {"<anonymous>", "", FirebaseAnalytics.Param.LOCATION, "Landroid/location/Location;", "invoke"}, k = 3, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
final class TrackingService$sharedLocationLogic$1 extends Lambda implements Function1<Location, Unit> {
    final /* synthetic */ TrackingService this$0;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    TrackingService$sharedLocationLogic$1(TrackingService trackingService) {
        super(1);
        this.this$0 = trackingService;
    }

    @Override // kotlin.jvm.functions.Function1
    public /* bridge */ /* synthetic */ Unit invoke(Location location) {
        invoke2(location);
        return Unit.INSTANCE;
    }

    /* JADX WARN: Removed duplicated region for block: B:44:0x011c  */
    /* JADX INFO: renamed from: invoke, reason: avoid collision after fix types in other method */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void invoke2(android.location.Location r15) {
        /*
            Method dump skipped, instruction units count: 511
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.aipsoft.aipsoftconnect.Service.TrackingService$sharedLocationLogic$1.invoke2(android.location.Location):void");
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void invoke$lambda$0(Function1 tmp0, Object p0) {
        Intrinsics.checkNotNullParameter(tmp0, "$tmp0");
        tmp0.invoke(p0);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void invoke$lambda$1(Exception e) {
        Intrinsics.checkNotNullParameter(e, "e");
        Log.e("TrackingServiceDB", "Firebase push failed: " + e.getMessage());
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void invoke$lambda$2(Function1 tmp0, Object p0) {
        Intrinsics.checkNotNullParameter(tmp0, "$tmp0");
        tmp0.invoke(p0);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void invoke$lambda$3(Exception e) {
        Intrinsics.checkNotNullParameter(e, "e");
        Log.e("TrackingServiceDB", "Firebase push failed Single: " + e.getMessage());
    }
}
