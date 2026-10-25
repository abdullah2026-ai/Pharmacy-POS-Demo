import { Medicine, Patient } from '../types/pharmacy';
import { storageService } from './storageService';

export interface PublicDrugInfo {
  brandName: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  indications: string;
  warnings?: string;
  adverseReactions?: string;
  activeIngredients?: string;
  source: 'BANGLADESH_DGDA' | 'OPENFDA_PUBLIC_API';
}

export interface DrugInteractionAlert {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  mechanism: string;
}

class MedicineApiService {
  // Public OpenFDA drug API query with graceful offline fallback
  public async searchPublicDrugData(query: string): Promise<PublicDrugInfo[]> {
    if (!query || query.trim().length < 2) return [];

    const normalized = query.trim().toLowerCase();
    const results: PublicDrugInfo[] = [];

    // 1. Search local Bangladesh pharmaceutical database first (Instant offline-first)
    const localMedicines = storageService.getMedicines();
    const localMatches = localMedicines.filter(m => 
      m.brandName.toLowerCase().includes(normalized) ||
      m.genericName.toLowerCase().includes(normalized) ||
      m.manufacturer.toLowerCase().includes(normalized) ||
      m.category.toLowerCase().includes(normalized)
    );

    localMatches.forEach(m => {
      results.push({
        brandName: m.brandName,
        genericName: m.genericName,
        manufacturer: m.manufacturer,
        dosageForm: m.dosageForm,
        indications: m.indications,
        warnings: m.contraindications || 'DGDA Scheduled Prescription Drug',
        adverseReactions: m.sideEffects,
        activeIngredients: `${m.genericName} (${m.strength})`,
        source: 'BANGLADESH_DGDA'
      });
    });

    // 2. If online, fetch supplementary pharmacological details from OpenFDA public registry
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const openFdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(normalized)}"&limit=3`;
        const resp = await fetch(openFdaUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          if (data.results && Array.isArray(data.results)) {
            data.results.forEach((item: any) => {
              const generic = item.openfda?.generic_name?.[0] || normalized;
              const brand = item.openfda?.brand_name?.[0] || generic;
              const mfr = item.openfda?.manufacturer_name?.[0] || 'Global Pharmaceutical Monograph';
              const indications = item.indications_and_usage?.[0]?.slice(0, 250) + '...' || 'Public monograph indication available';
              const warnings = item.warnings?.[0]?.slice(0, 250) + '...' || item.boxed_warning?.[0]?.slice(0, 250);

              // Avoid exact duplicates
              if (!results.some(r => r.brandName.toLowerCase() === brand.toLowerCase())) {
                results.push({
                  brandName: brand,
                  genericName: generic,
                  manufacturer: mfr,
                  dosageForm: item.openfda?.dosage_form?.[0] || 'Tablet',
                  indications: indications,
                  warnings: warnings,
                  activeIngredients: generic,
                  source: 'OPENFDA_PUBLIC_API'
                });
              }
            });
          }
        }
      } catch {
        // Quiet fallback if OpenFDA is unreachable or sandboxed
      }
    }

    return results;
  }

  // Cross-reference dispensing items against patient EMR for life-safety warnings
  public checkPatientDrugInteractions(
    patient: Patient | undefined,
    candidateMedicines: { brandName: string; genericName: string }[]
  ): DrugInteractionAlert[] {
    if (!patient) return [];

    const alerts: DrugInteractionAlert[] = [];
    const patientAllergies = (patient.allergies || []).map(a => a.toLowerCase());
    const chronic = (patient.chronicConditions || []).map(c => c.toLowerCase());

    candidateMedicines.forEach(med => {
      const generic = med.genericName.toLowerCase();
      const brand = med.brandName.toLowerCase();

      // 1. Allergy checks: Penicillin / Amoxicillin
      const hasPenicillinAllergy = patientAllergies.some(a => a.includes('penicillin') || a.includes('amoxicillin'));
      if (hasPenicillinAllergy) {
        if (generic.includes('amoxicillin') || generic.includes('ampicillin') || brand.includes('moxaclav')) {
          alerts.push({
            severity: 'CRITICAL',
            title: `CRITICAL ALLERGY ALERT: ${med.brandName}`,
            message: `Patient ${patient.fullNameEn} has a documented anaphylactic allergy to Penicillins. ${med.brandName} (${med.genericName}) is a penicillin-class antibiotic!`,
            mechanism: 'Cross-reactivity with beta-lactam core causing severe hypersensitivity or anaphylaxis.'
          });
        }
      }

      // 2. Allergy checks: NSAIDs
      const hasNsaidAllergy = patientAllergies.some(a => a.includes('nsaid') || a.includes('diclofenac') || a.includes('aspirin'));
      if (hasNsaidAllergy) {
        if (generic.includes('diclofenac') || generic.includes('ibuprofen') || generic.includes('naproxen') || generic.includes('aspirin')) {
          alerts.push({
            severity: 'CRITICAL',
            title: `NSAID ALLERGY CONFLICT: ${med.brandName}`,
            message: `Patient has documented allergy to NSAID anti-inflammatory agents.`,
            mechanism: 'COX-1 inhibition mediated pseudo-allergic bronchospasm or urticaria.'
          });
        }
      }

      // 3. Chronic disease cautions: Asthma + Beta Blockers / Aspirin
      const hasAsthma = chronic.some(c => c.includes('asthma') || c.includes('bronchial'));
      if (hasAsthma && (generic.includes('propranolol') || generic.includes('atenolol'))) {
        alerts.push({
          severity: 'WARNING',
          title: `ASTHMA CONTRAINDICATION: ${med.brandName}`,
          message: `Beta-blocker prescription for asthmatic patient risks triggering bronchospasm.`,
          mechanism: 'Beta-2 receptor blockade in bronchial smooth muscle.'
        });
      }

      // 4. Diabetes + High-dose Corticosteroids
      const hasDiabetes = chronic.some(c => c.includes('diabet') || c.includes('hyperglycemia'));
      if (hasDiabetes && (generic.includes('dexamethasone') || generic.includes('prednisolone'))) {
        alerts.push({
          severity: 'WARNING',
          title: `HYPERGLYCEMIA WARNING: ${med.brandName}`,
          message: `Corticosteroid therapy can cause severe blood glucose elevation in diabetic patients.`,
          mechanism: 'Increased gluconeogenesis and hepatic insulin resistance.'
        });
      }
    });

    return alerts;
  }
}

export const medicineApiService = new MedicineApiService();
