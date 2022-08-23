import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const theme = extendTheme({
	fonts: {
		heading: `"Inter", sans-serif`,
		body: `"Inter", sans-serif`,
	},
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ChakraProvider theme={theme}>
			<App />
		</ChakraProvider>
	</React.StrictMode>,
);
