package com.company.identity.common.dto;
public class ApiResponse<T> {
    public boolean success;
    public T data;
    public String message;
}