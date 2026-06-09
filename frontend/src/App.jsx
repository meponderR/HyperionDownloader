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
import { cyan, grey } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import HyperionDrawer from "./components/HyperionDrawer";
import HyperionAppBar from "./components/HyperionAppBar";

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
                main: cyan[500],
                contrastText: "#fff",
            },
            secondary: {
                main: cyan["A400"],
            },
        },
    });

    const classes = {
        root: {
            width: "100%",
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            marginLeft: theme.spacing(7) + 1,
        },
    };

    return (
        <Box sx={classes.root}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <CssBaseline enableColorScheme />
                    <SnackbarProvider />
                    <HashRouter>
                        <HyperionAppBar theme={theme} />
                        <HyperionDrawer
                            isSettingsOpen={isSettingsOpen}
                            setIsSettingsOpen={setIsSettingsOpen}
                            prefersDarkMode={prefersDarkMode}
                            theme={theme}
                        />

                        <Toolbar variant="dense" />
                        <Box
                            sx={{
                                flexGrow: 1,
                                padding: 2,
                                marginLeft: 11,
                                overflow: "auto",
                                height: `calc(100vh - 48px)`,
                            }}
                            component="main"
                        >
                            <Routes>
                                <Route
                                    exact
                                    path="/"
                                    element={<TasksPage />}
                                />
                                <Route
                                    path="/Settings"
                                    element={<SettingsPage />}
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
