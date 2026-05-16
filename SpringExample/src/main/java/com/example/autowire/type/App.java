package com.example.autowire.type;


import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class App {
    static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("autoWireByType.xml");
        Car car = (Car) context.getBean("myCar");

        car.displayDetails();
    }
}
