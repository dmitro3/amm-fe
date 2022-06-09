import { UserRole } from 'src/constants';
import { useAppSelector } from 'src/store/hooks';

const FCX_ADMIN = process.env.REACT_APP_FCX_ADMIN || '';

const useReturnUrl = (): string => {
  const userRole = useAppSelector((state) => state.auth.currentUser.role);
  const url = FCX_ADMIN;
  return [UserRole.SuperAdmin, UserRole.Admin].includes(userRole) ? url : '';
};

export default useReturnUrl;
