package com.aipsoft.aipsoftconnect.Service;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.location.Location;
import android.os.Build;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.app.NotificationCompat;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;
import com.aipsoft.aipsoftconnect.utils.Constant;
import com.aipsoft.aipsoftconnect.utils.LiveLocationUtility;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import dagger.hilt.android.AndroidEntryPoint;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import javax.inject.Inject;
import kotlin.Lazy;
import kotlin.LazyKt;
import kotlin.Metadata;
import kotlin.Unit;
import kotlin.collections.CollectionsKt;
import kotlin.jvm.functions.Function0;
import kotlin.jvm.functions.Function1;
import kotlin.jvm.internal.DefaultConstructorMarker;
import kotlin.jvm.internal.Intrinsics;

/* JADX INFO: compiled from: TrackingService.kt */
/* JADX INFO: loaded from: classes6.dex */
@Metadata(d1 = {"\u0000n\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\t\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\b\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\b\u0003\n\u0002\b\u0006\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0010\u0002\n\u0002\b\u0007\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\b\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u000e*\u0002$'\b\u0007\u0018\u0000 J2\u00020\u0001:\u0001JB\u0005¢\u0006\u0002\u0010\u0002J\b\u00100\u001a\u00020/H\u0002J\u0012\u00101\u001a\u00020/2\b\u00102\u001a\u0004\u0018\u00010.H\u0002J\b\u00103\u001a\u00020/H\u0002J\b\u00104\u001a\u00020/H\u0002J\u0010\u00105\u001a\u00020/2\u0006\u00106\u001a\u000207H\u0003J\b\u00108\u001a\u00020/H\u0002J\b\u00109\u001a\u00020/H\u0016J\"\u0010:\u001a\u00020;2\b\u0010<\u001a\u0004\u0018\u00010=2\u0006\u0010>\u001a\u00020;2\u0006\u0010?\u001a\u00020;H\u0016J\b\u0010@\u001a\u00020/H\u0002J\b\u0010A\u001a\u00020/H\u0003J\b\u0010B\u001a\u00020/H\u0002J\b\u0010C\u001a\u00020/H\u0002J\b\u0010D\u001a\u00020/H\u0003J\b\u0010E\u001a\u00020/H\u0002J\b\u0010F\u001a\u00020/H\u0002J\b\u0010G\u001a\u00020/H\u0002J\u000e\u0010H\u001a\u00020/2\u0006\u0010I\u001a\u00020!R\u000e\u0010\u0003\u001a\u00020\u0004X\u0082D¢\u0006\u0002\n\u0000R\u000e\u0010\u0005\u001a\u00020\u0004X\u0082D¢\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0004X\u0082D¢\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\u0004X\u0082D¢\u0006\u0002\n\u0000R\u001e\u0010\b\u001a\u00020\t8\u0006@\u0006X\u0087.¢\u0006\u000e\n\u0000\u001a\u0004\b\n\u0010\u000b\"\u0004\b\f\u0010\rR\u0010\u0010\u000e\u001a\u0004\u0018\u00010\u000fX\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010\u0010\u001a\u00020\tX\u0082.¢\u0006\u0002\n\u0000R\u001b\u0010\u0011\u001a\u00020\u00128BX\u0082\u0084\u0002¢\u0006\f\n\u0004\b\u0015\u0010\u0016\u001a\u0004\b\u0013\u0010\u0014R\u001b\u0010\u0017\u001a\u00020\u00128BX\u0082\u0084\u0002¢\u0006\f\n\u0004\b\u0019\u0010\u0016\u001a\u0004\b\u0018\u0010\u0014R\u001e\u0010\u001a\u001a\u00020\u001b8\u0006@\u0006X\u0087.¢\u0006\u000e\n\u0000\u001a\u0004\b\u001c\u0010\u001d\"\u0004\b\u001e\u0010\u001fR\u000e\u0010 \u001a\u00020!X\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010\"\u001a\u00020!X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010#\u001a\u00020$X\u0082\u0004¢\u0006\u0004\n\u0002\u0010%R\u0010\u0010&\u001a\u00020'X\u0082\u0004¢\u0006\u0004\n\u0002\u0010(R\u0010\u0010)\u001a\u0004\u0018\u00010\u000fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010*\u001a\u0004\u0018\u00010\u000fX\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010+\u001a\u00020!X\u0082\u000e¢\u0006\u0002\n\u0000R\u001a\u0010,\u001a\u000e\u0012\u0004\u0012\u00020.\u0012\u0004\u0012\u00020/0-X\u0082\u0004¢\u0006\u0002\n\u0000¨\u0006K"}, d2 = {"Lcom/aipsoft/aipsoftconnect/Service/TrackingService;", "Landroidx/lifecycle/LifecycleService;", "()V", "ACTIVE_DELIVERY_FASTEST_INTERVAL_SECONDS", "", "ACTIVE_DELIVERY_UPDATE_INTERVAL_SECONDS", "IDLE_LOCATION_REQUEST_INTERVAL_MINUTES", "SERVICE_MAX_DURATION_HOURS", "baseNotificationBuilder", "Landroidx/core/app/NotificationCompat$Builder;", "getBaseNotificationBuilder", "()Landroidx/core/app/NotificationCompat$Builder;", "setBaseNotificationBuilder", "(Landroidx/core/app/NotificationCompat$Builder;)V", "clientId", "", "currentNotificationBuilder", "database", "Lcom/google/firebase/database/DatabaseReference;", "getDatabase", "()Lcom/google/firebase/database/DatabaseReference;", "database$delegate", "Lkotlin/Lazy;", "databaseOnTime", "getDatabaseOnTime", "databaseOnTime$delegate", "fusedLocationProviderClient", "Lcom/google/android/gms/location/FusedLocationProviderClient;", "getFusedLocationProviderClient", "()Lcom/google/android/gms/location/FusedLocationProviderClient;", "setFusedLocationProviderClient", "(Lcom/google/android/gms/location/FusedLocationProviderClient;)V", "isCurrentlyDelivering", "", "isFirstRun", "locationCallback", "com/aipsoft/aipsoftconnect/Service/TrackingService$locationCallback$1", "Lcom/aipsoft/aipsoftconnect/Service/TrackingService$locationCallback$1;", "locationCallbackForSingle", "com/aipsoft/aipsoftconnect/Service/TrackingService$locationCallbackForSingle$1", "Lcom/aipsoft/aipsoftconnect/Service/TrackingService$locationCallbackForSingle$1;", "macId", "orderNumber", "serviceKilled", "sharedLocationLogic", "Lkotlin/Function1;", "Landroid/location/Location;", "", "addEmptyPolyline", "addPathPoint", FirebaseAnalytics.Param.LOCATION, "cancelIdleLocationUpdateAlarm", "cancelIdleStopTrackingAlarm", "createNotificationChannel", "notificationManager", "Landroid/app/NotificationManager;", "killService", "onCreate", "onStartCommand", "", "intent", "Landroid/content/Intent;", "flags", "startId", "postInitialValues", "requestSingleLocationUpdate", "scheduleIdleLocationUpdates", "scheduleIdleServiceStop", "startAppropriateLocationUpdates", "startForegroundService", "stopLocationUpdates", "stopLocationUpdatesAndAlarms", "updateNotificationTrackingState", "isSvcTracking", "Companion", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
@AndroidEntryPoint
public final class TrackingService extends Hilt_TrackingService {
    public static final String ACTION_IDLE_LOCATION_UPDATE_ALARM = "com.aipsoft.aipsoftconnect.Service.ACTION_IDLE_LOCATION_UPDATE_ALARM";
    public static final String ACTION_START_IDLE_MODE = "com.aipsoft.aipsoftconnect.Service.ACTION_START_IDLE_MODE";
    public static final String ACTION_STOP_IDLE_TRACKING_ALARM = "com.aipsoft.aipsoftconnect.Service.ACTION_STOP_IDLE_TRACKING_ALARM";
    public static final String ACTION_SWITCH_TO_IDLE_MODE = "com.aipsoft.aipsoftconnect.Service.ACTION_SWITCH_TO_IDLE_MODE";

    /* JADX INFO: renamed from: Companion, reason: from kotlin metadata */
    public static final Companion INSTANCE = new Companion(null);
    private static final MutableLiveData<Boolean> isTracking = new MutableLiveData<>();
    private static final MutableLiveData<List<List<LatLng>>> pathPoints = new MutableLiveData<>();

    @Inject
    public NotificationCompat.Builder baseNotificationBuilder;
    private String clientId;
    private NotificationCompat.Builder currentNotificationBuilder;

    @Inject
    public FusedLocationProviderClient fusedLocationProviderClient;
    private boolean isCurrentlyDelivering;
    private String macId;
    private String orderNumber;
    private boolean serviceKilled;
    private boolean isFirstRun = true;
    private final long ACTIVE_DELIVERY_UPDATE_INTERVAL_SECONDS = 10;
    private final long ACTIVE_DELIVERY_FASTEST_INTERVAL_SECONDS = 5;
    private final long IDLE_LOCATION_REQUEST_INTERVAL_MINUTES = 10;
    private final long SERVICE_MAX_DURATION_HOURS = 2;

    /* JADX INFO: renamed from: database$delegate, reason: from kotlin metadata */
    private final Lazy database = LazyKt.lazy(new Function0<DatabaseReference>() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService$database$2
        /* JADX WARN: Can't rename method to resolve collision */
        @Override // kotlin.jvm.functions.Function0
        public final DatabaseReference invoke() {
            return FirebaseDatabase.getInstance("https://aipsoft-connect-default-rtdb.firebaseio.com/").getReference("aipsoftConnectLiveLocationTracking");
        }
    });

    /* JADX INFO: renamed from: databaseOnTime$delegate, reason: from kotlin metadata */
    private final Lazy databaseOnTime = LazyKt.lazy(new Function0<DatabaseReference>() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService$databaseOnTime$2
        /* JADX WARN: Can't rename method to resolve collision */
        @Override // kotlin.jvm.functions.Function0
        public final DatabaseReference invoke() {
            return FirebaseDatabase.getInstance("https://aipsoft-connect-default-rtdb.firebaseio.com/").getReference("aipsoftConnectOnTimeTracking");
        }
    });
    private final Function1<Location, Unit> sharedLocationLogic = new TrackingService$sharedLocationLogic$1(this);
    private final TrackingService$locationCallback$1 locationCallback = new LocationCallback() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService$locationCallback$1
        @Override // com.google.android.gms.location.LocationCallback
        public void onLocationResult(LocationResult result) {
            Intrinsics.checkNotNullParameter(result, "result");
            super.onLocationResult(result);
            StringBuilder sbAppend = new StringBuilder().append("locationCallback fired lat : ");
            List<Location> locations = result.getLocations();
            Intrinsics.checkNotNullExpressionValue(locations, "getLocations(...)");
            StringBuilder sbAppend2 = sbAppend.append(((Location) CollectionsKt.first((List) locations)).getLatitude()).append(" lon : ");
            List<Location> locations2 = result.getLocations();
            Intrinsics.checkNotNullExpressionValue(locations2, "getLocations(...)");
            Log.w("TrackingService", sbAppend2.append(((Location) CollectionsKt.first((List) locations2)).getLongitude()).toString());
            if (!Intrinsics.areEqual((Object) TrackingService.INSTANCE.isTracking().getValue(), (Object) true) || !this.this$0.isCurrentlyDelivering) {
                if (!this.this$0.isCurrentlyDelivering) {
                    Log.w("TrackingService", "locationCallback fired but not in delivery mode. Stopping frequent updates.");
                    this.this$0.stopLocationUpdates();
                    if (Intrinsics.areEqual((Object) TrackingService.INSTANCE.isTracking().getValue(), (Object) true)) {
                        this.this$0.startAppropriateLocationUpdates();
                        return;
                    }
                    return;
                }
                return;
            }
            Iterable locations3 = result.getLocations();
            Intrinsics.checkNotNullExpressionValue(locations3, "getLocations(...)");
            Iterable $this$forEach$iv = locations3;
            Function1 action$iv = this.this$0.sharedLocationLogic;
            for (Object element$iv : $this$forEach$iv) {
                action$iv.invoke(element$iv);
            }
        }
    };
    private final TrackingService$locationCallbackForSingle$1 locationCallbackForSingle = new LocationCallback() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService$locationCallbackForSingle$1
        @Override // com.google.android.gms.location.LocationCallback
        public void onLocationResult(LocationResult result) {
            Intrinsics.checkNotNullParameter(result, "result");
            super.onLocationResult(result);
            StringBuilder sbAppend = new StringBuilder().append("locationCallback fired lat : ");
            List<Location> locations = result.getLocations();
            Intrinsics.checkNotNullExpressionValue(locations, "getLocations(...)");
            StringBuilder sbAppend2 = sbAppend.append(((Location) CollectionsKt.first((List) locations)).getLatitude()).append(" lon : ");
            List<Location> locations2 = result.getLocations();
            Intrinsics.checkNotNullExpressionValue(locations2, "getLocations(...)");
            Log.w("TrackingService", sbAppend2.append(((Location) CollectionsKt.first((List) locations2)).getLongitude()).toString());
            if (!this.this$0.isCurrentlyDelivering) {
                Iterable locations3 = result.getLocations();
                Intrinsics.checkNotNullExpressionValue(locations3, "getLocations(...)");
                Iterable $this$forEach$iv = locations3;
                Function1 action$iv = this.this$0.sharedLocationLogic;
                for (Object element$iv : $this$forEach$iv) {
                    action$iv.invoke(element$iv);
                }
            }
            this.this$0.getFusedLocationProviderClient().removeLocationUpdates(this);
        }
    };

    /* JADX INFO: Access modifiers changed from: private */
    public final DatabaseReference getDatabase() {
        return (DatabaseReference) this.database.getValue();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final DatabaseReference getDatabaseOnTime() {
        return (DatabaseReference) this.databaseOnTime.getValue();
    }

    public final FusedLocationProviderClient getFusedLocationProviderClient() {
        FusedLocationProviderClient fusedLocationProviderClient = this.fusedLocationProviderClient;
        if (fusedLocationProviderClient != null) {
            return fusedLocationProviderClient;
        }
        Intrinsics.throwUninitializedPropertyAccessException("fusedLocationProviderClient");
        return null;
    }

    public final void setFusedLocationProviderClient(FusedLocationProviderClient fusedLocationProviderClient) {
        Intrinsics.checkNotNullParameter(fusedLocationProviderClient, "<set-?>");
        this.fusedLocationProviderClient = fusedLocationProviderClient;
    }

    public final NotificationCompat.Builder getBaseNotificationBuilder() {
        NotificationCompat.Builder builder = this.baseNotificationBuilder;
        if (builder != null) {
            return builder;
        }
        Intrinsics.throwUninitializedPropertyAccessException("baseNotificationBuilder");
        return null;
    }

    public final void setBaseNotificationBuilder(NotificationCompat.Builder builder) {
        Intrinsics.checkNotNullParameter(builder, "<set-?>");
        this.baseNotificationBuilder = builder;
    }

    /* JADX INFO: compiled from: TrackingService.kt */
    @Metadata(d1 = {"\u00004\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010!\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\b\u0086\u0003\u0018\u00002\u00020\u0001B\u0007\b\u0002¢\u0006\u0002\u0010\u0002R\u000e\u0010\u0003\u001a\u00020\u0004X\u0086T¢\u0006\u0002\n\u0000R\u000e\u0010\u0005\u001a\u00020\u0004X\u0086T¢\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0004X\u0086T¢\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\u0004X\u0086T¢\u0006\u0002\n\u0000R\u0017\u0010\b\u001a\b\u0012\u0004\u0012\u00020\n0\t¢\u0006\b\n\u0000\u001a\u0004\b\b\u0010\u000bR+\u0010\f\u001a\u001c\u0012\u0018\u0012\u0016\u0012\u000e\u0012\f\u0012\u0004\u0012\u00020\u000e0\rj\u0002`\u000f0\rj\u0002`\u00100\t¢\u0006\b\n\u0000\u001a\u0004\b\u0011\u0010\u000b¨\u0006\u0012"}, d2 = {"Lcom/aipsoft/aipsoftconnect/Service/TrackingService$Companion;", "", "()V", "ACTION_IDLE_LOCATION_UPDATE_ALARM", "", "ACTION_START_IDLE_MODE", "ACTION_STOP_IDLE_TRACKING_ALARM", "ACTION_SWITCH_TO_IDLE_MODE", "isTracking", "Landroidx/lifecycle/MutableLiveData;", "", "()Landroidx/lifecycle/MutableLiveData;", "pathPoints", "", "Lcom/google/android/gms/maps/model/LatLng;", "Lcom/aipsoft/aipsoftconnect/Service/Polyline;", "Lcom/aipsoft/aipsoftconnect/Service/Polylines;", "getPathPoints", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
    public static final class Companion {
        public /* synthetic */ Companion(DefaultConstructorMarker defaultConstructorMarker) {
            this();
        }

        private Companion() {
        }

        public final MutableLiveData<Boolean> isTracking() {
            return TrackingService.isTracking;
        }

        public final MutableLiveData<List<List<LatLng>>> getPathPoints() {
            return TrackingService.pathPoints;
        }
    }

    private final void postInitialValues() {
        isTracking.postValue(false);
        pathPoints.postValue(new ArrayList());
    }

    private final void killService() {
        Log.d("TrackingService", "killService called");
        this.serviceKilled = true;
        this.isFirstRun = true;
        this.isCurrentlyDelivering = false;
        this.macId = null;
        this.clientId = null;
        this.orderNumber = null;
        stopLocationUpdatesAndAlarms();
        postInitialValues();
        stopSelf();
        if (Build.VERSION.SDK_INT >= 24) {
            stopForeground(1);
        } else {
            stopForeground(true);
        }
    }

    @Override // com.aipsoft.aipsoftconnect.Service.Hilt_TrackingService, androidx.lifecycle.LifecycleService, android.app.Service
    public void onCreate() {
        super.onCreate();
        this.currentNotificationBuilder = getBaseNotificationBuilder();
        postInitialValues();
        FusedLocationProviderClient fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this);
        Intrinsics.checkNotNullExpressionValue(fusedLocationProviderClient, "getFusedLocationProviderClient(...)");
        setFusedLocationProviderClient(fusedLocationProviderClient);
        final Function1<Boolean, Unit> function1 = new Function1<Boolean, Unit>() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService.onCreate.1
            {
                super(1);
            }

            @Override // kotlin.jvm.functions.Function1
            public /* bridge */ /* synthetic */ Unit invoke(Boolean bool) throws IllegalAccessException, NoSuchFieldException {
                invoke2(bool);
                return Unit.INSTANCE;
            }

            /* JADX INFO: renamed from: invoke, reason: avoid collision after fix types in other method */
            public final void invoke2(Boolean tracking) throws IllegalAccessException, NoSuchFieldException {
                TrackingService trackingService = TrackingService.this;
                Intrinsics.checkNotNull(tracking);
                trackingService.updateNotificationTrackingState(tracking.booleanValue());
                if (!tracking.booleanValue() && !TrackingService.this.serviceKilled) {
                    TrackingService.this.stopLocationUpdatesAndAlarms();
                }
            }
        };
        isTracking.observe(this, new Observer() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService$$ExternalSyntheticLambda0
            @Override // androidx.lifecycle.Observer
            public final void onChanged(Object obj) {
                TrackingService.onCreate$lambda$0(function1, obj);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onCreate$lambda$0(Function1 tmp0, Object p0) {
        Intrinsics.checkNotNullParameter(tmp0, "$tmp0");
        tmp0.invoke(p0);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void startAppropriateLocationUpdates() {
        if (!LiveLocationUtility.INSTANCE.hasLocationPermission(this)) {
            Log.w("TrackingService", "Missing location permission. Cannot start updates.");
            isTracking.postValue(false);
            killService();
            return;
        }
        stopLocationUpdates();
        if (this.isCurrentlyDelivering) {
            Log.d("TrackingService", "Starting ACTIVE DELIVERY location updates.");
            LocationRequest locationRequest = LocationRequest.create();
            locationRequest.setPriority(100);
            locationRequest.setInterval(TimeUnit.SECONDS.toMillis(this.ACTIVE_DELIVERY_UPDATE_INTERVAL_SECONDS));
            locationRequest.setFastestInterval(TimeUnit.SECONDS.toMillis(this.ACTIVE_DELIVERY_FASTEST_INTERVAL_SECONDS));
            getFusedLocationProviderClient().requestLocationUpdates(locationRequest, this.locationCallback, Looper.getMainLooper());
            cancelIdleLocationUpdateAlarm();
            cancelIdleStopTrackingAlarm();
            return;
        }
        Log.d("TrackingService", "Starting IDLE mode location updates.");
        requestSingleLocationUpdate();
        scheduleIdleLocationUpdates();
        scheduleIdleServiceStop();
    }

    private final void requestSingleLocationUpdate() {
        if (!LiveLocationUtility.INSTANCE.hasLocationPermission(this)) {
            Log.w("TrackingService", "Missing location permission for single update.");
            return;
        }
        Log.d("TrackingService", "Requesting SINGLE location update.");
        LocationRequest request = LocationRequest.create();
        request.setPriority(100);
        request.setExpirationDuration(TimeUnit.SECONDS.toMillis(15L));
        try {
            Task<Void> taskRequestLocationUpdates = getFusedLocationProviderClient().requestLocationUpdates(request, this.locationCallbackForSingle, Looper.getMainLooper());
            final C00291 c00291 = new Function1<Void, Unit>() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService.requestSingleLocationUpdate.1
                @Override // kotlin.jvm.functions.Function1
                public /* bridge */ /* synthetic */ Unit invoke(Void r2) {
                    invoke2(r2);
                    return Unit.INSTANCE;
                }

                /* JADX INFO: renamed from: invoke, reason: avoid collision after fix types in other method */
                public final void invoke2(Void it) {
                    Log.d("TrackingService", "requestSingleLocationUpdate: requestLocationUpdates call SUCCEEDED.");
                }
            };
            taskRequestLocationUpdates.addOnSuccessListener(new OnSuccessListener() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService$$ExternalSyntheticLambda1
                @Override // com.google.android.gms.tasks.OnSuccessListener
                public final void onSuccess(Object obj) {
                    TrackingService.requestSingleLocationUpdate$lambda$3(c00291, obj);
                }
            }).addOnFailureListener(new OnFailureListener() { // from class: com.aipsoft.aipsoftconnect.Service.TrackingService$$ExternalSyntheticLambda2
                @Override // com.google.android.gms.tasks.OnFailureListener
                public final void onFailure(Exception exc) {
                    TrackingService.requestSingleLocationUpdate$lambda$4(exc);
                }
            });
        } catch (Exception ex) {
            Log.e("TrackingService", "requestSingleLocationUpdate: Exception during requestLocationUpdates", ex);
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void requestSingleLocationUpdate$lambda$3(Function1 tmp0, Object p0) {
        Intrinsics.checkNotNullParameter(tmp0, "$tmp0");
        tmp0.invoke(p0);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void requestSingleLocationUpdate$lambda$4(Exception e) {
        Intrinsics.checkNotNullParameter(e, "e");
        Log.e("TrackingService", "requestSingleLocationUpdate: requestLocationUpdates call FAILED.", e);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void stopLocationUpdates() {
        Log.d("TrackingService", "Stopping location updates (fused provider).");
        getFusedLocationProviderClient().removeLocationUpdates(this.locationCallback);
        getFusedLocationProviderClient().removeLocationUpdates(this.locationCallbackForSingle);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void stopLocationUpdatesAndAlarms() {
        stopLocationUpdates();
        cancelIdleLocationUpdateAlarm();
        cancelIdleStopTrackingAlarm();
    }

    public final void updateNotificationTrackingState(boolean isSvcTracking) throws IllegalAccessException, NoSuchFieldException {
        String statusText;
        if (isSvcTracking) {
        }
        if (isSvcTracking) {
            Intent $this$updateNotificationTrackingState_u24lambda_u245 = new Intent(this, (Class<?>) TrackingService.class);
            $this$updateNotificationTrackingState_u24lambda_u245.setAction(Constant.ACTION_PAUSE_SERVICE);
            PendingIntent.getService(this, 1, $this$updateNotificationTrackingState_u24lambda_u245, 201326592);
        } else {
            Intent $this$updateNotificationTrackingState_u24lambda_u246 = new Intent(this, (Class<?>) TrackingService.class);
            $this$updateNotificationTrackingState_u24lambda_u246.setAction(Constant.ACTION_START_OR_RESUME_SERVICE);
            PendingIntent.getService(this, 2, $this$updateNotificationTrackingState_u24lambda_u246, 201326592);
        }
        Object systemService = getSystemService("notification");
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.app.NotificationManager");
        NotificationManager nm = (NotificationManager) systemService;
        NotificationCompat.Builder builder = this.currentNotificationBuilder;
        NotificationCompat.Builder builder2 = null;
        if (builder == null) {
            Intrinsics.throwUninitializedPropertyAccessException("currentNotificationBuilder");
            builder = null;
        }
        Field $this$updateNotificationTrackingState_u24lambda_u247 = builder.getClass().getDeclaredField("mActions");
        $this$updateNotificationTrackingState_u24lambda_u247.setAccessible(true);
        NotificationCompat.Builder builder3 = this.currentNotificationBuilder;
        if (builder3 == null) {
            Intrinsics.throwUninitializedPropertyAccessException("currentNotificationBuilder");
            builder3 = null;
        }
        $this$updateNotificationTrackingState_u24lambda_u247.set(builder3, new ArrayList());
        if (this.serviceKilled) {
            statusText = "Service stopped.";
        } else if (isSvcTracking && this.isCurrentlyDelivering) {
            statusText = "Active delivery tracking.";
        } else {
            statusText = (!isSvcTracking || this.isCurrentlyDelivering) ? "Tracking paused." : "Background tracking active (every " + this.IDLE_LOCATION_REQUEST_INTERVAL_MINUTES + " min).";
        }
        NotificationCompat.Builder builderClearActions = getBaseNotificationBuilder().setContentText(statusText).clearActions();
        Intrinsics.checkNotNullExpressionValue(builderClearActions, "clearActions(...)");
        this.currentNotificationBuilder = builderClearActions;
        if (builderClearActions == null) {
            Intrinsics.throwUninitializedPropertyAccessException("currentNotificationBuilder");
        } else {
            builder2 = builderClearActions;
        }
        nm.notify(1, builder2.build());
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void addPathPoint(Location location) {
        if (location != null) {
            LatLng pos = new LatLng(location.getLatitude(), location.getLongitude());
            MutableLiveData<List<List<LatLng>>> mutableLiveData = pathPoints;
            List<List<LatLng>> value = mutableLiveData.getValue();
            if (value != null) {
                Intrinsics.checkNotNull(value);
                if (!value.isEmpty()) {
                    ((List) CollectionsKt.last((List) value)).add(pos);
                    mutableLiveData.postValue(value);
                } else if (this.isCurrentlyDelivering) {
                    value.add(CollectionsKt.mutableListOf(pos));
                    mutableLiveData.postValue(value);
                }
            }
        }
    }

    private final void addEmptyPolyline() {
        MutableLiveData<List<List<LatLng>>> mutableLiveData = pathPoints;
        List<List<LatLng>> value = mutableLiveData.getValue();
        if (value != null) {
            value.add(new ArrayList());
            mutableLiveData.postValue(value);
        } else {
            value = null;
        }
        if (value == null) {
            mutableLiveData.postValue(CollectionsKt.mutableListOf(new ArrayList()));
        }
    }

    /* JADX WARN: Failed to restore switch over string. Please report as a decompilation issue */
    @Override // androidx.lifecycle.LifecycleService, android.app.Service
    public int onStartCommand(Intent intent, int flags, int startId) throws IllegalAccessException, NoSuchFieldException {
        if (intent != null) {
            Log.d("TrackingService", "onStartCommand action: " + intent.getAction() + ", Delivering: " + intent.getBooleanExtra(Constant.LIVE_TRACKING_IS_DELIVERING, this.isCurrentlyDelivering));
            String action = intent.getAction();
            if (action != null) {
                switch (action.hashCode()) {
                    case -1631682606:
                        if (action.equals(ACTION_SWITCH_TO_IDLE_MODE)) {
                            Log.d("TrackingService", "Switching to IDLE mode.");
                            this.isCurrentlyDelivering = false;
                            MutableLiveData<Boolean> mutableLiveData = isTracking;
                            if (Intrinsics.areEqual((Object) mutableLiveData.getValue(), (Object) true) && !this.serviceKilled) {
                                startAppropriateLocationUpdates();
                                updateNotificationTrackingState(true);
                            } else if (mutableLiveData.getValue() != null) {
                                Boolean value = mutableLiveData.getValue();
                                Intrinsics.checkNotNull(value);
                                if (value.booleanValue() || this.serviceKilled) {
                                    Log.d("TrackingService", "else isTracking.value " + mutableLiveData.getValue() + " serviceKilled " + this.serviceKilled);
                                } else {
                                    Log.d("TrackingService", "Switch to idle called, but service not actively tracking. No change in alarms yet.");
                                    startAppropriateLocationUpdates();
                                    updateNotificationTrackingState(true);
                                    Log.d("TrackingService", "Switch to idle called, but service not actively tracking. No change in alarms yet.");
                                }
                            } else {
                                Log.d("TrackingService", "Switch to idle called, but service not actively tracking. No change in alarms yet.");
                                mutableLiveData.postValue(true);
                                startForegroundService();
                                startAppropriateLocationUpdates();
                                updateNotificationTrackingState(true);
                            }
                        }
                        break;
                    case -1023568191:
                        if (action.equals(Constant.ACTION_STOP_SERVICE)) {
                            Log.d("TrackingService", "Stop action received.");
                            killService();
                        }
                        break;
                    case 824730749:
                        if (action.equals(ACTION_IDLE_LOCATION_UPDATE_ALARM)) {
                            Log.d("TrackingService", "Idle location update alarm received.");
                            MutableLiveData<Boolean> mutableLiveData2 = isTracking;
                            if (!Intrinsics.areEqual((Object) mutableLiveData2.getValue(), (Object) true) || this.isCurrentlyDelivering || this.serviceKilled) {
                                Log.d("TrackingService", mutableLiveData2.getValue() + ' ' + (!this.isCurrentlyDelivering) + "  " + (!this.serviceKilled));
                            } else {
                                stopLocationUpdates();
                                requestSingleLocationUpdate();
                            }
                        }
                        break;
                    case 923148003:
                        if (action.equals(Constant.ACTION_PAUSE_SERVICE)) {
                            Log.d("TrackingService", "Pause action received.");
                            isTracking.postValue(false);
                            stopLocationUpdatesAndAlarms();
                        }
                        break;
                    case 1401423918:
                        if (action.equals(ACTION_START_IDLE_MODE)) {
                            Log.d("TrackingService", "STARTING to IDLE mode.");
                            this.isCurrentlyDelivering = false;
                            MutableLiveData<Boolean> mutableLiveData3 = isTracking;
                            if (Intrinsics.areEqual((Object) mutableLiveData3.getValue(), (Object) true) && !this.serviceKilled) {
                                startAppropriateLocationUpdates();
                                updateNotificationTrackingState(true);
                            } else if (mutableLiveData3.getValue() != null) {
                                Boolean value2 = mutableLiveData3.getValue();
                                Intrinsics.checkNotNull(value2);
                                if (value2.booleanValue() || this.serviceKilled) {
                                    startForegroundService();
                                    mutableLiveData3.postValue(true);
                                    startAppropriateLocationUpdates();
                                    updateNotificationTrackingState(true);
                                } else {
                                    startAppropriateLocationUpdates();
                                    updateNotificationTrackingState(true);
                                    Log.d("TrackingService", "Switch to idle called, but service not actively tracking. No change in alarms yet.");
                                }
                            } else {
                                mutableLiveData3.postValue(true);
                                startForegroundService();
                                startAppropriateLocationUpdates();
                                updateNotificationTrackingState(true);
                            }
                        }
                        break;
                    case 1729812633:
                        if (action.equals(Constant.ACTION_START_OR_RESUME_SERVICE)) {
                            this.serviceKilled = false;
                            this.isCurrentlyDelivering = intent.getBooleanExtra(Constant.LIVE_TRACKING_IS_DELIVERING, false);
                            if (this.isFirstRun) {
                                this.clientId = intent.getStringExtra(Constant.LIVE_TRACKING_CLIENT_ID);
                                this.orderNumber = intent.getStringExtra(Constant.LIVE_TRACKING_ORDER_NUMBER);
                                this.macId = intent.getStringExtra(Constant.LIVE_TRACKING_MAC_ADDRESS);
                                String str = this.clientId;
                                if (!(str == null || str.length() == 0)) {
                                    String str2 = this.orderNumber;
                                    if (!(str2 == null || str2.length() == 0)) {
                                        String str3 = this.macId;
                                        if (!(str3 == null || str3.length() == 0)) {
                                            startForegroundService();
                                            this.isFirstRun = false;
                                            if (this.isCurrentlyDelivering) {
                                                addEmptyPolyline();
                                            }
                                        }
                                    }
                                }
                                Log.e("TrackingService", "Client ID, Order Number, or MAC ID is missing. Stopping service.");
                                killService();
                                return 2;
                            }
                            isTracking.postValue(true);
                            startAppropriateLocationUpdates();
                            Log.d("TrackingService", "Service started/resumed. Delivering: " + this.isCurrentlyDelivering);
                        }
                        break;
                    case 1884596890:
                        if (action.equals(ACTION_STOP_IDLE_TRACKING_ALARM)) {
                            Log.d("TrackingService", "Stop idle tracking alarm received. Killing service.");
                            killService();
                        }
                        break;
                }
            }
        }
        return super.onStartCommand(intent, flags, startId);
    }

    private final void startForegroundService() throws IllegalAccessException, NoSuchFieldException {
        Object systemService = getSystemService("notification");
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.app.NotificationManager");
        NotificationManager notificationManager = (NotificationManager) systemService;
        if (Build.VERSION.SDK_INT >= 26) {
            createNotificationChannel(notificationManager);
        }
        Boolean value = isTracking.getValue();
        if (value == null) {
            value = false;
        }
        updateNotificationTrackingState(value.booleanValue());
        NotificationCompat.Builder builder = this.currentNotificationBuilder;
        if (builder == null) {
            Intrinsics.throwUninitializedPropertyAccessException("currentNotificationBuilder");
            builder = null;
        }
        startForeground(1, builder.build());
        Log.d("TrackingService", "Foreground service initiated.");
    }

    private final void scheduleIdleLocationUpdates() {
        Object systemService = getSystemService(NotificationCompat.CATEGORY_ALARM);
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.app.AlarmManager");
        AlarmManager alarmManager = (AlarmManager) systemService;
        Intent intent = new Intent(this, (Class<?>) TrackingService.class);
        intent.setAction(ACTION_IDLE_LOCATION_UPDATE_ALARM);
        int piFlag = Build.VERSION.SDK_INT >= 31 ? 201326592 : 134217728;
        PendingIntent pendingIntent = PendingIntent.getService(this, 3, intent, piFlag);
        long intervalMillis = TimeUnit.MINUTES.toMillis(this.IDLE_LOCATION_REQUEST_INTERVAL_MINUTES);
        alarmManager.setInexactRepeating(2, SystemClock.elapsedRealtime() + intervalMillis, intervalMillis, pendingIntent);
        Log.d("TrackingService", "Idle location updates scheduled every " + this.IDLE_LOCATION_REQUEST_INTERVAL_MINUTES + " minutes.");
    }

    private final void cancelIdleLocationUpdateAlarm() {
        Object systemService = getSystemService(NotificationCompat.CATEGORY_ALARM);
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.app.AlarmManager");
        AlarmManager alarmManager = (AlarmManager) systemService;
        Intent intent = new Intent(this, (Class<?>) TrackingService.class);
        intent.setAction(ACTION_IDLE_LOCATION_UPDATE_ALARM);
        int piFlag = Build.VERSION.SDK_INT >= 31 ? 603979776 : 536870912;
        PendingIntent pendingIntent = PendingIntent.getService(this, 3, intent, piFlag);
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
            Log.d("TrackingService", "Idle location update alarm canceled.");
        }
    }

    private final void scheduleIdleServiceStop() {
        Object systemService = getSystemService(NotificationCompat.CATEGORY_ALARM);
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.app.AlarmManager");
        AlarmManager alarmManager = (AlarmManager) systemService;
        Intent intent = new Intent(this, (Class<?>) TrackingService.class);
        intent.setAction(ACTION_STOP_IDLE_TRACKING_ALARM);
        int piFlag = Build.VERSION.SDK_INT >= 31 ? 201326592 : 134217728;
        PendingIntent pendingIntent = PendingIntent.getService(this, 4, intent, piFlag);
        long stopTimeMillis = SystemClock.elapsedRealtime() + TimeUnit.HOURS.toMillis(this.SERVICE_MAX_DURATION_HOURS);
        if (Build.VERSION.SDK_INT >= 23) {
            alarmManager.setExactAndAllowWhileIdle(2, stopTimeMillis, pendingIntent);
        } else {
            alarmManager.setExact(2, stopTimeMillis, pendingIntent);
        }
        Log.d("TrackingService", "Idle service stop scheduled in " + this.SERVICE_MAX_DURATION_HOURS + " hours.");
    }

    private final void cancelIdleStopTrackingAlarm() {
        Object systemService = getSystemService(NotificationCompat.CATEGORY_ALARM);
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.app.AlarmManager");
        AlarmManager alarmManager = (AlarmManager) systemService;
        Intent intent = new Intent(this, (Class<?>) TrackingService.class);
        intent.setAction(ACTION_STOP_IDLE_TRACKING_ALARM);
        int piFlag = Build.VERSION.SDK_INT >= 31 ? 603979776 : 536870912;
        PendingIntent pendingIntent = PendingIntent.getService(this, 4, intent, piFlag);
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
            Log.d("TrackingService", "Idle service stop alarm canceled.");
        }
    }

    private final void createNotificationChannel(NotificationManager notificationManager) {
        NotificationChannel channel = new NotificationChannel(Constant.NOTIFICATION_CHANNEL_ID, "LiveTracking", 2);
        notificationManager.createNotificationChannel(channel);
        Log.d("TrackingService", "Notification channel created.");
    }
}
