package org.example.firstspring;

public class HelloResponse {
    private String messege;

    public HelloResponse(String messege) {
        this.messege = messege;
    }

    public String getMessege() {
        return messege;
    }

    public void setMessege(String messege) {
        this.messege = messege;
    }
}
