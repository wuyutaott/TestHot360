export class Global {
    private static _ins: Global;
    public static get Ins(): Global {
        if (!Global._ins)
            Global._ins = new Global;
        return Global._ins;
    }

    ChangeLog = null;
}

