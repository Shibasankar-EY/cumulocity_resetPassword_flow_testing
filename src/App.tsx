import { useState } from 'react';
import {
	Client,
	BearerAuth,
	FetchClient,
	type IFetchOptions,
} from '@c8y/client';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://dev.hennypenny.com';

let Response: { client: Client | null } = { client: null };

type Decoded = {
	aud: string;
	sub: string;
	nbf: number;
	iss: string;
	xsrfToken: string;
	tci: string;
	exp: number;
	ten: string;
	iat: number;
	jti: string;
	tfa: boolean;
};

const App = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const token = await Client.loginViaOAuthInternal(
			{ user: username, password: password },
			true,
			API_URL
		);
		console.log('token response', token);

		if (token) {
			let auth = new BearerAuth(token);
			Response.client = new Client(auth, API_URL);
			const { data: tenant } = await Response.client.tenant.current();
			Response.client.core.tenant = tenant.name;

			// const decoded: Decoded = jwtDecode(token);

			// const options: IFetchOptions = {
			// 	headers: { 'X-XSRF-TOKEN': decoded.xsrfToken },
			// 	method: 'PUT',
			// };

			// const fetchClient = new FetchClient(API_URL);
			// const result = await fetchClient.fetch(
			// 	`service/hp-commissioning-ms/1.0.0/updateUserRoles?userId=owner_operator_user01@c8y.com&parentUserId=1233@dsfsf.com&groupId=1395404`,
			// 	options
			// );

			// console.log('fetchClient', fetchClient);
			// console.log('fetchClient', result);
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-sm text-center">
				<h2 className="text-3xl font-bold text-blue-600 mb-2">Login</h2>
				<p className="text-gray-500 text-sm mb-6">
					Hey, enter your details to sign in to your account
				</p>

				<form onSubmit={handleLogin} className="space-y-4 text-left">
					<div>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
							placeholder="Enter your username/email"
							required
						/>
					</div>

					<div>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
							placeholder="Enter your password"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
					>
						{loading ? 'Logging in...' : 'Log In'}
					</button>
				</form>

				<p className="text-gray-500 text-sm mt-6">
					Don’t have an account?{' '}
					<a href="#" className="text-blue-600 font-semibold hover:underline">
						Sign up now
					</a>
				</p>
			</div>
		</div>
	);
};

export default App;
