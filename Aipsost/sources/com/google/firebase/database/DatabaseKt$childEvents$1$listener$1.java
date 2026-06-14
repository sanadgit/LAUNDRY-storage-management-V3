package com.google.firebase.database;

import androidx.constraintlayout.widget.ConstraintLayout;
import com.google.firebase.database.ChildEvent;
import com.google.firebase.database.core.Repo;
import com.google.firebase.messaging.Constants;
import kotlin.Metadata;
import kotlin.jvm.internal.Intrinsics;
import kotlinx.coroutines.CoroutineScopeKt;
import kotlinx.coroutines.channels.ChannelsKt;
import kotlinx.coroutines.channels.ProducerScope;

/* JADX INFO: compiled from: Database.kt */
/* JADX INFO: loaded from: classes11.dex */
@Metadata(d1 = {"\u0000'\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0004*\u0001\u0000\b\n\u0018\u00002\u00020\u0001J\u0010\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H\u0016J\u001a\u0010\u0006\u001a\u00020\u00032\u0006\u0010\u0007\u001a\u00020\b2\b\u0010\t\u001a\u0004\u0018\u00010\nH\u0016J\u001a\u0010\u000b\u001a\u00020\u00032\u0006\u0010\u0007\u001a\u00020\b2\b\u0010\t\u001a\u0004\u0018\u00010\nH\u0016J\u001a\u0010\f\u001a\u00020\u00032\u0006\u0010\u0007\u001a\u00020\b2\b\u0010\t\u001a\u0004\u0018\u00010\nH\u0016J\u0010\u0010\r\u001a\u00020\u00032\u0006\u0010\u0007\u001a\u00020\bH\u0016¨\u0006\u000e"}, d2 = {"com/google/firebase/database/DatabaseKt$childEvents$1$listener$1", "Lcom/google/firebase/database/ChildEventListener;", "onCancelled", "", Constants.IPC_BUNDLE_KEY_SEND_ERROR, "Lcom/google/firebase/database/DatabaseError;", "onChildAdded", "snapshot", "Lcom/google/firebase/database/DataSnapshot;", "previousChildName", "", "onChildChanged", "onChildMoved", "onChildRemoved", "com.google.firebase-firebase-database"}, k = 1, mv = {1, 8, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE)
public final class DatabaseKt$childEvents$1$listener$1 implements ChildEventListener {
    final /* synthetic */ ProducerScope<ChildEvent> $$this$callbackFlow;
    final /* synthetic */ Query $this_childEvents;

    /* JADX WARN: Multi-variable type inference failed */
    DatabaseKt$childEvents$1$listener$1(Query $receiver, ProducerScope<? super ChildEvent> producerScope) {
        this.$this_childEvents = $receiver;
        this.$$this$callbackFlow = producerScope;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onChildAdded$lambda$0(ProducerScope $this$callbackFlow, DataSnapshot snapshot, String $previousChildName) {
        Intrinsics.checkNotNullParameter($this$callbackFlow, "$$this$callbackFlow");
        Intrinsics.checkNotNullParameter(snapshot, "$snapshot");
        ChannelsKt.trySendBlocking($this$callbackFlow, new ChildEvent.Added(snapshot, $previousChildName));
    }

    @Override // com.google.firebase.database.ChildEventListener
    public void onChildAdded(final DataSnapshot snapshot, final String previousChildName) {
        Intrinsics.checkNotNullParameter(snapshot, "snapshot");
        Repo repo = this.$this_childEvents.repo;
        final ProducerScope<ChildEvent> producerScope = this.$$this$callbackFlow;
        repo.scheduleNow(new Runnable() { // from class: com.google.firebase.database.DatabaseKt$childEvents$1$listener$1$$ExternalSyntheticLambda0
            @Override // java.lang.Runnable
            public final void run() {
                DatabaseKt$childEvents$1$listener$1.onChildAdded$lambda$0(producerScope, snapshot, previousChildName);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onChildChanged$lambda$1(ProducerScope $this$callbackFlow, DataSnapshot snapshot, String $previousChildName) {
        Intrinsics.checkNotNullParameter($this$callbackFlow, "$$this$callbackFlow");
        Intrinsics.checkNotNullParameter(snapshot, "$snapshot");
        ChannelsKt.trySendBlocking($this$callbackFlow, new ChildEvent.Changed(snapshot, $previousChildName));
    }

    @Override // com.google.firebase.database.ChildEventListener
    public void onChildChanged(final DataSnapshot snapshot, final String previousChildName) {
        Intrinsics.checkNotNullParameter(snapshot, "snapshot");
        Repo repo = this.$this_childEvents.repo;
        final ProducerScope<ChildEvent> producerScope = this.$$this$callbackFlow;
        repo.scheduleNow(new Runnable() { // from class: com.google.firebase.database.DatabaseKt$childEvents$1$listener$1$$ExternalSyntheticLambda1
            @Override // java.lang.Runnable
            public final void run() {
                DatabaseKt$childEvents$1$listener$1.onChildChanged$lambda$1(producerScope, snapshot, previousChildName);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onChildRemoved$lambda$2(ProducerScope $this$callbackFlow, DataSnapshot snapshot) {
        Intrinsics.checkNotNullParameter($this$callbackFlow, "$$this$callbackFlow");
        Intrinsics.checkNotNullParameter(snapshot, "$snapshot");
        ChannelsKt.trySendBlocking($this$callbackFlow, new ChildEvent.Removed(snapshot));
    }

    @Override // com.google.firebase.database.ChildEventListener
    public void onChildRemoved(final DataSnapshot snapshot) {
        Intrinsics.checkNotNullParameter(snapshot, "snapshot");
        Repo repo = this.$this_childEvents.repo;
        final ProducerScope<ChildEvent> producerScope = this.$$this$callbackFlow;
        repo.scheduleNow(new Runnable() { // from class: com.google.firebase.database.DatabaseKt$childEvents$1$listener$1$$ExternalSyntheticLambda3
            @Override // java.lang.Runnable
            public final void run() {
                DatabaseKt$childEvents$1$listener$1.onChildRemoved$lambda$2(producerScope, snapshot);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static final void onChildMoved$lambda$3(ProducerScope $this$callbackFlow, DataSnapshot snapshot, String $previousChildName) {
        Intrinsics.checkNotNullParameter($this$callbackFlow, "$$this$callbackFlow");
        Intrinsics.checkNotNullParameter(snapshot, "$snapshot");
        ChannelsKt.trySendBlocking($this$callbackFlow, new ChildEvent.Moved(snapshot, $previousChildName));
    }

    @Override // com.google.firebase.database.ChildEventListener
    public void onChildMoved(final DataSnapshot snapshot, final String previousChildName) {
        Intrinsics.checkNotNullParameter(snapshot, "snapshot");
        Repo repo = this.$this_childEvents.repo;
        final ProducerScope<ChildEvent> producerScope = this.$$this$callbackFlow;
        repo.scheduleNow(new Runnable() { // from class: com.google.firebase.database.DatabaseKt$childEvents$1$listener$1$$ExternalSyntheticLambda2
            @Override // java.lang.Runnable
            public final void run() {
                DatabaseKt$childEvents$1$listener$1.onChildMoved$lambda$3(producerScope, snapshot, previousChildName);
            }
        });
    }

    @Override // com.google.firebase.database.ChildEventListener
    public void onCancelled(DatabaseError error) {
        Intrinsics.checkNotNullParameter(error, "error");
        CoroutineScopeKt.cancel(this.$$this$callbackFlow, "Error getting Query childEvent", error.toException());
    }
}
