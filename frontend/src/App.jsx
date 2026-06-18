import TasksPage from "./pages/TasksPage";
import SettingsPage from "./pages/SettingsPage";

//React
import { useState, Fragment } from "react";

//Material UI Components
import {
    AppBar,
    Box,
    createTheme,
    CssBaseline,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ThemeProvider,
    StyledEngineProvider,
    Toolbar,
    Typography,
    useMediaQuery,
    Paper,
    IconButton,
    Tooltip,
    Stack,
} from "@mui/material";

//Material UI Icons
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SettingsIcon from "@mui/icons-material/Settings";

//React Router
import { HashRouter, Routes, Route, Link } from "react-router";
import { amber, grey } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import HyperionDrawer from "./components/HyperionDrawer";
import HyperionAppBar from "./components/HyperionAppBar";

const platform = (() => {
    if (typeof window.wails?.platform === "function") return window.wails.platform(); // Android
    if (window.webkit?.messageHandlers?.external) return "ios";
    return "desktop";
})();

const isIOS = platform === "ios";
const isAndroid = platform === "android";
const isMobile = isIOS || isAndroid;

function App() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(window.location.hash === "#/Settings");

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    let darkMode = "dark";
    if (!prefersDarkMode) {
        darkMode = "light";
    }

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

    const classes = {
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            marginLeft: isMobile ? 0 : theme.spacing(7) + 1,
        },
    };

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
                        />
                        {isMobile ? null : (
                            <HyperionDrawer
                                isSettingsOpen={isSettingsOpen}
                                setIsSettingsOpen={setIsSettingsOpen}
                                prefersDarkMode={prefersDarkMode}
                                theme={theme}
                            />
                        )}

                        <Toolbar
                            variant="dense"
                            sx={{
                                marginBottom: isMobile ? "env(safe-area-inset-top)" : 0,
                            }}
                        />
                        <Box
                            sx={{
                                flexGrow: 1,
                                padding: 2,
                                marginLeft: isMobile ? 0 : 11,
                                overflow: "auto",
                                height: isMobile
                                    ? "calc(100vh - 48px - env(safe-area-inset-top)-env(safe-area-inset-bottom))"
                                    : "calc(100vh - 48px)",
                                overscrollBehaviorX: "none",
                            }}
                            component="main"
                        >
                            <Routes>
                                <Route exact path="/" element={<TasksPage />} />
                                <Route
                                    path="/Settings"
                                    element={
                                        <SettingsPage
                                            isSettingsOpen={isSettingsOpen}
                                            setIsSettingsOpen={setIsSettingsOpen}
                                            theme={theme}
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

export default App;
