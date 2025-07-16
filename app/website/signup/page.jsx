import { Suspense } from "react";
import SignupForm from "./form";

export const metadata = {
    title: 'Sign Up',
};

export default async function Page() {
    return <Suspense>
        <SignupForm reCaptchaSiteKey={process.env.RECAPTCHA_SITE_KEY}/>
    </Suspense>;
}
