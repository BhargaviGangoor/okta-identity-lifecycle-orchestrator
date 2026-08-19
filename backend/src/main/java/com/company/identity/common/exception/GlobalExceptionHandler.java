package com.company.identity.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Centralised exception handler for the Identity Orchestrator API.
 *
 * Handles:
 *   - MethodArgumentNotValidException  → 400 with per-field validation messages
 *     (e.g. userId blank, action null after coercion)
 *
 *   - HttpMessageNotReadableException  → 400 with a descriptive message
 *     (e.g. unknown action enum value like "ENABLE" or "disable")
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles @Valid annotation failures (e.g. @NotBlank, @NotNull violations).
     * Returns a map of fieldName → errorMessage pairs for easy frontend consumption.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("status", 400);
        body.put("error", "Validation Failed");
        body.put("fieldErrors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Handles JSON deserialization failures — most commonly caused by an invalid
     * enum value for the 'action' field (e.g. "ENABLE", "disable", "activate_user").
     * Valid values are: ACTIVATE, SUSPEND, UNSUSPEND, DEACTIVATE.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableMessage(
            HttpMessageNotReadableException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("status", 400);
        body.put("error", "Invalid Request Body");
        body.put("message",
                "Could not parse request. If specifying 'action', use one of: " +
                "ACTIVATE, SUSPEND, UNSUSPEND, DEACTIVATE");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
