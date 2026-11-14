package com.railtrack.exception;

public class InvalidIncidentTransitionException extends RuntimeException {

    public InvalidIncidentTransitionException(String message) {
        super(message);
    }
}
