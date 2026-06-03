package org.example.seuoj.payload.User;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long userId;
    private String userName;
    private String email;
    private Integer rating;
    private Integer solvedCount;
    private Boolean isBanned;
    private LocalDateTime joinedDate;
}
