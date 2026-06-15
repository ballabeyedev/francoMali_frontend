import { useContext } from 'react';
import { AuthContext } from '../contexts/authContextObject';
export default function useAuth() {
  return useContext(AuthContext);
}
