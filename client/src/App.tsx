// App.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./styles/app.scss";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import Login from "@/pages/auth/Login";
import { AppRoutes } from "./shared/shared.models";
import Nav from "./components/nav/Nav";
import Dashboard from "./pages/dashboard/Dashboard";
import AppProvider from "./shared/AppProvider";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { RequireAuth } from "./shared/RequireAuth";
import { PracticeProvider } from "./shared/PracticeProvider";
import Faqs from "./pages/faqs/Faqs";
import AdminLayout from "./pages/admin/AdminLayout";
import Plans from "./pages/admin/adminPages/plans/Plans";
import PeopleAccess from "./pages/admin/adminPages/people/PeopleAccess";
import RequireAdmin from "./shared/RequireAdmin";
import AdminCampaigns from "./pages/admin/adminPages/campaigns/AdminCampaigns";
import { TierProvider } from "./shared/TierProvider";
import NotificationsCenter from "./pages/notificationsCenter/NotificationsCenter";

ModuleRegistry.registerModules([AllCommunityModule]);
const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export default function App() {
	const { pathname } = useLocation();

	const publicPages = useMemo(
		() => [
			{ path: AppRoutes.Home, element: <Login /> },
			{ path: AppRoutes.Login, element: <Login /> },
		],
		[]
	);

	const privatePages = useMemo(
		() => [
			{
				path: AppRoutes.Dashboard,
				element: <Dashboard />,
			},
			{
				path: AppRoutes.NotificationsCenter,
				element: <NotificationsCenter />,
			},
			{ path: AppRoutes.FAQs, element: <Faqs /> },
		],
		[]
	);

	const isPublicPath = [AppRoutes.Home, AppRoutes.Login].includes(
		pathname as AppRoutes
	);

	return (
		<Suspense fallback={null}>
			<QueryClientProvider client={queryClient}>
				<TierProvider>
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

										{/* Private (simple) */}
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

										{/* Admin (nested) — NOTE the /* */}
										<Route
											path={`${AppRoutes.Admin}/*`} // => "/admin/*"
											element={
												<RequireAuth>
													<RequireAdmin>
														<AdminLayout />
													</RequireAdmin>
												</RequireAuth>
											}
										>
											<Route index element={<Plans />} />{" "}
											<Route
												path={AppRoutes.Plans}
												element={<Plans />}
											/>
											<Route
												path={AppRoutes.Campaigns}
												element={<AdminCampaigns />}
											/>
											<Route
												path={AppRoutes.Bespoke}
												element={<Plans />}
											/>
											<Route
												path={AppRoutes.PeopleAccess}
												element={<PeopleAccess />}
											/>
										</Route>

										{/* Fallback */}
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
				</TierProvider>
			</QueryClientProvider>
		</Suspense>
	);
}
