package com.rt.printerlibrary.cmd;

import com.rt.printerlibrary.factory.cmd.CmdFactory;

/* JADX INFO: loaded from: classes11.dex */
public class ZplFactory extends CmdFactory {
    @Override // com.rt.printerlibrary.factory.cmd.CmdFactory
    public ZplCmd create() {
        return new ZplCmd();
    }
}
