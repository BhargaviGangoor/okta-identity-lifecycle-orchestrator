# Database Schema

## users
id, employee_id, okta_user_id, name, email, department, role, status

## policies
id, department, role, required_groups

## audit_logs
id, actor, employee_id, action, old_state, new_state, result, reason, timestamp

## operations
id, request_id, operation, status, created_at, completed_at

## identity_twin
id, employee_id, expected_department, expected_role, expected_groups, expected_status, last_checked

## simulations
id, user_id, action, risk_level, risk_score, status, created_at, approved_by, approved_at

## drift_results
id, user_id, expected_state, actual_state, mismatch, risk_level, status, detected_at
