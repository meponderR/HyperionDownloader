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
import FilesPage from "./pages/FilesPage";

function App({ platform }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(window.location.hash === "#/Settings");

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    let darkMode = "dark";
    if (!prefersDarkMode) {
        darkMode = "light";
    }

    const isIOS = platform === "ios";
    const isAndroid = platform === "android";
    const isMobile = isIOS || isAndroid;

    const drawerWidth = isMobile ? 0 : "7rem";
    window.platform = platform;
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
            marginLeft: isMobile ? 0 : drawerWidth,
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
                            isMobile={isMobile}
                        />
                        {isMobile ? null : (
                            <HyperionDrawer
                                isSettingsOpen={isSettingsOpen}
                                setIsSettingsOpen={setIsSettingsOpen}
                                prefersDarkMode={prefersDarkMode}
                                theme={theme}
                                drawerWidth={drawerWidth}
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
                                marginLeft: isMobile ? "1px" : `calc(${drawerWidth} + 1px)`,
                                marginRight: "1px", // This 1px margin on the right is to allow resizing when a vertical scrollbar is present. Not sure why wails doesn't allow resizing when the scrollbar is present, but this is a workaround to that issue. The 1px margin on the left is to balance.
                                overflow: "auto",
                                height: isMobile
                                    ? "calc(100vh - 3rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))"
                                    : "calc(100vh - 3rem)",
                                overscrollBehaviorX: "none",
                            }}
                            component="main"
                        >
                            <Routes>
                                <Route exact path="/" element={<TasksPage isMobile={isMobile} />} />
                                <Route path="/Downloads" element={<FilesPage isIOS={isIOS} isAndroid={isAndroid} />} />
                                <Route
                                    path="/Settings"
                                    element={
                                        <SettingsPage
                                            isSettingsOpen={isSettingsOpen}
                                            setIsSettingsOpen={setIsSettingsOpen}
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

export default App;
