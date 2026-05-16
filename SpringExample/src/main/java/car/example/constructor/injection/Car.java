package car.example.constructor.injection;

public class Car {
    private Specification specification;

    public void displayDetails(){
        System.out.printf("Car Details " + specification.toString());
    }

    public Car(Specification specification) {
        this.specification = specification;
    }
}
