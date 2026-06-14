package com.rt.printerlibrary.observer;

import java.util.ArrayList;

/* JADX INFO: loaded from: classes11.dex */
public class PrinterObserverManager {
    private static final PrinterObserverManager ourInstance = new PrinterObserverManager();
    private ArrayList<PrinterObserver> observers = new ArrayList<>();

    private PrinterObserverManager() {
    }

    public static PrinterObserverManager getInstance() {
        return ourInstance;
    }

    public void add(PrinterObserver printerObserver) {
        this.observers.add(printerObserver);
    }

    public void clear() {
        this.observers.clear();
    }

    public ArrayList<PrinterObserver> getObservers() {
        return this.observers;
    }

    public void remove(PrinterObserver printerObserver) {
        this.observers.remove(printerObserver);
    }
}
