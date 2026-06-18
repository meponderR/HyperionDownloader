//React
import { useEffect, useState } from "react";

//Material UI Components
import {
    Switch,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    TextField,
    Typography,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Button,
} from "@mui/material";

//Material UI Icons
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

//Bindings
import {
    GetDefaultCookie,
    GetDefaultUserAgent,
    GetOutputDir,
    SetDefaultCookie,
    SetDefaultUserAgent,
    SetOutputDir,
    PickDir,
} from "../../bindings/hyperion-downloader/services/configservice";

//Utils
import { enqueueSnackbar } from "notistack";
import { Link } from "react-router";

const platform = (() => {
    if (typeof window.wails?.platform === "function") return window.wails.platform(); // Android
    if (window.webkit?.messageHandlers?.external) return "ios";
    return "desktop";
})();

const isIOS = platform === "ios";
const isAndroid = platform === "android";
const isMobile = isIOS || isAndroid;

export default function SettingsPage({ isSettingsOpen, setIsSettingsOpen, theme }) {
    // Download
    const [outputLocation, setOutputLocation] = useState("");
    const [defaultCookie, setDefaultCookie] = useState("");
    const [defaultUserAgent, setDefaultUserAgent] = useState("");

    useEffect(() => {
        GetOutputDir().then((outputDir) => {
            setOutputLocation(outputDir);
        });
        GetDefaultCookie().then((cookie) => {
            setDefaultCookie(cookie);
        });
        GetDefaultUserAgent().then((userAgent) => {
            setDefaultUserAgent(userAgent);
        });
    }, []);

    return (
        <form
            style={{
                display: "flex",
                width: "100%",
                height: "100%",
            }}
            noValidate
            autoComplete="off"
            onSubmit={(event) => {
                event.preventDefault();
                (async function () {
                    try {
                        if (!isMobile) {
                            await SetOutputDir(outputLocation);
                        }
                        await SetDefaultCookie(defaultCookie);
                        await SetDefaultUserAgent(defaultUserAgent);
                        enqueueSnackbar("Settings saved", { variant: "success" });
                    } catch (error) {
                        enqueueSnackbar("Failed to save settings", { variant: "error" });
                    }
                })();
            }}
        >
            <Grid
                container
                spacing={0}
                alignItems="center"
                justifyContent="center"
                direction="column"
                sx={{
                    flexGrow: 1,
                    textAlign: "center",
                    alignContent: "center",
                }}
            >
                <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                        mb: 4,
                        userSelect: "none",
                    }}
                >
                    Settings
                </Typography>
                {isMobile ? (
                    <Button
                        variant="contained"
                        sx={{ mb: 4 }}
                        onClick={() => {
                            setIsSettingsOpen(false);
                            window.location.hash = "/";
                        }}
                    >
                        Return to Home
                    </Button>
                ) : null}

                {isMobile ? null : (
                    <TextField
                        variant="outlined"
                        sx={{
                            width: 0.8,
                        }}
                        id="outputLocation"
                        label="Default Download Output Location"
                        onChange={(event) => {
                            setOutputLocation(event.target.value);
                        }}
                        value={outputLocation}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="pick file"
                                            onClick={async () => {
                                                const pickFile = await PickDir("Select Output Directory");
                                                if (pickFile) {
                                                    setOutputLocation(pickFile);
                                                }
                                            }}
                                            onMouseDown={(event) => event.preventDefault()}
                                            edge="end"
                                            sx={{
                                                height: "40px",
                                                width: "40px",
                                                mr: 0.25,
                                            }}
                                        >
                                            <FolderOpenIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                )}
                <TextField
                    variant="outlined"
                    sx={{
                        width: 0.8,
                        mt: 2,
                    }}
                    id="defaultUserAgent"
                    label="Default User Agent"
                    onChange={(event) => {
                        setDefaultUserAgent(event.target.value);
                    }}
                    value={defaultUserAgent}
                />
                <TextField
                    variant="outlined"
                    sx={{
                        width: 0.8,
                        mt: 2,
                    }}
                    id="defaultCookie"
                    label="Default Cookie"
                    onChange={(event) => {
                        setDefaultCookie(event.target.value);
                    }}
                    value={defaultCookie}
                />
                <Box
                    display="flex"
                    sx={{
                        flexGrow: 1,
                    }}
                />
                <Box
                    display="flex"
                    sx={{
                        width: "80%",
                        mt: 2,
                    }}
                >
                    <IconButton
                        align="center"
                        sx={{
                            width: 96,
                            height: 96,
                        }}
                        size="small"
                        type="submit"
                    >
                        <SaveIcon
                            sx={{
                                fontSize: 72,
                            }}
                        />
                    </IconButton>
                </Box>
            </Grid>
        </form>
    );
}
