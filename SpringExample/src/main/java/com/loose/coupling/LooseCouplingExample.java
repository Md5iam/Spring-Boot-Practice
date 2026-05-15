package com.loose.coupling;

public class LooseCouplingExample {
    static void main(String[] args) {

        // Database 1
        UserDataProvider userDB = new UserDatabaseProvider();
        UserManager userManagerDB = new UserManager(userDB);
        System.out.println(userManagerDB.getUserInfo());

        // Database 2
        UserDataProvider userWS = new UserWebServiceProvider();
        UserManager userManagerWS = new UserManager(userWS);
        System.out.println(userManagerWS.getUserInfo());

        // Facility : no need to modify the existable code, once update(add/remove database) needed
    }
}
