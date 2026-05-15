package com.tight.coupling;

public class UserManager {

    UserDatabase userDB = new UserDatabase();

    public String getUserInfo(){
        return userDB.getUserDetails();
    }
}
