package android.support.customtabs;

import android.net.Uri;
import android.os.Binder;
import android.os.Bundle;
import android.os.IBinder;
import android.os.IInterface;
import android.os.Parcel;
import android.os.RemoteException;
import android.support.customtabs.ICustomTabsCallback;
import java.util.List;

/* JADX INFO: loaded from: classes.dex */
public interface ICustomTabsService extends IInterface {
    Bundle extraCommand(String str, Bundle bundle) throws RemoteException;

    boolean mayLaunchUrl(ICustomTabsCallback iCustomTabsCallback, Uri uri, Bundle bundle, List<Bundle> list) throws RemoteException;

    boolean newSession(ICustomTabsCallback iCustomTabsCallback) throws RemoteException;

    boolean newSessionWithExtras(ICustomTabsCallback iCustomTabsCallback, Bundle bundle) throws RemoteException;

    int postMessage(ICustomTabsCallback iCustomTabsCallback, String str, Bundle bundle) throws RemoteException;

    boolean receiveFile(ICustomTabsCallback iCustomTabsCallback, Uri uri, int i, Bundle bundle) throws RemoteException;

    boolean requestPostMessageChannel(ICustomTabsCallback iCustomTabsCallback, Uri uri) throws RemoteException;

    boolean requestPostMessageChannelWithExtras(ICustomTabsCallback iCustomTabsCallback, Uri uri, Bundle bundle) throws RemoteException;

    boolean updateVisuals(ICustomTabsCallback iCustomTabsCallback, Bundle bundle) throws RemoteException;

    boolean validateRelationship(ICustomTabsCallback iCustomTabsCallback, int i, Uri uri, Bundle bundle) throws RemoteException;

    boolean warmup(long j) throws RemoteException;

    public static class Default implements ICustomTabsService {
        @Override // android.support.customtabs.ICustomTabsService
        public boolean warmup(long flags) throws RemoteException {
            return false;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean newSession(ICustomTabsCallback callback) throws RemoteException {
            return false;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean newSessionWithExtras(ICustomTabsCallback callback, Bundle extras) throws RemoteException {
            return false;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean mayLaunchUrl(ICustomTabsCallback callback, Uri url, Bundle extras, List<Bundle> otherLikelyBundles) throws RemoteException {
            return false;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public Bundle extraCommand(String commandName, Bundle args) throws RemoteException {
            return null;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean updateVisuals(ICustomTabsCallback callback, Bundle bundle) throws RemoteException {
            return false;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean requestPostMessageChannel(ICustomTabsCallback callback, Uri postMessageOrigin) throws RemoteException {
            return false;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean requestPostMessageChannelWithExtras(ICustomTabsCallback callback, Uri postMessageOrigin, Bundle extras) throws RemoteException {
            return false;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public int postMessage(ICustomTabsCallback callback, String message, Bundle extras) throws RemoteException {
            return 0;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean validateRelationship(ICustomTabsCallback callback, int relation, Uri origin, Bundle extras) throws RemoteException {
            return false;
        }

        @Override // android.support.customtabs.ICustomTabsService
        public boolean receiveFile(ICustomTabsCallback callback, Uri uri, int purpose, Bundle extras) throws RemoteException {
            return false;
        }

        @Override // android.os.IInterface
        public IBinder asBinder() {
            return null;
        }
    }

    public static abstract class Stub extends Binder implements ICustomTabsService {
        private static final String DESCRIPTOR = "android.support.customtabs.ICustomTabsService";
        static final int TRANSACTION_extraCommand = 5;
        static final int TRANSACTION_mayLaunchUrl = 4;
        static final int TRANSACTION_newSession = 3;
        static final int TRANSACTION_newSessionWithExtras = 10;
        static final int TRANSACTION_postMessage = 8;
        static final int TRANSACTION_receiveFile = 12;
        static final int TRANSACTION_requestPostMessageChannel = 7;
        static final int TRANSACTION_requestPostMessageChannelWithExtras = 11;
        static final int TRANSACTION_updateVisuals = 6;
        static final int TRANSACTION_validateRelationship = 9;
        static final int TRANSACTION_warmup = 2;

        public Stub() {
            attachInterface(this, DESCRIPTOR);
        }

        public static ICustomTabsService asInterface(IBinder obj) {
            if (obj == null) {
                return null;
            }
            IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
            if (iin != null && (iin instanceof ICustomTabsService)) {
                return (ICustomTabsService) iin;
            }
            return new Proxy(obj);
        }

        @Override // android.os.IInterface
        public IBinder asBinder() {
            return this;
        }

        @Override // android.os.Binder
        public boolean onTransact(int i, Parcel parcel, Parcel parcel2, int i2) throws RemoteException {
            Uri uri;
            Bundle bundle;
            Bundle bundle2;
            Bundle bundle3;
            Uri uri2;
            Bundle bundle4;
            Uri uri3;
            Bundle bundle5;
            Bundle bundle6;
            Uri uri4;
            Bundle bundle7;
            Uri uri5;
            Bundle bundle8;
            switch (i) {
                case 2:
                    parcel.enforceInterface(DESCRIPTOR);
                    boolean zWarmup = warmup(parcel.readLong());
                    parcel2.writeNoException();
                    parcel2.writeInt(zWarmup ? 1 : 0);
                    return true;
                case 3:
                    parcel.enforceInterface(DESCRIPTOR);
                    boolean zNewSession = newSession(ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder()));
                    parcel2.writeNoException();
                    parcel2.writeInt(zNewSession ? 1 : 0);
                    return true;
                case 4:
                    parcel.enforceInterface(DESCRIPTOR);
                    ICustomTabsCallback iCustomTabsCallbackAsInterface = ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder());
                    if (parcel.readInt() != 0) {
                        uri = (Uri) Uri.CREATOR.createFromParcel(parcel);
                    } else {
                        uri = null;
                    }
                    if (parcel.readInt() != 0) {
                        bundle = (Bundle) Bundle.CREATOR.createFromParcel(parcel);
                    } else {
                        bundle = null;
                    }
                    boolean zMayLaunchUrl = mayLaunchUrl(iCustomTabsCallbackAsInterface, uri, bundle, parcel.createTypedArrayList(Bundle.CREATOR));
                    parcel2.writeNoException();
                    parcel2.writeInt(zMayLaunchUrl ? 1 : 0);
                    return true;
                case 5:
                    parcel.enforceInterface(DESCRIPTOR);
                    String string = parcel.readString();
                    if (parcel.readInt() != 0) {
                        bundle2 = (Bundle) Bundle.CREATOR.createFromParcel(parcel);
                    } else {
                        bundle2 = null;
                    }
                    Bundle bundleExtraCommand = extraCommand(string, bundle2);
                    parcel2.writeNoException();
                    if (bundleExtraCommand != null) {
                        parcel2.writeInt(1);
                        bundleExtraCommand.writeToParcel(parcel2, 1);
                    } else {
                        parcel2.writeInt(0);
                    }
                    return true;
                case 6:
                    parcel.enforceInterface(DESCRIPTOR);
                    ICustomTabsCallback iCustomTabsCallbackAsInterface2 = ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder());
                    if (parcel.readInt() != 0) {
                        bundle3 = (Bundle) Bundle.CREATOR.createFromParcel(parcel);
                    } else {
                        bundle3 = null;
                    }
                    boolean zUpdateVisuals = updateVisuals(iCustomTabsCallbackAsInterface2, bundle3);
                    parcel2.writeNoException();
                    parcel2.writeInt(zUpdateVisuals ? 1 : 0);
                    return true;
                case 7:
                    parcel.enforceInterface(DESCRIPTOR);
                    ICustomTabsCallback iCustomTabsCallbackAsInterface3 = ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder());
                    if (parcel.readInt() != 0) {
                        uri2 = (Uri) Uri.CREATOR.createFromParcel(parcel);
                    } else {
                        uri2 = null;
                    }
                    boolean zRequestPostMessageChannel = requestPostMessageChannel(iCustomTabsCallbackAsInterface3, uri2);
                    parcel2.writeNoException();
                    parcel2.writeInt(zRequestPostMessageChannel ? 1 : 0);
                    return true;
                case 8:
                    parcel.enforceInterface(DESCRIPTOR);
                    ICustomTabsCallback iCustomTabsCallbackAsInterface4 = ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder());
                    String string2 = parcel.readString();
                    if (parcel.readInt() != 0) {
                        bundle4 = (Bundle) Bundle.CREATOR.createFromParcel(parcel);
                    } else {
                        bundle4 = null;
                    }
                    int iPostMessage = postMessage(iCustomTabsCallbackAsInterface4, string2, bundle4);
                    parcel2.writeNoException();
                    parcel2.writeInt(iPostMessage);
                    return true;
                case 9:
                    parcel.enforceInterface(DESCRIPTOR);
                    ICustomTabsCallback iCustomTabsCallbackAsInterface5 = ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder());
                    int i3 = parcel.readInt();
                    if (parcel.readInt() != 0) {
                        uri3 = (Uri) Uri.CREATOR.createFromParcel(parcel);
                    } else {
                        uri3 = null;
                    }
                    if (parcel.readInt() != 0) {
                        bundle5 = (Bundle) Bundle.CREATOR.createFromParcel(parcel);
                    } else {
                        bundle5 = null;
                    }
                    boolean zValidateRelationship = validateRelationship(iCustomTabsCallbackAsInterface5, i3, uri3, bundle5);
                    parcel2.writeNoException();
                    parcel2.writeInt(zValidateRelationship ? 1 : 0);
                    return true;
                case 10:
                    parcel.enforceInterface(DESCRIPTOR);
                    ICustomTabsCallback iCustomTabsCallbackAsInterface6 = ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder());
                    if (parcel.readInt() != 0) {
                        bundle6 = (Bundle) Bundle.CREATOR.createFromParcel(parcel);
                    } else {
                        bundle6 = null;
                    }
                    boolean zNewSessionWithExtras = newSessionWithExtras(iCustomTabsCallbackAsInterface6, bundle6);
                    parcel2.writeNoException();
                    parcel2.writeInt(zNewSessionWithExtras ? 1 : 0);
                    return true;
                case 11:
                    parcel.enforceInterface(DESCRIPTOR);
                    ICustomTabsCallback iCustomTabsCallbackAsInterface7 = ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder());
                    if (parcel.readInt() != 0) {
                        uri4 = (Uri) Uri.CREATOR.createFromParcel(parcel);
                    } else {
                        uri4 = null;
                    }
                    if (parcel.readInt() != 0) {
                        bundle7 = (Bundle) Bundle.CREATOR.createFromParcel(parcel);
                    } else {
                        bundle7 = null;
                    }
                    boolean zRequestPostMessageChannelWithExtras = requestPostMessageChannelWithExtras(iCustomTabsCallbackAsInterface7, uri4, bundle7);
                    parcel2.writeNoException();
                    parcel2.writeInt(zRequestPostMessageChannelWithExtras ? 1 : 0);
                    return true;
                case 12:
                    parcel.enforceInterface(DESCRIPTOR);
                    ICustomTabsCallback iCustomTabsCallbackAsInterface8 = ICustomTabsCallback.Stub.asInterface(parcel.readStrongBinder());
                    if (parcel.readInt() != 0) {
                        uri5 = (Uri) Uri.CREATOR.createFromParcel(parcel);
                    } else {
                        uri5 = null;
                    }
                    int i4 = parcel.readInt();
                    if (parcel.readInt() != 0) {
                        bundle8 = (Bundle) Bundle.CREATOR.createFromParcel(parcel);
                    } else {
                        bundle8 = null;
                    }
                    boolean zReceiveFile = receiveFile(iCustomTabsCallbackAsInterface8, uri5, i4, bundle8);
                    parcel2.writeNoException();
                    parcel2.writeInt(zReceiveFile ? 1 : 0);
                    return true;
                case 1598968902:
                    parcel2.writeString(DESCRIPTOR);
                    return true;
                default:
                    return super.onTransact(i, parcel, parcel2, i2);
            }
        }

        private static class Proxy implements ICustomTabsService {
            public static ICustomTabsService sDefaultImpl;
            private IBinder mRemote;

            Proxy(IBinder remote) {
                this.mRemote = remote;
            }

            @Override // android.os.IInterface
            public IBinder asBinder() {
                return this.mRemote;
            }

            public String getInterfaceDescriptor() {
                return Stub.DESCRIPTOR;
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean warmup(long flags) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeLong(flags);
                    boolean _status = this.mRemote.transact(2, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().warmup(flags);
                    }
                    _reply.readException();
                    boolean _status2 = _reply.readInt() != 0;
                    return _status2;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean newSession(ICustomTabsCallback callback) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    boolean _status = this.mRemote.transact(3, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().newSession(callback);
                    }
                    _reply.readException();
                    boolean _status2 = _reply.readInt() != 0;
                    return _status2;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean newSessionWithExtras(ICustomTabsCallback callback, Bundle extras) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    if (extras != null) {
                        _data.writeInt(1);
                        extras.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = this.mRemote.transact(10, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().newSessionWithExtras(callback, extras);
                    }
                    _reply.readException();
                    boolean _result = _reply.readInt() != 0;
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean mayLaunchUrl(ICustomTabsCallback callback, Uri url, Bundle extras, List<Bundle> otherLikelyBundles) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    if (url != null) {
                        _data.writeInt(1);
                        url.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    if (extras != null) {
                        _data.writeInt(1);
                        extras.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    _data.writeTypedList(otherLikelyBundles);
                    boolean _status = this.mRemote.transact(4, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().mayLaunchUrl(callback, url, extras, otherLikelyBundles);
                    }
                    _reply.readException();
                    boolean _result = _reply.readInt() != 0;
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public Bundle extraCommand(String commandName, Bundle args) throws RemoteException {
                Bundle _result;
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeString(commandName);
                    if (args != null) {
                        _data.writeInt(1);
                        args.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = this.mRemote.transact(5, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().extraCommand(commandName, args);
                    }
                    _reply.readException();
                    if (_reply.readInt() != 0) {
                        _result = (Bundle) Bundle.CREATOR.createFromParcel(_reply);
                    } else {
                        _result = null;
                    }
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean updateVisuals(ICustomTabsCallback callback, Bundle bundle) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    if (bundle != null) {
                        _data.writeInt(1);
                        bundle.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = this.mRemote.transact(6, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().updateVisuals(callback, bundle);
                    }
                    _reply.readException();
                    boolean _result = _reply.readInt() != 0;
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean requestPostMessageChannel(ICustomTabsCallback callback, Uri postMessageOrigin) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    if (postMessageOrigin != null) {
                        _data.writeInt(1);
                        postMessageOrigin.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = this.mRemote.transact(7, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().requestPostMessageChannel(callback, postMessageOrigin);
                    }
                    _reply.readException();
                    boolean _result = _reply.readInt() != 0;
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean requestPostMessageChannelWithExtras(ICustomTabsCallback callback, Uri postMessageOrigin, Bundle extras) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    if (postMessageOrigin != null) {
                        _data.writeInt(1);
                        postMessageOrigin.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    if (extras != null) {
                        _data.writeInt(1);
                        extras.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = this.mRemote.transact(11, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().requestPostMessageChannelWithExtras(callback, postMessageOrigin, extras);
                    }
                    _reply.readException();
                    boolean _result = _reply.readInt() != 0;
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public int postMessage(ICustomTabsCallback callback, String message, Bundle extras) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    _data.writeString(message);
                    if (extras != null) {
                        _data.writeInt(1);
                        extras.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = this.mRemote.transact(8, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().postMessage(callback, message, extras);
                    }
                    _reply.readException();
                    int _result = _reply.readInt();
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean validateRelationship(ICustomTabsCallback callback, int relation, Uri origin, Bundle extras) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    _data.writeInt(relation);
                    if (origin != null) {
                        _data.writeInt(1);
                        origin.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    if (extras != null) {
                        _data.writeInt(1);
                        extras.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = this.mRemote.transact(9, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().validateRelationship(callback, relation, origin, extras);
                    }
                    _reply.readException();
                    boolean _result = _reply.readInt() != 0;
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }

            @Override // android.support.customtabs.ICustomTabsService
            public boolean receiveFile(ICustomTabsCallback callback, Uri uri, int purpose, Bundle extras) throws RemoteException {
                Parcel _data = Parcel.obtain();
                Parcel _reply = Parcel.obtain();
                try {
                    _data.writeInterfaceToken(Stub.DESCRIPTOR);
                    _data.writeStrongBinder(callback != null ? callback.asBinder() : null);
                    if (uri != null) {
                        _data.writeInt(1);
                        uri.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    _data.writeInt(purpose);
                    if (extras != null) {
                        _data.writeInt(1);
                        extras.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    boolean _status = this.mRemote.transact(12, _data, _reply, 0);
                    if (!_status && Stub.getDefaultImpl() != null) {
                        return Stub.getDefaultImpl().receiveFile(callback, uri, purpose, extras);
                    }
                    _reply.readException();
                    boolean _result = _reply.readInt() != 0;
                    return _result;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
            }
        }

        public static boolean setDefaultImpl(ICustomTabsService impl) {
            if (Proxy.sDefaultImpl != null) {
                throw new IllegalStateException("setDefaultImpl() called twice");
            }
            if (impl != null) {
                Proxy.sDefaultImpl = impl;
                return true;
            }
            return false;
        }

        public static ICustomTabsService getDefaultImpl() {
            return Proxy.sDefaultImpl;
        }
    }
}
