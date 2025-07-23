import { PlacesClient } from "@googlemaps/places";
import { headers } from "next.config";

class PlacesCaller {
    constructor (referer) {
        this.referer = referer;
        this.client = new PlacesClient({apiKey: process.env.GMAPS_PLACES_API_KEY});
    }
    async call(method, ...args) {
        return await this[method](...args);
    }
    async autocomplete(input, includedTypes, sessionToken) {
        const [res] = await this.client.autocompletePlaces(
            {
                input,
                maxResultCount: 5,
                includedPrimaryTypes: includedTypes,
                includedRegionCodes: ['CA'],
                sessionToken,
            },
        );
        return res.suggestions.map((s) => ({
            placeId: s.placePrediction.placeId,
            mainText: s.placePrediction.structuredFormat.mainText.text,
            secondaryText: s.placePrediction.structuredFormat.secondaryText.text,
        }));
    }
    async getPlace(placeId, sessionToken) {
        const [res] = await this.client.getPlace(
            {
                name: 'places/' + placeId,
                sessionToken,
            },
            {
                otherArgs: {
                    headers: {
                        'X-Goog-FieldMask': 'addressComponents,displayName,internationalPhoneNumber,postalAddress,websiteUri,types',
                    },
                },
            },
        );
        return {
            name: res.displayName?.text,
            phone: res.internationalPhoneNumber,
            website: res.websiteUri,
            address: {
                address1: res.postalAddress?.addressLines?.[0],
                address2: res.postalAddress?.addressLines?.[1],
                city: res.postalAddress?.locality,
                country: res.postalAddress?.regionCode,
                state: res.addressComponents?.filter((c) => c.types.includes('administrative_area_level_1'))[0]?.shortText,
                zip: res.addressComponents?.filter((c) => c.types.includes('postal_code'))[0]?.longText,
            },
            types: res.types,
        };
    }
};

export default async (request, context) => {
    const referer = request.headers.get('referer');
    if (!referer || !context.site?.url || (new URL(context.site.url)).origin !== (new URL(referer)).origin) {
        return new Response('', {
            status: 403,
            headers,
        });
    }

    const requestJson = await request.json();
    const caller = new PlacesCaller(referer);
    const res = await caller.call(...requestJson);

    return new Response(JSON.stringify(res), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const config = {
    method: ['POST', 'OPTIONS'],
};
