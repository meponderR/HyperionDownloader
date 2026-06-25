//React
import { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";

//Material UI Components
import { Box, Divider, Fab, Grid, Typography } from "@mui/material";

//Material UI Icons
import RefreshIcon from "../icons/600/RefreshIcon";

import { Events } from "@wailsio/runtime";

import FileCard from "../components/FileCard";
import { GetOutputDir } from "../../bindings/hyperion-downloader/services/configservice";
import { GetFiles } from "../../bindings/hyperion-downloader/services/downloadedfilesservice";
import { closeSnackbar, enqueueSnackbar } from "notistack";

function FilesPage({ isIOS = false, isAndroid = false }) {
    const [files, setFiles] = useState([]);

    async function refreshFiles() {
        const loadingSnackbar = enqueueSnackbar("Loading files...", {
            variant: "info",
            persist: true,
        });
        try {
            const outputDir = await GetOutputDir();
            const fileList = await GetFiles(outputDir);
            // Sort files by modification time with most recent at the top
            const sortedFileList = [...fileList].sort(
                (a, b) => b.MTime - a.MTime,
            );

            setFiles(sortedFileList);
        } catch {
            enqueueSnackbar("Error occurred while loading files.", {
                variant: "error",
            });
        } finally {
            closeSnackbar(loadingSnackbar);
        }
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
                                width: "100%",
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
                            <Typography variant="h4">
                                No Files Downloaded
                            </Typography>
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
                            width: 1,
                        }}
                    >
                        {(() => {
                            if (files) {
                                if (files.length >= 1) {
                                    // Sort files by modification time with most recent at the top
                                    return files.map((file) => (
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
                    bottom: "calc(1rem + var(--safe-bottom))",
                    right: "calc(1rem + var(--safe-right))",
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

FilesPage.propTypes = {
    isIOS: PropTypes.bool,
    isAndroid: PropTypes.bool,
};

export default FilesPage;
