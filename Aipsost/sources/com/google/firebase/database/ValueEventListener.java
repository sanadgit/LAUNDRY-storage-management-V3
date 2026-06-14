package com.google.firebase.database;

/* JADX INFO: loaded from: classes11.dex */
public interface ValueEventListener {
    void onCancelled(DatabaseError databaseError);

    void onDataChange(DataSnapshot dataSnapshot);
}
