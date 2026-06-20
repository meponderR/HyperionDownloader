import PropTypes from "prop-types";

import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";

import { Link } from "react-router";

import { Minimise, Maximise, Close } from "../../bindings/hyperion-downloader/services/windowcontrols";

function HyperionAppBar({ isSettingsOpen, setIsSettingsOpen, theme, isMobile }) {
    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: theme.zIndex.modal + 1,
                paddingX: "1px",
                paddingTop: "1px",
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
                    paddingRight: 0,
                    paddingLeft: isMobile ? 0 : theme.spacing(2),
                    paddingTop: isMobile ? "env(safe-area-inset-top)" : 0,
                }}
            >
                {isMobile ? (
                    <IconButton
                        size="large"
                        edge="start"
                        component={Link}
                        to="/"
                        color="inherit"
                        aria-label="home"
                        sx={{ ml: 0 }}
                    >
                        <HomeIcon />
                    </IconButton>
                ) : null}
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                    <Typography variant="h6" noWrap>
                        {isMobile ? "Hyperion DL" : "Hyperion Downloader"}
                    </Typography>
                </Link>
                <Box sx={{ flexGrow: 1 }} />

                {isMobile ? (
                    <Button
                        sx={{
                            fontWeight: "bold",
                        }}
                        color="inherit"
                        component={Link}
                        to="/Downloads"
                    >
                        Downloads
                    </Button>
                ) : null}
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
                        to="/Settings"
                        color="inherit"
                        style={{
                            "--wails-draggable": "no-drag",
                        }}
                        sx={{
                            borderRadius: 0,
                        }}
                        //onClick={() => setIsSettingsOpen(true)}
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
    isMobile: PropTypes.bool.isRequired,
};

export default HyperionAppBar;
