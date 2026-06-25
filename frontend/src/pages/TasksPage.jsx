//React
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

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
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

//Material UI Icons
import AddTaskIcon from "../icons/400/AddTaskIcon";
import FolderIcon from "../icons/400/FolderIcon";
import ContentPasteIcon from "../icons/600/ContentPasteIcon";
import KeyboardArrowDownIcon from "../icons/400/KeyboardArrowDownIcon";

import { Clipboard, Events } from "@wailsio/runtime";

import TaskCard from "../components/TaskCard";
import {
    DeleteTask,
    DownloadFile,
    GetTasks,
} from "../../bindings/hyperion-downloader/services/hyperdownload/hyperdownloadservice";
import {
    GetCacheDir,
    GetDefaultCookie,
    GetDefaultUserAgent,
    GetOutputDir,
    PickDir,
} from "../../bindings/hyperion-downloader/services/config/configservice";
import { enqueueSnackbar } from "notistack";
import NumberField from "../components/NumberField";

function TasksPage({ isMobile, isIOS }) {
    const [tasks, setTasks] = useState([]);
    const [taskAddDialogOpen, setTaskAddDialogOpen] = useState(false);

    // Tab: Download
    const [downloadURL, setDownloadURL] = useState("");
    const [downloadPath, setDownloadPath] = useState("");

    // Advanced Options
    const [concurrentDownloads, setConcurrentDownloads] = useState(64);
    const [targetPartSize, setTargetPartSize] = useState(4); // 64*4 = 256 MiB
    const [cookies, setCookies] = useState("");
    const [userAgent, setUserAgent] = useState("");
    const [referer, setReferer] = useState("");
    const [authorizationHeader, setAuthorizationHeader] = useState("");

    const [defaultDownloadPath, setDefaultDownloadPath] = useState("");
    const [defaultCookies, setDefaultCookies] = useState("");
    const [defaultUserAgent, setDefaultUserAgent] = useState("");

    // Error Dialog
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorFilename, setErrorFilename] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        GetTasks().then((tasks) => {
            setTasks(tasks);
        });

        GetOutputDir().then((outputDir) => {
            setDownloadPath(outputDir);
            setDefaultDownloadPath(outputDir);
        });
        GetDefaultCookie().then((cookie) => {
            setCookies(cookie);
            setDefaultCookies(cookie);
        });
        GetDefaultUserAgent().then((userAgent) => {
            setUserAgent(userAgent);
            setDefaultUserAgent(userAgent);
        });

        const unsubscribeTasks = Events.On("tasksSnapshot", (tasksSnapshot) => {
            setTasks(tasksSnapshot.data.tasks);
            console.log("Received tasks snapshot:", tasksSnapshot.data.tasks);
        });

        const unsubscribeDownload = Events.On("downloadCompleted", (task) => {
            enqueueSnackbar(`Download completed: ${task.data.filename}`, {
                variant: "success",
            });
            DeleteTask(task.uid);
        });

        const unsubscribeDownloadError = Events.On("downloadError", (err) => {
            setErrorDialogOpen(true);
            setErrorFilename(err.data.filename);
            setErrorMessage(`Download error: ${err.data.error}`);
            DeleteTask(err.data.uid);
        });

        return () => {
            unsubscribeTasks();
            unsubscribeDownload();
            unsubscribeDownloadError();
        };
    }, []);

    //window.ipcHyperion.getTasks();

    async function handleDownload() {
        // Split the download text area by newlines to support multiple downloads at once
        const urls = downloadURL
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => url.length > 0);
        // Execute downloads in parallel and wait for all of them to complete
        await Promise.all(
            urls.map(async (url) => {
                await handleSingleDownload(url);
            }),
        );

        setDownloadURL("");
        setDownloadPath(defaultDownloadPath);
        setConcurrentDownloads(32);
        setTargetPartSize(4);
        setCookies(defaultCookies);
        setUserAgent(defaultUserAgent);
        setReferer("");
        setAuthorizationHeader("");
    }

    async function sha256(str) {
        const utf8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        return hashHex;
    }

    async function handleSingleDownload(downloadURL) {
        const cacheDir = await GetCacheDir();
        // Hash url to create unique temp folder that is resumable across app restarts. Use sha256 for uniqueness since the url can be long and we just need a unique identifier for the temp folder. Trim the hash to get a string representation that can be used as a folder name.
        const urlHash = (await sha256(downloadURL)).slice(0, 12);

        const tempDir = `${cacheDir}/Temp/${urlHash}`;
        await DownloadFile(
            downloadURL,
            downloadPath,
            tempDir,
            parseInt(concurrentDownloads),
            parseInt(targetPartSize * 1024 * 1024),
            {
                Cookies: cookies,
                UserAgent: userAgent,
                Referer: referer,
                AuthorizationHeader: authorizationHeader,
            },
        );
    }

    return (
        <div>
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
                    Tasks
                </Typography>
                <Dialog
                    open={taskAddDialogOpen}
                    onClose={() => setTaskAddDialogOpen(false)}
                    fullWidth
                >
                    <DialogTitle
                        sx={{
                            userSelect: "none",
                        }}
                    >
                        Add Task
                    </DialogTitle>

                    <DialogContent>
                        <Box sx={{ width: "100%" }}>
                            <Grid
                                container
                                spacing={1}
                                alignItems="center"
                                justifyContent="center"
                                sx={{
                                    width: 1,
                                }}
                            >
                                <FormControl
                                    fullWidth
                                    sx={{
                                        marginY: 1,
                                    }}
                                >
                                    <TextField
                                        variant="filled"
                                        id="downloadURLInput"
                                        label="URL"
                                        type="url"
                                        fullWidth
                                        multiline
                                        value={downloadURL}
                                        onChange={(event) =>
                                            setDownloadURL(event.target.value)
                                        }
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title="Paste">
                                                            <IconButton
                                                                aria-label="paste"
                                                                onClick={() => {
                                                                    Clipboard.Text().then(
                                                                        (
                                                                            text,
                                                                        ) => {
                                                                            setDownloadURL(
                                                                                (
                                                                                    prev,
                                                                                ) =>
                                                                                    prev +
                                                                                    text,
                                                                            );
                                                                        },
                                                                    );
                                                                }}
                                                                edge="end"
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    mr: 0.5,
                                                                }}
                                                            >
                                                                <ContentPasteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </FormControl>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        marginBottom: 1,
                                    }}
                                >
                                    {isIOS ? null : (
                                        <TextField
                                            variant="filled"
                                            id="outputLocationInput"
                                            label="Output Location"
                                            value={downloadPath}
                                            onChange={(event) => {
                                                setDownloadPath(
                                                    event.target.value,
                                                );
                                            }}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Tooltip title="Pick Directory">
                                                                <IconButton
                                                                    aria-label="pick file"
                                                                    onClick={async () => {
                                                                        const pickFile =
                                                                            await PickDir(
                                                                                "Select Output Directory",
                                                                            );
                                                                        if (
                                                                            pickFile
                                                                        ) {
                                                                            setDownloadPath(
                                                                                pickFile,
                                                                            );
                                                                        }
                                                                    }}
                                                                    onMouseDown={(
                                                                        event,
                                                                    ) =>
                                                                        event.preventDefault()
                                                                    }
                                                                    edge="end"
                                                                    sx={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        mr: 0.5,
                                                                    }}
                                                                >
                                                                    <FolderIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                </FormControl>
                                {/* Additional includes: Concurrent Downloads, Max Part Size, Cookies, UserAgent, Referer, AuthorizationHeader */}
                                <Accordion
                                    sx={{
                                        width: "100%",
                                        boxShadow: 0,
                                    }}
                                    elevation={16}
                                >
                                    <AccordionSummary
                                        expandIcon={<KeyboardArrowDownIcon />}
                                        aria-controls="advanced-options-content"
                                        id="advanced-options-header"
                                    >
                                        <Typography>
                                            Advanced Options
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails
                                        sx={{
                                            maxHeight:
                                                0.18 * window.innerHeight,
                                            overflowY: "scroll",
                                        }}
                                    >
                                        {isMobile ? (
                                            <>
                                                <FormControl
                                                    sx={{
                                                        marginBottom: 1,
                                                        flexGrow: 1,
                                                    }}
                                                    fullWidth
                                                >
                                                    <NumberField
                                                        variant="filled"
                                                        id="concurrentDownloadsInput"
                                                        label="Concurrent Downloads"
                                                        value={
                                                            concurrentDownloads
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            setConcurrentDownloads(
                                                                value,
                                                            );
                                                        }}
                                                        min={1}
                                                    />
                                                </FormControl>
                                                <FormControl
                                                    sx={{
                                                        marginBottom: 1,
                                                        flexGrow: 1,
                                                    }}
                                                    fullWidth
                                                >
                                                    <NumberField
                                                        variant="filled"
                                                        id="targetPartSizeInput"
                                                        label="Max Part Size"
                                                        value={targetPartSize}
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            setTargetPartSize(
                                                                value,
                                                            );
                                                        }}
                                                        min={0.5}
                                                        step={0.5}
                                                        endAdornment="MiB"
                                                    />
                                                </FormControl>
                                            </>
                                        ) : (
                                            <Grid
                                                display="flex"
                                                container
                                                spacing={1}
                                                direction="row"
                                                sx={{
                                                    width: 1,
                                                    flexWrap: "nowrap",
                                                }}
                                            >
                                                <FormControl
                                                    sx={{
                                                        marginBottom: 1,
                                                        flexGrow: 1,
                                                    }}
                                                >
                                                    <NumberField
                                                        variant="filled"
                                                        id="concurrentDownloadsInput"
                                                        label="Concurrent Downloads"
                                                        value={
                                                            concurrentDownloads
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            setConcurrentDownloads(
                                                                value,
                                                            );
                                                        }}
                                                        min={1}
                                                    />
                                                </FormControl>
                                                <FormControl
                                                    sx={{
                                                        marginBottom: 1,
                                                        flexGrow: 1,
                                                    }}
                                                >
                                                    <NumberField
                                                        variant="filled"
                                                        id="targetPartSizeInput"
                                                        label="Max Part Size"
                                                        value={targetPartSize}
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            setTargetPartSize(
                                                                value,
                                                            );
                                                        }}
                                                        min={0.5}
                                                        step={0.5}
                                                        endAdornment="MiB"
                                                    />
                                                </FormControl>
                                            </Grid>
                                        )}
                                        <FormControl
                                            sx={{
                                                marginBottom: 1,
                                                flexGrow: 1,
                                            }}
                                            fullWidth
                                        >
                                            <TextField
                                                variant="filled"
                                                id="cookiesInput"
                                                label="Cookies"
                                                value={cookies}
                                                onChange={(event) =>
                                                    setCookies(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormControl
                                            sx={{
                                                marginBottom: 1,
                                                flexGrow: 1,
                                            }}
                                            fullWidth
                                        >
                                            <TextField
                                                variant="filled"
                                                id="userAgentInput"
                                                label="User Agent"
                                                value={userAgent}
                                                onChange={(event) =>
                                                    setUserAgent(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormControl
                                            sx={{
                                                marginBottom: 1,
                                                flexGrow: 1,
                                            }}
                                            fullWidth
                                        >
                                            <TextField
                                                variant="filled"
                                                id="refererInput"
                                                label="Referer"
                                                value={referer}
                                                onChange={(event) =>
                                                    setReferer(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormControl
                                            sx={{
                                                marginBottom: 1,
                                                flexGrow: 1,
                                            }}
                                            fullWidth
                                        >
                                            <TextField
                                                variant="filled"
                                                id="authorizationHeaderInput"
                                                label="Authorization Header"
                                                value={authorizationHeader}
                                                onChange={(event) =>
                                                    setAuthorizationHeader(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTaskAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setTaskAddDialogOpen(false);
                                handleDownload();
                            }}
                        >
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={errorDialogOpen}>
                    <DialogTitle>Error {errorFilename}</DialogTitle>
                    <DialogContent>
                        <Typography>{errorMessage}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setErrorDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                <Divider
                    sx={{
                        width: "100%",
                    }}
                />
                <Box
                    display="flex"
                    sx={{
                        margin: 1,
                        width: 0.8,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {tasks.length == 0 ? (
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
                                <IconButton
                                    aria-label="add task"
                                    onClick={() => setTaskAddDialogOpen(true)}
                                    edge="end"
                                    sx={{
                                        height: "3rem",
                                        width: "3rem",
                                    }}
                                >
                                    <AddTaskIcon sx={{ fontSize: "4rem" }} />
                                </IconButton>
                                <Typography variant="h4">
                                    No Active Tasks
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Grid
                            display="flex"
                            container
                            spacing={1}
                            alignItems="center"
                            justifyContent="center"
                        >
                            {(() => {
                                if (tasks) {
                                    if (tasks.length >= 1) {
                                        // Sort tasks by created time with most recent at the top
                                        const sortedTasks = [...tasks].sort(
                                            (a, b) => b.createdAt - a.createdAt,
                                        );
                                        return sortedTasks.map((task) => (
                                            <TaskCard
                                                key={task.uid}
                                                task={task}
                                                sx={{
                                                    display: "flex",
                                                    flexGrow: 1,
                                                    marginY: 1,
                                                    width: isMobile ? 1 : 0.8,
                                                }}
                                            />
                                        ));
                                    }
                                }
                            })()}
                        </Grid>
                    )}
                </Box>
            </Grid>
            <Fab
                aria-label="add"
                onClick={() => setTaskAddDialogOpen(true)}
                color="primary"
                variant="extended"
                sx={{
                    position: "fixed",
                    bottom: "calc(1rem + var(--safe-bottom))",
                    right: "calc(1rem + var(--safe-right))",
                }}
            >
                <AddTaskIcon
                    sx={{
                        mr: 1,
                    }}
                />
                Add Task
            </Fab>
        </div>
    );
}

TasksPage.propTypes = {
    isMobile: PropTypes.bool.isRequired,
    isIOS: PropTypes.bool.isRequired,
};

export default TasksPage;
