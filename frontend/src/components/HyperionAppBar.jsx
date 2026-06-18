import PropTypes from "prop-types";

import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link } from "react-router";

import { Minimise, Maximise, Close } from "../../bindings/hyperion-downloader/services/windowcontrols";

const platform = (() => {
    if (typeof window.wails?.platform === "function") return window.wails.platform(); // Android
    if (window.webkit?.messageHandlers?.external) return "ios";
    return "desktop";
})();

const isIOS = platform === "ios";
const isAndroid = platform === "android";
const isMobile = isIOS || isAndroid;

function HyperionAppBar({ isSettingsOpen, setIsSettingsOpen, theme }) {
    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: theme.zIndex.modal + 1,
            }}
            style={{
                "--wails-draggable": "drag",
                "-webkit-user-select": "none",
                overflow: "hidden",
            }}
            enableColorOnDark
            elevation={16}
        >
            <Toolbar
                variant="dense"
                style={{
                    paddingRight: "12px",
                    paddingTop: isMobile ? "env(safe-area-inset-top)" : 0,
                }}
            >
                <Typography variant="h6" noWrap>
                    Hyperion Downloader
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                {!isMobile ? (
                    <Box sx={{ display: "flex" }}>
                        <IconButton
                            size="large"
                            aria-label="minimize window"
                            onClick={() => Minimise()}
                            color="inherit"
                            style={{
                                "--wails-draggable": "no-drag",
                            }}
                            sx={{
                                borderRadius: 0,
                            }}
                        >
                            <RemoveIcon />
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="maximize window"
                            onClick={() => Maximise()}
                            color="inherit"
                            style={{
                                "--wails-draggable": "no-drag",
                            }}
                            sx={{
                                borderRadius: 0,
                            }}
                        >
                            <CheckBoxOutlineBlankIcon />
                        </IconButton>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="close window"
                            onClick={() => Close()}
                            color="inherit"
                            style={{
                                "--wails-draggable": "no-drag",
                            }}
                            sx={{
                                borderRadius: 0,
                                "&:hover": {
                                    backgroundColor: theme.palette.error.main,
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <IconButton
                        size="large"
                        aria-label="settings"
                        component={Link}
                        to={window.location.hash.includes("Settings") ? "/" : "/Settings"}
                        color="inherit"
                        style={{
                            "--wails-draggable": "no-drag",
                        }}
                        sx={{
                            borderRadius: 0,
                        }}
                        onClick={() => setIsSettingsOpen(!window.location.hash.includes("Settings"))}
                    >
                        <SettingsIcon
                            sx={{
                                transform: isSettingsOpen ? "rotate(150deg)" : "none",
                                transition: "transform 0.5s",
                            }}
                        />
                    </IconButton>
                )}
            </Toolbar>
        </AppBar>
    );
}

HyperionAppBar.propTypes = {
    isSettingsOpen: PropTypes.bool.isRequired,
    setIsSettingsOpen: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
};

export default HyperionAppBar;
