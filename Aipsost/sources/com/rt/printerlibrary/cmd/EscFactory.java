package com.rt.printerlibrary.cmd;

import com.rt.printerlibrary.factory.cmd.CmdFactory;

/* JADX INFO: loaded from: classes11.dex */
public class EscFactory extends CmdFactory {
    @Override // com.rt.printerlibrary.factory.cmd.CmdFactory
    public EscCmd create() {
        return new EscCmd();
    }
}
