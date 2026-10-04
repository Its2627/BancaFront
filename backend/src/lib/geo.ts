import type { Lookup } from 'geoip-lite';

type GeoipModule = { lookup: (ip: string) => Lookup | null };

let geoip: GeoipModule | null | undefined;

export const geoLookup = (ip?: string | null): Lookup | null => {
    if (!ip) return null;

    if (geoip === undefined) {
        try {
            geoip = require('geoip-lite') as GeoipModule;
        } catch {
            geoip = null;
        }
    }

    try {
        return geoip?.lookup(ip) ?? null;
    } catch {
        return null;
    }
};

export const geoCity = (ip?: string | null): string | null => geoLookup(ip)?.city ?? null;

export const geoCountry = (ip?: string | null): string | null => geoLookup(ip)?.country ?? null;
