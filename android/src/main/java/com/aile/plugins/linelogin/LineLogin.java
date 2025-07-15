package com.aile.plugins.linelogin;

import com.getcapacitor.Logger;

public class LineLogin {

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }
}
