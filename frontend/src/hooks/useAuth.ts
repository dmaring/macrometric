/**
 * useAuth hook - re-exports from AuthContext for backwards compatibility.
 */
export { useAuth } from '../contexts/AuthContext';
export default { useAuth: () => require('../contexts/AuthContext').useAuth() };
