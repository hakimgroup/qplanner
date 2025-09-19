import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./styles/app.scss";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import Login from "@/pages/auth/Login";
import { AppRoutes } from "./shared/shared.models";
import Nav from "./components/nav/Nav";
import Dashboard from "./pages/dashboard/Dashboard";
import AppProvider from "./shared/AppProvider";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { RequireAuth } from "./shared/RequireAuth";
import { PracticeProvider } from "./shared/PracticeProvider";

ModuleRegistry.registerModules([AllCommunityModule]);
const queryClient = new QueryClient();

export default function App() {
	const { pathname } = useLocation();

	// Public routes only
	const publicPages = [
		{ path: AppRoutes.Home, element: <Login /> }, // swap to <Home /> when you have it
		{ path: AppRoutes.Login, element: <Login /> },
	];

	// Protected routes (must be authenticated)
	const privatePages = [
		{ path: AppRoutes.Dashboard, element: <Dashboard /> },
		// add any other private routes here
	];

	const isPublicPath = [AppRoutes.Home, AppRoutes.Login].includes(
		pathname as AppRoutes
	);

	return (
		<Suspense fallback={null}>
			<QueryClientProvider client={queryClient}>
				<PracticeProvider>
					<AppProvider>
						<div className="app">
							{!isPublicPath && <Nav />}
							<main>
								<Routes>
									{/* Public */}
									{publicPages.map((pg) => (
										<Route
											key={pg.path}
											path={pg.path}
											element={pg.element}
										/>
									))}

									{/* Private */}
									{privatePages.map((pg) => (
										<Route
											key={pg.path}
											path={pg.path}
											element={
												<RequireAuth>
													{pg.element}
												</RequireAuth>
											}
										/>
									))}

									{/* Fallback: unknown routes -> login (or home) */}
									<Route
										path="*"
										element={
											<Navigate
												to={AppRoutes.Login}
												replace
											/>
										}
									/>
								</Routes>
							</main>
						</div>
					</AppProvider>
				</PracticeProvider>
			</QueryClientProvider>
		</Suspense>
	);
}
