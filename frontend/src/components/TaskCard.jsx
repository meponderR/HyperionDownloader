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
import CancelIcon from "../icons/400/CancelIcon";
import PauseIcon from "../icons/400/PauseIcon";
import InfoIcon from "../icons/400/InfoIcon";

import prettyBytes from "pretty-bytes";
import dateformat from "dateformat";

import { PauseTask, StopTask } from "../../bindings/hyperion-downloader/services/hyperdownloadservice";
import LinearProgressWithLabel from "./LinearProgressWithLabel";

function TaskCard(props) {
    const task = props.task;
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [pauseButtonLoading, setPauseButtonLoading] = useState(false);
    const [cancelButtonLoading, setCancelButtonLoading] = useState(false);

    return (
        <Card sx={{ ...{ minWidth: 275 }, ...props.sx }}>
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
                                    {task.name || "Task"}
                                </Typography>
                                <Typography
                                    id="infoModalTid"
                                    sx={{
                                        color: "text.disabled",
                                        alignSelf: "bottom left",
                                    }}
                                >
                                    {task.uid ? "Task ID: " + task.uid : ""}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={4}>
                            <Grid container spacing={2} direction={"column"}>
                                <Typography
                                    id="infoModalUrl"
                                    sx={{
                                        overflowX: "scroll",
                                        whiteSpace: "nowrap",
                                        width: 1,
                                    }}
                                >
                                    {task.url ? "URL: " + task.url : ""}
                                </Typography>
                                <Typography id="infoModalSize">
                                    {task.fileSize ? "File Size: " + prettyBytes(task.fileSize) : ""}
                                </Typography>
                                <Typography id="infoModalCreatedAt">
                                    {task.createdAt
                                        ? "Created At: " + dateformat(task.createdAt, "yyyy-mm-dd HH:MM:ss")
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
                            {task.filename || "Task"}
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        alignItems="right"
                        sx={{
                            ml: "auto",
                            mr: 1,
                            height: "2rem",
                            width: "6rem",
                        }}
                    >
                        <ButtonGroup variant="contained" aria-label="task buttons">
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
                            <Tooltip title="Pause">
                                <IconButton
                                    aria-label="Pause"
                                    onClick={async () => {
                                        setPauseButtonLoading(true);
                                        try {
                                            await PauseTask(task.uid);
                                        } finally {
                                            setPauseButtonLoading(false);
                                        }
                                    }}
                                    sx={{
                                        height: "2rem",
                                        width: "2rem",
                                    }}
                                    loading={pauseButtonLoading}
                                >
                                    <PauseIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                                <IconButton
                                    aria-label="cancel"
                                    onClick={async () => {
                                        setCancelButtonLoading(true);
                                        try {
                                            await StopTask(task.uid);
                                        } finally {
                                            setCancelButtonLoading(false);
                                        }
                                    }}
                                    sx={{
                                        height: "2rem",
                                        width: "2rem",
                                    }}
                                    loading={cancelButtonLoading}
                                >
                                    <CancelIcon />
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
                        {task.status ? "Status: " : ""}
                        {task.status || ""}
                    </Typography>
                </Box>
                <LinearProgressWithLabel value={task.progress ? task.progress * 100 : 0} />
            </CardContent>
        </Card>
    );
}

TaskCard.propTypes = {
    task: PropTypes.object.isRequired,
    sx: PropTypes.object,
};

export default TaskCard;
