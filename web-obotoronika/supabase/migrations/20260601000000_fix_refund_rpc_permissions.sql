-- ========================================================
-- Fix: Refund RPC functions need SECURITY DEFINER
-- Issue: Functions query auth.users via user_profiles view
--        but run with SECURITY INVOKER (caller permissions).
--        service_role cannot SELECT from auth schema.
-- Fix:   ALTER to SECURITY DEFINER so they run with
--        the function owner's (superuser) permissions.
-- ========================================================

-- get_refund_details: joins user_profiles + auth.users
ALTER FUNCTION get_refund_details(BIGINT) SECURITY DEFINER;

-- get_refunds_list: joins user_profiles
ALTER FUNCTION get_refunds_list(TEXT, TEXT, INTEGER, INTEGER) SECURITY DEFINER;

-- get_refunds_count: joins user_profiles
ALTER FUNCTION get_refunds_count(TEXT, TEXT) SECURITY DEFINER;

-- ========================================================
-- Security: Revoke EXECUTE from anon for admin RPCs
-- These are admin-only functions; the API layer already
-- checks roles before calling them via supabaseAdmin.
-- Allowing anon to call SECURITY DEFINER functions is
-- unnecessary risk.
-- ========================================================
REVOKE EXECUTE ON FUNCTION get_refund_details FROM anon;
REVOKE EXECUTE ON FUNCTION get_refunds_list FROM anon;
REVOKE EXECUTE ON FUNCTION get_refunds_count FROM anon;
