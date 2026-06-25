import PropTypes from "prop-types";
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    SwipeableDrawer,
    Toolbar,
} from "@mui/material";
import TaskAltIcon from "../icons/600/TasksAltIcon";
import DownloadIcon from "../icons/600/DownloadIcon";
import SettingsIcon from "../icons/600/SettingsIcon";
import { grey } from "@mui/material/colors";
import { Link } from "react-router";

function HyperionDrawer({
    open,
    onClose,
    onOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    prefersDarkMode,
    theme,
    drawerWidth,
    isMobile,
}) {
    const DrawerVariant = isMobile ? SwipeableDrawer : Drawer;

    return (
        <>
            <DrawerVariant
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
                variant={isMobile ? "temporary" : "permanent"}
                classes={{
                    paper: {
                        width: drawerWidth,
                    },
                }}
                open={open}
                onClose={onClose}
                onOpen={onOpen}
            >
                <Toolbar variant="dense" />
                <Paper
                    sx={{
                        overflow: "auto",
                        height: "100vh",
                        background: prefersDarkMode ? grey[900] : grey[400],
                        display: "flex",
                        flexDirection: "column",
                        paddingTop: "env(safe-area-inset-top)",
                        paddingBottom: "env(safe-area-inset-bottom)",
                    }}
                    elevation={8}
                    square
                >
                    <Box
                        sx={{
                            flexGrow: 1, // This box will grow to push the settings icon to the bottom
                        }}
                    >
                        <List>
                            <ListItemButton
                                key="Tasks"
                                component={Link}
                                to="/"
                                sx={{
                                    alignItems: "center",
                                    height: theme.spacing(10),
                                }}
                                draggable="false"
                                onClick={() => {
                                    setIsSettingsOpen(false);
                                    if (isMobile) {
                                        onClose();
                                    }
                                }}
                            >
                                <Stack
                                    direction="column" // Stack items vertically
                                    alignItems="center" // Center items horizontally in the stack
                                    justifyContent="center" // Center items vertically in the stack
                                    sx={{
                                        width: "100%", // Ensure the stack takes the full width of the ListItemButton
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: "auto", // Remove the default minWidth of ListItemIcon
                                            justifyContent: "center", // Center the icon
                                        }}
                                    >
                                        <TaskAltIcon
                                            sx={{
                                                fontSize: theme.spacing(7),
                                                color: prefersDarkMode
                                                    ? "white"
                                                    : grey[900],
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="TASKS" // Label text
                                        slotProps={{
                                            primary: {
                                                sx: {
                                                    fontSize:
                                                        theme.typography.body1
                                                            .fontSize, // Adjust the font size as needed
                                                    fontWeight:
                                                        theme.typography
                                                            .fontWeightBold, // Adjust the font weight as needed
                                                    color: prefersDarkMode
                                                        ? "white"
                                                        : grey[900],
                                                },
                                            },
                                        }}
                                        sx={{
                                            textAlign: "center", // Center the label text
                                            mt: theme.spacing(0.25), // Adjust the margin top as needed
                                        }}
                                    />
                                </Stack>
                            </ListItemButton>
                            {isMobile && (
                                <ListItemButton
                                    key="Downloads"
                                    component={Link}
                                    to="/Downloads"
                                    sx={{
                                        alignItems: "center",
                                        height: theme.spacing(10),
                                    }}
                                    draggable="false"
                                    onClick={() => {
                                        setIsSettingsOpen(false);
                                        if (isMobile) {
                                            onClose();
                                        }
                                    }}
                                >
                                    <Stack
                                        direction="column" // Stack items vertically
                                        alignItems="center" // Center items horizontally in the stack
                                        justifyContent="center" // Center items vertically in the stack
                                        sx={{
                                            width: "100%", // Ensure the stack takes the full width of the ListItemButton
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: "auto", // Remove the default minWidth of ListItemIcon
                                                justifyContent: "center", // Center the icon
                                            }}
                                        >
                                            <DownloadIcon
                                                sx={{
                                                    fontSize: theme.spacing(7),
                                                    color: prefersDarkMode
                                                        ? "white"
                                                        : grey[900],
                                                }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="DOWNLOADS" // Label text
                                            slotProps={{
                                                primary: {
                                                    sx: {
                                                        fontSize:
                                                            theme.typography
                                                                .body2.fontSize, // Adjust the font size as needed
                                                        fontWeight:
                                                            theme.typography
                                                                .fontWeightBold, // Adjust the font weight as needed
                                                        color: prefersDarkMode
                                                            ? "white"
                                                            : grey[900],
                                                    },
                                                },
                                            }}
                                            sx={{
                                                textAlign: "center", // Center the label text
                                                mt: theme.spacing(0.25), // Adjust the margin top as needed
                                            }}
                                        />
                                    </Stack>
                                </ListItemButton>
                            )}
                        </List>
                    </Box>
                    <List>
                        <ListItemButton
                            key="Settings"
                            component={Link}
                            to="/Settings"
                            sx={{
                                alignItems: "center",
                                height: theme.spacing(10),
                            }}
                            onClick={() => {
                                setIsSettingsOpen(true);
                                if (isMobile) {
                                    onClose();
                                }
                            }}
                            draggable="false"
                        >
                            <Stack
                                direction="column" // Stack items vertically
                                alignItems="center" // Center items horizontally in the stack
                                justifyContent="center" // Center items vertically in the stack
                                sx={{
                                    width: "100%", // Ensure the stack takes the full width of the ListItemButton
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: "auto", // Remove the default minWidth of ListItemIcon
                                        justifyContent: "center", // Center the icon
                                    }}
                                >
                                    <SettingsIcon
                                        // animate the icon when the settings page is open. (rotate 30 degrees like a gear)
                                        sx={{
                                            fontSize: theme.spacing(7),
                                            transform: isSettingsOpen
                                                ? "rotate(150deg)"
                                                : "none",
                                            transition: "transform 0.5s",
                                            color: prefersDarkMode
                                                ? "white"
                                                : grey[900],
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary="SETTINGS" // Label text
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                fontSize:
                                                    theme.typography.body1
                                                        .fontSize, // Adjust the font size as needed
                                                fontWeight:
                                                    theme.typography
                                                        .fontWeightBold, // Adjust the font weight as needed
                                                color: prefersDarkMode
                                                    ? "white"
                                                    : grey[900],
                                            },
                                        },
                                    }}
                                    sx={{
                                        textAlign: "center", // Center the label text
                                        mt: theme.spacing(0.25), // Adjust the margin top as needed
                                    }}
                                />
                            </Stack>
                        </ListItemButton>
                    </List>
                </Paper>
            </DrawerVariant>
        </>
    );
}

HyperionDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    isSettingsOpen: PropTypes.bool.isRequired,
    setIsSettingsOpen: PropTypes.func.isRequired,
    prefersDarkMode: PropTypes.bool.isRequired,
    theme: PropTypes.object.isRequired,
    drawerWidth: PropTypes.string.isRequired,
    isMobile: PropTypes.bool.isRequired,
};

export default HyperionDrawer;
