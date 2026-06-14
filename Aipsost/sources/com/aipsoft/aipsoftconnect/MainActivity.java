package com.aipsoft.aipsoftconnect;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.Dialog;
import android.content.ContentValues;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentSender;
import android.content.SharedPreferences;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.inputmethod.InputMethodManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import com.aipsoft.aipsoftconnect.Service.BaseApplication;
import com.aipsoft.aipsoftconnect.Service.TimeRecordUtils;
import com.aipsoft.aipsoftconnect.Service.TrackingService;
import com.aipsoft.aipsoftconnect.model.PrintData;
import com.aipsoft.aipsoftconnect.utils.Constant;
import com.aipsoft.aipsoftconnect.utils.LiveLocationUtility;
import com.aipsoft.aipsoftconnect.view.imp.SettingsActivity;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.Result;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.ImagesContract;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResult;
import com.google.android.gms.location.LocationSettingsStatusCodes;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.snackbar.Snackbar;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.messaging.Constants;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;
import com.rt.printerlibrary.bean.BluetoothEdrConfigBean;
import com.rt.printerlibrary.bean.WiFiConfigBean;
import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.factory.connect.BluetoothFactory;
import com.rt.printerlibrary.factory.connect.PIFactory;
import com.rt.printerlibrary.factory.connect.WiFiFactory;
import com.rt.printerlibrary.factory.printer.PrinterFactory;
import com.rt.printerlibrary.factory.printer.UniversalPrinterFactory;
import com.rt.printerlibrary.observer.PrinterObserver;
import com.rt.printerlibrary.observer.PrinterObserverManager;
import com.rt.printerlibrary.printer.RTPrinter;
import dagger.hilt.android.AndroidEntryPoint;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import kotlin.Metadata;
import kotlin.Unit;
import kotlin.jvm.internal.Intrinsics;
import kotlin.jvm.internal.TypeIntrinsics;
import org.json.JSONException;
import pub.devrel.easypermissions.AppSettingsDialog;
import pub.devrel.easypermissions.EasyPermissions;

/* JADX INFO: compiled from: MainActivity.kt */
/* JADX INFO: loaded from: classes8.dex */
@Metadata(d1 = {"\u0000þ\u0001\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0006\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\u0010\u0011\n\u0002\b\u0005\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0010\u0002\n\u0002\b\b\n\u0002\u0018\u0002\n\u0002\b\b\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010!\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0007\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0010\n\u0002\u0018\u0002\n\u0002\b\u0007\n\u0002\u0010\u0015\n\u0002\b\b\n\u0002\u0010\u0012\n\u0002\b\u0010\n\u0002\u0018\u0002\n\u0002\b\b\b\u0007\u0018\u0000 ¤\u00012\u00020\u00012\u00020\u00022\u00020\u0003:\u0006¤\u0001¥\u0001¦\u0001B\u0005¢\u0006\u0002\u0010\u0004J\b\u0010b\u001a\u000203H\u0002J\u0010\u0010c\u001a\u0002032\u0006\u0010d\u001a\u00020eH\u0002J\u0010\u0010f\u001a\u0002032\u0006\u0010g\u001a\u00020hH\u0002J\u0010\u0010i\u001a\u00020j2\u0006\u0010k\u001a\u00020lH\u0002J\u0010\u0010m\u001a\u0004\u0018\u00010\u000e2\u0006\u0010k\u001a\u00020lJ\b\u0010n\u001a\u00020jH\u0002J\u0010\u0010o\u001a\u0002032\u0006\u0010k\u001a\u00020lH\u0002J\b\u0010p\u001a\u000203H\u0002J\u0006\u0010q\u001a\u00020(J\b\u00104\u001a\u000203H\u0002J\u000e\u0010r\u001a\u00020(2\u0006\u0010k\u001a\u00020lJ\u0006\u0010s\u001a\u000203J\u000e\u0010t\u001a\u00020(2\u0006\u0010k\u001a\u00020lJ\"\u0010u\u001a\u0002032\u0006\u0010v\u001a\u00020\u00062\u0006\u0010w\u001a\u00020\u00062\b\u0010x\u001a\u0004\u0018\u00010-H\u0016J\u001a\u0010y\u001a\u0002032\u0006\u0010w\u001a\u00020\u00062\b\u0010x\u001a\u0004\u0018\u00010-H\u0002J\b\u0010z\u001a\u000203H\u0016J\u0012\u0010{\u001a\u0002032\b\u0010|\u001a\u0004\u0018\u00010}H\u0014J\u0006\u0010~\u001a\u000203J\u001f\u0010\u007f\u001a\u0002032\u0006\u0010v\u001a\u00020\u00062\r\u0010\u0080\u0001\u001a\b\u0012\u0004\u0012\u00020\f0JH\u0016J \u0010\u0081\u0001\u001a\u0002032\u0006\u0010v\u001a\u00020\u00062\r\u0010\u0080\u0001\u001a\b\u0012\u0004\u0012\u00020\f0JH\u0016J2\u0010\u0082\u0001\u001a\u0002032\u0006\u0010v\u001a\u00020\u00062\u000f\u0010\u0083\u0001\u001a\n\u0012\u0006\b\u0001\u0012\u00020\f0\u001e2\b\u0010\u0084\u0001\u001a\u00030\u0085\u0001H\u0016¢\u0006\u0003\u0010\u0086\u0001J\t\u0010\u0087\u0001\u001a\u000203H\u0014J\t\u0010\u0088\u0001\u001a\u000203H\u0002J!\u0010\u0089\u0001\u001a\u0002032\r\u0010\u008a\u0001\u001a\b\u0012\u0002\b\u0003\u0018\u00010\u00172\u0007\u0010\u008b\u0001\u001a\u00020\u0006H\u0016J\"\u0010\u008c\u0001\u001a\u0002032\r\u0010\u008a\u0001\u001a\b\u0012\u0002\b\u0003\u0018\u00010\u00172\b\u0010\u008d\u0001\u001a\u00030\u008e\u0001H\u0016J\t\u0010\u008f\u0001\u001a\u000203H\u0002J\t\u0010\u0090\u0001\u001a\u000203H\u0002J5\u0010\u0091\u0001\u001a\u00020-2\u0007\u0010\u0092\u0001\u001a\u00020\f2\u0007\u0010\u0093\u0001\u001a\u00020\f2\u0007\u0010\u0094\u0001\u001a\u00020\f2\u000b\b\u0002\u0010\u0095\u0001\u001a\u0004\u0018\u00010(¢\u0006\u0003\u0010\u0096\u0001J\t\u0010\u0097\u0001\u001a\u000203H\u0002J\t\u0010\u0098\u0001\u001a\u000203H\u0002J\u0007\u0010\u0099\u0001\u001a\u000203J\u0012\u0010\u009a\u0001\u001a\u0002032\u0007\u0010\u009b\u0001\u001a\u00020\fH\u0002J\u0007\u0010\u009c\u0001\u001a\u000203J\u001b\u0010\u009d\u0001\u001a\u0002032\b\u0010\u009e\u0001\u001a\u00030\u009f\u00012\u0006\u0010[\u001a\u00020\u0006H\u0002J\u001f\u0010 \u0001\u001a\u0002032\t\u0010\u0093\u0001\u001a\u0004\u0018\u00010\f2\t\u0010\u0094\u0001\u001a\u0004\u0018\u00010\fH\u0002J\t\u0010¡\u0001\u001a\u000203H\u0002J\u001f\u0010¢\u0001\u001a\u0002032\t\u0010\u0093\u0001\u001a\u0004\u0018\u00010\f2\t\u0010\u0094\u0001\u001a\u0004\u0018\u00010\fH\u0002J\u000f\u0010£\u0001\u001a\u0002032\u0006\u0010\u001b\u001a\u00020\u0019R\u0014\u0010\u0005\u001a\u00020\u0006X\u0086D¢\u0006\b\n\u0000\u001a\u0004\b\u0007\u0010\bR\u0014\u0010\t\u001a\b\u0018\u00010\nR\u00020\u0000X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010\u000b\u001a\u0004\u0018\u00010\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u001c\u0010\r\u001a\u0004\u0018\u00010\u000eX\u0086\u000e¢\u0006\u000e\n\u0000\u001a\u0004\b\u000f\u0010\u0010\"\u0004\b\u0011\u0010\u0012R\u0010\u0010\u0013\u001a\u0004\u0018\u00010\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010\u0014\u001a\u0004\u0018\u00010\u0015X\u0082\u000e¢\u0006\u0002\n\u0000R\u0014\u0010\u0016\u001a\b\u0012\u0002\b\u0003\u0018\u00010\u0017X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010\u0018\u001a\u0004\u0018\u00010\u0019X\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010\u001a\u001a\u00020\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010\u001b\u001a\u0004\u0018\u00010\u0019X\u0082\u000e¢\u0006\u0002\n\u0000R(\u0010\u001c\u001a\u0010\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u000e0\u001e\u0018\u00010\u001dX\u0086\u000e¢\u0006\u000e\n\u0000\u001a\u0004\b\u001f\u0010 \"\u0004\b!\u0010\"R\u0010\u0010#\u001a\u0004\u0018\u00010$X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010%\u001a\u0004\u0018\u00010&X\u0082\u0004¢\u0006\u0002\n\u0000R\u000e\u0010'\u001a\u00020(X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010)\u001a\u0004\u0018\u00010\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010*\u001a\u00020\fX\u0082\u000e¢\u0006\u0002\n\u0000R \u0010+\u001a\b\u0012\u0004\u0012\u00020-0,X\u0086.¢\u0006\u000e\n\u0000\u001a\u0004\b.\u0010/\"\u0004\b0\u00101R\u0014\u00102\u001a\u0002038BX\u0082\u0004¢\u0006\u0006\u001a\u0004\b4\u00105R\u000e\u00106\u001a\u00020(X\u0082\u000e¢\u0006\u0002\n\u0000R\u001f\u00107\u001a\u0010\u0012\f\u0012\n 8*\u0004\u0018\u00010-0-0,¢\u0006\b\n\u0000\u001a\u0004\b9\u0010/R\u000e\u0010:\u001a\u00020\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010;\u001a\u0004\u0018\u00010<X\u0082\u0004¢\u0006\u0002\n\u0000R\u0010\u0010=\u001a\u0004\u0018\u00010\fX\u0082\u0004¢\u0006\u0002\n\u0000R\u001a\u0010>\u001a\u00020\fX\u0086\u000e¢\u0006\u000e\n\u0000\u001a\u0004\b?\u0010@\"\u0004\bA\u0010BR\u001c\u0010C\u001a\u0010\u0012\f\u0012\n 8*\u0004\u0018\u00010-0-0,X\u0082\u0004¢\u0006\u0002\n\u0000R\u0010\u0010D\u001a\u0004\u0018\u00010EX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010F\u001a\u0004\u0018\u00010\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010G\u001a\u0004\u0018\u00010\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010H\u001a\u0004\u0018\u00010\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0014\u0010I\u001a\b\u0012\u0004\u0012\u00020K0JX\u0082\u0004¢\u0006\u0002\n\u0000R\u0010\u0010L\u001a\u0004\u0018\u00010MX\u0082\u000e¢\u0006\u0002\n\u0000R&\u0010N\u001a\u001a\u0012\b\u0012\u0006\u0012\u0002\b\u00030\u00170Oj\f\u0012\b\u0012\u0006\u0012\u0002\b\u00030\u0017`PX\u0082\u0004¢\u0006\u0002\n\u0000R\u000e\u0010Q\u001a\u00020\u0006X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010R\u001a\u0004\u0018\u00010SX\u0082\u000e¢\u0006\u0002\n\u0000R\u0016\u0010T\u001a\n\u0012\u0004\u0012\u00020\u0015\u0018\u00010UX\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010V\u001a\u00020\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010W\u001a\u0004\u0018\u00010\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010X\u001a\u00020(X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010Y\u001a\u0004\u0018\u00010ZX\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010[\u001a\u00020\u0006X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010\\\u001a\u0004\u0018\u00010]X\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010^\u001a\u0004\u0018\u00010]X\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010_\u001a\u00020\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u0010\u0010`\u001a\u0004\u0018\u00010\fX\u0082\u000e¢\u0006\u0002\n\u0000R\u000e\u0010a\u001a\u00020\u0006X\u0082\u000e¢\u0006\u0002\n\u0000¨\u0006§\u0001"}, d2 = {"Lcom/aipsoft/aipsoftconnect/MainActivity;", "Landroidx/appcompat/app/AppCompatActivity;", "Lcom/rt/printerlibrary/observer/PrinterObserver;", "Lpub/devrel/easypermissions/EasyPermissions$PermissionCallbacks;", "()V", "CUSTOMIZED_REQUEST_CODE", "", "getCUSTOMIZED_REQUEST_CODE", "()I", "alert", "Lcom/aipsoft/aipsoftconnect/MainActivity$ViewDialog;", "android_id", "", "cam_path", "Landroid/net/Uri;", "getCam_path", "()Landroid/net/Uri;", "setCam_path", "(Landroid/net/Uri;)V", "clientIdentifier", "configObj", "", "curPrinterInterface", "Lcom/rt/printerlibrary/connect/PrinterInterface;", "deliveryPermissionDialog", "Landroid/app/Dialog;", "device_name", "dialog", "f_string", "Landroid/webkit/ValueCallback;", "", "getF_string", "()Landroid/webkit/ValueCallback;", "setF_string", "(Landroid/webkit/ValueCallback;)V", "fusedLocationProviderClient", "Lcom/google/android/gms/location/FusedLocationProviderClient;", "handler", "Landroid/os/Handler;", "isDeliveryStartedFromWeb", "", "keyboardStatus", "latitude", "launcher", "Landroidx/activity/result/ActivityResultLauncher;", "Landroid/content/Intent;", "getLauncher", "()Landroidx/activity/result/ActivityResultLauncher;", "setLauncher", "(Landroidx/activity/result/ActivityResultLauncher;)V", "locationPermission", "", "getLocationPermission", "()Lkotlin/Unit;", "locationPermissionGranted", "locationSettingsLauncher", "kotlin.jvm.PlatformType", "getLocationSettingsLauncher", "longitude", "mGeolocationCallback", "Landroid/webkit/GeolocationPermissions$Callback;", "mGeolocationOrigin", "main_url", "getMain_url", "()Ljava/lang/String;", "setMain_url", "(Ljava/lang/String;)V", "myARL", "myWebView", "Landroid/webkit/WebView;", "orderId", "orientation", "paired_device", "printList", "", "Lcom/aipsoft/aipsoftconnect/model/PrintData;", "printerFactory", "Lcom/rt/printerlibrary/factory/printer/PrinterFactory;", "printerInterfaceArrayList", "Ljava/util/ArrayList;", "Lkotlin/collections/ArrayList;", "printerStatus", "root", "Landroidx/constraintlayout/widget/ConstraintLayout;", "rtPrinter", "Lcom/rt/printerlibrary/printer/RTPrinter;", "scannerStatus", "screen", "shouldShowToast", "sp", "Landroid/content/SharedPreferences;", NotificationCompat.CATEGORY_STATUS, "subtitle", "Landroid/widget/TextView;", "title", "token", "wifi_device_ip", "wifi_device_port", "checkLocation", "connectBluetooth", "bluetoothEdrConfigBean", "Lcom/rt/printerlibrary/bean/BluetoothEdrConfigBean;", "connectWifi", "wiFiConfigBean", "Lcom/rt/printerlibrary/bean/WiFiConfigBean;", "createImageFile", "Ljava/io/File;", "context", "Landroid/content/Context;", "createImageUri", "create_image", "displayLocationSettingsRequest", "fetchLocation", "file_permission", "hasExactAlarmPermission", "inits", "isLocationServicesEnabled", "onActivityResult", "requestCode", "resultCode", Constants.ScionAnalytics.MessageType.DATA_MESSAGE, "onActivityResultCode", "onBackPressed", "onCreate", "savedInstanceState", "Landroid/os/Bundle;", "onDeliveryActionTriggered", "onPermissionsDenied", "perms", "onPermissionsGranted", "onRequestPermissionsResult", "permissions", "grantResults", "", "(I[Ljava/lang/String;[I)V", "onResume", "openBarcodeForWeb", "printerObserverCallback", "printerInterface", "state", "printerReadMsgCallback", "bytes", "", "requestExactAlarmPermission", "requestPermissionForLiveTracking", "sendCommandToService", "action", Constant.LIVE_TRACKING_CLIENT_ID, "order_number", "isDelivering", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/Boolean;)Landroid/content/Intent;", "setDeviceData", "showDeliveryPermissionDialog", "showKeyboard", "showToast", "s", "snackbarShow", "startActivity", "activity", "Landroid/app/Activity;", "startLiveLocationTracking", "startMyDeliveryProcess", "stopLiveLocationTracking", "updateProceedButtonState", "Companion", "MyWebViewClient", "ViewDialog", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
@AndroidEntryPoint
public final class MainActivity extends Hilt_MainActivity implements PrinterObserver, EasyPermissions.PermissionCallbacks {
    private static final int MY_PERMISSIONS_REQUEST_CALL_PHONE = 101;
    private static final int PERMISSIONS_REQUEST_ACCESS_FINE_LOCATION = 1;
    private static final int REQUEST_CHECK_SETTINGS = 101;
    private static final int RP_ACCESS_LOCATION = 101;
    private static final String TAG = "MainActivity";
    private final int CUSTOMIZED_REQUEST_CODE;
    private ViewDialog alert;
    private String android_id;
    private Uri cam_path;
    private String clientIdentifier;
    private Object configObj;
    private PrinterInterface<?> curPrinterInterface;
    private Dialog deliveryPermissionDialog;
    private String device_name;
    private Dialog dialog;
    private ValueCallback<Uri[]> f_string;
    private FusedLocationProviderClient fusedLocationProviderClient;
    private final Handler handler;
    private boolean isDeliveryStartedFromWeb;
    private String keyboardStatus;
    private String latitude;
    public ActivityResultLauncher<Intent> launcher;
    private boolean locationPermissionGranted;
    private final ActivityResultLauncher<Intent> locationSettingsLauncher;
    private String longitude;
    private final GeolocationPermissions.Callback mGeolocationCallback;
    private final String mGeolocationOrigin;
    private String main_url;
    private final ActivityResultLauncher<Intent> myARL;
    private WebView myWebView;
    private String orderId;
    private String orientation;
    private String paired_device;
    private PrinterFactory printerFactory;
    private int printerStatus;
    private ConstraintLayout root;
    private RTPrinter<Object> rtPrinter;
    private String scannerStatus;
    private String screen;
    private boolean shouldShowToast;
    private SharedPreferences sp;
    private int status;
    private TextView subtitle;
    private TextView title;
    private String token;
    private String wifi_device_ip;
    private int wifi_device_port;
    private final ArrayList<PrinterInterface<?>> printerInterfaceArrayList = new ArrayList<>();
    private final List<PrintData> printList = new ArrayList();

    public MainActivity() {
        ActivityResultLauncher<Intent> activityResultLauncherRegisterForActivityResult = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), new ActivityResultCallback() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda5
            @Override // androidx.activity.result.ActivityResultCallback
            public final void onActivityResult(Object obj) {
                MainActivity.myARL$lambda$1(this.f$0, (ActivityResult) obj);
            }
        });
        Intrinsics.checkNotNullExpressionValue(activityResultLauncherRegisterForActivityResult, "registerForActivityResult(...)");
        this.myARL = activityResultLauncherRegisterForActivityResult;
        ActivityResultLauncher<Intent> activityResultLauncherRegisterForActivityResult2 = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), new ActivityResultCallback() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda6
            @Override // androidx.activity.result.ActivityResultCallback
            public final void onActivityResult(Object obj) {
                Log.d("DialogPerm", "Returned from Location Settings. Updating dialog state.");
            }
        });
        Intrinsics.checkNotNullExpressionValue(activityResultLauncherRegisterForActivityResult2, "registerForActivityResult(...)");
        this.locationSettingsLauncher = activityResultLauncherRegisterForActivityResult2;
        this.main_url = "https://connect.aipsoft.com";
        this.scannerStatus = "Enable";
        this.CUSTOMIZED_REQUEST_CODE = 65535;
        this.token = "";
        this.device_name = "";
        this.latitude = "";
        this.longitude = "";
    }

    public final ValueCallback<Uri[]> getF_string() {
        return this.f_string;
    }

    public final void setF_string(ValueCallback<Uri[]> valueCallback) {
        this.f_string = valueCallback;
    }

    public final Uri getCam_path() {
        return this.cam_path;
    }

    public final void setCam_path(Uri uri) {
        this.cam_path = uri;
    }

    public final ActivityResultLauncher<Intent> getLauncher() {
        ActivityResultLauncher<Intent> activityResultLauncher = this.launcher;
        if (activityResultLauncher != null) {
            return activityResultLauncher;
        }
        Intrinsics.throwUninitializedPropertyAccessException("launcher");
        return null;
    }

    public final void setLauncher(ActivityResultLauncher<Intent> activityResultLauncher) {
        Intrinsics.checkNotNullParameter(activityResultLauncher, "<set-?>");
        this.launcher = activityResultLauncher;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void myARL$lambda$1(MainActivity this$0, ActivityResult result) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Intrinsics.checkNotNullParameter(result, "result");
        Uri[] uriArr = null;
        if (result.getResultCode() == -1) {
            Intent data = result.getData();
            if (data == null || data.getData() == null) {
                Uri it = this$0.cam_path;
                if (it != null) {
                    uriArr = new Uri[]{it};
                }
            } else {
                Uri data2 = data.getData();
                Intrinsics.checkNotNull(data2);
                uriArr = new Uri[]{data2};
            }
        }
        ValueCallback<Uri[]> valueCallback = this$0.f_string;
        if (valueCallback != null) {
            valueCallback.onReceiveValue(uriArr);
        }
        this$0.f_string = null;
    }

    public final ActivityResultLauncher<Intent> getLocationSettingsLauncher() {
        return this.locationSettingsLauncher;
    }

    public final String getMain_url() {
        return this.main_url;
    }

    public final void setMain_url(String str) {
        Intrinsics.checkNotNullParameter(str, "<set-?>");
        this.main_url = str;
    }

    public final int getCUSTOMIZED_REQUEST_CODE() {
        return this.CUSTOMIZED_REQUEST_CODE;
    }

    /* JADX WARN: Removed duplicated region for block: B:117:0x0281  */
    /* JADX WARN: Removed duplicated region for block: B:136:0x02dd  */
    /* JADX WARN: Removed duplicated region for block: B:138:0x02eb  */
    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    protected void onCreate(android.os.Bundle r19) {
        /*
            Method dump skipped, instruction units count: 865
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.aipsoft.aipsoftconnect.MainActivity.onCreate(android.os.Bundle):void");
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onCreate$lambda$3(MainActivity this$0, Task task) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Intrinsics.checkNotNullParameter(task, "task");
        if (!task.isSuccessful()) {
            Log.w("TAG", "Fetching FCM registration token failed", task.getException());
            return;
        }
        Object result = task.getResult();
        Intrinsics.checkNotNullExpressionValue(result, "getResult(...)");
        String str = (String) result;
        this$0.token = str;
        Log.d("token", str);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onCreate$lambda$4(Task task) {
        Intrinsics.checkNotNullParameter(task, "task");
        if (task.isSuccessful()) {
            FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
            Log.d("AUTH", "Anonymous sign-in successful: " + (user != null ? user.getUid() : null));
        } else {
            Log.e("AUTH", "Sign-in failed", task.getException());
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onCreate$lambda$5(MainActivity this$0, ActivityResult result) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Intrinsics.checkNotNullParameter(result, "result");
        this$0.onActivityResultCode(result.getResultCode(), result.getData());
    }

    /* JADX INFO: renamed from: com.aipsoft.aipsoftconnect.MainActivity$onCreate$6, reason: invalid class name */
    /* JADX INFO: compiled from: MainActivity.kt */
    @Metadata(d1 = {"\u0000\u001b\n\u0000\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0002\b\u0007\n\u0002\u0010\u000e\n\u0002\b\b*\u0001\u0000\b\n\u0018\u00002\u00020\u0001J\b\u0010\u0002\u001a\u00020\u0003H\u0007J\b\u0010\u0004\u001a\u00020\u0003H\u0007J\b\u0010\u0005\u001a\u00020\u0003H\u0007J\b\u0010\u0006\u001a\u00020\u0003H\u0007J\b\u0010\u0007\u001a\u00020\u0003H\u0007J\b\u0010\b\u001a\u00020\u0003H\u0007J\u0010\u0010\t\u001a\u00020\u00032\u0006\u0010\n\u001a\u00020\u000bH\u0007J\b\u0010\f\u001a\u00020\u0003H\u0007J\u001c\u0010\r\u001a\u00020\u00032\b\u0010\u000e\u001a\u0004\u0018\u00010\u000b2\b\u0010\u000f\u001a\u0004\u0018\u00010\u000bH\u0007J\u001c\u0010\u0010\u001a\u00020\u00032\b\u0010\u0011\u001a\u0004\u0018\u00010\u000b2\b\u0010\u0012\u001a\u0004\u0018\u00010\u000bH\u0007¨\u0006\u0013"}, d2 = {"com/aipsoft/aipsoftconnect/MainActivity$onCreate$6", "", "GetDeviceData", "", "GetDeviceLocation", "OpenNotificationSettings", "exitPage", "onDeliverySelected", "openBarcode", "print", Constants.ScionAnalytics.MessageType.DATA_MESSAGE, "", "settings", "start_delivery", "client_identifier", "order_id", "stop_delivery", Constant.LIVE_TRACKING_CLIENT_ID, "order_number", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
    public static final class AnonymousClass6 {
        AnonymousClass6() {
        }

        @JavascriptInterface
        public final void openBarcode() {
            MainActivity.this.openBarcodeForWeb();
        }

        @JavascriptInterface
        public final void settings() {
            Intent intent = new Intent(MainActivity.this.getApplicationContext(), (Class<?>) SettingsActivity.class);
            MainActivity.this.getLauncher().launch(intent);
        }

        @JavascriptInterface
        public final void exitPage() {
            MainActivity.this.finish();
        }

        @JavascriptInterface
        public final void OpenNotificationSettings() {
            Intent intent = new Intent();
            intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
            intent.addFlags(268435456);
            intent.putExtra("app_package", MainActivity.this.getPackageName());
            intent.putExtra("app_uid", MainActivity.this.getApplicationInfo().uid);
            intent.putExtra("android.provider.extra.APP_PACKAGE", MainActivity.this.getPackageName());
            MainActivity.this.startActivity(intent);
        }

        @JavascriptInterface
        public final void GetDeviceData() throws JSONException {
            MainActivity.this.setDeviceData();
        }

        @JavascriptInterface
        public final void GetDeviceLocation() {
            MainActivity.this.m59getLocationPermission();
            MainActivity mainActivity = MainActivity.this;
            Context applicationContext = mainActivity.getApplicationContext();
            Intrinsics.checkNotNullExpressionValue(applicationContext, "getApplicationContext(...)");
            mainActivity.displayLocationSettingsRequest(applicationContext);
            MainActivity.this.fetchLocation();
        }

        /* JADX WARN: Removed duplicated region for block: B:25:0x00b0  */
        @android.webkit.JavascriptInterface
        /*
            Code decompiled incorrectly, please refer to instructions dump.
            To view partially-correct code enable 'Show inconsistent code' option in preferences
        */
        public final void print(java.lang.String r19) {
            /*
                Method dump skipped, instruction units count: 484
                To view this dump change 'Code comments level' option to 'DEBUG'
            */
            throw new UnsupportedOperationException("Method not decompiled: com.aipsoft.aipsoftconnect.MainActivity.AnonymousClass6.print(java.lang.String):void");
        }

        /* JADX INFO: Access modifiers changed from: private */
        public static final void print$lambda$1$lambda$0(MainActivity this$0, View view) {
            Intrinsics.checkNotNullParameter(this$0, "this$0");
            if (!Intrinsics.areEqual(this$0.wifi_device_ip, "") && this$0.wifi_device_port != 0) {
                ViewDialog viewDialog = this$0.alert;
                if (viewDialog != null) {
                    viewDialog.showDialog(this$0.getParent(), "Please wait..", "Wifi printer is connecting...");
                }
                this$0.configObj = new WiFiConfigBean(this$0.wifi_device_ip, this$0.wifi_device_port);
                Object obj = this$0.configObj;
                Intrinsics.checkNotNull(obj, "null cannot be cast to non-null type com.rt.printerlibrary.bean.WiFiConfigBean");
                WiFiConfigBean wiFiConfigBean = (WiFiConfigBean) obj;
                this$0.connectWifi(wiFiConfigBean);
            }
        }

        /* JADX INFO: Access modifiers changed from: private */
        /* JADX WARN: Removed duplicated region for block: B:10:0x001c  */
        /* JADX WARN: Removed duplicated region for block: B:32:0x008a  */
        /* JADX WARN: Removed duplicated region for block: B:35:0x009a  */
        /*
            Code decompiled incorrectly, please refer to instructions dump.
            To view partially-correct code enable 'Show inconsistent code' option in preferences
        */
        public static final void print$lambda$4$lambda$3(com.aipsoft.aipsoftconnect.MainActivity r9, android.view.View r10) {
            /*
                java.lang.String r0 = "this$0"
                kotlin.jvm.internal.Intrinsics.checkNotNullParameter(r9, r0)
                java.lang.String r0 = com.aipsoft.aipsoftconnect.MainActivity.access$getPaired_device$p(r9)
                r1 = 1
                r2 = 0
                if (r0 == 0) goto L1c
                java.lang.CharSequence r0 = (java.lang.CharSequence) r0
                int r0 = r0.length()
                if (r0 <= 0) goto L17
                r0 = 1
                goto L18
            L17:
                r0 = 0
            L18:
                if (r0 != r1) goto L1c
                r0 = 1
                goto L1d
            L1c:
                r0 = 0
            L1d:
                if (r0 == 0) goto Lbd
                com.aipsoft.aipsoftconnect.MainActivity$ViewDialog r0 = com.aipsoft.aipsoftconnect.MainActivity.access$getAlert$p(r9)
                if (r0 == 0) goto L32
                android.app.Activity r3 = r9.getParent()
                java.lang.String r4 = "Please wait.."
                java.lang.String r5 = "Bluetooth printer is connecting..."
                r0.showDialog(r3, r4, r5)
            L32:
                android.bluetooth.BluetoothAdapter r0 = android.bluetooth.BluetoothAdapter.getDefaultAdapter()
                java.lang.String r3 = com.aipsoft.aipsoftconnect.MainActivity.access$getPaired_device$p(r9)
                if (r3 == 0) goto L9a
                java.lang.CharSequence r3 = (java.lang.CharSequence) r3
                kotlin.text.Regex r4 = new kotlin.text.Regex
                java.lang.String r5 = ", "
                r4.<init>(r5)
                java.util.List r3 = r4.split(r3, r2)
                if (r3 == 0) goto L9a
            L4d:
                r4 = 0
                boolean r5 = r3.isEmpty()
                if (r5 != 0) goto L84
                int r5 = r3.size()
                java.util.ListIterator r5 = r3.listIterator(r5)
            L5c:
                boolean r6 = r5.hasPrevious()
                if (r6 == 0) goto L84
                java.lang.Object r6 = r5.previous()
                java.lang.String r6 = (java.lang.String) r6
                r7 = 0
                r8 = r6
                java.lang.CharSequence r8 = (java.lang.CharSequence) r8
                int r8 = r8.length()
                if (r8 != 0) goto L74
                r8 = 1
                goto L75
            L74:
                r8 = 0
            L75:
                if (r8 != 0) goto L5c
                r6 = r3
                java.lang.Iterable r6 = (java.lang.Iterable) r6
                int r7 = r5.nextIndex()
                int r7 = r7 + r1
                java.util.List r6 = kotlin.collections.CollectionsKt.take(r6, r7)
                goto L88
            L84:
                java.util.List r6 = kotlin.collections.CollectionsKt.emptyList()
            L88:
                if (r6 == 0) goto L9a
                r3 = r6
                java.util.Collection r3 = (java.util.Collection) r3
                r4 = 0
                r5 = r3
                java.lang.String[] r6 = new java.lang.String[r2]
                java.lang.Object[] r3 = r5.toArray(r6)
                java.lang.String[] r3 = (java.lang.String[]) r3
                if (r3 == 0) goto L9a
                goto L9e
            L9a:
                r3 = 0
                java.lang.String[] r2 = new java.lang.String[r2]
                r3 = r2
            L9e:
                r2 = r3
                r1 = r2[r1]
                android.bluetooth.BluetoothDevice r3 = r0.getRemoteDevice(r1)
                com.rt.printerlibrary.bean.BluetoothEdrConfigBean r4 = new com.rt.printerlibrary.bean.BluetoothEdrConfigBean
                r4.<init>(r3)
                com.aipsoft.aipsoftconnect.MainActivity.access$setConfigObj$p(r9, r4)
                java.lang.Object r4 = com.aipsoft.aipsoftconnect.MainActivity.access$getConfigObj$p(r9)
                java.lang.String r5 = "null cannot be cast to non-null type com.rt.printerlibrary.bean.BluetoothEdrConfigBean"
                kotlin.jvm.internal.Intrinsics.checkNotNull(r4, r5)
                com.rt.printerlibrary.bean.BluetoothEdrConfigBean r4 = (com.rt.printerlibrary.bean.BluetoothEdrConfigBean) r4
                com.aipsoft.aipsoftconnect.MainActivity.access$connectBluetooth(r9, r4)
            Lbd:
                return
            */
            throw new UnsupportedOperationException("Method not decompiled: com.aipsoft.aipsoftconnect.MainActivity.AnonymousClass6.print$lambda$4$lambda$3(com.aipsoft.aipsoftconnect.MainActivity, android.view.View):void");
        }

        @JavascriptInterface
        public final void onDeliverySelected() {
            MainActivity.this.onDeliveryActionTriggered();
        }

        @JavascriptInterface
        public final void start_delivery(String client_identifier, String order_id) {
            MainActivity.this.isDeliveryStartedFromWeb = true;
            MainActivity.this.clientIdentifier = client_identifier;
            MainActivity.this.orderId = order_id;
            MainActivity.this.onDeliveryActionTriggered();
        }

        @JavascriptInterface
        public final void stop_delivery(String client_id, String order_number) {
            MainActivity.this.stopLiveLocationTracking(client_id, order_number);
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void openBarcodeForWeb() {
        SharedPreferences sharedPreferences = this.sp;
        String string = sharedPreferences != null ? sharedPreferences.getString("scanner", "Enable") : null;
        if (string == null) {
            string = "Enable";
        }
        this.scannerStatus = string;
        Log.d("scannerstatus", string);
        if (Intrinsics.areEqual(this.scannerStatus, "Enable")) {
            new IntentIntegrator(this).setOrientationLocked(false).setCaptureActivity(ScanActivity.class).initiateScan();
        }
    }

    private final void startLiveLocationTracking(String client_id, String order_number) {
        String str = client_id;
        if (str == null || str.length() == 0) {
            return;
        }
        String str2 = order_number;
        if (!(str2 == null || str2.length() == 0)) {
            sendCommandToService(Constant.ACTION_START_OR_RESUME_SERVICE, client_id, order_number, true);
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void stopLiveLocationTracking(String client_id, String order_number) {
        sendCommandToService(TrackingService.ACTION_SWITCH_TO_IDLE_MODE, client_id == null ? "" : client_id, order_number != null ? order_number : "", false);
    }

    public static /* synthetic */ Intent sendCommandToService$default(MainActivity mainActivity, String str, String str2, String str3, Boolean bool, int i, Object obj) {
        if ((i & 8) != 0) {
            bool = null;
        }
        return mainActivity.sendCommandToService(str, str2, str3, bool);
    }

    public final Intent sendCommandToService(String action, String client_id, String order_number, Boolean isDelivering) {
        Intrinsics.checkNotNullParameter(action, "action");
        Intrinsics.checkNotNullParameter(client_id, "client_id");
        Intrinsics.checkNotNullParameter(order_number, "order_number");
        Intent intent = new Intent(this, (Class<?>) TrackingService.class);
        intent.setAction(action);
        intent.putExtra(Constant.LIVE_TRACKING_CLIENT_ID, client_id);
        intent.putExtra(Constant.LIVE_TRACKING_ORDER_NUMBER, order_number);
        String str = this.android_id;
        if (str == null) {
            str = "";
        }
        intent.putExtra(Constant.LIVE_TRACKING_MAC_ADDRESS, str);
        if (isDelivering != null) {
            boolean it = isDelivering.booleanValue();
            intent.putExtra(Constant.LIVE_TRACKING_IS_DELIVERING, it);
        }
        startService(intent);
        return intent;
    }

    private final void showDeliveryPermissionDialog() {
        final Dialog dialog = new Dialog(this);
        dialog.requestWindowFeature(1);
        dialog.setCancelable(false);
        dialog.setContentView(R.layout.dialog_delivery_permission);
        this.deliveryPermissionDialog = dialog;
        MaterialCardView cardScheduleAlarm = (MaterialCardView) dialog.findViewById(R.id.cardScheduleAlarm);
        MaterialCardView cardLocationPermission = (MaterialCardView) dialog.findViewById(R.id.cardLocationPermission);
        Button btnProceed = (Button) dialog.findViewById(R.id.btnProceed);
        MaterialCardView btnEnableLocationServices = (MaterialCardView) dialog.findViewById(R.id.btnEnableLocationServices);
        cardScheduleAlarm.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda11
            @Override // android.view.View.OnClickListener
            public final void onClick(View view) {
                MainActivity.showDeliveryPermissionDialog$lambda$9(this.f$0, view);
            }
        });
        cardLocationPermission.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda12
            @Override // android.view.View.OnClickListener
            public final void onClick(View view) {
                MainActivity.showDeliveryPermissionDialog$lambda$10(this.f$0, view);
            }
        });
        btnProceed.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda13
            @Override // android.view.View.OnClickListener
            public final void onClick(View view) {
                MainActivity.showDeliveryPermissionDialog$lambda$11(dialog, this, view);
            }
        });
        btnEnableLocationServices.setOnClickListener(new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda14
            @Override // android.view.View.OnClickListener
            public final void onClick(View view) {
                MainActivity.showDeliveryPermissionDialog$lambda$12(this.f$0, view);
            }
        });
        Window window = dialog.getWindow();
        if (window != null) {
            window.setLayout(-1, -2);
        }
        Window window2 = dialog.getWindow();
        if (window2 != null) {
            window2.setBackgroundDrawableResource(android.R.color.transparent);
        }
        dialog.setOnShowListener(new DialogInterface.OnShowListener() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda15
            @Override // android.content.DialogInterface.OnShowListener
            public final void onShow(DialogInterface dialogInterface) {
                MainActivity.showDeliveryPermissionDialog$lambda$13(this.f$0, dialog, dialogInterface);
            }
        });
        dialog.setOnDismissListener(new DialogInterface.OnDismissListener() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda16
            @Override // android.content.DialogInterface.OnDismissListener
            public final void onDismiss(DialogInterface dialogInterface) {
                MainActivity.showDeliveryPermissionDialog$lambda$14(this.f$0, dialogInterface);
            }
        });
        dialog.show();
        updateProceedButtonState(dialog);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void showDeliveryPermissionDialog$lambda$9(MainActivity this$0, View it) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        this$0.requestExactAlarmPermission();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void showDeliveryPermissionDialog$lambda$10(MainActivity this$0, View it) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        this$0.requestPermissionForLiveTracking();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void showDeliveryPermissionDialog$lambda$11(Dialog dialog, MainActivity this$0, View it) {
        Intrinsics.checkNotNullParameter(dialog, "$dialog");
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Log.d("DialogPerm", "Proceed button clicked. Permissions should be granted.");
        dialog.dismiss();
        this$0.deliveryPermissionDialog = null;
        Toast.makeText(this$0, "Permissions granted! Starting delivery process.", 0).show();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void showDeliveryPermissionDialog$lambda$12(MainActivity this$0, View it) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Toast.makeText(this$0, "Please enable Location services (GPS) in the upcoming system settings.", 1).show();
        Intent intent = new Intent("android.settings.LOCATION_SOURCE_SETTINGS");
        this$0.locationSettingsLauncher.launch(intent);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void showDeliveryPermissionDialog$lambda$13(MainActivity this$0, Dialog dialog, DialogInterface it) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Intrinsics.checkNotNullParameter(dialog, "$dialog");
        Log.d("DialogPerm", "Dialog shown. Updating button state.");
        this$0.updateProceedButtonState(dialog);
    }

    /* JADX INFO: Access modifiers changed from: private */
    /* JADX WARN: Removed duplicated region for block: B:7:0x0019  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public static final void showDeliveryPermissionDialog$lambda$14(com.aipsoft.aipsoftconnect.MainActivity r3, android.content.DialogInterface r4) {
        /*
            java.lang.String r0 = "this$0"
            kotlin.jvm.internal.Intrinsics.checkNotNullParameter(r3, r0)
            java.lang.String r0 = "DialogPerm"
            java.lang.String r1 = "ondismiss"
            android.util.Log.d(r0, r1)
            android.app.Dialog r0 = r3.deliveryPermissionDialog
            r1 = 0
            if (r0 == 0) goto L19
            boolean r0 = r0.isShowing()
            r2 = 1
            if (r0 != r2) goto L19
            goto L1a
        L19:
            r2 = 0
        L1a:
            if (r2 == 0) goto L24
            android.app.Dialog r0 = r3.deliveryPermissionDialog
            if (r0 == 0) goto L29
            r0.dismiss()
            goto L29
        L24:
            r0 = 0
            r3.deliveryPermissionDialog = r0
            r3.shouldShowToast = r1
        L29:
            return
        */
        throw new UnsupportedOperationException("Method not decompiled: com.aipsoft.aipsoftconnect.MainActivity.showDeliveryPermissionDialog$lambda$14(com.aipsoft.aipsoftconnect.MainActivity, android.content.DialogInterface):void");
    }

    public final void updateProceedButtonState(Dialog dialog) {
        Intrinsics.checkNotNullParameter(dialog, "dialog");
        MaterialCardView cardScheduleAlarm = (MaterialCardView) dialog.findViewById(R.id.cardScheduleAlarm);
        MaterialCardView cardLocationPermission = (MaterialCardView) dialog.findViewById(R.id.cardLocationPermission);
        Button btnProceed = (Button) dialog.findViewById(R.id.btnProceed);
        MaterialCardView btnEnableLocationServices = (MaterialCardView) dialog.findViewById(R.id.btnEnableLocationServices);
        boolean isAlarmPermissionGranted = hasExactAlarmPermission(this);
        if (isAlarmPermissionGranted) {
            cardScheduleAlarm.setVisibility(8);
        } else {
            cardScheduleAlarm.setVisibility(0);
        }
        boolean isLocationPermissionGranted = LiveLocationUtility.INSTANCE.hasLocationPermission(this);
        if (isLocationPermissionGranted) {
            cardLocationPermission.setVisibility(8);
        } else {
            cardLocationPermission.setVisibility(0);
        }
        boolean isGpsEnabled = isLocationServicesEnabled(this);
        if (!isGpsEnabled) {
            btnEnableLocationServices.setVisibility(0);
        } else {
            btnEnableLocationServices.setVisibility(8);
        }
        Log.d("DialogPerm", "Alarm: " + isAlarmPermissionGranted + ", Location: " + isLocationPermissionGranted + ", Proceed: " + btnProceed.isEnabled());
    }

    public final boolean hasExactAlarmPermission(Context context) {
        Intrinsics.checkNotNullParameter(context, "context");
        Object systemService = context.getSystemService(NotificationCompat.CATEGORY_ALARM);
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.app.AlarmManager");
        AlarmManager alarmManager = (AlarmManager) systemService;
        if (Build.VERSION.SDK_INT >= 31) {
            return alarmManager.canScheduleExactAlarms();
        }
        return true;
    }

    public final boolean isLocationServicesEnabled(Context context) {
        Intrinsics.checkNotNullParameter(context, "context");
        Object systemService = context.getSystemService(FirebaseAnalytics.Param.LOCATION);
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.location.LocationManager");
        LocationManager locationManager = (LocationManager) systemService;
        try {
            if (!locationManager.isProviderEnabled("gps")) {
                if (!locationManager.isProviderEnabled("network")) {
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            Log.e("LocationCheck", "Cannot determine location services status", e);
            return false;
        }
    }

    public final void onDeliveryActionTriggered() {
        if (hasExactAlarmPermission(this) && LiveLocationUtility.INSTANCE.hasLocationPermission(this) && isLocationServicesEnabled(this)) {
            if (this.shouldShowToast) {
                Toast.makeText(this, "Permissions already granted. Proceeding.", 0).show();
            }
            sendCommandToService(TrackingService.ACTION_START_IDLE_MODE, "", "", false);
            if (this.isDeliveryStartedFromWeb) {
                startLiveLocationTracking(this.clientIdentifier, this.orderId);
                this.isDeliveryStartedFromWeb = false;
                this.clientIdentifier = null;
                this.orderId = null;
                return;
            }
            startMyDeliveryProcess();
            return;
        }
        this.shouldShowToast = true;
        showDeliveryPermissionDialog();
    }

    private final void startMyDeliveryProcess() {
        WebView webView = this.myWebView;
        if (webView != null) {
            webView.post(new Runnable() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda0
                @Override // java.lang.Runnable
                public final void run() {
                    MainActivity.startMyDeliveryProcess$lambda$15(this.f$0);
                }
            });
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void startMyDeliveryProcess$lambda$15(MainActivity this$0) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        WebView webView = this$0.myWebView;
        if (webView != null) {
            webView.evaluateJavascript("startmydeliveryprocess('enabled');", null);
        }
    }

    public final void snackbarShow() {
        ConstraintLayout root = this.root;
        if (root != null) {
            Snackbar snackbar = Snackbar.make(root, "Please connect printer", 0).setAction("Connect", new View.OnClickListener() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda10
                @Override // android.view.View.OnClickListener
                public final void onClick(View view) {
                    MainActivity.snackbarShow$lambda$17$lambda$16(this.f$0, view);
                }
            });
            Intrinsics.checkNotNullExpressionValue(snackbar, "setAction(...)");
            snackbar.show();
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void snackbarShow$lambda$17$lambda$16(MainActivity this$0, View view) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        this$0.startActivity(new SettingsActivity(), 0);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void showToast(String s) {
        Toast.makeText(this, s, 0).show();
    }

    private final void startActivity(Activity activity, int status) {
        if (status == 0) {
            Intent intent = new Intent(this, activity.getClass());
            startActivity(intent);
        }
    }

    public final void inits() {
        BaseApplication.instance.setCurrentCmdType(1);
        UniversalPrinterFactory universalPrinterFactory = new UniversalPrinterFactory();
        this.printerFactory = universalPrinterFactory;
        Intrinsics.checkNotNull(universalPrinterFactory, "null cannot be cast to non-null type com.rt.printerlibrary.factory.printer.UniversalPrinterFactory");
        this.rtPrinter = universalPrinterFactory.create();
        BaseApplication.getInstance().setRtPrinter(this.rtPrinter);
        PrinterObserverManager.getInstance().add(this);
    }

    public final boolean file_permission() {
        if (Build.VERSION.SDK_INT < 23 || (ContextCompat.checkSelfPermission(this, "android.permission.WRITE_EXTERNAL_STORAGE") == 0 && ContextCompat.checkSelfPermission(this, "android.permission.CAMERA") == 0)) {
            return true;
        }
        ActivityCompat.requestPermissions(this, new String[]{"android.permission.WRITE_EXTERNAL_STORAGE", "android.permission.CAMERA"}, 1);
        return false;
    }

    private final File create_image() throws IOException {
        String file_name = new SimpleDateFormat("yyyy_mm_ss").format(new Date());
        String new_name = "file_" + file_name + '_';
        File sd_directory = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File fileCreateTempFile = File.createTempFile(new_name, ".jpg", sd_directory);
        Intrinsics.checkNotNullExpressionValue(fileCreateTempFile, "createTempFile(...)");
        return fileCreateTempFile;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void setDeviceData() {
        final String android2 = "android";
        WebView webView = this.myWebView;
        if (webView != null) {
            webView.post(new Runnable() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda19
                @Override // java.lang.Runnable
                public final void run() {
                    MainActivity.setDeviceData$lambda$18(this.f$0, android2);
                }
            });
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void setDeviceData$lambda$18(MainActivity this$0, String android2) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Intrinsics.checkNotNullParameter(android2, "$android");
        WebView webView = this$0.myWebView;
        if (webView != null) {
            webView.evaluateJavascript("setdeivcedata('" + this$0.android_id + "','" + this$0.device_name + "','" + android2 + "','" + this$0.token + "');", null);
        }
    }

    @Override // com.rt.printerlibrary.observer.PrinterObserver
    public void printerReadMsgCallback(PrinterInterface<?> printerInterface, byte[] bytes) {
        Intrinsics.checkNotNullParameter(bytes, "bytes");
    }

    @Override // com.rt.printerlibrary.observer.PrinterObserver
    public void printerObserverCallback(final PrinterInterface<?> printerInterface, final int state) {
        runOnUiThread(new Runnable() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda18
            @Override // java.lang.Runnable
            public final void run() {
                MainActivity.printerObserverCallback$lambda$22(state, this, printerInterface);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void printerObserverCallback$lambda$22(int $state, final MainActivity this$0, PrinterInterface $printerInterface) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        switch ($state) {
            case 0:
                if ($printerInterface != null && $printerInterface.getConfigObject() != null) {
                    if (this$0.dialog != null) {
                        TextView textView = this$0.subtitle;
                        Intrinsics.checkNotNull(textView);
                        textView.setText($printerInterface.getConfigObject().toString());
                        TextView textView2 = this$0.title;
                        Intrinsics.checkNotNull(textView2);
                        textView2.setText("Disconnected");
                        TextView textView3 = this$0.title;
                        Intrinsics.checkNotNull(textView3);
                        textView3.setTextColor(ContextCompat.getColor(this$0.getApplicationContext(), R.color.red));
                        new Handler().postDelayed(new Runnable() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda3
                            @Override // java.lang.Runnable
                            public final void run() {
                                MainActivity.printerObserverCallback$lambda$22$lambda$20(this.f$0);
                            }
                        }, Constant.FASTEST_LOCATION_INTERVAL);
                    } else {
                        this$0.showToast($printerInterface.getConfigObject() + this$0.getString(R.string._main_disconnect));
                    }
                } else if (this$0.dialog != null) {
                    TextView textView4 = this$0.subtitle;
                    Intrinsics.checkNotNull(textView4);
                    textView4.setText("Check your printer connection and");
                    TextView textView5 = this$0.title;
                    Intrinsics.checkNotNull(textView5);
                    textView5.setText("try again...");
                    new Handler().postDelayed(new Runnable() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda4
                        @Override // java.lang.Runnable
                        public final void run() {
                            MainActivity.printerObserverCallback$lambda$22$lambda$21(this.f$0);
                        }
                    }, Constant.FASTEST_LOCATION_INTERVAL);
                } else {
                    this$0.showToast("Check your wifi connection and try again..");
                }
                TimeRecordUtils.record("RT连接断开：", System.currentTimeMillis());
                this$0.curPrinterInterface = null;
                TypeIntrinsics.asMutableCollection(this$0.printerInterfaceArrayList).remove($printerInterface);
                SharedPreferences.Editor editor1 = this$0.getSharedPreferences("pref", 0).edit();
                editor1.putInt("checkConnection", 0);
                editor1.apply();
                break;
            case 1:
                TimeRecordUtils.record("RT连接end：", System.currentTimeMillis());
                if (this$0.dialog != null) {
                    TextView textView6 = this$0.subtitle;
                    Intrinsics.checkNotNull(textView6);
                    Intrinsics.checkNotNull($printerInterface);
                    textView6.setText($printerInterface.getConfigObject().toString());
                    TextView textView7 = this$0.title;
                    Intrinsics.checkNotNull(textView7);
                    textView7.setText("Connected");
                    TextView textView8 = this$0.title;
                    Intrinsics.checkNotNull(textView8);
                    textView8.setTextColor(ContextCompat.getColor(this$0.getApplicationContext(), R.color.button_dark_green_bg));
                    new Handler().postDelayed(new Runnable() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda2
                        @Override // java.lang.Runnable
                        public final void run() {
                            MainActivity.printerObserverCallback$lambda$22$lambda$19(this.f$0);
                        }
                    }, Constant.FASTEST_LOCATION_INTERVAL);
                } else {
                    StringBuilder sb = new StringBuilder();
                    Intrinsics.checkNotNull($printerInterface);
                    this$0.showToast(sb.append($printerInterface.getConfigObject()).append(this$0.getString(R.string._main_connected)).toString());
                }
                this$0.curPrinterInterface = $printerInterface;
                this$0.printerInterfaceArrayList.add($printerInterface);
                RTPrinter<Object> rTPrinter = this$0.rtPrinter;
                Intrinsics.checkNotNull(rTPrinter);
                rTPrinter.setPrinterInterface($printerInterface);
                SharedPreferences.Editor editor = this$0.getSharedPreferences("pref", 0).edit();
                editor.putInt("checkConnection", 1);
                editor.apply();
                break;
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void printerObserverCallback$lambda$22$lambda$19(MainActivity this$0) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Dialog dialog = this$0.dialog;
        Intrinsics.checkNotNull(dialog);
        dialog.dismiss();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void printerObserverCallback$lambda$22$lambda$20(MainActivity this$0) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Dialog dialog = this$0.dialog;
        Intrinsics.checkNotNull(dialog);
        dialog.dismiss();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void printerObserverCallback$lambda$22$lambda$21(MainActivity this$0) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Dialog dialog = this$0.dialog;
        Intrinsics.checkNotNull(dialog);
        dialog.dismiss();
    }

    /* JADX INFO: compiled from: MainActivity.kt */
    @Metadata(d1 = {"\u0000$\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\u000b\n\u0000\b\u0002\u0018\u00002\u00020\u0001B\u0005¢\u0006\u0002\u0010\u0002J\u0018\u0010\u0003\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\u00062\u0006\u0010\u0007\u001a\u00020\bH\u0016J\u0018\u0010\t\u001a\u00020\n2\u0006\u0010\u0005\u001a\u00020\u00062\u0006\u0010\u0007\u001a\u00020\bH\u0016¨\u0006\u000b"}, d2 = {"Lcom/aipsoft/aipsoftconnect/MainActivity$MyWebViewClient;", "Landroid/webkit/WebViewClient;", "()V", "onPageFinished", "", "view", "Landroid/webkit/WebView;", ImagesContract.URL, "", "shouldOverrideUrlLoading", "", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
    private static final class MyWebViewClient extends WebViewClient {
        @Override // android.webkit.WebViewClient
        public void onPageFinished(WebView view, String url) {
            Intrinsics.checkNotNullParameter(view, "view");
            Intrinsics.checkNotNullParameter(url, "url");
        }

        @Override // android.webkit.WebViewClient
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            Intrinsics.checkNotNullParameter(view, "view");
            Intrinsics.checkNotNullParameter(url, "url");
            return false;
        }
    }

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, android.app.Activity
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        Intrinsics.checkNotNullParameter(permissions, "permissions");
        Intrinsics.checkNotNullParameter(grantResults, "grantResults");
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
        if (requestCode == 1 && grantResults.length > 0 && grantResults[0] == 0) {
            ContextCompat.checkSelfPermission(this, "android.permission.ACCESS_FINE_LOCATION");
        }
    }

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, android.app.Activity
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != this.CUSTOMIZED_REQUEST_CODE && requestCode != 49374) {
            super.onActivityResult(requestCode, resultCode, data);
            return;
        }
        IntentResult result = IntentIntegrator.parseActivityResult(resultCode, data);
        if (result.getContents() == null) {
            WebView webView = this.myWebView;
            if (webView != null) {
                webView.evaluateJavascript("setRequestFocus();", null);
            }
            showKeyboard();
            return;
        }
        Log.d("barcode", result.getContents());
        WebView webView2 = this.myWebView;
        if (webView2 != null) {
            webView2.evaluateJavascript("setDelayItem('" + result.getContents() + "');", null);
        }
    }

    @Override // androidx.activity.ComponentActivity, android.app.Activity
    public void onBackPressed() {
        WebView webView = this.myWebView;
        if (webView != null) {
            webView.evaluateJavascript("goBackPage('abc');", null);
        }
    }

    public final void showKeyboard() {
        Object systemService = getSystemService("input_method");
        Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.view.inputmethod.InputMethodManager");
        InputMethodManager inputMethodManager = (InputMethodManager) systemService;
        inputMethodManager.toggleSoftInput(2, 0);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void fetchLocation() {
        if (ActivityCompat.checkSelfPermission(this, "android.permission.ACCESS_FINE_LOCATION") != 0 && ActivityCompat.checkSelfPermission(this, "android.permission.ACCESS_COARSE_LOCATION") != 0) {
            return;
        }
        LocationRequest mLocationRequest = LocationRequest.create();
        mLocationRequest.setNumUpdates(1);
        mLocationRequest.setPriority(100);
        LocationCallback mLocationCallback = new MainActivity$fetchLocation$mLocationCallback$1(this);
        LocationServices.getFusedLocationProviderClient((Activity) this).requestLocationUpdates(mLocationRequest, mLocationCallback, null);
        LocationServices.getFusedLocationProviderClient((Activity) this).getLastLocation().addOnSuccessListener(new OnSuccessListener() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda17
            @Override // com.google.android.gms.tasks.OnSuccessListener
            public final void onSuccess(Object obj) {
                MainActivity.fetchLocation$lambda$23(this.f$0, (Location) obj);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void fetchLocation$lambda$23(MainActivity this$0, Location location) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        if (location != null) {
            this$0.latitude = String.valueOf(location.getLatitude());
            this$0.longitude = String.valueOf(location.getLongitude());
            WebView webView = this$0.myWebView;
            if (webView != null) {
                webView.evaluateJavascript("setCurrentPosition('" + this$0.latitude + "','" + this$0.longitude + "');", null);
            }
        }
    }

    private final void checkLocation() {
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void displayLocationSettingsRequest(Context context) {
        GoogleApiClient googleApiClient = new GoogleApiClient.Builder(context).addApi(LocationServices.API).build();
        Intrinsics.checkNotNullExpressionValue(googleApiClient, "build(...)");
        googleApiClient.connect();
        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setPriority(100);
        locationRequest.setInterval(10000L);
        locationRequest.setFastestInterval(Constant.LOCATION_UPDATE_INTERVAL);
        LocationSettingsRequest.Builder builder = new LocationSettingsRequest.Builder().addLocationRequest(locationRequest);
        builder.setAlwaysShow(true);
        LocationServices.SettingsApi.checkLocationSettings(googleApiClient, builder.build()).setResultCallback(new ResultCallback() { // from class: com.aipsoft.aipsoftconnect.MainActivity$$ExternalSyntheticLambda1
            @Override // com.google.android.gms.common.api.ResultCallback
            public final void onResult(Result result) {
                MainActivity.displayLocationSettingsRequest$lambda$24(this.f$0, (LocationSettingsResult) result);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void displayLocationSettingsRequest$lambda$24(MainActivity this$0, LocationSettingsResult result) {
        Intrinsics.checkNotNullParameter(this$0, "this$0");
        Intrinsics.checkNotNullParameter(result, "result");
        Status status = result.getStatus();
        Intrinsics.checkNotNullExpressionValue(status, "getStatus(...)");
        switch (status.getStatusCode()) {
            case 0:
                Log.i("TAG", "All location settings are satisfied.");
                break;
            case 6:
                Log.i("TAG", "Location settings are not satisfied. Show the user a dialog to upgrade location settings ");
                try {
                    status.startResolutionForResult(this$0, 101);
                } catch (IntentSender.SendIntentException e) {
                    Log.i("TAG", "PendingIntent unable to execute request.");
                    return;
                }
                break;
            case LocationSettingsStatusCodes.SETTINGS_CHANGE_UNAVAILABLE /* 8502 */:
                Log.i("TAG", "Location settings are inadequate, and cannot be fixed here. Dialog not created.");
                break;
        }
    }

    private final Unit getLocationPermission() {
        if (ContextCompat.checkSelfPermission(getApplicationContext(), "android.permission.ACCESS_FINE_LOCATION") == 0) {
            this.locationPermissionGranted = true;
        } else {
            ActivityCompat.requestPermissions(this, new String[]{"android.permission.ACCESS_FINE_LOCATION"}, 1);
        }
        return Unit.INSTANCE;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void connectBluetooth(BluetoothEdrConfigBean bluetoothEdrConfigBean) {
        PIFactory piFactory = new BluetoothFactory();
        PrinterInterface printerInterface = piFactory.create();
        printerInterface.setConfigObject(bluetoothEdrConfigBean);
        RTPrinter<Object> rTPrinter = this.rtPrinter;
        Intrinsics.checkNotNull(rTPrinter);
        rTPrinter.setPrinterInterface(printerInterface);
        try {
            RTPrinter<Object> rTPrinter2 = this.rtPrinter;
            Intrinsics.checkNotNull(rTPrinter2);
            rTPrinter2.connect(bluetoothEdrConfigBean);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void connectWifi(WiFiConfigBean wiFiConfigBean) {
        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
        PIFactory piFactory = new WiFiFactory();
        PrinterInterface printerInterface = piFactory.create();
        printerInterface.setConfigObject(wiFiConfigBean);
        rtPrinter.setPrinterInterface(printerInterface);
        try {
            rtPrinter.connect(wiFiConfigBean);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* JADX INFO: compiled from: MainActivity.kt */
    @Metadata(d1 = {"\u0000 \n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0002\b\u0086\u0004\u0018\u00002\u00020\u0001B\u0005¢\u0006\u0002\u0010\u0002J$\u0010\u0003\u001a\u00020\u00042\b\u0010\u0005\u001a\u0004\u0018\u00010\u00062\b\u0010\u0007\u001a\u0004\u0018\u00010\b2\b\u0010\t\u001a\u0004\u0018\u00010\b¨\u0006\n"}, d2 = {"Lcom/aipsoft/aipsoftconnect/MainActivity$ViewDialog;", "", "(Lcom/aipsoft/aipsoftconnect/MainActivity;)V", "showDialog", "", "activity", "Landroid/app/Activity;", "msg1", "", "msg2", "app_debug"}, k = 1, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
    public final class ViewDialog {
        public ViewDialog() {
        }

        public final void showDialog(Activity activity, String msg1, String msg2) {
            MainActivity.this.dialog = new Dialog(MainActivity.this, R.style.AppTheme2);
            Dialog dialog = MainActivity.this.dialog;
            if (dialog != null) {
                dialog.requestWindowFeature(1);
            }
            Dialog dialog2 = MainActivity.this.dialog;
            if (dialog2 != null) {
                dialog2.setCancelable(true);
            }
            Dialog dialog3 = MainActivity.this.dialog;
            if (dialog3 != null) {
                dialog3.setContentView(R.layout.printer_connection_dialog);
            }
            MainActivity mainActivity = MainActivity.this;
            Dialog dialog4 = mainActivity.dialog;
            mainActivity.subtitle = dialog4 != null ? (TextView) dialog4.findViewById(R.id.sutitle) : null;
            MainActivity mainActivity2 = MainActivity.this;
            Dialog dialog5 = mainActivity2.dialog;
            mainActivity2.title = dialog5 != null ? (TextView) dialog5.findViewById(R.id.title) : null;
            TextView textView = MainActivity.this.subtitle;
            if (textView != null) {
                textView.setText(msg1);
            }
            TextView textView2 = MainActivity.this.title;
            if (textView2 != null) {
                textView2.setText(msg2);
            }
            Dialog dialog6 = MainActivity.this.dialog;
            if (dialog6 != null) {
                dialog6.show();
            }
            Dialog dialog7 = MainActivity.this.dialog;
            Window window = dialog7 != null ? dialog7.getWindow() : null;
            if (window != null) {
                window.setLayout(-1, -2);
            }
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    /* JADX INFO: renamed from: getLocationPermission, reason: collision with other method in class */
    public final void m59getLocationPermission() {
        if (ContextCompat.checkSelfPermission(getApplicationContext(), "android.permission.ACCESS_FINE_LOCATION") == 0) {
            this.locationPermissionGranted = true;
        } else {
            ActivityCompat.requestPermissions(this, new String[]{"android.permission.ACCESS_FINE_LOCATION"}, 1);
        }
    }

    private final void requestPermissionForLiveTracking() {
        if (LiveLocationUtility.INSTANCE.hasLocationPermission(this)) {
            return;
        }
        if (Build.VERSION.SDK_INT < 29) {
            EasyPermissions.requestPermissions(this, "You need to accept the location permission to use the app", Constant.REQUEST_CODE_LOCATION_PERMISSION, "android.permission.ACCESS_FINE_LOCATION");
        } else {
            EasyPermissions.requestPermissions(this, "You need to accept the location permission to use the app", Constant.REQUEST_CODE_LOCATION_PERMISSION, "android.permission.ACCESS_FINE_LOCATION");
        }
    }

    private final void requestExactAlarmPermission() {
        if (Build.VERSION.SDK_INT >= 31) {
            Object systemService = getSystemService(NotificationCompat.CATEGORY_ALARM);
            Intrinsics.checkNotNull(systemService, "null cannot be cast to non-null type android.app.AlarmManager");
            AlarmManager alarmManager = (AlarmManager) systemService;
            if (!alarmManager.canScheduleExactAlarms()) {
                Intent it = new Intent();
                it.setAction("android.settings.REQUEST_SCHEDULE_EXACT_ALARM");
                try {
                    startActivity(it);
                } catch (Exception e) {
                    Log.e("PermissionRequest", "Could not open exact alarm settings", e);
                    Intent it2 = new Intent("android.settings.APPLICATION_DETAILS_SETTINGS");
                    it2.setData(Uri.fromParts("package", getPackageName(), null));
                    startActivity(it2);
                }
            }
        }
    }

    @Override // pub.devrel.easypermissions.EasyPermissions.PermissionCallbacks
    public void onPermissionsGranted(int requestCode, List<String> perms) {
        Intrinsics.checkNotNullParameter(perms, "perms");
        if (Build.VERSION.SDK_INT > 29 && !LiveLocationUtility.INSTANCE.hasLocationPermission(this)) {
            ActivityCompat.requestPermissions(this, new String[]{"android.permission.ACCESS_BACKGROUND_LOCATION"}, Constant.REQUEST_CODE_LOCATION_PERMISSION);
        }
    }

    @Override // pub.devrel.easypermissions.EasyPermissions.PermissionCallbacks
    public void onPermissionsDenied(int requestCode, List<String> perms) {
        Intrinsics.checkNotNullParameter(perms, "perms");
        if (EasyPermissions.somePermissionPermanentlyDenied(this, perms)) {
            new AppSettingsDialog.Builder(this).build().show();
        } else {
            onDeliveryActionTriggered();
        }
    }

    @Override // androidx.fragment.app.FragmentActivity, android.app.Activity
    protected void onResume() {
        super.onResume();
        Dialog dialog = this.deliveryPermissionDialog;
        boolean z = false;
        if (dialog != null && dialog.isShowing()) {
            z = true;
        }
        if (z) {
            Dialog dialog2 = this.deliveryPermissionDialog;
            if (dialog2 != null) {
                dialog2.dismiss();
            }
            Log.d("DialogPerm", "OnResume");
            this.deliveryPermissionDialog = null;
            onDeliveryActionTriggered();
        }
    }

    private final File createImageFile(Context context) throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
        File storageDir = context.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File fileCreateTempFile = File.createTempFile("IMG_" + timeStamp, ".jpg", storageDir);
        Intrinsics.checkNotNullExpressionValue(fileCreateTempFile, "createTempFile(...)");
        return fileCreateTempFile;
    }

    public final Uri createImageUri(Context context) {
        Intrinsics.checkNotNullParameter(context, "context");
        ContentValues contentValues = new ContentValues();
        contentValues.put("_display_name", "IMG_" + System.currentTimeMillis() + ".jpg");
        contentValues.put("mime_type", "image/jpeg");
        contentValues.put("relative_path", "Pictures/MyApp");
        return context.getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Failed to restore switch over string. Please report as a decompilation issue */
    /* JADX WARN: Removed duplicated region for block: B:29:0x0062  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private final void onActivityResultCode(int r6, android.content.Intent r7) {
        /*
            Method dump skipped, instruction units count: 324
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.aipsoft.aipsoftconnect.MainActivity.onActivityResultCode(int, android.content.Intent):void");
    }
}
