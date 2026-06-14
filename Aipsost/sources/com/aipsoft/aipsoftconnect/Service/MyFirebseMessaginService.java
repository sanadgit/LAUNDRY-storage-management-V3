package com.aipsoft.aipsoftconnect.Service;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;
import androidx.core.app.NotificationCompat;
import androidx.core.view.accessibility.AccessibilityEventCompat;
import com.aipsoft.aipsoftconnect.HelperClass.HelperClass;
import com.aipsoft.aipsoftconnect.MainActivity;
import com.aipsoft.aipsoftconnect.R;
import com.bumptech.glide.Glide;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/* JADX INFO: loaded from: classes6.dex */
public class MyFirebseMessaginService extends FirebaseMessagingService {
    @Override // com.google.firebase.messaging.FirebaseMessagingService
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Map<String, String> data = remoteMessage.getData();
        if (remoteMessage.getNotification() != null) {
            showNotification(remoteMessage.getNotification().getTitle(), remoteMessage.getNotification().getBody(), remoteMessage.getNotification().getImageUrl());
        }
        if (data.size() > 0) {
            String title = data.get("title");
            String subTitle = data.get("body");
            String image = data.get("image");
            Uri myUri = Uri.parse(image);
            showNotification(title, subTitle, myUri);
        }
    }

    private RemoteViews getCustomDesign(String title, String message, Uri image) {
        RemoteViews remoteViews = new RemoteViews(getApplicationContext().getPackageName(), R.layout.notification);
        remoteViews.setTextViewText(R.id.title, title);
        remoteViews.setTextViewText(R.id.message, message);
        try {
            Bitmap bitmap = Glide.with(this).asBitmap().load(image).submit(512, 512).get();
            remoteViews.setImageViewBitmap(R.id.icon, bitmap);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return remoteViews;
    }

    public void showNotification(String title, String message, Uri image) {
        Intent intent = new Intent(this, (Class<?>) MainActivity.class);
        intent.addFlags(AccessibilityEventCompat.TYPE_VIEW_TARGETED_BY_SCROLL);
        intent.putExtra("noti_click", true);
        intent.putExtra("title", title);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 1140850688);
        HelperClass.startMusic(getApplicationContext());
        NotificationCompat.Builder builder = new NotificationCompat.Builder(getApplicationContext(), "notification_channel").setContentTitle(title).setContentText(message).setSmallIcon(R.mipmap.ic_launcher).setAutoCancel(true).setVibrate(new long[]{1000, 1000, 1000, 1000, 1000}).setOnlyAlertOnce(true).setContentIntent(pendingIntent);
        if (image != null) {
            Bitmap bitmap = null;
            try {
                bitmap = Glide.with(this).asBitmap().load(image).submit(512, 512).get();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (ExecutionException e2) {
                e2.printStackTrace();
            }
            builder.setStyle(new NotificationCompat.BigPictureStyle().bigPicture(bitmap)).setLargeIcon(bitmap);
        }
        builder.setSmallIcon(R.mipmap.ic_launcher);
        NotificationManager notificationManager = (NotificationManager) getSystemService("notification");
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel notificationChannel = new NotificationChannel("notification_channel", "AiPSoft Connect", 4);
            notificationManager.createNotificationChannel(notificationChannel);
        }
        int m = (int) ((new Date().getTime() / 1000) % 2147483647L);
        notificationManager.notify(m, builder.build());
    }
}
