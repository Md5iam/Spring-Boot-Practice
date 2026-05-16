package car.example.setter.injection;

public class Car {
    private Specification specification;

    public void setSpecification(Specification specification) {
        this.specification = specification;
    }

    public void displayDetails(){
        System.out.printf("Car Details " + specification.toString());
    }

}
