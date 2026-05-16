package com.ioc.coupling;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class IocCouplingExample {
    static void main(String[] args) {

        ApplicationContext context = new ClassPathXmlApplicationContext("applicationIocCouplingExample.xml");
        // Database 1
//        UserDataProvider userDB = new UserDatabaseProvider();
//        UserManager userManagerDB = new UserManager(userDB);
//        System.out.println(userManagerDB.getUserInfo());
        UserManager userManagerDB = (UserManager) context.getBean("userManagerWithUserDataProvider");
        System.out.println(userManagerDB.getUserInfo());

        // Database 2
//        UserDataProvider userWS = new UserWebServiceProvider();
//        UserManager userManagerWS = new UserManager(userWS);
//        System.out.println(userManagerWS.getUserInfo());
        UserManager userManagerWS = (UserManager) context.getBean("userManagerWithUserWebServiceProvider");
        System.out.println(userManagerWS.getUserInfo());

        // Facility : no need to modify the existable code, once update(add/remove database) needed
        // in bean spring will handle all the object creation, no need to make them manually once
        // we assign them in resorces dir .xml file
    }
}
