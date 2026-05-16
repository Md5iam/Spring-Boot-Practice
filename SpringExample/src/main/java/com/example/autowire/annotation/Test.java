package com.example.autowire.annotation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Test {
    private Manager manager;
    private Employee employee;


    // only allow one @Autowired not multiple in each class
    @Autowired
    public Test(Manager manager, Employee employee) {
        this.manager = manager;
        this.employee = employee;
    }

    @Override
    public String toString() {
        return "Test{" +
                "manager=" + manager +
                ", employee=" + employee +
                '}';
    }
}
