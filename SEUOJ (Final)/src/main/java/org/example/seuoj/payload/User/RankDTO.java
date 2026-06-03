package org.example.seuoj.payload.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankDTO {
    private Integer rank;
    private String username;
    private Integer rating;
    private Integer solvedCount;
}
