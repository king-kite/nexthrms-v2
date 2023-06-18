import React from 'react';

import { AuthDataType } from '../../types';

export type AuthContextType = {
	auth: boolean;
	data?: AuthDataType;
	loading: boolean;
	login: (data: AuthDataType) => void;
	logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
	return React.useContext(AuthContext) as AuthContextType;
};

const AuthProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [data, setData] = React.useState<AuthDataType>();
	const [loading, setLoading] = React.useState(true);
	const [auth, setAuth] = React.useState(false);

	const login = React.useCallback((userData: AuthDataType) => {
		setData(userData);
		setLoading(false);
		setAuth(true);
	}, []);

	const logout = React.useCallback(() => {
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
