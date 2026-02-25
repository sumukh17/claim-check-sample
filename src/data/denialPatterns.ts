import type { Claim } from '../types';

export interface DenialPattern {
  id: string;
  type: string;
  category: string;
  name: string;
  conditions: Record<string, string>;
  denialProbability: number;
  confidence: number;
  sampleSize: number;
  avgClaimValue: number;
  recommendedAction: string;
  carcCode: string;
}

export interface MatchedPattern extends DenialPattern {
  matchScore: number;
  matchReasons: string[];
}

export const DENIAL_PATTERNS: DenialPattern[] = [
  // ─── PRIOR AUTHORIZATION ──────────────────────────────────
  {
    id: 'PA_001', type: 'prior_auth', category: 'PRIOR_AUTHORIZATION', name: 'MRI No Auth – Highmark',
    conditions: { payer_name: 'Highmark', ins_level: 'primary', '241d_CPT': '70553', '241e_diag': 'G43.909', service_type: 'radiology', prior_auth_status: 'not_obtained', place_of_service: '22' },
    denialProbability: 0.94, confidence: 0.91, sampleSize: 1245, avgClaimValue: 1850,
    recommendedAction: 'Obtain prior authorization before service', carcCode: '197',
  },
  {
    id: 'PA_002', type: 'prior_auth', category: 'PRIOR_AUTHORIZATION', name: 'CT Scan Auth Expired – BCBS',
    conditions: { payer_name: 'BCBS', ins_level: 'primary', '241d_CPT': '74176', '241e_diag': 'R10.9', service_type: 'radiology', prior_auth_status: 'expired', days_past_auth_expiry: '15' },
    denialProbability: 0.89, confidence: 0.88, sampleSize: 892, avgClaimValue: 1200,
    recommendedAction: 'Request retro-authorization or auth extension', carcCode: '197',
  },
  {
    id: 'PA_003', type: 'prior_auth', category: 'PRIOR_AUTHORIZATION', name: 'Surgery Auth CPT Mismatch – Aetna',
    conditions: { payer_name: 'Aetna', ins_level: 'primary', '241d_CPT': '27447', authorized_CPT: '27446', '241e_diag': 'M17.11', service_type: 'surgery', prior_auth_status: 'obtained' },
    denialProbability: 0.87, confidence: 0.85, sampleSize: 567, avgClaimValue: 15200,
    recommendedAction: 'Request auth amendment or appeal with clinical justification', carcCode: '197',
  },
  {
    id: 'PA_004', type: 'prior_auth', category: 'PRIOR_AUTHORIZATION', name: 'DME No Auth – Medicare',
    conditions: { payer_name: 'Medicare', ins_level: 'primary', '241d_CPT': 'E0601', '241e_diag': 'G47.33', service_type: 'DME', prior_auth_status: 'not_obtained', provider_type: 'DME_supplier' },
    denialProbability: 0.92, confidence: 0.90, sampleSize: 2341, avgClaimValue: 1500,
    recommendedAction: 'Complete Medicare prior auth process', carcCode: '197',
  },
  {
    id: 'PA_005', type: 'prior_auth', category: 'PRIOR_AUTHORIZATION', name: 'Infusion Auth DOS Outside Window – UHC',
    conditions: { payer_name: 'UnitedHealthcare', ins_level: 'primary', '241d_CPT': '96413', '241e_diag': 'C50.911', service_type: 'infusion', prior_auth_status: 'obtained', dos_vs_auth_window: 'outside' },
    denialProbability: 0.85, confidence: 0.82, sampleSize: 723, avgClaimValue: 4500,
    recommendedAction: 'Request DOS extension on authorization', carcCode: '197',
  },
  {
    id: 'PA_006', type: 'prior_auth', category: 'PRIOR_AUTHORIZATION', name: 'Genetic Testing No Auth – Cigna',
    conditions: { payer_name: 'Cigna', ins_level: 'primary', '241d_CPT': '81479', '241e_diag': 'Z15.01', service_type: 'laboratory', prior_auth_status: 'not_obtained', test_type: 'genetic' },
    denialProbability: 0.96, confidence: 0.93, sampleSize: 456, avgClaimValue: 3200,
    recommendedAction: 'Obtain genetic testing prior authorization', carcCode: '197',
  },

  // ─── ELIGIBILITY ──────────────────────────────────────────
  {
    id: 'ELIG_001', type: 'eligibility', category: 'ELIGIBILITY', name: 'Coverage Termed 30 Days – Highmark',
    conditions: { payer_name: 'Highmark', ins_level: 'primary', coverage_status: 'terminated', days_since_termination: '30', '241d_CPT': '99213', verification_performed: 'no' },
    denialProbability: 0.98, confidence: 0.96, sampleSize: 3421, avgClaimValue: 185,
    recommendedAction: 'Verify eligibility before service; identify alternate coverage', carcCode: '27',
  },
  {
    id: 'ELIG_002', type: 'eligibility', category: 'ELIGIBILITY', name: 'Invalid Member ID – BCBS',
    conditions: { payer_name: 'BCBS', ins_level: 'primary', member_id_format: 'invalid', '241d_CPT': '99214', id_length: 'incorrect' },
    denialProbability: 0.91, confidence: 0.89, sampleSize: 1876, avgClaimValue: 210,
    recommendedAction: 'Correct member ID format per payer requirements', carcCode: '58',
  },
  {
    id: 'ELIG_003', type: 'eligibility', category: 'ELIGIBILITY', name: 'Group Number Missing – Aetna',
    conditions: { payer_name: 'Aetna', ins_level: 'primary', group_number: 'missing', '241d_CPT': '99215', employer_group: 'large' },
    denialProbability: 0.78, confidence: 0.75, sampleSize: 2134, avgClaimValue: 275,
    recommendedAction: 'Add group number from insurance card', carcCode: 'A1',
  },
  {
    id: 'ELIG_004', type: 'eligibility', category: 'ELIGIBILITY', name: 'Dependent Over Age Limit – UHC',
    conditions: { payer_name: 'UnitedHealthcare', ins_level: 'dependent', patient_age: '27', relationship: 'child', '241d_CPT': '99213', student_status: 'no' },
    denialProbability: 0.95, confidence: 0.93, sampleSize: 567, avgClaimValue: 185,
    recommendedAction: 'Verify dependent eligibility; bill alternate coverage', carcCode: '27',
  },
  {
    id: 'ELIG_005', type: 'eligibility', category: 'ELIGIBILITY', name: 'Retroactive Termination – Medicaid',
    conditions: { payer_name: 'Medicaid', ins_level: 'primary', coverage_status: 'retro_termed', '241d_CPT': '99214', redetermination: 'failed' },
    denialProbability: 0.97, confidence: 0.95, sampleSize: 4532, avgClaimValue: 150,
    recommendedAction: 'Check for Medicaid reinstatement; bill patient or charity', carcCode: '27',
  },

  // ─── CODING ───────────────────────────────────────────────
  {
    id: 'CODE_001', type: 'coding', category: 'CODING', name: 'Dx/CPT Mismatch – Knee MRI',
    conditions: { payer_name: 'ALL', '241d_CPT': '73721', '241e_diag': 'M54.5', body_region_CPT: 'knee', body_region_Dx: 'back', service_type: 'radiology' },
    denialProbability: 0.88, confidence: 0.92, sampleSize: 3456, avgClaimValue: 950,
    recommendedAction: 'Correct diagnosis to support knee imaging', carcCode: '11',
  },
  {
    id: 'CODE_002', type: 'coding', category: 'CODING', name: 'LCD Not Met – Spine Surgery',
    conditions: { payer_name: 'Medicare', ins_level: 'primary', '241d_CPT': '22853', '241e_diag': 'M47.816', lcd_criteria_met: 'no', conservative_treatment_days: '30' },
    denialProbability: 0.91, confidence: 0.89, sampleSize: 892, avgClaimValue: 25000,
    recommendedAction: 'Document 6+ weeks conservative treatment per LCD', carcCode: '50',
  },
  {
    id: 'CODE_003', type: 'coding', category: 'CODING', name: 'Unbundling Edit – Surgery',
    conditions: { payer_name: 'ALL', '241d_CPT': '29881', additional_CPT: '29877', modifier: 'none', cci_edit: 'column1_column2', service_type: 'surgery' },
    denialProbability: 0.85, confidence: 0.88, sampleSize: 1567, avgClaimValue: 2800,
    recommendedAction: 'Remove unbundled code or add modifier 59/XE if appropriate', carcCode: '97',
  },
  {
    id: 'CODE_004', type: 'coding', category: 'CODING', name: 'MUE Exceeded – Injections',
    conditions: { payer_name: 'ALL', '241d_CPT': '64483', units_billed: '4', mue_limit: '2', modifier: 'none', service_type: 'pain_management' },
    denialProbability: 0.93, confidence: 0.91, sampleSize: 2341, avgClaimValue: 1200,
    recommendedAction: 'Reduce units to MUE limit or document medical necessity', carcCode: '151',
  },
  {
    id: 'CODE_005', type: 'coding', category: 'CODING', name: 'Invalid Modifier Combination',
    conditions: { payer_name: 'ALL', '241d_CPT': '99213', modifier_1: '25', modifier_2: '59', same_dos: 'yes', service_type: 'office_visit' },
    denialProbability: 0.72, confidence: 0.70, sampleSize: 1234, avgClaimValue: 185,
    recommendedAction: 'Review modifier usage; remove invalid combination', carcCode: '4',
  },
  {
    id: 'CODE_006', type: 'coding', category: 'CODING', name: 'Truncated ICD-10 Code',
    conditions: { payer_name: 'ALL', '241e_diag': 'M54', specificity: '3_digit', required_specificity: '5_digit', '241d_CPT': '99214' },
    denialProbability: 0.89, confidence: 0.91, sampleSize: 5678, avgClaimValue: 210,
    recommendedAction: 'Code to highest level of specificity per documentation', carcCode: 'A1',
  },
  {
    id: 'CODE_007', type: 'coding', category: 'CODING', name: 'Gender-Specific Procedure Mismatch',
    conditions: { payer_name: 'ALL', '241d_CPT': '55700', patient_gender: 'F', procedure_gender: 'M', service_type: 'surgery' },
    denialProbability: 0.99, confidence: 0.98, sampleSize: 234, avgClaimValue: 1500,
    recommendedAction: 'Verify patient gender; correct CPT or demographics', carcCode: '4',
  },
  {
    id: 'CODE_008', type: 'coding', category: 'CODING', name: 'Age-Specific Code Violation',
    conditions: { payer_name: 'ALL', '241d_CPT': '99392', patient_age: '45', code_age_range: '1-4', service_type: 'preventive' },
    denialProbability: 0.97, confidence: 0.96, sampleSize: 567, avgClaimValue: 175,
    recommendedAction: 'Use age-appropriate preventive visit code', carcCode: '4',
  },

  // ─── COORDINATION OF BENEFITS ─────────────────────────────
  {
    id: 'COB_001', type: 'cob', category: 'COORDINATION_OF_BENEFITS', name: 'Primary Payer Not Billed',
    conditions: { payer_name: 'BCBS', ins_level: 'secondary', primary_payer: 'Aetna', primary_eob: 'not_attached', '241d_CPT': '99214' },
    denialProbability: 0.94, confidence: 0.92, sampleSize: 2341, avgClaimValue: 210,
    recommendedAction: 'Bill primary payer first; attach EOB to secondary', carcCode: '22',
  },
  {
    id: 'COB_002', type: 'cob', category: 'COORDINATION_OF_BENEFITS', name: 'Medicare Secondary No MSP',
    conditions: { payer_name: 'Medicare', ins_level: 'secondary', primary_payer: 'employer_group', msp_questionnaire: 'incomplete', '241d_CPT': '99213' },
    denialProbability: 0.88, confidence: 0.85, sampleSize: 1567, avgClaimValue: 185,
    recommendedAction: 'Complete MSP questionnaire; verify COB order', carcCode: '22',
  },
  {
    id: 'COB_003', type: 'cob', category: 'COORDINATION_OF_BENEFITS', name: "Worker's Comp Primary",
    conditions: { payer_name: 'BCBS', ins_level: 'primary', injury_type: 'work_related', workers_comp: 'not_billed', '241d_CPT': '99203' },
    denialProbability: 0.91, confidence: 0.89, sampleSize: 892, avgClaimValue: 250,
    recommendedAction: "Bill Workers' Comp as primary payer", carcCode: '22',
  },
  {
    id: 'COB_004', type: 'cob', category: 'COORDINATION_OF_BENEFITS', name: 'Auto Accident Primary',
    conditions: { payer_name: 'UnitedHealthcare', ins_level: 'primary', injury_type: 'auto_accident', auto_insurance: 'not_billed', '241d_CPT': '99284' },
    denialProbability: 0.89, confidence: 0.87, sampleSize: 567, avgClaimValue: 450,
    recommendedAction: 'Bill auto insurance as primary payer', carcCode: '22',
  },

  // ─── TIMELY FILING ────────────────────────────────────────
  {
    id: 'TF_001', type: 'timely_filing', category: 'TIMELY_FILING', name: 'Medicare 365 Days Exceeded',
    conditions: { payer_name: 'Medicare', ins_level: 'primary', days_from_dos: '380', filing_limit_days: '365', '241d_CPT': '99214', original_submission: 'no' },
    denialProbability: 0.99, confidence: 0.98, sampleSize: 1234, avgClaimValue: 210,
    recommendedAction: 'Submit timely filing appeal with extenuating circumstances', carcCode: '29',
  },
  {
    id: 'TF_002', type: 'timely_filing', category: 'TIMELY_FILING', name: 'Commercial 90 Days Exceeded – Aetna',
    conditions: { payer_name: 'Aetna', ins_level: 'primary', days_from_dos: '120', filing_limit_days: '90', '241d_CPT': '99213', original_submission: 'no' },
    denialProbability: 0.97, confidence: 0.95, sampleSize: 2567, avgClaimValue: 185,
    recommendedAction: 'Appeal with proof of timely submission or extenuating circumstances', carcCode: '29',
  },
  {
    id: 'TF_003', type: 'timely_filing', category: 'TIMELY_FILING', name: 'Corrected Claim Late – BCBS',
    conditions: { payer_name: 'BCBS', ins_level: 'primary', claim_type: 'corrected', days_from_original: '95', correction_limit_days: '90', '241d_CPT': '99215' },
    denialProbability: 0.92, confidence: 0.90, sampleSize: 789, avgClaimValue: 275,
    recommendedAction: 'Appeal with documentation of timely original submission', carcCode: '29',
  },

  // ─── MEDICAL NECESSITY ────────────────────────────────────
  {
    id: 'MN_001', type: 'medical_necessity', category: 'MEDICAL_NECESSITY', name: 'Cosmetic Procedure Denial',
    conditions: { payer_name: 'ALL', '241d_CPT': '15824', '241e_diag': 'H02.839', service_type: 'surgery', cosmetic_indicator: 'possible', functional_impairment: 'not_documented' },
    denialProbability: 0.86, confidence: 0.83, sampleSize: 456, avgClaimValue: 3500,
    recommendedAction: 'Document functional impairment; obtain medical necessity letter', carcCode: '50',
  },
  {
    id: 'MN_002', type: 'medical_necessity', category: 'MEDICAL_NECESSITY', name: 'Experimental Treatment – Oncology',
    conditions: { payer_name: 'UnitedHealthcare', ins_level: 'primary', '241d_CPT': '96401', drug_code: 'J9999', '241e_diag': 'C34.90', fda_approval: 'off_label' },
    denialProbability: 0.78, confidence: 0.75, sampleSize: 234, avgClaimValue: 8500,
    recommendedAction: 'Submit appeal with peer-reviewed literature supporting efficacy', carcCode: '96',
  },
  {
    id: 'MN_003', type: 'medical_necessity', category: 'MEDICAL_NECESSITY', name: 'Frequency Exceeded – PT',
    conditions: { payer_name: 'Cigna', ins_level: 'primary', '241d_CPT': '97110', units_this_year: '45', annual_limit: '30', '241e_diag': 'M54.5' },
    denialProbability: 0.82, confidence: 0.80, sampleSize: 1678, avgClaimValue: 125,
    recommendedAction: 'Request medical necessity exception with progress documentation', carcCode: '150',
  },
  {
    id: 'MN_004', type: 'medical_necessity', category: 'MEDICAL_NECESSITY', name: 'Investigational Device',
    conditions: { payer_name: 'BCBS', ins_level: 'primary', '241d_CPT': '22867', device_status: 'investigational', '241e_diag': 'M47.816', service_type: 'surgery' },
    denialProbability: 0.91, confidence: 0.88, sampleSize: 123, avgClaimValue: 45000,
    recommendedAction: 'Submit appeal with clinical trial data and patient-specific justification', carcCode: '96',
  },

  // ─── PROVIDER ─────────────────────────────────────────────
  {
    id: 'PROV_001', type: 'provider', category: 'PROVIDER', name: 'Out-of-Network No Auth – Aetna',
    conditions: { payer_name: 'Aetna', ins_level: 'primary', provider_network: 'out_of_network', oon_auth: 'not_obtained', '241d_CPT': '99214', service_type: 'office_visit' },
    denialProbability: 0.75, confidence: 0.72, sampleSize: 3456, avgClaimValue: 210,
    recommendedAction: 'Obtain OON authorization or refer to in-network provider', carcCode: 'B7',
  },
  {
    id: 'PROV_002', type: 'provider', category: 'PROVIDER', name: 'Rendering NPI Not Enrolled – Medicare',
    conditions: { payer_name: 'Medicare', ins_level: 'primary', rendering_npi: 'not_enrolled', enrollment_status: 'pending', '241d_CPT': '99213' },
    denialProbability: 0.96, confidence: 0.94, sampleSize: 892, avgClaimValue: 185,
    recommendedAction: 'Complete provider enrollment; bill under supervising physician', carcCode: 'B16',
  },
  {
    id: 'PROV_003', type: 'provider', category: 'PROVIDER', name: 'Taxonomy Mismatch – Medicaid',
    conditions: { payer_name: 'Medicaid', ins_level: 'primary', provider_taxonomy: '207Q00000X', service_taxonomy: '208000000X', '241d_CPT': '99214' },
    denialProbability: 0.71, confidence: 0.68, sampleSize: 567, avgClaimValue: 210,
    recommendedAction: 'Update taxonomy code or verify provider can bill service', carcCode: 'B18',
  },
  {
    id: 'PROV_004', type: 'provider', category: 'PROVIDER', name: 'Locum Tenens No Modifier',
    conditions: { payer_name: 'Medicare', ins_level: 'primary', provider_type: 'locum_tenens', modifier_Q6: 'missing', '241d_CPT': '99213' },
    denialProbability: 0.88, confidence: 0.85, sampleSize: 345, avgClaimValue: 185,
    recommendedAction: 'Add modifier Q6 for locum tenens services', carcCode: '4',
  },

  // ─── DUPLICATE ────────────────────────────────────────────
  {
    id: 'DUP_001', type: 'duplicate', category: 'DUPLICATE_CLAIM', name: 'Same DOS/CPT Duplicate',
    conditions: { payer_name: 'ALL', '241d_CPT': '99214', dos_match: 'exact', cpt_match: 'exact', prior_claim_status: 'paid' },
    denialProbability: 0.99, confidence: 0.98, sampleSize: 4567, avgClaimValue: 210,
    recommendedAction: 'Verify if true duplicate; if different service add modifier', carcCode: '18',
  },
  {
    id: 'DUP_002', type: 'duplicate', category: 'DUPLICATE_CLAIM', name: 'Resubmission No ICN',
    conditions: { payer_name: 'ALL', '241d_CPT': '99213', claim_type: 'resubmission', original_icn: 'missing', frequency_code: '7' },
    denialProbability: 0.85, confidence: 0.82, sampleSize: 2341, avgClaimValue: 185,
    recommendedAction: 'Add original ICN to corrected claim submission', carcCode: '18',
  },
  {
    id: 'DUP_003', type: 'duplicate', category: 'DUPLICATE_CLAIM', name: 'Split Bill Same Encounter – Highmark',
    conditions: { payer_name: 'Highmark', ins_level: 'primary', facility_claim: 'submitted', professional_claim: 'submitted', same_dos: 'yes', same_encounter: 'yes' },
    denialProbability: 0.45, confidence: 0.60, sampleSize: 1234, avgClaimValue: 1500,
    recommendedAction: 'Verify facility/professional split billing is appropriate', carcCode: '18',
  },

  // ─── PAYMENT ──────────────────────────────────────────────
  {
    id: 'PAY_001', type: 'payment', category: 'UNDERPAYMENT', name: 'Below Contracted Rate – BCBS',
    conditions: { payer_name: 'BCBS', ins_level: 'primary', '241d_CPT': '99214', contracted_rate: '185.00', paid_amount: '145.00', variance_pct: '22' },
    denialProbability: 0.15, confidence: 0.85, sampleSize: 5678, avgClaimValue: 40,
    recommendedAction: 'Submit underpayment dispute with contract reference', carcCode: '45',
  },
  {
    id: 'PAY_002', type: 'payment', category: 'UNDERPAYMENT', name: 'Multiple Procedure Reduction Excessive – Aetna',
    conditions: { payer_name: 'Aetna', ins_level: 'primary', '241d_CPT': '29881', additional_procedures: '2', reduction_applied: '75', expected_reduction: '50' },
    denialProbability: 0.12, confidence: 0.78, sampleSize: 892, avgClaimValue: 700,
    recommendedAction: 'Dispute excessive multiple procedure reduction', carcCode: '45',
  },
  {
    id: 'PAY_003', type: 'payment', category: 'UNDERPAYMENT', name: 'Modifier 50 Single Unit – UHC',
    conditions: { payer_name: 'UnitedHealthcare', ins_level: 'primary', '241d_CPT': '64483', modifier: '50', units_paid: '1', units_expected: '2' },
    denialProbability: 0.18, confidence: 0.82, sampleSize: 567, avgClaimValue: 600,
    recommendedAction: 'Appeal for bilateral payment per contract terms', carcCode: '45',
  },

  // ─── SPECIALTY SPECIFIC ───────────────────────────────────
  {
    id: 'SPEC_001', type: 'specialty', category: 'SPECIALTY_SPECIFIC', name: 'Chemo Admin Sequence Error',
    conditions: { payer_name: 'ALL', '241d_CPT': '96413', additional_CPT: '96415', sequence: 'incorrect', initial_admin: 'missing', service_type: 'oncology' },
    denialProbability: 0.79, confidence: 0.77, sampleSize: 456, avgClaimValue: 850,
    recommendedAction: 'Correct chemotherapy administration code sequence', carcCode: '4',
  },
  {
    id: 'SPEC_002', type: 'specialty', category: 'SPECIALTY_SPECIFIC', name: 'Dialysis Composite Rate – Medicare',
    conditions: { payer_name: 'Medicare', ins_level: 'primary', '241d_CPT': '90960', composite_rate: 'applicable', separate_billing: 'attempted', service_type: 'nephrology' },
    denialProbability: 0.94, confidence: 0.92, sampleSize: 789, avgClaimValue: 2500,
    recommendedAction: 'Bill under composite rate; do not unbundle', carcCode: '97',
  },
  {
    id: 'SPEC_003', type: 'specialty', category: 'SPECIALTY_SPECIFIC', name: 'Mental Health Visit Limit – Cigna',
    conditions: { payer_name: 'Cigna', ins_level: 'primary', '241d_CPT': '90837', visits_ytd: '28', annual_limit: '26', '241e_diag': 'F32.1' },
    denialProbability: 0.88, confidence: 0.85, sampleSize: 1234, avgClaimValue: 175,
    recommendedAction: 'Request medical necessity exception for additional visits', carcCode: '150',
  },
  {
    id: 'SPEC_004', type: 'specialty', category: 'SPECIALTY_SPECIFIC', name: 'ASC Facility Fee Denied – Aetna',
    conditions: { payer_name: 'Aetna', ins_level: 'primary', '241d_CPT': '29881', place_of_service: '24', facility_fee: 'billed', asc_approved: 'no' },
    denialProbability: 0.72, confidence: 0.70, sampleSize: 567, avgClaimValue: 1800,
    recommendedAction: 'Verify ASC approval for procedure; appeal if appropriate', carcCode: 'B7',
  },
  {
    id: 'SPEC_005', type: 'specialty', category: 'SPECIALTY_SPECIFIC', name: 'Global Period Violation – Medicare',
    conditions: { payer_name: 'Medicare', ins_level: 'primary', '241d_CPT': '99213', prior_surgery_CPT: '27447', days_post_surgery: '45', global_period: '90' },
    denialProbability: 0.91, confidence: 0.89, sampleSize: 892, avgClaimValue: 185,
    recommendedAction: 'Add modifier 24 if unrelated E&M or wait for global period end', carcCode: '4',
  },

  // ─── PAYER SPECIFIC ───────────────────────────────────────
  {
    id: 'PAYER_001', type: 'payer_specific', category: 'PAYER_SPECIFIC', name: 'Highmark Prior Auth – Radiology',
    conditions: { payer_name: 'Highmark', ins_level: 'primary', '241d_CPT': '70553', service_type: 'radiology', auth_vendor: 'eviCore', prior_auth_status: 'not_obtained' },
    denialProbability: 0.93, confidence: 0.91, sampleSize: 2341, avgClaimValue: 1850,
    recommendedAction: 'Obtain eviCore authorization for Highmark radiology', carcCode: '197',
  },
  {
    id: 'PAYER_002', type: 'payer_specific', category: 'PAYER_SPECIFIC', name: 'UHC Optum Auth Required',
    conditions: { payer_name: 'UnitedHealthcare', ins_level: 'primary', '241d_CPT': '27447', service_type: 'surgery', auth_vendor: 'Optum', prior_auth_status: 'not_obtained' },
    denialProbability: 0.95, confidence: 0.93, sampleSize: 1567, avgClaimValue: 18500,
    recommendedAction: 'Obtain Optum authorization for UHC surgical procedures', carcCode: '197',
  },
  {
    id: 'PAYER_003', type: 'payer_specific', category: 'PAYER_SPECIFIC', name: 'Aetna Precert Imaging',
    conditions: { payer_name: 'Aetna', ins_level: 'primary', '241d_CPT': '74176', service_type: 'radiology', auth_vendor: 'AIM', prior_auth_status: 'not_obtained' },
    denialProbability: 0.91, confidence: 0.89, sampleSize: 1892, avgClaimValue: 1200,
    recommendedAction: 'Obtain AIM Specialty Health authorization for Aetna imaging', carcCode: '197',
  },
  {
    id: 'PAYER_004', type: 'payer_specific', category: 'PAYER_SPECIFIC', name: 'Medicare ABN Not Signed',
    conditions: { payer_name: 'Medicare', ins_level: 'primary', '241d_CPT': '82728', service_type: 'laboratory', frequency_limit: 'exceeded', abn_signed: 'no' },
    denialProbability: 0.89, confidence: 0.87, sampleSize: 3456, avgClaimValue: 45,
    recommendedAction: 'Obtain signed ABN before service; bill with GA modifier', carcCode: '50',
  },
  {
    id: 'PAYER_005', type: 'payer_specific', category: 'PAYER_SPECIFIC', name: 'Medicaid Referral Missing',
    conditions: { payer_name: 'Medicaid', ins_level: 'primary', '241d_CPT': '99214', provider_type: 'specialist', referral_status: 'not_obtained', pcp_referral_required: 'yes' },
    denialProbability: 0.86, confidence: 0.84, sampleSize: 2567, avgClaimValue: 210,
    recommendedAction: 'Obtain PCP referral; update claim with referral number', carcCode: '4',
  },

  // ─── COMPLEX MULTI-FACTOR ─────────────────────────────────
  {
    id: 'COMPLEX_001', type: 'complex_pattern', category: 'MULTI_FACTOR', name: 'Auth + Coding + Eligibility',
    conditions: { payer_name: 'BCBS', ins_level: 'primary', '241d_CPT': '27447', '241e_diag': 'M17.0', prior_auth_status: 'obtained', auth_CPT: '27446', coverage_status: 'pending_verification', provider_network: 'in_network' },
    denialProbability: 0.82, confidence: 0.78, sampleSize: 234, avgClaimValue: 15200,
    recommendedAction: 'Verify eligibility; request auth CPT amendment; correct coding', carcCode: '197',
  },
  {
    id: 'COMPLEX_002', type: 'complex_pattern', category: 'MULTI_FACTOR', name: 'Secondary + Timely Filing + COB',
    conditions: { payer_name: 'Aetna', ins_level: 'secondary', primary_payer: 'Medicare', primary_paid_date: '90_days_ago', secondary_filing_limit: '90', '241d_CPT': '99214' },
    denialProbability: 0.78, confidence: 0.75, sampleSize: 567, avgClaimValue: 52,
    recommendedAction: 'Submit timely filing appeal with primary EOB date documentation', carcCode: '29',
  },
  {
    id: 'COMPLEX_003', type: 'complex_pattern', category: 'MULTI_FACTOR', name: 'OON + No Auth + High Cost',
    conditions: { payer_name: 'UnitedHealthcare', ins_level: 'primary', '241d_CPT': '22853', provider_network: 'out_of_network', oon_auth: 'not_obtained', claim_amount: '35000', service_type: 'surgery' },
    denialProbability: 0.91, confidence: 0.88, sampleSize: 123, avgClaimValue: 35000,
    recommendedAction: 'Obtain retrospective OON authorization; prepare appeal with medical necessity', carcCode: 'B7',
  },
  {
    id: 'COMPLEX_004', type: 'complex_pattern', category: 'MULTI_FACTOR', name: 'Retro Elig Term + Auth Obtained',
    conditions: { payer_name: 'Cigna', ins_level: 'primary', '241d_CPT': '70553', prior_auth_status: 'obtained', coverage_status: 'retro_termed', auth_date: 'before_term', dos: 'after_term' },
    denialProbability: 0.96, confidence: 0.94, sampleSize: 345, avgClaimValue: 1850,
    recommendedAction: 'Bill patient or identify alternate coverage; auth void due to termination', carcCode: '27',
  },
];

// ─── Payer keyword normalization ──────────────────────────
function payerKeywords(shortName: string): string[] {
  const n = shortName.toLowerCase();
  const kws = [n];
  if (n.includes('united') || n.includes('uhc') || n.includes('unitedhealthcare')) {
    kws.push('unitedhealth', 'unitedhealthcare', 'uhc', 'united');
  }
  if (n.includes('blue') || n.includes('bcbs')) kws.push('bcbs', 'blue cross', 'blue shield');
  if (n.includes('aetna')) kws.push('aetna');
  if (n.includes('cigna')) kws.push('cigna');
  if (n.includes('highmark')) kws.push('highmark');
  if (n.includes('medicare')) kws.push('medicare');
  if (n.includes('medicaid')) kws.push('medicaid');
  if (n.includes('humana')) kws.push('humana');
  if (n.includes('anthem')) kws.push('anthem');
  return kws;
}

// ─── Map DenialFactor category → pattern type list ────────
const FACTOR_CAT_TO_PATTERN_TYPES: Record<string, string[]> = {
  authorization:      ['prior_auth', 'payer_specific', 'complex_pattern'],
  eligibility:        ['eligibility', 'complex_pattern'],
  coding:             ['coding', 'specialty'],
  documentation:      ['medical_necessity'],
  medical_necessity:  ['medical_necessity'],
  billing:            ['payment', 'duplicate', 'timely_filing'],
};

// ─── Which fact node does a match reason map to? ──────────
function reasonToFactId(reason: string, patternCategory: string): string {
  if (reason.startsWith('CPT:')) return 'fact-cpt';
  if (reason.startsWith('Auth:')) return 'fact-auth';
  if (reason.startsWith('ICD:')) return 'fact-icd';
  if (reason.startsWith('Payer:') || reason === 'Universal pattern') return 'fact-payer';
  if (reason.startsWith('Risk category:')) {
    if (patternCategory === 'CODING' || patternCategory === 'SPECIALTY_SPECIFIC') return 'fact-cpt';
    if (patternCategory === 'ELIGIBILITY') return 'fact-payer';
    if (patternCategory === 'PRIOR_AUTHORIZATION' || patternCategory === 'PAYER_SPECIFIC') return 'fact-auth';
    return 'fact-payer';
  }
  return 'fact-payer';
}

export { reasonToFactId };

// ─── Main matching function ────────────────────────────────
export function matchPatternsForClaim(claim: Claim): MatchedPattern[] {
  const claimCPTs = new Set(claim.procedureCodes.map(p => p.cpt));
  const claimICDs = new Set(claim.diagnosisCodes.map(d => d.code));
  const kwds = payerKeywords(claim.payer.shortName);

  // Derive auth status from denial factors
  const authFactor = claim.denialFactors.find(
    f => (f.category === 'authorization') && f.impact === 'increases'
  );
  const authStatus: string = authFactor
    ? (authFactor.description.toLowerCase().includes('expir') ? 'expired' : 'not_obtained')
    : 'obtained';

  // Collect pattern types implied by claim denial factors
  const impliedTypes = new Set<string>();
  claim.denialFactors
    .filter(f => f.impact === 'increases')
    .forEach(f => {
      (FACTOR_CAT_TO_PATTERN_TYPES[f.category] ?? []).forEach(t => impliedTypes.add(t));
    });

  const scored = DENIAL_PATTERNS.map(pattern => {
    let score = 0;
    const reasons: string[] = [];

    const patternPayer = (pattern.conditions.payer_name ?? '').toLowerCase();

    // Payer match
    if (patternPayer === 'all') {
      score += 1; // soft universal match — no reason label
    } else if (kwds.some(kw => patternPayer.includes(kw) || kw.includes(patternPayer))) {
      score += 3;
      reasons.push(`Payer: ${pattern.conditions.payer_name}`);
    }

    // CPT match (strongest signal)
    const patCPT = pattern.conditions['241d_CPT'];
    if (patCPT && claimCPTs.has(patCPT)) {
      score += 4;
      reasons.push(`CPT: ${patCPT}`);
    }

    // Auth status match
    const patAuth = pattern.conditions['prior_auth_status'];
    if (patAuth) {
      if (patAuth === authStatus) {
        score += 3;
        reasons.push(`Auth: ${authStatus.replace(/_/g, ' ')}`);
      } else if (authStatus !== 'obtained') {
        score += 1; // partial — claim has some auth issue
      }
    }

    // ICD-10 match
    const patICD = pattern.conditions['241e_diag'];
    if (patICD && claimICDs.has(patICD)) {
      score += 2;
      reasons.push(`ICD: ${patICD}`);
    }

    // Implied pattern type from claim denial factors
    if (impliedTypes.has(pattern.type)) {
      score += 2;
      if (!reasons.some(r => r.startsWith('Risk'))) {
        reasons.push(`Risk category: ${pattern.category.replace(/_/g, ' ')}`);
      }
    }

    return { ...pattern, matchScore: score, matchReasons: reasons };
  });

  // Filter, sort, and return top 5
  const filtered = scored
    .filter(p => p.matchScore > 1 && p.matchReasons.length > 0)
    .sort((a, b) =>
      b.matchScore !== a.matchScore
        ? b.matchScore - a.matchScore
        : b.denialProbability - a.denialProbability
    );

  // Ensure at least 3 results by lowering threshold if needed
  if (filtered.length < 3) {
    const fallback = scored
      .filter(p => p.matchScore >= 1)
      .sort((a, b) => b.matchScore - a.matchScore || b.denialProbability - a.denialProbability)
      .slice(0, 5);
    return fallback.map(p => ({
      ...p,
      matchReasons: p.matchReasons.length > 0 ? p.matchReasons : ['Pattern type match'],
    }));
  }

  return filtered.slice(0, 5);
}
