import Constants from 'expo-constants';

export const APP_VERSION = `v${Constants.expoConfig?.version || '2.2.14'}`;
export const APP_VERSION_CODE = Constants.expoConfig?.android?.versionCode || 15;
export const APP_NAME = 'Eleições Progressistas';
export const APP_SLOGAN = 'Cheque o passado. Escolha o futuro.';
