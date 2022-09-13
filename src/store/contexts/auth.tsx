import {
	FC,
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react';

import { AuthDataType } from '../../types';

export type AuthContextType = {
	auth: boolean;
	data?: AuthDataType;
	loading: boolean;
	login: (data: AuthDataType) => void;
	logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
	return useContext(AuthContext) as AuthContextType;
};

const AuthProvider: FC<{
	children: ReactNode;
}> = ({ children }) => {
	const [data, setData] = useState<AuthDataType>();
	const [loading, setLoading] = useState(true);
	const [auth, setAuth] = useState(false);

	const login = useCallback((userData: AuthDataType) => {
		setData(userData);
		setLoading(false);
		setAuth(true);
	}, []);

	const logout = useCallback(() => {
		setLoading(false);
		setAuth(false);
		setData(undefined);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				auth,
				data,
				loading,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
