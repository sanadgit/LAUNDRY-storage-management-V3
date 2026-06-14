package com.google.android.datatransport.cct.internal;

import com.google.android.datatransport.cct.internal.NetworkConnectionInfo;

/* JADX INFO: loaded from: classes.dex */
final class AutoValue_NetworkConnectionInfo extends NetworkConnectionInfo {
    private final NetworkConnectionInfo.MobileSubtype mobileSubtype;
    private final NetworkConnectionInfo.NetworkType networkType;

    private AutoValue_NetworkConnectionInfo(NetworkConnectionInfo.NetworkType networkType, NetworkConnectionInfo.MobileSubtype mobileSubtype) {
        this.networkType = networkType;
        this.mobileSubtype = mobileSubtype;
    }

    @Override // com.google.android.datatransport.cct.internal.NetworkConnectionInfo
    public NetworkConnectionInfo.NetworkType getNetworkType() {
        return this.networkType;
    }

    @Override // com.google.android.datatransport.cct.internal.NetworkConnectionInfo
    public NetworkConnectionInfo.MobileSubtype getMobileSubtype() {
        return this.mobileSubtype;
    }

    public String toString() {
        return "NetworkConnectionInfo{networkType=" + this.networkType + ", mobileSubtype=" + this.mobileSubtype + "}";
    }

    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof NetworkConnectionInfo)) {
            return false;
        }
        NetworkConnectionInfo that = (NetworkConnectionInfo) o;
        NetworkConnectionInfo.NetworkType networkType = this.networkType;
        if (networkType != null ? networkType.equals(that.getNetworkType()) : that.getNetworkType() == null) {
            NetworkConnectionInfo.MobileSubtype mobileSubtype = this.mobileSubtype;
            if (mobileSubtype == null) {
                if (that.getMobileSubtype() == null) {
                    return true;
                }
            } else if (mobileSubtype.equals(that.getMobileSubtype())) {
                return true;
            }
        }
        return false;
    }

    public int hashCode() {
        int h$ = 1 * 1000003;
        NetworkConnectionInfo.NetworkType networkType = this.networkType;
        int h$2 = (h$ ^ (networkType == null ? 0 : networkType.hashCode())) * 1000003;
        NetworkConnectionInfo.MobileSubtype mobileSubtype = this.mobileSubtype;
        return h$2 ^ (mobileSubtype != null ? mobileSubtype.hashCode() : 0);
    }

    static final class Builder extends NetworkConnectionInfo.Builder {
        private NetworkConnectionInfo.MobileSubtype mobileSubtype;
        private NetworkConnectionInfo.NetworkType networkType;

        Builder() {
        }

        @Override // com.google.android.datatransport.cct.internal.NetworkConnectionInfo.Builder
        public NetworkConnectionInfo.Builder setNetworkType(NetworkConnectionInfo.NetworkType networkType) {
            this.networkType = networkType;
            return this;
        }

        @Override // com.google.android.datatransport.cct.internal.NetworkConnectionInfo.Builder
        public NetworkConnectionInfo.Builder setMobileSubtype(NetworkConnectionInfo.MobileSubtype mobileSubtype) {
            this.mobileSubtype = mobileSubtype;
            return this;
        }

        @Override // com.google.android.datatransport.cct.internal.NetworkConnectionInfo.Builder
        public NetworkConnectionInfo build() {
            return new AutoValue_NetworkConnectionInfo(this.networkType, this.mobileSubtype);
        }
    }
}
