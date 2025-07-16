import { forwardRef, useId } from "react";

function getErrorMessage(error) {
    if (typeof error === "string") {
        return error;
    }
    if (typeof error === "object" && (error.message || error.type)) {
        if (error.message) {
            return error.message;
        }
        return {
            'required': 'This field is required.',
        }[error.type] || "";
    }
    return "";
}

export function FloatingLabelInput ({label, help, error, className, containerClass, containerAttrs, labelClass, labelAttrs, ...inputAttrs}) {
    const uniqueId = useId();
    if (inputAttrs.required && !label.endsWith("*")) {
        label = label + " *";
    }
    return (
        <div className={"relative z-0 mt-4 group w-full " + (containerClass || '')} {...(containerAttrs || {})}>
            <input type="text" id={uniqueId} placeholder=" " autoComplete={(inputAttrs || {}).type === "password" ? "no" : "yes"} {...(inputAttrs || {})}
                className={"block pt-2 pb-1 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 peer " + (className || '')}/>
            <label htmlFor={uniqueId} {...(labelAttrs || {})}
                className={"peer-focus:font-medium absolute text-sm text-gray-700 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 " + (labelClass || '')}>
                {label}
            </label>
            {help && (
                <p className="mt-0.5 text-xs text-gray-500">
                    {help}
                </p>
            )}
            {error && (
                <p className="mt-0.5 text-xs text-red-500">
                    {getErrorMessage(error)}
                </p>
            )}
        </div>
    );
};

export function FloatingLabelSelect({label, options, help, error, className, containerClass, containerAttrs, labelClass, labelAttrs, ...inputAttrs}) {
    const uniqueId = useId();
    if (!inputAttrs.defaultValue) {
        inputAttrs.defaultValue = '';
    }
    if (inputAttrs.required && !label.endsWith("*")) {
        label = label + " *";
    }
    return (
        <div className={"relative z-0 mt-4 group w-full " + (containerClass || '')} {...(containerAttrs || {})}>
            <select type="text" id={uniqueId} placeholder=" " autoComplete="on" {...(inputAttrs || {})}
                className={"block pt-2 pb-0.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-500 appearance-none focus:outline-none focus:ring-0 peer " + (className || '')}>
                    <option value="" {...{disabled: inputAttrs.required}}>{(inputAttrs || {}).placeholder || '...'}</option>
                    {(options || []).map((option) => (
                        <option value={option.value} key={option.value}>{option.label || option.value}</option>
                    ))}
                </select>
            <label htmlFor={uniqueId} {...(labelAttrs || {})}
                className={"peer-focus:font-medium absolute text-sm text-gray-700 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 " + (labelClass || '')}>
                {label}
            </label>
            {help && (
                <p className="mt-0.5 text-xs text-gray-500">
                    {help}
                </p>
            )}
            {error && (
                <p className="mt-0.5 text-xs text-red-500">
                    {getErrorMessage(error)}
                </p>
            )}
        </div>
    );
}

export function Checkbox ({label, error, className, containerClass, containerAttrs, labelClass, labelAttrs, ...inputAttrs}) {
    const uniqueId = useId();
    if (inputAttrs.required && !label.endsWith("*")) {
        label = label + " *";
    }
    return (
        <div className={"relative z-0 mt-4 group w-full " + (containerClass || '')} {...(containerAttrs || {})}>
            <label htmlFor={uniqueId} {...(labelAttrs || {})}
                className={"text-sm text-gray-900 " + (labelClass || '')}>
                <input type="checkbox" id={uniqueId} placeholder=" " autoComplete={(inputAttrs || {}).type === "password" ? "no" : "yes"} {...(inputAttrs || {})}
                    className={"text-sm bg-transparent mr-2 border-0 " + (className || '')}/>
                {label}
            </label>
            {error && (
                <p className="mt-0.5 text-xs text-red-500">
                    {getErrorMessage(error)}
                </p>
            )}
        </div>
    );
};
