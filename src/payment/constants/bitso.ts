export enum BitsoEnvironments {
  DEV = 'DEV',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
}

export const BITSO_ENDOIINTS = {
  [BitsoEnvironments.DEV]: 'https://dev.bitso.com/api/v3',
  [BitsoEnvironments.STAGING]: 'https://stage.bitso.com/api/v3',
  [BitsoEnvironments.PRODUCTION]: 'https://bitso.com/api/v4',
};
