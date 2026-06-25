import TasksPage from "./pages/TasksPage";
import SettingsPage from "./pages/SettingsPage";

//React
import { useState } from "react";
import PropTypes from "prop-types";

//Material UI Components
import {
    Box,
    createTheme,
    CssBaseline,
    ThemeProvider,
    StyledEngineProvider,
    Toolbar,
    useMediaQuery,
} from "@mui/material";

//React Router
import { HashRouter, Routes, Route } from "react-router";
import { amber } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import HyperionDrawer from "./components/HyperionDrawer";
import HyperionAppBar from "./components/HyperionAppBar";
import FilesPage from "./pages/FilesPage";

function App({ platform }) {
    const isIOS = platform === "ios";
    const isAndroid = platform === "android";
    const isMobile = isIOS || isAndroid;

    const [isSettingsOpen, setIsSettingsOpen] = useState(
        window.location.hash === "#/Settings",
    );
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    let darkMode = "dark";
    if (!prefersDarkMode) {
        darkMode = "light";
    }

    window.addEventListener("hashchange", () => {
        if (window.location.hash === "#/Settings") {
            setIsSettingsOpen(true);
        } else {
            setIsSettingsOpen(false);
        }
    });

    const drawerWidth = "7rem"; //isMobile ? 0 : "7rem";

    const theme = createTheme({
        palette: {
            mode: darkMode,
            primary: {
                main: amber[900],
                contrastText: "#fff",
            },
            secondary: {
                main: amber["A400"],
            },
        },
    });

    return (
        <Box
            sx={{
                width: "100%",
                overflowX: "hidden",
                overscrollBehaviorX: "none",
            }}
        >
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <CssBaseline enableColorScheme />
                    <SnackbarProvider />
                    <HashRouter>
                        <HyperionAppBar
                            isSettingsOpen={isSettingsOpen}
                            setIsSettingsOpen={setIsSettingsOpen}
                            theme={theme}
                            isMobile={isMobile}
                            toggleDrawer={() => setDrawerOpen(!drawerOpen)}
                            closeDrawer={() => setDrawerOpen(false)}
                        />
                        <HyperionDrawer
                            open={drawerOpen}
                            onClose={() => setDrawerOpen(false)}
                            onOpen={() => setDrawerOpen(true)}
                            isSettingsOpen={isSettingsOpen}
                            setIsSettingsOpen={setIsSettingsOpen}
                            prefersDarkMode={prefersDarkMode}
                            theme={theme}
                            drawerWidth={drawerWidth}
                            isMobile={isMobile}
                            isIOS={isIOS}
                            isAndroid={isAndroid}
                        />

                        <Toolbar
                            variant="dense"
                            sx={{
                                marginBottom: isMobile ? "var(--safe-top)" : 0,
                            }}
                        />
                        <Box
                            sx={{
                                flexGrow: 1,
                                padding: 2,
                                marginLeft: isMobile
                                    ? "1px"
                                    : `calc(${drawerWidth} + 1px)`,
                                marginRight: "1px", // This 1px margin on the right is to allow resizing when a vertical scrollbar is present. Not sure why wails doesn't allow resizing when the scrollbar is present, but this is a workaround to that issue. The 1px margin on the left is to balance.
                                overflow: "auto",
                                height: isMobile
                                    ? "calc(100vh - 3rem - var(--safe-top) - var(--safe-bottom))"
                                    : "calc(100vh - 3rem)",
                                overscrollBehaviorX: "none",
                            }}
                            component="main"
                        >
                            <Routes>
                                <Route
                                    exact
                                    path="/"
                                    element={
                                        <TasksPage
                                            isMobile={isMobile}
                                            isIOS={isIOS}
                                        />
                                    }
                                />
                                <Route
                                    path="/Downloads"
                                    element={
                                        <FilesPage
                                            isIOS={isIOS}
                                            isAndroid={isAndroid}
                                        />
                                    }
                                />
                                <Route
                                    path="/Settings"
                                    element={
                                        <SettingsPage
                                            isSettingsOpen={isSettingsOpen}
                                            setIsSettingsOpen={
                                                setIsSettingsOpen
                                            }
                                            theme={theme}
                                            isMobile={isMobile}
                                            isIOS={isIOS}
                                            isAndroid={isAndroid}
                                        />
                                    }
                                />
                            </Routes>
                        </Box>
                    </HashRouter>
                </ThemeProvider>
            </StyledEngineProvider>
        </Box>
    );
}

App.propTypes = {
    platform: PropTypes.string.isRequired,
};

export default App;
