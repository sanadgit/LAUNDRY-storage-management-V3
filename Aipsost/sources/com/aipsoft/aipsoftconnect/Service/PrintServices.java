package com.aipsoft.aipsoftconnect.Service;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.aipsoft.aipsoftconnect.R;
import com.aipsoft.aipsoftconnect.model.ConfigModel;
import com.aipsoft.aipsoftconnect.model.PrintData;
import com.aipsoft.aipsoftconnect.view.callback.PrintCallback;
import com.bumptech.glide.load.Key;
import com.rt.printerlibrary.bean.Position;
import com.rt.printerlibrary.cmd.Cmd;
import com.rt.printerlibrary.cmd.EscFactory;
import com.rt.printerlibrary.enumerate.BmpPrintMode;
import com.rt.printerlibrary.enumerate.ESCFontTypeEnum;
import com.rt.printerlibrary.enumerate.SettingEnum;
import com.rt.printerlibrary.exception.SdkException;
import com.rt.printerlibrary.factory.cmd.CmdFactory;
import com.rt.printerlibrary.printer.RTPrinter;
import com.rt.printerlibrary.setting.BitmapSetting;
import com.rt.printerlibrary.setting.CommonSetting;
import com.rt.printerlibrary.setting.TextSetting;
import com.rt.printerlibrary.utils.FuncUtils;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Method;
import java.net.Socket;
import java.util.List;
import kotlin.jvm.internal.ByteCompanionObject;

/* JADX INFO: loaded from: classes6.dex */
public class PrintServices {
    private static byte FONT_TYPE;
    private static PrintCallback callback;
    private static OutputStream outputStream;

    public PrintServices(PrintCallback callback2) {
    }

    public static void print_image(Context context, Bitmap file) throws IOException {
        try {
            SharedPreferences prefs = context.getSharedPreferences("pref", 0);
            String paired_device = prefs.getString("bluetooth_device", "");
            BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
            String[] array = paired_device.split(", ");
            String address = array[1];
            BluetoothDevice mDevice = mBluetoothAdapter.getRemoteDevice(address);
            Method m = mDevice.getClass().getMethod("createRfcommSocket", Integer.TYPE);
            BluetoothSocket btsocket = (BluetoothSocket) m.invoke(mDevice, 1);
            System.out.println("Connecting.....");
            if (ActivityCompat.checkSelfPermission(context, "android.permission.BLUETOOTH_CONNECT") != 0) {
                return;
            }
            btsocket.connect();
            System.out.println("Connected");
            OutputStream os = btsocket.getOutputStream();
            os.flush();
            if (btsocket.isConnected()) {
                OutputStream opstream = null;
                try {
                    opstream = btsocket.getOutputStream();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                outputStream = opstream;
                try {
                    OutputStream outputStream2 = btsocket.getOutputStream();
                    outputStream = outputStream2;
                    byte[] printformat = {PrinterCommands.ESC, 33, 0};
                    try {
                        byte[] arrayOfByte1 = {PrinterCommands.ESC, 33, 0};
                        printformat[2] = (byte) (arrayOfByte1[2] | 8);
                        outputStream2.write(printformat);
                        printText("abcd\n\n".getBytes());
                        printformat[2] = (byte) (arrayOfByte1[2] | PrinterCommands.DLE);
                        outputStream.write(printformat);
                        printText("abcd\n\n".getBytes());
                        printformat[2] = (byte) (arrayOfByte1[2] | 32);
                        outputStream.write(printformat);
                        printText("abcd\n\n".getBytes());
                        printformat[2] = (byte) (arrayOfByte1[2] | ByteCompanionObject.MIN_VALUE);
                        outputStream.write(printformat);
                        printText("abcd\n\n".getBytes());
                        printformat[2] = (byte) (arrayOfByte1[2] | 1);
                        outputStream.write(printformat);
                        printText("abcd\r\n".getBytes());
                        printNewLine();
                        printNewLine();
                        printNewLine();
                        byte[] cc = {PrinterCommands.ESC, 33, 0};
                        outputStream.write(cc);
                        printText("abcd\n\n".getBytes());
                        byte[] cc2 = {PrinterCommands.ESC, 33, 8};
                        outputStream.write(cc2);
                        printText("abcd\n\n".getBytes());
                        byte[] bb = {PrinterCommands.ESC, 33, 32};
                        outputStream.write(bb);
                        printText("abcd\n\n".getBytes());
                        byte[] bb2 = {PrinterCommands.ESC, 33, PrinterCommands.DLE};
                        outputStream.write(bb2);
                        printText("abcd\r\n".getBytes());
                        printNewLine();
                        printNewLine();
                        printNewLine();
                        byte[] bb3 = {PrinterCommands.ESC, 33, 1};
                        outputStream.write(bb3);
                        printText("abcd\n\n".getBytes());
                        byte[] cc1 = {PrinterCommands.ESC, 33, 8};
                        outputStream.write(cc1);
                        printText("abcd\n\n".getBytes());
                        byte[] bb1 = {PrinterCommands.ESC, 33, PrinterCommands.DLE};
                        outputStream.write(bb1);
                        printText("abcd\n\n".getBytes());
                        byte[] bb22 = {PrinterCommands.ESC, 33, 32};
                        outputStream.write(bb22);
                        printText("abcd\n\n".getBytes());
                        byte[] bb34 = {PrinterCommands.ESC, 33, 32};
                        outputStream.write(bb34);
                        printText("abcd\r\n".getBytes());
                        printNewLine();
                        printNewLine();
                        printNewLine();
                        try {
                            try {
                                printPhoto(0, file, context);
                                outputStream.flush();
                                btsocket.close();
                                return;
                            } catch (Exception e2) {
                                e = e2;
                            }
                        } catch (IOException e3) {
                            e = e3;
                            e.printStackTrace();
                            return;
                        }
                    } catch (IOException e4) {
                        e = e4;
                    }
                } catch (IOException e5) {
                    e = e5;
                }
            } else {
                return;
            }
        } catch (Exception e6) {
            e = e6;
        }
        callback.snackbarShow();
        e.printStackTrace();
    }

    public static void printPhoto(int img, Bitmap file, Context context) {
        try {
            Drawable d = ContextCompat.getDrawable(context, R.drawable.example);
            Bitmap bitmap = ((BitmapDrawable) d).getBitmap();
            float percentage = (350.0f / bitmap.getWidth()) * 100.0f;
            Bitmap.createScaledBitmap(bitmap, (int) ((bitmap.getWidth() * percentage) / 100.0f), (int) Math.ceil((bitmap.getHeight() * percentage) / 100.0f), true);
            new ByteArrayOutputStream();
            PrintPic printPic = PrintPic.getInstance();
            printPic.init(file);
            byte[] bitmapdata = printPic.printDraw();
            outputStream.write(PrinterCommands.ESC_ALIGN_CENTER);
            printText(bitmapdata);
        } catch (Exception e) {
            e.printStackTrace();
            Log.e("PrintTools", "the file isn't exists");
        }
    }

    private static void printText(byte[] msg) {
        try {
            outputStream.write(msg);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void printNewLine() {
        try {
            outputStream.write(PrinterCommands.FEED_LINE);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void print_network(Context context, String bmp) {
        SharedPreferences prefs = context.getSharedPreferences("pref", 0);
        if (!prefs.getString("network_device", "").equals("")) {
            String[] network_device = prefs.getString("network_device", "").split(":");
            final String ip = network_device[0];
            final int port_sp = Integer.parseInt(network_device[1]);
            Thread thread = new Thread() { // from class: com.aipsoft.aipsoftconnect.Service.PrintServices.1
                @Override // java.lang.Thread, java.lang.Runnable
                public void run() {
                    try {
                        Socket mSocket = new Socket(ip, port_sp);
                        OutputStream mPrinter1 = mSocket.getOutputStream();
                        mPrinter1.write(new byte[]{PrinterCommands.ESC, 97, 1});
                        byte[] newBytes = new String("\nabcd\n\n".getBytes(), "UTF8").getBytes("Windows-1256");
                        mPrinter1.write(newBytes);
                        mPrinter1.write(PrinterCommands.FEED_PAPER_AND_CUT);
                        mSocket.close();
                    } catch (Exception e) {
                        Log.e("printer exceptionj", e.toString());
                    }
                }
            };
            thread.start();
        }
    }

    public static void print2Text(RTPrinter rtPrinter) throws UnsupportedEncodingException {
        RTPrinter rtPrinter1 = BaseApplication.getInstance().getRtPrinter();
        TextSetting textSetting = new TextSetting();
        ESCFontTypeEnum curESCFontType = ESCFontTypeEnum.FONT_B_9x24;
        textSetting.setEscFontType(curESCFontType);
        if (rtPrinter1 != null) {
            CmdFactory escFac = new EscFactory();
            Cmd escCmd = escFac.create();
            escCmd.append(escCmd.getHeaderCmd());
            escCmd.setChartsetName("GBK");
            CommonSetting commonSetting = new CommonSetting();
            Position txtposition = new Position(0, 0);
            textSetting.setTxtPrintPosition(txtposition);
            textSetting.setIsEscSmallCharactor(SettingEnum.Enable);
            escCmd.append(escCmd.getCommonSettingCmd(commonSetting));
            escCmd.append(escCmd.getTextCmd(textSetting, "Hello Printer"));
            escCmd.append(escCmd.getLFCRCmd());
            textSetting.setIsEscSmallCharactor(SettingEnum.Disable);
            escCmd.append(escCmd.getTextCmd(textSetting, "Hello Printer"));
            escCmd.append(escCmd.getLFCRCmd());
            txtposition.x = 160;
            textSetting.setTxtPrintPosition(txtposition);
            escCmd.append(escCmd.getLFCRCmd());
            escCmd.append(escCmd.getLFCRCmd());
            escCmd.append(escCmd.getHeaderCmd());
            escCmd.append(escCmd.getLFCRCmd());
            Log.i("result", FuncUtils.ByteArrToHex(escCmd.getAppendCmds()));
            rtPrinter.writeMsgAsync(escCmd.getAppendCmds());
        }
    }

    public static void escPrint(final Bitmap image) throws SdkException {
        final RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
        final int bmpPrintWidth = 40;
        new Thread(new Runnable() { // from class: com.aipsoft.aipsoftconnect.Service.PrintServices.2
            @Override // java.lang.Runnable
            public void run() {
                CmdFactory cmdFactory = new EscFactory();
                Cmd cmd = cmdFactory.create();
                cmd.append(cmd.getHeaderCmd());
                CommonSetting commonSetting = new CommonSetting();
                cmd.append(cmd.getCommonSettingCmd(commonSetting));
                BitmapSetting bitmapSetting = new BitmapSetting();
                bitmapSetting.setBmpPrintMode(BmpPrintMode.MODE_SINGLE_COLOR);
                bitmapSetting.setBimtapLimitWidth(bmpPrintWidth * 8);
                try {
                    cmd.append(cmd.getBitmapCmd(bitmapSetting, image));
                } catch (Exception e) {
                    e.printStackTrace();
                }
                cmd.append(cmd.getLFCRCmd());
                cmd.append(cmd.getLFCRCmd());
                cmd.append(cmd.getLFCRCmd());
                RTPrinter rTPrinter = rtPrinter;
                if (rTPrinter != null) {
                    rTPrinter.writeMsg(cmd.getAppendCmds());
                }
            }
        }).start();
    }

    public static void printData(List<PrintData> printList, ConfigModel configModel) throws UnsupportedEncodingException {
        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
        TextSetting textSetting = new TextSetting();
        if (configModel.isCashDrawer()) {
            switch (BaseApplication.getInstance().getCurrentCmdType()) {
                case 1:
                    if (rtPrinter != null) {
                        CmdFactory cmdFactory = new EscFactory();
                        Cmd cmd = cmdFactory.create();
                        cmd.append(cmd.getOpenMoneyBoxCmd());
                        Log.e("Fuuu", FuncUtils.ByteArrToHex(cmd.getAppendCmds()));
                        rtPrinter.writeMsgAsync(cmd.getAppendCmds());
                    }
                    break;
                default:
                    if (rtPrinter != null) {
                        CmdFactory cmdFactory2 = new EscFactory();
                        Cmd cmd2 = cmdFactory2.create();
                        cmd2.append(cmd2.getOpenMoneyBoxCmd());
                    }
                    break;
            }
        }
        for (int i = 0; i < configModel.getNoOfCopy(); i++) {
            CmdFactory escFac = new EscFactory();
            Cmd escCmd = escFac.create();
            escCmd.append(escCmd.getHeaderCmd());
            escCmd.setChartsetName("GBK");
            CommonSetting commonSetting = new CommonSetting();
            Position txtposition = new Position(0, 0);
            textSetting.setTxtPrintPosition(txtposition);
            escCmd.append(escCmd.getCommonSettingCmd(commonSetting));
            escCmd.append(escCmd.getLFCRCmd());
            for (int j = 0; j < printList.size(); j++) {
                PrintData printData = printList.get(j);
                if (printData.isText()) {
                    if (!printData.getFont().equals("")) {
                        if (printData.getFont().equals("Font A")) {
                            ESCFontTypeEnum curESCFontType = ESCFontTypeEnum.FONT_A_12x24;
                            textSetting.setEscFontType(curESCFontType);
                        }
                        if (printData.getFont().equals("Font B")) {
                            ESCFontTypeEnum curESCFontType2 = ESCFontTypeEnum.FONT_B_9x24;
                            textSetting.setEscFontType(curESCFontType2);
                        }
                        if (printData.getFont().equals("Font C")) {
                            ESCFontTypeEnum curESCFontType3 = ESCFontTypeEnum.FONT_C_9x17;
                            textSetting.setEscFontType(curESCFontType3);
                        }
                        if (printData.getFont().equals("Font D")) {
                            ESCFontTypeEnum curESCFontType4 = ESCFontTypeEnum.FONT_D_8x16;
                            textSetting.setEscFontType(curESCFontType4);
                        }
                        if (printData.getFont().equals("None")) {
                            textSetting.setEscFontType(null);
                        }
                    }
                    if (printData.getStyle() != null) {
                        for (String style : printData.getStyle()) {
                            if (style.equals("DoubleHeight")) {
                                textSetting.setDoubleHeight(SettingEnum.Enable);
                            }
                            if (style.equals("DoubleWidth")) {
                                textSetting.setDoubleWidth(SettingEnum.Enable);
                            }
                            if (style.equals("Bold")) {
                                textSetting.setBold(SettingEnum.Enable);
                            }
                            if (style.equals("Italic")) {
                                textSetting.setItalic(SettingEnum.Enable);
                            }
                            if (style.equals("AntiWhite")) {
                                textSetting.setIsAntiWhite(SettingEnum.Enable);
                            }
                            if (style.equals("SmallFont")) {
                                textSetting.setIsEscSmallCharactor(SettingEnum.Enable);
                            }
                            if (style.equals("Underline")) {
                                textSetting.setUnderline(SettingEnum.Enable);
                            }
                        }
                    }
                    if (printData.getAlign().equals("Center")) {
                        textSetting.setAlign(1);
                    }
                    if (printData.getAlign().equals("Left")) {
                        textSetting.setAlign(0);
                    }
                    if (printData.getAlign().equals("Right")) {
                        textSetting.setAlign(2);
                    }
                    escCmd.append(escCmd.getLFCRCmd());
                    escCmd.append(escCmd.getTextCmd(textSetting, printData.getValue()));
                    if (printData.getNext() != null) {
                        textSetting.setDoubleHeight(SettingEnum.Disable);
                        textSetting.setDoubleWidth(SettingEnum.Disable);
                        textSetting.setBold(SettingEnum.Disable);
                        textSetting.setItalic(SettingEnum.Disable);
                        textSetting.setIsAntiWhite(SettingEnum.Disable);
                        textSetting.setIsEscSmallCharactor(SettingEnum.Disable);
                        textSetting.setUnderline(SettingEnum.Disable);
                    }
                } else if (printData.getValue().equals("LineBreak")) {
                    escCmd.append(escCmd.getLFCRCmd());
                }
                if (printList.size() - 1 == j) {
                    escCmd.append(escCmd.getLFCRCmd());
                    escCmd.append(escCmd.getHeaderCmd());
                    escCmd.append(escCmd.getLFCRCmd());
                    rtPrinter.writeMsgAsync(escCmd.getAppendCmds());
                    escCmd.append(escCmd.getLFCRCmd());
                    escCmd.append(escCmd.getLFCRCmd());
                    if (configModel.isCut()) {
                        switch (BaseApplication.getInstance().getCurrentCmdType()) {
                            case 1:
                                if (rtPrinter != null) {
                                    CmdFactory cmdFactory3 = new EscFactory();
                                    Cmd cmd3 = cmdFactory3.create();
                                    cmd3.append(cmd3.getAllCutCmd());
                                    rtPrinter.writeMsgAsync(cmd3.getAppendCmds());
                                }
                                break;
                            default:
                                if (rtPrinter != null) {
                                    CmdFactory cmdFactory4 = new EscFactory();
                                    Cmd cmd4 = cmdFactory4.create();
                                    cmd4.append(cmd4.getAllCutCmd());
                                    rtPrinter.writeMsgAsync(cmd4.getAppendCmds());
                                }
                                break;
                        }
                    }
                }
            }
        }
        for (int k = 0; k < configModel.getSound(); k++) {
            switch (BaseApplication.getInstance().getCurrentCmdType()) {
                case 1:
                    if (rtPrinter != null) {
                        CmdFactory cmdFactory5 = new EscFactory();
                        Cmd cmd5 = cmdFactory5.create();
                        cmd5.append(cmd5.getBeepCmd());
                        rtPrinter.writeMsgAsync(cmd5.getAppendCmds());
                    }
                    break;
                default:
                    if (rtPrinter != null) {
                        CmdFactory cmdFactory6 = new EscFactory();
                        Cmd cmd6 = cmdFactory6.create();
                        cmd6.append(cmd6.getBeepCmd());
                        rtPrinter.writeMsgAsync(cmd6.getAppendCmds());
                    }
                    break;
            }
        }
    }

    public static void escPrint() throws UnsupportedEncodingException {
        RTPrinter rtPrinter = BaseApplication.getInstance().getRtPrinter();
        TextSetting textSetting = new TextSetting();
        if (rtPrinter != null) {
            CmdFactory escFac = new EscFactory();
            Cmd escCmd = escFac.create();
            escCmd.append(escCmd.getHeaderCmd());
            escCmd.setChartsetName(Key.STRING_CHARSET_NAME);
            CommonSetting commonSetting = new CommonSetting();
            Position txtposition = new Position(0, 0);
            textSetting.setTxtPrintPosition(txtposition);
            escCmd.append(escCmd.getCommonSettingCmd(commonSetting));
            escCmd.append(escCmd.getTextCmd(textSetting, "Printor Connected"));
            escCmd.append(escCmd.getLFCRCmd());
            txtposition.x = 160;
            textSetting.setTxtPrintPosition(txtposition);
            escCmd.append(escCmd.getLFCRCmd());
            escCmd.append(escCmd.getLFCRCmd());
            escCmd.append(escCmd.getLFCRCmd());
            escCmd.append(escCmd.getLFCRCmd());
            escCmd.append(escCmd.getHeaderCmd());
            escCmd.append(escCmd.getLFCRCmd());
            rtPrinter.writeMsgAsync(escCmd.getAppendCmds());
        }
    }
}
