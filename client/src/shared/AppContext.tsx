/* AppContext.tsx */
import { createContext } from "react";
import { AppState } from "../models/general.models";

/* interface only holds the *shape* */
export interface AppContextModel {
	state: AppState | null;
	setState: React.Dispatch<React.SetStateAction<AppState | null>>;
}

/* this is the *value* React needs at runtime */
export const AppContext = createContext<AppContextModel>({
	state: null,
	setState: () => {},
});

/* keep a default export if you prefer */
export default AppContext;
