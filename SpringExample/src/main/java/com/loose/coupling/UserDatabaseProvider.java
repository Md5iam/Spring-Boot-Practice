package com.loose.coupling;

public class UserDatabaseProvider implements UserDataProvider{
    @Override
    public String getUserDetails() {
        return "This is from UserDatabaseProvider class";
    }
}
