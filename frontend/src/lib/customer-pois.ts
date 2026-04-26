import { useEffect, useMemo, useState } from "react";
import { POIS, type POI } from "@/mocks/pois";
import { listMerchantOffers } from "@/lib/merchant-offers";
import { isMockMerchantOffer } from "@/mocks/merchant";

/**
 * If a merchant has an active offer for a static POI that is missing from the current
 * live list (Tavily), prepend that POI so customers still see the offer.
 */
function mergePoisWithOfferTargets(base: POI[]): POI[] {
  const activePoiIds = new Set(
    listMerchantOffers().filter((o) => o.active && isMockMerchantOffer(o)).map((o) => o.poiId),
  );
  const have = new Set(base.map((p) => p.id));
  const extras: POI[] = [];
  for (const poiId of activePoiIds) {
    if (have.has(poiId)) continue;
    const staticPoi = POIS.find((p) => p.id === poiId);
    if (staticPoi) extras.push(staticPoi);
  }
  if (extras.length === 0) return base;
  return [...extras, ...base];
}

export function useCustomerPois(basePois: POI[]): POI[] {
  const [bump, setBump] = useState(0);
  useEffect(() => {
    const onChange = () => setBump((n) => n + 1);
    window.addEventListener("merchant-offers-updated", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("merchant-offers-updated", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return useMemo(() => mergePoisWithOfferTargets(basePois), [basePois, bump]);
}
