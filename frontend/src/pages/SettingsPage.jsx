//React
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

//Material UI Components
import {
    Grid,
    IconButton,
    TextField,
    Typography,
    InputAdornment,
    Box,
} from "@mui/material";

//Material UI Icons
import SaveIcon from "../icons/400/SaveIcon";
import FolderIcon from "../icons/400/FolderIcon";

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

function SettingsPage({ isMobile = false, isIOS = false }) {
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
                        enqueueSnackbar("Settings saved", {
                            variant: "success",
                        });
                    } catch {
                        enqueueSnackbar("Failed to save settings", {
                            variant: "error",
                        });
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
                    width: "100%",
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
                {!isIOS && (
                    <TextField
                        variant="outlined"
                        sx={{
                            width: 0.8,
                        }}
                        id="outputLocation"
                        label="Default Output Location"
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
                                                const pickFile = await PickDir(
                                                    "Select Output Directory",
                                                );
                                                if (pickFile) {
                                                    setOutputLocation(pickFile);
                                                }
                                            }}
                                            onMouseDown={(event) =>
                                                event.preventDefault()
                                            }
                                            edge="end"
                                            sx={{
                                                height: "2.5rem",
                                                width: "2.5rem",
                                                mr: 0.25,
                                            }}
                                        >
                                            <FolderIcon />
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
                <Grid
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
                </Grid>
            </Grid>
        </form>
    );
}

SettingsPage.propTypes = {
    isMobile: PropTypes.bool,
    isIOS: PropTypes.bool,
};

export default SettingsPage;
