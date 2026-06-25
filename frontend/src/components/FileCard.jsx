import { useState } from "react";
import PropTypes from "prop-types";

import {
    Box,
    ButtonGroup,
    Card,
    CardContent,
    Grid,
    IconButton,
    LinearProgress,
    Modal,
    Tooltip,
    Typography,
} from "@mui/material";
import DeleteIcon from "../icons/400/DeleteIcon";
import IosShareIcon from "../icons/400/IosShareIcon";
import ShareIcon from "../icons/400/ShareIcon";
import InfoIcon from "../icons/400/InfoIcon";

import prettyBytes from "pretty-bytes";
import dateformat from "dateformat";

import { PauseTask, StopTask } from "../../bindings/hyperion-downloader/services/hyperdownloadservice";
import LinearProgressWithLabel from "./LinearProgressWithLabel";
import { DeleteFile, ShareFile } from "../../bindings/hyperion-downloader/services/downloadedfilesservice";

function is24HourTime() {
    const options = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions();
    return options.hourCycle === "h23" || options.hourCycle === "h24";
}

function FileCard({ file, sx, isIOS, isAndroid, ...props }) {
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [pauseButtonLoading, setPauseButtonLoading] = useState(false);
    const [cancelButtonLoading, setCancelButtonLoading] = useState(false);

    return (
        <Card sx={{ ...{ minWidth: "16rem" }, ...sx }} {...props}>
            <Modal
                open={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "75%",
                        bgcolor: "background.paper",
                        border: "2px solid #000",
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid item xs={8}>
                            <Grid container spacing={2} direction={"column"}>
                                <Typography id="infoModalTitle" variant="h6" component="h2">
                                    {file.name || "Task"}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={4}>
                            <Grid container spacing={2} direction={"column"}>
                                <Typography
                                    id="infoModalPath"
                                    sx={{
                                        overflowX: "auto",
                                        whiteSpace: "nowrap",
                                        width: 1,
                                    }}
                                >
                                    {file.path
                                        ? "Path: " +
                                          (isIOS
                                              ? `/Hyperion Downloader/Documents/${file.path.split("/Documents/")[1]}`
                                              : file.path)
                                        : ""}
                                </Typography>
                                <Typography id="infoModalSize">
                                    {file.size ? "File Size: " + prettyBytes(file.size) : ""}
                                </Typography>
                                <Typography id="infoModalModifiedAt">
                                    {file.mtime
                                        ? "Modified At: " +
                                          dateformat(
                                              file.mtime * 1000,
                                              is24HourTime() ? "yyyy-mm-dd HH:MM:ss" : "yyyy-mm-dd hh:MM:ss",
                                          )
                                        : ""}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
            <CardContent
                sx={{
                    width: "100%",
                    paddingRight: ".5rem",
                    paddingBottom: "1rem",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        width: "100%",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            width: "calc(100% - 6rem)",
                            flexGrow: 1,
                        }}
                    >
                        <Typography
                            variant="h5"
                            component="h1"
                            // Ensure that the text doesn't overflow the card
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {file.name || "File"}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            ml: "auto",
                            height: "2rem",
                            width: "6rem",
                        }}
                    >
                        <ButtonGroup variant="contained" aria-label="file buttons">
                            <Tooltip title="Info">
                                <IconButton
                                    aria-label="info"
                                    onClick={() => setInfoModalOpen(true)}
                                    sx={{
                                        height: "2rem",
                                        width: "2rem",
                                    }}
                                >
                                    <InfoIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Share">
                                <IconButton
                                    aria-label="share"
                                    onClick={() => ShareFile(file.path)}
                                    sx={{
                                        height: "2rem",
                                        width: "2rem",
                                    }}
                                >
                                    {isIOS ? <IosShareIcon /> : <ShareIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => DeleteFile(file.path)}
                                    sx={{
                                        height: "2rem",
                                        width: "2rem",
                                    }}
                                    loading={cancelButtonLoading}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </ButtonGroup>
                    </Box>
                </Box>
                <Box
                    display="flex"
                    sx={{
                        width: "100%",
                        marginTop: "1rem",
                    }}
                >
                    <Typography>
                        {file.size ? "Size: " : ""}
                        {file.size ? prettyBytes(file.size) : ""}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

FileCard.propTypes = {
    file: PropTypes.shape({
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        size: PropTypes.number,
        mtime: PropTypes.string,
        dir: PropTypes.bool,
    }).isRequired,
    sx: PropTypes.object,
};

export default FileCard;
