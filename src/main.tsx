import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import App from "./App";
import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./shared/AuthProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<MantineProvider theme={theme}>
				<AuthProvider>
					<App />
					<Toaster
						className="toast"
						position="top-center"
						richColors
						closeButton={false}
						expand={false}
					/>
				</AuthProvider>
			</MantineProvider>
		</BrowserRouter>
	</React.StrictMode>
);
