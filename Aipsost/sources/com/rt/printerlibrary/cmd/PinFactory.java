package com.rt.printerlibrary.cmd;

import com.rt.printerlibrary.factory.cmd.CmdFactory;

/* JADX INFO: loaded from: classes11.dex */
public class PinFactory extends CmdFactory {
    @Override // com.rt.printerlibrary.factory.cmd.CmdFactory
    public PinCmd create() {
        return new PinCmd();
    }
}
