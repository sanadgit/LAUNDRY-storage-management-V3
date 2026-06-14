package com.rt.printerlibrary.cmd;

import com.rt.printerlibrary.factory.cmd.CmdFactory;

/* JADX INFO: loaded from: classes11.dex */
public class TscFactory extends CmdFactory {
    @Override // com.rt.printerlibrary.factory.cmd.CmdFactory
    public TscCmd create() {
        return new TscCmd();
    }
}
