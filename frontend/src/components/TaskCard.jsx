import { useState } from "react";
import PropTypes from "prop-types";

import { Box, ButtonGroup, Card, CardContent, Grid, IconButton, LinearProgress, Modal, Tooltip, Typography } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import PauseIcon from "@mui/icons-material/Pause";
import InfoIcon from "@mui/icons-material/Info";
//import PauseIcon from "@mui/icons-material/Pause";

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
                    <Grid
                        container
                        spacing={4}
                    >
                        <Grid
                            item
                            xs={8}
                        >
                            <Grid
                                container
                                spacing={2}
                                direction={"column"}
                            >
                                <Typography
                                    id="infoModalTitle"
                                    variant="h6"
                                    component="h2"
                                >
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
                        <Grid
                            item
                            xs={4}
                        >
                            <Grid
                                container
                                spacing={2}
                                direction={"column"}
                            >
                                <Typography id="infoModalUrl">{task.url ? "URL: " + task.url : ""}</Typography>
                                <Typography id="infoModalSize">{task.fileSize ? "File Size: " + prettyBytes(task.fileSize) : ""}</Typography>
                                <Typography id="infoModalCreatedAt">{task.createdAt ? "Created At: " + dateformat(task.createdAt, "yyyy-mm-dd HH:MM:ss") : ""}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
            <CardContent
                sx={{
                    width: "100%",
                }}
            >
                <Box
                    display="flex"
                    sx={{
                        width: "100%",
                    }}
                >
                    <Box
                        display="flex"
                        sx={{
                            width: "100%",
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
                                width: `calc(100% -${task.type === "Download" ? "112px" : "64px"} )`,
                            }}
                        >
                            {task.filename || "Task"}
                        </Typography>

                        <Box
                            display="flex"
                            alignItems="right"
                            sx={{
                                ml: "auto",
                                mr: 1,
                                height: "32px",
                                width: "96px",
                            }}
                        >
                            <ButtonGroup
                                variant="contained"
                                aria-label="task buttons"
                            >
                                <Tooltip title="Info">
                                    <IconButton
                                        aria-label="info"
                                        onClick={() => setInfoModalOpen(true)}
                                        sx={{
                                            height: "32px",
                                            width: "32px",
                                        }}
                                    >
                                        <InfoIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Pause">
                                    <IconButton
                                        aria-label="Pause"
                                        onClick={() => {
                                            setPauseButtonLoading(true);
                                            PauseTask(task.uid);
                                        }}
                                        sx={{
                                            height: "32px",
                                            width: "32px",
                                        }}
                                        loading={pauseButtonLoading}
                                    >
                                        <PauseIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                    <IconButton
                                        aria-label="cancel"
                                        onClick={() => {
                                            setCancelButtonLoading(true);
                                            StopTask(task.uid);
                                        }}
                                        sx={{
                                            height: "32px",
                                            width: "32px",
                                        }}
                                        loading={cancelButtonLoading}
                                    >
                                        <CancelIcon />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>
                        </Box>
                    </Box>
                </Box>
                <br />
                <Box
                    display="flex"
                    sx={{
                        width: "100%",
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
