import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";

import { Minimise, Maximise, Close } from "../../bindings/hyperion-downloader/services/windowcontrols";

function HyperionAppBar({ theme }) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
                }}
            >
                <Typography
                    variant="h6"
                    noWrap
                >
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
                ) : null}
            </Toolbar>
        </AppBar>
    );
}

HyperionAppBar.propTypes = {};

export default HyperionAppBar;
