package org.example.securitydemo.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    // Getting jwd from header
    private static final Logger logger= LoggerFactory.getLogger(JwtUtils.class);
    public String getJwtFromHeader (HttpServletRequest request){
        String bearerToken =  request.getHeader("Authorization");
        logger.debug("Authorization Header: {}", bearerToken);
        if ( bearerToken != null && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }
        return null;
    }
    // Generating jwt token form username
    @Value("${spring.app.jwtExpirationMS}")
    private int jwtExpirationMs;
    public String generateTokenFromUsername(UserDetails userDetails){
        String username = userDetails.getUsername();
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date( new Date().getTime() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }
    // Generating username form jwt token
    public String getUserNameFromJWTToken(String token){
        return Jwts.parser()
                .verifyWith((SecretKey) key())
                .build().parseSignedClaims(token)
                .getPayload().getSubject();
    }
    // Generating signing key
    @Value("${spring.app.jwtSecret}")
    private String jwtSecret;
    public Key key(){
        return Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(jwtSecret)
        );
    }
    // Validate jwt token
    public boolean validateJwtToken(String authToken){
        try{
            System.out.println("Validate");
            Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(authToken);
            return true;
        }catch (MalformedJwtException e ){
            logger.error("Invalid JWT token: {}", e.getMessage());
        }catch (ExpiredJwtException e ){
            logger.error("Jwt Token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Jwt Token is unsupported: {}", e.getMessage());
        }catch (IllegalArgumentException e ){
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
