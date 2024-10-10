import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./styles/app.scss";
import { Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import Login from "@/pages/auth/Login";
import Signup from "./pages/auth/Signup";
import { AppRoutes } from "./shared/shared.models";
import CalendarPlanner from "./pages/calendarPlanner/CalendarPlanner";
import Nav from "./components/nav/Nav";
import Admin from "./pages/admin/Admin";
import Campaigns from "./pages/campaigns/Campaigns";
import Forgot from "./pages/auth/Forgot";
import ResetPassword from "./pages/auth/Reset";

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
			path: AppRoutes.Signup,
			element: <Signup />,
		},
		{
			path: AppRoutes.Forgot,
			element: <Forgot />,
		},
		{
			path: AppRoutes.Reset,
			element: <ResetPassword />,
		},
		{
			path: AppRoutes.Calendar,
			element: <CalendarPlanner />,
		},
		{
			path: `${AppRoutes.Calendar}/:stage`,
			element: <CalendarPlanner />,
		},
		{
			path: `${AppRoutes.Calendar}/:stage/:campaignId`,
			element: <CalendarPlanner />,
		},
		{
			path: AppRoutes.Admin,
			element: <Admin />,
		},
		{
			path: AppRoutes.MyCampaigns,
			element: <Campaigns />,
		},
	];

	return (
		<Suspense fallback={null}>
			<QueryClientProvider client={queryClient}>
				<div className="app">
					{![
						AppRoutes.Home,
						AppRoutes.Login,
						AppRoutes.Signup,
						AppRoutes.Forgot,
						AppRoutes.Reset,
					].includes(pathname as AppRoutes) && <Nav />}
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
