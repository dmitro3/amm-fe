import routeConstants from '../constants/routeConstants';
export const authRoutes = [
  routeConstants.SIGN_IN,
  routeConstants.FORGOT_PASSWORD,
  routeConstants.LANDING,
  routeConstants.VERIFY_EMAIL,
  routeConstants.REGISTER,
  routeConstants.NOT_FOUND,
  routeConstants.MAIN_TAIN,
];

export const checkAuthRoute = (route: string): boolean => {
  return !(authRoutes.filter((item) => route.indexOf(item) !== -1).length > 0);
};
