package com.company.identity.workstream1;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.Collections;
import java.util.Map;

/**
 * Test utility to manipulate environment variables using reflection.
 * This allows tests to control System.getenv() without external dependencies.
 * Handles Java 9+ modules and different JDK implementations.
 */
public class EnvironmentVariableHelper {

    /**
     * Set an environment variable for testing purposes using reflection.
     * Works on Linux, macOS, and Windows by manipulating the underlying ProcessEnvironment map.
     */
    @SuppressWarnings("unchecked")
    public static void setEnvironmentVariable(String key, String value) throws Exception {
        try {
            // Try to access ProcessEnvironment.theEnvironment directly
            // This is the most reliable approach across Java versions
            Class<?> processEnvironmentClass = Class.forName("java.lang.ProcessEnvironment");
            Field theEnvironmentField = processEnvironmentClass.getDeclaredField("theEnvironment");
            theEnvironmentField.setAccessible(true);
            
            // Remove final modifier if present (for Java 9+)
            removeFieldFinalModifier(theEnvironmentField);
            
            Map<String, String> env = (Map<String, String>) theEnvironmentField.get(null);
            if (env != null) {
                env.put(key, value);
                return;
            }
        } catch (Exception e) {
            // Fall through to alternative approach
        }

        try {
            // Alternative: try theUnmodifiableEnvironment
            Class<?> processEnvironmentClass = Class.forName("java.lang.ProcessEnvironment");
            Field theUnmodifiableEnvironmentField = processEnvironmentClass.getDeclaredField("theUnmodifiableEnvironment");
            theUnmodifiableEnvironmentField.setAccessible(true);
            removeFieldFinalModifier(theUnmodifiableEnvironmentField);
            
            Object unmodifiableEnv = theUnmodifiableEnvironmentField.get(null);
            if (unmodifiableEnv != null) {
                // Get the wrapped map from the Collections.UnmodifiableMap
                Field mapField = null;
                try {
                    mapField = unmodifiableEnv.getClass().getDeclaredField("m");
                } catch (NoSuchFieldException e) {
                    mapField = Collections.unmodifiableMap(Collections.emptyMap()).getClass().getDeclaredField("m");
                }
                mapField.setAccessible(true);
                removeFieldFinalModifier(mapField);
                Map<String, String> map = (Map<String, String>) mapField.get(unmodifiableEnv);
                if (map != null) {
                    map.put(key, value);
                    return;
                }
            }
        } catch (Exception e) {
            // Fall through
        }

        throw new RuntimeException("Unable to set environment variable: " + key + ". No accessible ProcessEnvironment found.");
    }

    /**
     * Remove an environment variable for testing purposes using reflection.
     */
    @SuppressWarnings("unchecked")
    public static void removeEnvironmentVariable(String key) throws Exception {
        try {
            Class<?> processEnvironmentClass = Class.forName("java.lang.ProcessEnvironment");
            Field theEnvironmentField = processEnvironmentClass.getDeclaredField("theEnvironment");
            theEnvironmentField.setAccessible(true);
            removeFieldFinalModifier(theEnvironmentField);
            
            Map<String, String> env = (Map<String, String>) theEnvironmentField.get(null);
            if (env != null) {
                env.remove(key);
                return;
            }
        } catch (Exception e) {
            // Fall through
        }

        try {
            Class<?> processEnvironmentClass = Class.forName("java.lang.ProcessEnvironment");
            Field theUnmodifiableEnvironmentField = processEnvironmentClass.getDeclaredField("theUnmodifiableEnvironment");
            theUnmodifiableEnvironmentField.setAccessible(true);
            removeFieldFinalModifier(theUnmodifiableEnvironmentField);
            
            Object unmodifiableEnv = theUnmodifiableEnvironmentField.get(null);
            if (unmodifiableEnv != null) {
                Field mapField = null;
                try {
                    mapField = unmodifiableEnv.getClass().getDeclaredField("m");
                } catch (NoSuchFieldException e) {
                    mapField = Collections.unmodifiableMap(Collections.emptyMap()).getClass().getDeclaredField("m");
                }
                mapField.setAccessible(true);
                removeFieldFinalModifier(mapField);
                Map<String, String> map = (Map<String, String>) mapField.get(unmodifiableEnv);
                if (map != null) {
                    map.remove(key);
                    return;
                }
            }
        } catch (Exception e) {
            // Fall through
        }

        throw new RuntimeException("Unable to remove environment variable: " + key + ". No accessible ProcessEnvironment found.");
    }

    /**
     * Remove the final modifier from a field to allow reflection-based modification.
     * Required for Java 9+ where fields may be marked as final.
     */
    private static void removeFieldFinalModifier(Field field) throws Exception {
        try {
            Field modifiersField = Field.class.getDeclaredField("modifiers");
            modifiersField.setAccessible(true);
            modifiersField.setInt(field, field.getModifiers() & ~Modifier.FINAL);
        } catch (NoSuchFieldException e) {
            // Java 12+ may not have modifiers field, try direct setAccessible
            field.setAccessible(true);
        }
    }
}
