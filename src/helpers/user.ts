/* eslint-disable max-len */
import { RegisterInfoError } from 'src/interfaces/user';

export const nameRegex = /^[^@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]*$/;
export const companyNameRegex = /^[^\n]*$/;
export const walletAddressRegex = /^[a-zA-Z0-9]*$/;
export const positionRegex = /^[^\n]*$/;
export const phoneNumberRegex = /^[0-9]*$/;
export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]{8,30}$/;
export const urlRegex = /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;
export const emailRegex =
  /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2}(?:[a-zA-Z]*[a-zA-Z])?$/;

export const isValidEmailFormat = (email: string): boolean => {
  const regex = /^.*@\w+\.\w+.*$/;
  return regex.test(email);
};
export const isOnlyTextAndSpace = (text: string): boolean => {
  const regex = /^[a-zA-Z\s]*$/;
  return regex.test(text);
};
export const isValidCompanyName = (company: string): boolean => {
  const regex = /^[a-zA-Z0-9\s]*$/;
  return regex.test(company);
};
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const regex = /^[0-9]*$/;
  return regex.test(phoneNumber);
};
export const isValidPassword = (password: string): boolean => {
  const regex =
    // eslint-disable-next-line max-len
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]{8,30}$/;
  return regex.test(password);
};
export const isValidWalletAddress = (walletAddress: string): boolean => {
  const regex = /^[a-zA-Z0-9]*$/;
  return regex.test(walletAddress);
};
export const isValidInputUrl = (url: string): boolean => {
  const regex =
    // eslint-disable-next-line max-len
    /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;
  return regex.test(url);
};
export const isValidName = (name: string): boolean => {
  const regex = /^[^@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]*$/;
  return regex.test(name);
};
export const hasError = (error: RegisterInfoError | undefined): boolean => {
  if (!error) return false;
  let hasError = false;
  Object.keys(error).forEach((key: string) => {
    //@ts-ignore
    if (!!error[key].text) hasError = true;
  });
  return hasError;
};
export const replaceMail = (email: string): string => {
  if (email === '') return '';

  const pos = email.split('');
  let i = 2;
  while (pos[i] !== '@') {
    pos[i] = '*';
    i++;
  }
  return pos.join('');
};
