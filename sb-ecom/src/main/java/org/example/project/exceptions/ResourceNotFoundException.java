package org.example.project.exceptions;

public class ResourceNotFoundException extends RuntimeException{
    String resourcesName;
    String field;
    String fieldName;
    Long fieldId;

    public ResourceNotFoundException(String resourcesName, String field, String fieldName) {
        super(String.format("%s not found with %s: %s", resourcesName, field, fieldName));
        this.resourcesName = resourcesName;
        this.field = field;
        this.fieldName = fieldName;
    }

    public ResourceNotFoundException(String resourcesName, String field, Long fieldId) {
        super(String.format("%s not found with %s: %d", resourcesName, field, fieldId));
        this.resourcesName = resourcesName;
        this.field = field;
        this.fieldId = fieldId;
    }
}
