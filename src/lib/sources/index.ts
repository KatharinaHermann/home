import { catalogSource } from "./catalog";
import { makeFacebookSource } from "./facebook";
import { makeKleinanzeigenSource } from "./kleinanzeigen";
import { retailerSources } from "./retailers";
import type { ProductSource } from "./types";

export function buildSources(opts: { facebookToken?: string; kleinanzeigen?: boolean }): ProductSource[] {
  return [
    catalogSource,
    makeFacebookSource({ accessToken: opts.facebookToken }),
    makeKleinanzeigenSource({ enabled: !!opts.kleinanzeigen }),
    ...retailerSources,
  ];
}
export type { ProductSource, SearchQuery } from "./types";
