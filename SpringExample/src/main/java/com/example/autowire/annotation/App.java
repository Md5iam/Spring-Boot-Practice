package com.example.autowire.annotation;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class App {
    static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
//        Employee emp = (Employee) context.getBean("employee");
//        System.out.println(emp.toString());
//
//        Manager manager = (Manager) context.getBean("manager");
//        System.out.println(manager.toString());

        Test test = (Test) context.getBean("test");
        System.out.println(test.toString());
    }
}
