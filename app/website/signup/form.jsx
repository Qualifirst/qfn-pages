'use client';

import { Checkbox, FloatingLabelInput, FloatingLabelSelect } from "components/input";
import { companyTypes, countries, cuisineTypes, employees, spendAmounts, states } from "shared/data";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";

export default function SignupForm({reCaptchaSiteKey}) {
    const {register, handleSubmit, watch, formState, setValue, setError} = useForm({
        defaultValues: {
            newsletter: true,
        },
    });

    const country = watch('country');
    const filteredStates = useMemo(() => {
        return states[country] || [];
    }, [country]);
    useEffect(() => {
        setValue('state', '');
    }, [country, setValue]);

    const companyName = watch('companyName');
    const isCompany = useMemo(() => {
        return !!companyName;
    }, [companyName]);

    const companyType = watch('companyType');
    const cuisineType = watch('cuisineType');
    useEffect(() => {
        setValue('otherCompanyType', '');
        setValue('cuisineType', '');
    }, [companyType, setValue]);
    useEffect(() => {
        setValue('otherCuisineType', '');
    }, [cuisineType, setValue]);

    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect');

    const onSubmit = useCallback((data) => {
        let phone = (data.phone || '').replace(/[^0-9+]/g, '');
        if (phone !== '' && !phone.startsWith('+')) {
            phone = '+1' + phone;
        }
        const requestData = {
            customer: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                title: data.title,
                newsletter: data.newsletter,
            },
            isCompany: isCompany,
            company: {
                name: data.companyName,
                email: data.companyEmail,
                website: data.companyWebsite,
                companyType: data.companyType + (data.otherCompanyType ? (" | " + data.otherCompanyType) : ""),
                primaryCuisine: data.cuisineType + (data.otherCuisineType ? (" | " + data.otherCuisineType) : ""),
                employees: data.employees,
                annualSpend: data.spendAmount,
            },
            address: {
                address1: data.address1,
                address2: data.address2,
                city: data.city,
                zip: data.zip,
                country: data.country,
                state: data.state,
                phone: phone,
                deliveryInstructions: data.deliveryInstructions,
                recipient: data.recipient,
            },
        };
        return new Promise(async (resolve, reject) => {
            try {
                const recaptchaToken = await (new Promise((resolve) => {
                    grecaptcha.ready(function() {
                        grecaptcha.execute(reCaptchaSiteKey, {action: 'submit'}).then(function(token) {
                            resolve(token);
                        });
                    });
                }));
                const res = await fetch('/.netlify/functions/signup-submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        recaptchaToken,
                        data: requestData,
                    }),
                });
                if (res.status === 403) {
                    setError('root', {message: 'Form verification failed. Please refresh the page and try again.'});
                    reject();
                    return;
                }
                const resJson = await res.json();
                if (res.status === 200) {
                    if (isCompany) {
                        console.log('new company', resJson.company?.id);
                    } else {
                        console.log('new customer', resJson.customer?.id);
                    }
                    if (redirectTo) {
                        setTimeout(() => {window.top.location.href = redirectTo;}, 1500);
                    }
                    resolve();
                    return;
                }
                console.error('response with error from signup', res, resJson);
                setError('root', {message: resJson.userErrors ? resJson.userErrors.map((error, idx) => {
                    return <span className="block" key={idx}>{error.message}</span>;
                }) : 'Error creating account'});
                reject();
            } catch (error) {
                console.error(error);
                setError('root', {message: 'Error creating account'});
                reject();
            }
        });
    }, [setError, isCompany]);

    return (
        <div className="w-1000 max-w-lg p-2">
            <script src={"https://www.google.com/recaptcha/api.js?render=" + reCaptchaSiteKey} async></script>
            {redirectTo && (
                <p className="mb-4 w-full text-center text-gray-700">
                    Already have an account?
                    <a href={redirectTo} className="ml-2" target="_top">Log In</a>
                </p>
            )}
            <h1 className="w-full text-center">Create Account</h1>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="w-full mt-7">
                    <h3>User Information</h3>
                    <div className="w-full">
                        <div className="sm:flex gap-4">
                            <FloatingLabelInput label="First Name" {...register("firstName", {required: true})}
                                error={formState.errors.firstName} required/>
                            <FloatingLabelInput label="Last Name" {...register("lastName", {required: true})}
                                error={formState.errors.lastName} required/>
                        </div>
                        <div className="sm:flex">
                            <FloatingLabelInput label="Email Address" {...register("email", {required: true})}
                                type="email" help="Will be your login." error={formState.errors.email} required/>
                        </div>
                    </div>
                </div>
                <div className="mt-5 w-full">
                    <h3>Business Information</h3>
                    <div className="w-full">
                        <div className="sm:flex gap-2">
                            <FloatingLabelInput label="Business Name" {...register("companyName")} error={formState.errors.companyName}
                                help={!isCompany && "If you are part of a Business, you can enjoy Wholesale pricing in all of our products!"}/>
                            {isCompany && (
                                <FloatingLabelInput label="Job Position" {...register("title", {required: true})} error={formState.errors.title} required/>
                            )}
                        </div>
                        {isCompany && (
                            <>
                                <div className="sm:flex gap-2">
                                    <FloatingLabelInput label="Business Email" {...register("companyEmail", {required: true})} error={formState.errors.companyEmail} required/>
                                    <FloatingLabelInput label="Business Website" {...register("companyWebsite")} error={formState.errors.companyWebsite}/>
                                </div>
                                <div className="sm:flex gap-2">
                                    <FloatingLabelSelect label="Business Type" placeholder="Select a business type..." options={companyTypes} {...register("companyType", {required: true})} error={formState.errors.companyType} required/>
                                    {companyType === "Other" && (
                                        <FloatingLabelInput label="Please Enter Business Type" {...register("otherCompanyType", {required: true})} error={formState.errors.otherCompanyType} required/>
                                    )}
                                </div>
                                {companyType === "Restaurant" && (
                                    <div className="sm:flex gap-2">
                                        <FloatingLabelSelect label="Primary Cuisine" placeholder="Select a cuisine type..." options={cuisineTypes} {...register("cuisineType", {required: true})} error={formState.errors.cuisineType} required/>
                                        {cuisineType === "Other" && (
                                            <FloatingLabelInput label="Please Enter Cuisine Type" {...register("otherCuisineType", {required: true})} error={formState.errors.otherCuisineType} required/>
                                        )}
                                    </div>
                                )}
                                <div className="sm:flex gap-2">
                                    <FloatingLabelSelect label="Employees" placeholder="Select employees..." options={employees} {...register("employees", {required: true})} error={formState.errors.employees} required
                                        help="How Many Employees In Your Organization?"/>
                                    <FloatingLabelSelect label="Estimated Spend Amount" placeholder="Select amount..." options={spendAmounts} {...register("spendAmount", {required: true})} error={formState.errors.spendAmount} required
                                        help="How Much Do You Spend On Gourmet Ingredients Each Year?"/>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="mt-5 w-full">
                    <h3>Address</h3>
                    <div className="w-full">
                        {isCompany && (
                            <div className="sm:flex">
                                <FloatingLabelInput label="Recipient" {...register("recipient", {required: true})}
                                    error={formState.errors.recipient} required/>
                            </div>
                        )}
                        <div className="sm:flex">
                            <FloatingLabelInput label="Address Line 1" {...register("address1", {required: true})}
                                error={formState.errors.address1} required/>
                        </div>
                        <div className="sm:flex">
                            <FloatingLabelInput label="Address Line 2" {...register("address2")}
                                error={formState.errors.address2}/>
                        </div>
                        <div className="sm:flex gap-4">
                            <FloatingLabelInput label="City" {...register("city", {required: true})}
                                error={formState.errors.city} required/>
                            <FloatingLabelInput label="Postal Code / ZIP" {...register("zip", {required: true})}
                                error={formState.errors.zip} required/>
                        </div>
                        <div className="sm:flex gap-4">
                            <FloatingLabelSelect label="Country" options={countries} {...register("country", {required: true})}
                                placeholder="Select a country..." error={formState.errors.country} required/>
                            <FloatingLabelSelect label="State / Province" options={filteredStates} {...register("state", {required: true})}
                                placeholder="Select a state / province..." error={formState.errors.state} required/>
                        </div>
                        <div className="sm:flex gap-4">
                            <FloatingLabelInput label="Contact Phone" type="phone" {...register("phone")}
                                error={formState.errors.phone} help="Add country code if phone is from a different country (e.g., +44 for UK)."/>
                        </div>
                        {isCompany && (
                            <div className="sm:flex gap-4">
                                <FloatingLabelInput label="Delivery Instructions" {...register("deliveryInstructions")}
                                    error={formState.errors.deliveryInstructions} help="Do you have any special delivery instructions?"/>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-7 w-full text-center">
                    <Checkbox label="Subscribe to Newsletter" {...register("newsletter")} error={formState.errors.newsletter}/>
                    {formState.errors.root?.message && (
                        <p className="mt-3 mb-1 text-xs text-red-500">
                            {formState.errors.root?.message}
                        </p>
                    )}
                    {formState.isSubmitSuccessful ? (
                        <p className="mt-3 mb-1 text-xs text-green-800">
                            Account created correctly!
                            {redirectTo && <span> You are being redirected...</span>}
                        </p>
                    ) : (
                        <button type="submit" disabled={formState.isSubmitting}
                            className="mt-2 text-white w-full bg-gray-800 hover:cursor-pointer hover:bg-black focus:ring-4 focus:outline-none font-medium text-sm w-full px-5 py-2.5 text-center disabled:bg-gray-300">
                            {
                                formState.isSubmitting ?
                                'Creating Account...' :
                                'Create Account'
                            }
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
