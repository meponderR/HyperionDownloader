//React
import { useEffect, useState } from "react";

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
import AddTaskIcon from "@mui/icons-material/AddTask";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import shajs from "sha.js";
import { Events } from "@wailsio/runtime";

import TaskCard from "../components/TaskCard";
import { DeleteTask, DownloadFile, GetTasks } from "../../bindings/hyperion-downloader/services/hyperdownloadservice";
import { GetAppDataDir, GetCacheDir, GetDefaultCookie, GetDefaultUserAgent, GetOutputDir, PickDir } from "../../bindings/hyperion-downloader/services/configservice";
import { enqueueSnackbar } from "notistack";
import NumberField from "../components/NumberField";

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [taskAddDialogOpen, setTaskAddDialogOpen] = useState(false);

    // Tab: Download
    const [downloadURL, setDownloadURL] = useState("");
    const [downloadPath, setDownloadPath] = useState("");

    // Advanced Options
    const [concurrentDownloads, setConcurrentDownloads] = useState(32);
    const [targetPartSize, setTargetPartSize] = useState(12); // 12 MiB
    const [cookies, setCookies] = useState("");
    const [userAgent, setUserAgent] = useState("");
    const [referer, setReferer] = useState("");
    const [authorizationHeader, setAuthorizationHeader] = useState("");

    let defaultDownloadPath,
        defaultCookies,
        defaultUserAgent = "";

    // Error Dialog
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorFilename, setErrorFilename] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        GetTasks().then((tasks) => {
            setTasks(tasks);
        });

        GetOutputDir().then((outputDir) => {
            defaultDownloadPath = outputDir;
            setDownloadPath(outputDir);
        });
        GetDefaultCookie().then((cookie) => {
            setCookies(cookie);
            defaultCookies = cookie;
        });
        GetDefaultUserAgent().then((userAgent) => {
            setUserAgent(userAgent);
            defaultUserAgent = userAgent;
        });

        const unsubscribeTasks = Events.On("tasksSnapshot", (tasksSnapshot) => {
            setTasks(tasksSnapshot.data.tasks);
        });

        const unsubscribeDownload = Events.On("downloadCompleted", (task) => {
            enqueueSnackbar(`Download completed: ${task.data.filename}`, {
                variant: "success",
            });
            deleteTask(task.uid);
        });

        const unsubscribeDownloadError = Events.On("downloadError", (err) => {
            setErrorDialogOpen(true);
            setErrorFilename(err.data.filename);
            setErrorMessage(`Download error: ${err.data.error}`);
            deleteTask(err.data.uid);
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
            })
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

    async function handleSingleDownload(downloadURL) {
        const cacheDir = await GetCacheDir();
        // Hash url to create unique temp folder that is resumable across app restarts. Use crc32 for speed since the url can be long and we just need a unique identifier for the temp folder. Base64 encode the hash to get a string representation that can be used as a folder name.
        const urlHash = shajs("sha256").update(downloadURL).digest("base64");
        const tempDir = `${cacheDir}/Temp/${urlHash}`;
        await DownloadFile(downloadURL, downloadPath, tempDir, parseInt(concurrentDownloads), parseInt(targetPartSize * 1024 * 1024), {
            Cookies: cookies,
            UserAgent: userAgent,
            Referer: referer,
            AuthorizationHeader: authorizationHeader,
        });
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
                                direction="column"
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
                                        onChange={(event) => setDownloadURL(event.target.value)}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <IconButton
                                                        aria-label="paste"
                                                        onClick={() => {
                                                            navigator.clipboard.readText().then((text) => {
                                                                setDownloadURL(text);
                                                            });
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
                                    <TextField
                                        variant="filled"
                                        id="outputLocationInput"
                                        label="Output Location"
                                        value={downloadPath}
                                        onChange={(event) => {
                                            setDownloadPath(event.target.value);
                                        }}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="pick file"
                                                            onClick={async () => {
                                                                const pickFile = await PickDir("Select Output Directory");
                                                                if (pickFile) {
                                                                    setDownloadPath(pickFile);
                                                                }
                                                            }}
                                                            onMouseDown={(event) => event.preventDefault()}
                                                            edge="end"
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                mr: 0.5,
                                                            }}
                                                        >
                                                            <FolderOpenIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
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
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="advanced-options-content"
                                        id="advanced-options-header"
                                    >
                                        <Typography>Advanced Options</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
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
                                                    value={concurrentDownloads}
                                                    onValueChange={(value) => {
                                                        setConcurrentDownloads(value);
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
                                                    onValueChange={(value) => {
                                                        setTargetPartSize(value);
                                                    }}
                                                    min={0.5}
                                                    step={0.5}
                                                    endAdornment="MiB"
                                                />
                                            </FormControl>
                                        </Grid>
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
                                                onChange={(event) => setCookies(event.target.value)}
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
                                                onChange={(event) => setUserAgent(event.target.value)}
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
                                                onChange={(event) => setReferer(event.target.value)}
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
                                                onChange={(event) => setAuthorizationHeader(event.target.value)}
                                            />
                                        </FormControl>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTaskAddDialogOpen(false)}>Cancel</Button>
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
                        <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
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
                                }}
                            >
                                <IconButton
                                    aria-label="add task"
                                    onClick={() => setTaskAddDialogOpen(true)}
                                    edge="end"
                                    sx={{
                                        height: 48,
                                        width: 48,
                                    }}
                                >
                                    <AddTaskIcon sx={{ fontSize: 64 }} />
                                </IconButton>
                                <Typography variant="h4">No Active Tasks</Typography>
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
                                        let sortedTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt);
                                        return sortedTasks.map((task) => (
                                            <TaskCard
                                                task={task}
                                                sx={{
                                                    display: "flex",
                                                    flexGrow: 1,
                                                    marginY: 1,
                                                    width: 0.8,
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
                    bottom: 16,
                    right: 32,
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
