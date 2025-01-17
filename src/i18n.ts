// @ts-ignore
import enTranslations from './translations/en.json?raw';

type TranslationData = Record<string, any>;

const translations: Record<string, TranslationData> = {
    en: JSON.parse(enTranslations)
};

let currentLanguage: string = 'en';

export function setLanguage(lang: string) {
    if (!translations[lang]) {
        console.warn(`Translation for language ${lang} not loaded`);
    }
    currentLanguage = lang;
}

export function getLanguage(): string {
    return currentLanguage;
}

function interpolate(template: string, params: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => 
        params[key] !== undefined ? params[key].toString() : `{${key}}`
    );
}

export function t(key: string, params: Record<string, any> = {}): string {
    const translation = translations[currentLanguage];
    const keys = key.split('.');
    
    let value: any = translation;
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key;
        }
    }

    if (typeof value === 'string') {
        return interpolate(value, params);
    }

    return value;
}
