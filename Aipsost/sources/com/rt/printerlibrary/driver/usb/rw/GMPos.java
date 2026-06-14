package com.rt.printerlibrary.driver.usb.rw;

import androidx.appcompat.app.AppCompatDelegate;
import androidx.recyclerview.widget.ItemTouchHelper;
import com.google.android.gms.location.LocationRequest;
import com.google.firebase.messaging.ServiceStarter;
import java.io.File;
import java.io.RandomAccessFile;
import kotlinx.coroutines.scheduling.WorkQueueKt;

/* JADX INFO: loaded from: classes11.dex */
class GMPos {
    String c;
    String d;
    public int timeout = ServiceStarter.ERROR_UNKNOWN;
    int a = 512;
    boolean b = false;
    private int[] e = {0, 128};
    private int[] f = {0, 64};
    private int[] g = {0, 32};
    private int[] h = {0, 16};
    private int[] i = {0, 8};
    private int[] j = {0, 4};
    private int[] k = {0, 2};
    private int[][] l = {new int[]{0, 128, 32, 160, 8, 136, 40, 168, 2, 130, 34, 162, 10, 138, 42, 170}, new int[]{192, 64, 224, 96, ItemTouchHelper.Callback.DEFAULT_DRAG_ANIMATION_DURATION, 72, 232, 104, 194, 66, 226, 98, 202, 74, 234, 106}, new int[]{48, 176, 16, 144, 56, 184, 24, 152, 50, 178, 18, 146, 58, 186, 26, 154}, new int[]{240, 112, 208, 80, 248, 120, 216, 88, 242, 114, 210, 82, ItemTouchHelper.Callback.DEFAULT_SWIPE_ANIMATION_DURATION, 122, 218, 90}, new int[]{12, 140, 44, 172, 4, 132, 36, 164, 14, 142, 46, 174, 6, 134, 38, 166}, new int[]{204, 76, 236, AppCompatDelegate.FEATURE_SUPPORT_ACTION_BAR, 196, 68, 228, 100, 206, 78, 238, 110, 198, 70, 230, 102}, new int[]{60, 188, 28, 156, 52, 180, 20, 148, 62, 190, 30, 158, 54, 182, 22, 150}, new int[]{252, 124, 220, 92, 244, 116, 212, 84, 254, 126, 222, 94, 246, 118, 214, 86}, new int[]{3, 131, 35, 163, 11, 139, 43, 171, 1, 129, 33, 161, 9, 137, 41, 169}, new int[]{195, 67, 227, 99, 203, 75, 235, 107, 193, 65, 225, 97, 201, 73, 233, LocationRequest.PRIORITY_NO_POWER}, new int[]{51, 179, 19, 147, 59, 187, 27, 155, 49, 177, 17, 145, 57, 185, 25, 153}, new int[]{243, 115, 211, 83, 251, 123, 219, 91, 241, 113, 209, 81, 249, 121, 217, 89}, new int[]{15, 143, 47, 175, 7, 135, 39, 167, 13, 141, 45, 173, 5, 133, 37, 165}, new int[]{207, 79, 239, 111, 199, 71, 231, 103, 205, 77, 237, AppCompatDelegate.FEATURE_SUPPORT_ACTION_BAR_OVERLAY, 197, 69, 229, 101}, new int[]{63, 191, 31, 159, 55, 183, 23, 151, 61, 189, 29, 157, 53, 181, 21, 149}, new int[]{254, WorkQueueKt.MASK, 223, 95, 247, 119, 215, 87, 253, 125, 221, 93, 245, 117, 213, 85}};

    GMPos() {
    }

    public boolean POS_IsOpen() {
        return false;
    }

    public int POS_Read(byte[] bArr, int i, int i2, int i3) {
        return -1007;
    }

    public int POS_Write(byte[] bArr, int i, int i2, int i3) {
        return -1007;
    }

    public void POS_WriteToFile(String str, String str2) {
        if (str2 == null || str == null || "".equals(str)) {
            return;
        }
        String str3 = str + "\r\n";
        try {
            File file = new File(str2);
            if (!file.exists()) {
                file.createNewFile();
            }
            RandomAccessFile randomAccessFile = new RandomAccessFile(file, "rw");
            randomAccessFile.seek(file.length());
            randomAccessFile.write(str3.getBytes());
            randomAccessFile.close();
        } catch (Exception e) {
        }
    }

    public void POS_WriteToFile(byte[] bArr, int i, int i2, String str) {
        if (str == null || bArr == null || i < 0 || i2 <= 0) {
            return;
        }
        byte[] bArr2 = new byte[i2];
        DataUtils.copyBytes(bArr, i, bArr2, 0, i2);
        String str2 = DataUtils.bytesToStr(bArr2) + "\r\n";
        try {
            File file = new File(str);
            if (!file.exists()) {
                file.createNewFile();
            }
            RandomAccessFile randomAccessFile = new RandomAccessFile(file, "rw");
            randomAccessFile.seek(file.length());
            randomAccessFile.write(str2.getBytes());
            randomAccessFile.close();
        } catch (Exception e) {
        }
    }
}
