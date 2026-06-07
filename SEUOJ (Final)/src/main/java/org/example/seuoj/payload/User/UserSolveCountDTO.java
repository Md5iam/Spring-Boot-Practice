package org.example.seuoj.payload.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSolveCountDTO {
    private Long easySolved;
    private Long mediumSolved;
    private Long hardSolved;
}
