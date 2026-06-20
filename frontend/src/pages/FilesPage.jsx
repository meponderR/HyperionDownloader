//React
import { Fragment, useEffect, useState } from "react";

//Material UI Components
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";

//Material UI Icons
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Events } from "@wailsio/runtime";

import FileCard from "../components/FileCard";
import { DeleteTask, DownloadFile, GetTasks } from "../../bindings/hyperion-downloader/services/hyperdownloadservice";
import { GetOutputDir } from "../../bindings/hyperion-downloader/services/configservice";
import { GetFiles, DeleteFile } from "../../bindings/hyperion-downloader/services/downloadedfilesservice";
import { enqueueSnackbar } from "notistack";
import NumberField from "../components/NumberField";

export default function FilesPage({ isIOS, isAndroid }) {
    const [files, setFiles] = useState([]);

    function refreshFiles() {
        GetOutputDir().then((outputDir) => {
            GetFiles(outputDir).then((files) => {
                setFiles(files);
            });
        });
    }

    useEffect(() => {
        refreshFiles();

        const unsubscribeFileUpdate = Events.On("fileUpdate", () => {
            refreshFiles();
        });

        return () => {
            unsubscribeFileUpdate();
        };
    }, []);

    return (
        <Fragment>
            <Grid
                container
                spacing={0}
                direction="column"
                sx={{
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        textAlign: "center",
                        userSelect: "none",
                    }}
                >
                    Files
                </Typography>
                <Divider
                    sx={{
                        width: "100%",
                    }}
                />

                {files.length == 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.5,
                                userSelect: "none",
                                textAlign: "center",
                                paddingX: 1,
                            }}
                        >
                            <Typography variant="h4">No Files Downloaded</Typography>
                        </Box>
                    </Box>
                ) : (
                    <Grid
                        container
                        spacing={"1rem"}
                        sx={{
                            marginTop: "1rem",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        {(() => {
                            if (files) {
                                if (files.length >= 1) {
                                    // Sort files by modification time with most recent at the top
                                    let sortedFiles = [...files].sort((a, b) => b.MTime - a.MTime);
                                    return sortedFiles.map((file) => (
                                        <Grid
                                            key={file.name}
                                            sx={{
                                                display: "flex",
                                                flexGrow: 1,
                                                maxWidth: "24rem",
                                            }}
                                        >
                                            <FileCard
                                                file={file}
                                                sx={{
                                                    display: "flex",
                                                    flexGrow: 1,
                                                    width: "16rem",
                                                }}
                                                isIOS={isIOS}
                                                isAndroid={isAndroid}
                                            />
                                        </Grid>
                                    ));
                                }
                            }
                        })()}
                    </Grid>
                )}
            </Grid>
            <Fab
                aria-label="add"
                onClick={refreshFiles}
                color="primary"
                variant="extended"
                sx={{
                    position: "fixed",
                    bottom: "calc(1rem + env(safe-area-inset-bottom))",
                    right: "calc(1rem + env(safe-area-inset-right))",
                }}
            >
                <RefreshIcon
                    sx={{
                        mr: 1,
                    }}
                />
                Refresh
            </Fab>
        </Fragment>
    );
}
