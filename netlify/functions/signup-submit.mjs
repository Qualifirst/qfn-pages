export default async (request, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (request.method === "OPTIONS") {
        return new Response('', {
            status: 204,
            headers,
        });
    }

    const referer = request.headers.get('referer');
    if (!referer || !context.site?.url || (new URL(context.site.url)).origin !== (new URL(referer)).origin) {
        return new Response('', {
            status: 403,
            headers,
        });
    }

    const {recaptchaToken, data} = await request.json();
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`, {method: "POST"});
    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
        return new Response('', {
            status: 400,
            headers,
        });
    }

    const res = await fetch(process.env.SHOPIFY_FUNCTIONS_URL + "/signup", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.SHOPIFY_FUNCTIONS_AUTH_KEY,
        },
        body: JSON.stringify(data),
    });
    const resJson = await res.json();
    return new Response(JSON.stringify(resJson), {
        status: res.status,
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
    });
};

export const config = {
    method: ['POST', 'OPTIONS'],
};
