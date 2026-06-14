package com.aipsoft.aipsoftconnect.adapter;

import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;
import androidx.core.app.ActivityCompat;
import com.aipsoft.aipsoftconnect.R;
import java.util.List;

/* JADX INFO: loaded from: classes3.dex */
public class BluetoothDevicePrinterAdapter extends BaseAdapter {
    private Context mContext;
    private LayoutInflater mInflater;
    private List<BluetoothDevice> mList;

    public BluetoothDevicePrinterAdapter(Context context, List<BluetoothDevice> list) {
        this.mContext = context;
        this.mList = list;
        this.mInflater = LayoutInflater.from(context);
    }

    @Override // android.widget.Adapter
    public int getCount() {
        return this.mList.size();
    }

    @Override // android.widget.Adapter
    public Object getItem(int position) {
        return this.mList.get(position);
    }

    @Override // android.widget.Adapter
    public long getItemId(int position) {
        return position;
    }

    private class ViewHolder {
        TextView tvName;

        private ViewHolder() {
        }
    }

    @Override // android.widget.Adapter
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;
        if (convertView == null) {
            convertView = this.mInflater.inflate(R.layout.bluetooth_device_item, (ViewGroup) null);
            holder = new ViewHolder();
            holder.tvName = (TextView) convertView.findViewById(R.id.tv_bluetooth_device_name);
            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }
        BluetoothDevice bluetoothDevice = this.mList.get(position);
        if (ActivityCompat.checkSelfPermission(this.mContext, "android.permission.BLUETOOTH_CONNECT") != 0) {
            return convertView;
        }
        if (TextUtils.isEmpty(bluetoothDevice.getName())) {
            holder.tvName.setText(bluetoothDevice.getAddress());
        } else {
            holder.tvName.setText(this.mList.get(position).getName() + " [" + bluetoothDevice.getAddress() + "]");
        }
        return convertView;
    }
}
