package com.railtrack.exception;

public class NoRouteException extends RuntimeException {

    public NoRouteException(String message) {
        super(message);
    }
}
