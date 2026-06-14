package com.aipsoft.aipsoftconnect.di;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.app.NotificationCompat;
import com.aipsoft.aipsoftconnect.MainActivity;
import com.aipsoft.aipsoftconnect.R;
import com.aipsoft.aipsoftconnect.utils.Constant;
import com.google.android.gms.common.internal.BaseGmsClient;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import dagger.Module;
import dagger.Provides;
import dagger.hilt.android.qualifiers.ApplicationContext;
import kotlin.Metadata;
import kotlin.Unit;
import kotlin.jvm.internal.Intrinsics;

/* JADX INFO: compiled from: ServiceModule.kt */
/* JADX INFO: loaded from: classes6.dex */
@Metadata(d1 = {"\u0000&\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\bÇ\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002¢\u0006\u0002\u0010\u0002J\u001a\u0010\u0003\u001a\u00020\u00042\b\b\u0001\u0010\u0005\u001a\u00020\u00062\u0006\u0010\u0007\u001a\u00020\bH\u0007J\u001a\u0010\t\u001a\n \u000b*\u0004\u0018\u00010\n0\n2\b\b\u0001\u0010\u0005\u001a\u00020\u0006H\u0007J\u001a\u0010\f\u001a\n \u000b*\u0004\u0018\u00010\b0\b2\b\b\u0001\u0010\u0005\u001a\u00020\u0006H\u0007¨\u0006\r"}, d2 = {"Lcom/aipsoft/aipsoftconnect/di/ServiceModule;", "", "()V", "provideBaseNotificationBuilder", "Landroidx/core/app/NotificationCompat$Builder;", "app", "Landroid/content/Context;", BaseGmsClient.KEY_PENDING_INTENT, "Landroid/app/PendingIntent;", "provideFusedLocationProvidedClient", "Lcom/google/android/gms/location/FusedLocationProviderClient;", "kotlin.jvm.PlatformType", "provideMainActivityPendingIntent", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
@Module
public final class ServiceModule {
    public static final ServiceModule INSTANCE = new ServiceModule();

    private ServiceModule() {
    }

    @Provides
    public final FusedLocationProviderClient provideFusedLocationProvidedClient(@ApplicationContext Context app) {
        Intrinsics.checkNotNullParameter(app, "app");
        return LocationServices.getFusedLocationProviderClient(app);
    }

    @Provides
    public final PendingIntent provideMainActivityPendingIntent(@ApplicationContext Context app) {
        Intrinsics.checkNotNullParameter(app, "app");
        Intent it = new Intent(app, (Class<?>) MainActivity.class);
        it.setAction(Constant.ACTION_SHOW_LIVE_TRACKING_FRAGMENT);
        Unit unit = Unit.INSTANCE;
        return PendingIntent.getActivity(app, 0, it, 201326592);
    }

    @Provides
    public final NotificationCompat.Builder provideBaseNotificationBuilder(@ApplicationContext Context app, PendingIntent pendingIntent) {
        Intrinsics.checkNotNullParameter(app, "app");
        Intrinsics.checkNotNullParameter(pendingIntent, "pendingIntent");
        NotificationCompat.Builder contentIntent = new NotificationCompat.Builder(app, Constant.NOTIFICATION_CHANNEL_ID).setAutoCancel(false).setOngoing(true).setSmallIcon(R.drawable.laundry_logo).setContentTitle("AIPSOFT").setContentText("Delivery is in Progress").setContentIntent(pendingIntent);
        Intrinsics.checkNotNullExpressionValue(contentIntent, "setContentIntent(...)");
        return contentIntent;
    }
}
