-- Migration: Add SUP role + kpi_type to user_profiles + SA metric keys to kpi_targets
-- Run this in Supabase SQL Editor

-- 1. Update role check constraint to allow 'sup'
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('sa', 'sup', 'ccc', 'admin'));

-- 2. Add kpi_type column to user_profiles (default 'sa' for all existing SA users)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS kpi_type TEXT DEFAULT 'sa'
  CHECK (kpi_type IN ('sa', 'sup'));

-- 3. Set kpi_type for existing users based on role
UPDATE public.user_profiles SET kpi_type = 'sup' WHERE role = 'sup' AND kpi_type IS NULL;
UPDATE public.user_profiles SET kpi_type = 'sa'  WHERE role = 'sa'  AND kpi_type IS NULL;

-- 4. Drop existing metric check constraint on kpi_targets and recreate with SA keys
ALTER TABLE public.kpi_targets DROP CONSTRAINT IF EXISTS kpi_targets_metric_check;

ALTER TABLE public.kpi_targets
  ADD CONSTRAINT kpi_targets_metric_check CHECK (metric IN (
    -- Part A SUP
    'a1_sop', 'a1_nvqltk', 'a1_nvkd', 'a1_admin', 'a1_other',
    'a2_project', 'a2_improve',
    'a3_compliance', 'a3_teamwork',
    'a4_knowledge', 'a4_share',
    -- Part A SA (new)
    'a1_mo_tk', 'a1_lenh_gd', 'a1_luu_ky', 'a1_gd_tien', 'a1_ky_quy',
    'a2_test',
    'a3_event',
    'a4_cert',
    -- Part B (shared)
    'call_count', 'contact_success_rate',
    'icp_grouping_rate', 'icp_data_quality',
    'reactivation_count', 'ltv_fee', 'referral_rate',
    'support_count', 'new_product_count', 'group_conversion_rate'
  ));
