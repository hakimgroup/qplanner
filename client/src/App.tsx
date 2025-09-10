import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./styles/app.scss";
import { Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import Login from "@/pages/auth/Login";
import { AppRoutes } from "./shared/shared.models";
import Nav from "./components/nav/Nav";
import Dashboard from "./pages/dashboard/Dashboard";

const queryClient = new QueryClient();
export default function App() {
	const { pathname } = useLocation();

	const pages = [
		{
			path: AppRoutes.Home,
			element: <Login />,
		},
		{
			path: AppRoutes.Login,
			element: <Login />,
		},
		{
			path: AppRoutes.Dashboard,
			element: <Dashboard />,
		},
	];

	return (
		<Suspense fallback={null}>
			<QueryClientProvider client={queryClient}>
				<div className="app">
					{![AppRoutes.Home, AppRoutes.Login].includes(
						pathname as AppRoutes
					) && <Nav />}
					<main>
						<Routes>
							{pages.map((pg, i) => (
								<Route
									key={`${pg.path}-${i}`}
									path={pg.path}
									element={pg.element}
								/>
							))}
						</Routes>
					</main>
				</div>
			</QueryClientProvider>
		</Suspense>
	);
}
