package org.example.project.security.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.example.project.model.Role;

import java.util.Set;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min =3, max = 20)
    private String username;
    @NotBlank
    @Size(max = 20)
    @Email
    private String email;
    @NotBlank
    @Size(min =6, max = 20)
    private String password;

    private Set<String > role;
}
