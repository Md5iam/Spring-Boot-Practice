package com.loose.coupling;

public class UserWebServiceProvider implements UserDataProvider{
    @Override
    public String getUserDetails() {
        return "This is from UserWebServiceProvider class ";
    }
}
