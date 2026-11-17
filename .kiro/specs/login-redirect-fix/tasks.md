# Implementation Plan

## Overview

This document outlines the implementation tasks for fixing the login redirect bug. The tasks follow the bug condition methodology with property-based testing to ensure the fix resolves the timing issue while preserving existing authentication behavior.

## Tasks

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Role-Based Dashboard Redirect After Login
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test implementation:
    - Simulate login success for each role (ADMIN, TEACHER, STUDENT, PARENT)
    - Assert that navigation reaches the correct role-specific dashboard
    - Assert that auth state is fully populated with user data before navigation completes
    - Verify RoleBasedRedirect has access to user.role when evaluating redirect logic
  - Test assertions should match Expected Behavior from design:
    - ADMIN login → navigation target = "/admin/dashboard"
    - TEACHER login → navigation target = "/teacher/dashboard"
    - STUDENT login → navigation target = "/student/dashboard"
    - PARENT login → navigation target = "/parent/dashboard"
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (navigation reaches "/" instead of role-specific dashboard, or auth state not populated)
  - Document counterexamples found (e.g., "Admin login navigates to '/' instead of '/admin/dashboard'")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Login Auth Flows Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (cases where isBugCondition returns false):
    - Observe: Failed login with invalid credentials displays error and stays on login page
    - Observe: Logout clears auth state and redirects to "/login"
    - Observe: Already authenticated user visiting "/login" redirects to "/"
    - Observe: Unauthenticated user accessing protected route redirects to "/login"
  - Write property-based tests capturing observed behavior patterns:
    - FOR ALL authentication failures, error message displayed AND no navigation away from login page
    - FOR ALL logout events, auth state cleared AND navigation to "/login"
    - FOR ALL authenticated visits to "/login", redirect to "/" occurs
    - FOR ALL unauthenticated protected route access, redirect to "/login" occurs
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Fix for login redirect timing issue

  - [ ] 3.1 Implement the fix
    - Move navigation to useEffect that watches authentication state
    - Ensure navigation only triggers after user data and role are populated in auth state
    - Implement direct role-based navigation from login success handler instead of relying on RoleBasedRedirect
    - Alternative: Add loading/suspense state in RoleBasedRedirect to wait for auth state stabilization
    - Ensure auth state update completes before triggering navigation
    - _Bug_Condition: isBugCondition(input) where input.loginSucceeded = true AND authStateUpdated(input.user) = false AND navigationTriggered(input) = true_
    - _Expected_Behavior: Navigation to role-specific dashboard based on user.role (ADMIN→/admin/dashboard, TEACHER→/teacher/dashboard, STUDENT→/student/dashboard, PARENT→/parent/dashboard)_
    - _Preservation: All non-login auth flows (authentication failure, logout, session expiration, token refresh, protected route access) remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Role-Based Dashboard Redirect After Login
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Re-run bug condition exploration test from step 1
    - Verify navigation reaches correct role-specific dashboard for all roles
    - Verify auth state is populated before navigation completes
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Login Auth Flows Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Re-run preservation property tests from step 2
    - Verify all non-login auth flows still behave correctly
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Property 1 tests the Bug Condition (exploration) and validates the fix (expected behavior)
- Property 2 tests Preservation Requirements to ensure no regressions
- All tests should be run on UNFIXED code first to establish baseline behavior
- Exploration tests are expected to FAIL on unfixed code - this confirms the bug exists
- Preservation tests are expected to PASS on unfixed code - this establishes baseline behavior
- After the fix, exploration tests should PASS and preservation tests should still PASS
