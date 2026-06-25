import PropTypes from "prop-types";

import {
    AppBar,
    Box,
    Button,
    IconButton,
    Toolbar,
    Typography,
} from "@mui/material";
import RemoveIcon from "../icons/600/RemoveIcon";
import CheckBoxOutlineBlankIcon from "../icons/600/CheckBoxOutlineBlankIcon";
import CloseIcon from "../icons/600/CloseIcon";
import MenuIcon from "../icons/600/MenuIcon";

import { Link } from "react-router";

import {
    Minimise,
    Maximise,
    Close,
} from "../../bindings/hyperion-downloader/services/windowcontrols";

import DownloadIcon from "../icons/600/DownloadIcon";
import TasksAltIcon from "../icons/600/TasksAltIcon";

function HyperionAppBar({
    setIsSettingsOpen,
    toggleDrawer,
    closeDrawer,
    theme,
    isMobile,
}) {
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
                    paddingRight: isMobile ? "var(--safe-right)" : ".75rem",
                    paddingLeft: isMobile ? "var(--safe-left)" : "1rem",
                    paddingTop: isMobile ? "var(--safe-top)" : 0,
                }}
            >
                {isMobile ? (
                    <>
                        <IconButton
                            size="large"
                            edge="start"
                            onClick={toggleDrawer}
                            color="inherit"
                            aria-label="menu"
                            sx={{ ml: 0, borderRadius: 0 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Button
                            variant="text"
                            color="inherit"
                            onClick={toggleDrawer}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    textTransform: "none",
                                }}
                            >
                                Hyperion DL
                            </Typography>
                        </Button>
                    </>
                ) : (
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            textTransform: "none",
                        }}
                    >
                        Hyperion Downloader
                    </Typography>
                )}
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
                    <>
                        <IconButton
                            size="large"
                            aria-label="tasks"
                            component={Link}
                            to="/"
                            color="inherit"
                            style={{
                                "--wails-draggable": "no-drag",
                            }}
                            sx={{
                                borderRadius: 0,
                            }}
                            onClick={() => {
                                if (isMobile) {
                                    closeDrawer();
                                }
                                setIsSettingsOpen(true);
                            }}
                        >
                            <TasksAltIcon />
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="downloads"
                            component={Link}
                            to="/Downloads"
                            color="inherit"
                            style={{
                                "--wails-draggable": "no-drag",
                            }}
                            sx={{
                                borderRadius: 0,
                            }}
                            onClick={() => {
                                if (isMobile) {
                                    closeDrawer();
                                }
                                setIsSettingsOpen(true);
                            }}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

HyperionAppBar.propTypes = {
    setIsSettingsOpen: PropTypes.func.isRequired,
    toggleDrawer: PropTypes.func.isRequired,
    closeDrawer: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    isMobile: PropTypes.bool.isRequired,
};

export default HyperionAppBar;
