package services

import (
	"hyperion-downloader/internal/pkg/hyperDownload"
	"hyperion-downloader/internal/pkg/hyperStructs"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v3/pkg/application"
)

type HyperDownloadService struct {
	app   *application.App
	store *HyperDownloadTaskStore
}

type HyperDownloadTask struct {
	CreatedAt int64   `json:"createdAt"`
	UID       string  `json:"uid"`
	URL       string  `json:"url"`
	Filename  string  `json:"filename"`
	OutputDir string  `json:"outputDir"`
	Status    string  `json:"status"`
	Progress  float64 `json:"progress"`
	FileSize  int64   `json:"fileSize"`
	Paused    bool    `json:"paused"`
	Stopped   bool    `json:"stopped"`
}

type HyperDownloadTasksSnapshot struct {
	Tasks []HyperDownloadTask `json:"tasks"`
}

type HyperDownloadTaskStore struct {
	mu    sync.Mutex
	tasks map[string]*HyperDownloadTask
	app   *application.App
}

type progressUpdate struct {
	UID      string  `json:"uid"`
	Progress float64 `json:"progress"`
}

type taskUpdate struct {
	UID  string `json:"uid"`
	Task string `json:"task"`
}

type metadataUpdate struct {
	UID      string                  `json:"uid"`
	Metadata *hyperStructs.HyperFile `json:"metadata"`
}

type HyperDownloadFunctions struct {
	app   *application.App
	uid   string
	store *HyperDownloadTaskStore
}

type HyperDownloadError struct {
	UID      string `json:"uid"`
	Filename string `json:"filename"`
	Error    string `json:"error"`
}

func NewHyperDownloadService(app *application.App) *HyperDownloadService {
	return &HyperDownloadService{app: app, store: NewTaskStore(app)}
}

func NewTaskStore(app *application.App) *HyperDownloadTaskStore {
	return &HyperDownloadTaskStore{
		tasks: make(map[string]*HyperDownloadTask),
		app:   app,
	}
}

func (store *HyperDownloadTaskStore) EmitSnapshot() {
	store.mu.Lock()
	tasks := make([]HyperDownloadTask, 0, len(store.tasks))
	for _, task := range store.tasks {
		tasks = append(tasks, *task)
	}
	store.mu.Unlock()

	snapshot := HyperDownloadTasksSnapshot{Tasks: tasks}
	store.app.Event.Emit("tasksSnapshot", snapshot)
}

func (store *HyperDownloadTaskStore) Upsert(task *HyperDownloadTask) {
	store.mu.Lock()
	store.tasks[task.UID] = task
	store.mu.Unlock()

	store.EmitSnapshot()
}

func (store *HyperDownloadTaskStore) Delete(uid string) {
	store.mu.Lock()
	delete(store.tasks, uid)
	store.mu.Unlock()

	store.EmitSnapshot()
}

func (h *HyperDownloadService) DeleteTask(uid string) {
	h.store.Delete(uid)
}

func (store *HyperDownloadTaskStore) Get(uid string) (*HyperDownloadTask, bool) {
	store.mu.Lock()
	task, exists := store.tasks[uid]
	store.mu.Unlock()
	return task, exists
}

func (store *HyperDownloadTaskStore) UpdateProgress(uid string, progress float64) {
	store.mu.Lock()
	task, exists := store.tasks[uid]
	if !exists {
		store.mu.Unlock()
		return
	}
	task.Progress = progress
	store.mu.Unlock()

	store.EmitSnapshot()
}

func (store *HyperDownloadTaskStore) UpdateStatus(uid string, status string) {
	store.mu.Lock()
	task, exists := store.tasks[uid]
	if !exists {
		store.mu.Unlock()
		return
	}
	task.Status = status
	store.mu.Unlock()

	store.EmitSnapshot()
}

func (store *HyperDownloadTaskStore) UpdatePaused(uid string, paused bool) {
	store.mu.Lock()
	task, exists := store.tasks[uid]
	if !exists {
		store.mu.Unlock()
		return
	}
	task.Paused = paused
	store.mu.Unlock()

	store.EmitSnapshot()
}

func (store *HyperDownloadTaskStore) UpdateStopped(uid string, stopped bool) {
	store.mu.Lock()
	task, exists := store.tasks[uid]
	if !exists {
		store.mu.Unlock()
		return
	}
	task.Stopped = stopped
	store.mu.Unlock()

	store.EmitSnapshot()
}

func (h *HyperDownloadService) GetTasks() []HyperDownloadTask {
	h.store.mu.Lock()
	tasks := make([]HyperDownloadTask, 0, len(h.store.tasks))
	for _, task := range h.store.tasks {
		tasks = append(tasks, *task)
	}
	h.store.mu.Unlock()
	return tasks
}

func newUid() string {
	return uuid.New().String()
}

func (h *HyperDownloadFunctions) GotMetadataFunc(metadata *hyperStructs.HyperFile) error {
	task := &HyperDownloadTask{
		CreatedAt: time.Now().Unix(),
		UID:       h.uid,
		URL:       metadata.Url,
		Filename:  metadata.Filename,
		FileSize:  metadata.Size,
		Status:    "Downloading",
		Progress:  0,
		Paused:    false,
		Stopped:   false,
	}
	h.store.Upsert(task)
	return nil
}

func (h *HyperDownloadFunctions) ProgressFunc(progress float64) error {
	h.store.UpdateProgress(h.uid, progress)
	return nil
}

func (h *HyperDownloadFunctions) TaskFunc(task string) error {
	h.store.UpdateStatus(h.uid, task)
	return nil
}

func (h *HyperDownloadFunctions) CheckPausedFunc() bool {
	// Check if paused is true for this task in the store
	task, exists := h.store.Get(h.uid)
	if !exists {
		return false
	}
	return task.Paused
}

func (h *HyperDownloadFunctions) CheckCancelledFunc() bool {
	// Implement logic to check if the download is cancelled
	task, exists := h.store.Get(h.uid)
	if !exists {
		return false
	}
	return task.Stopped
}

func getHyperDownloadFunctions(app *application.App, uid string, store *HyperDownloadTaskStore) *HyperDownloadFunctions {
	return &HyperDownloadFunctions{
		app:   app,
		uid:   uid,
		store: store,
	}
}

func (h *HyperDownloadService) PauseTask(uid string) {
	// Set the paused field to true for this task in the store
	h.store.UpdatePaused(uid, true)
}

func (h *HyperDownloadService) StopTask(uid string) {
	// Set the stopped field to true for this task in the store
	h.store.UpdateStopped(uid, true)
}

func (h *HyperDownloadService) DownloadFile(url string, outputDir string, tempDir string, concurrentDownloads int, targetPartSize int64, advancedOptions *hyperStructs.HyperDownloadAdvancedOptions) error {
	uid := newUid()
	functions := getHyperDownloadFunctions(h.app, uid, h.store)

	err := hyperDownload.DownloadFile(url, outputDir, tempDir, concurrentDownloads, targetPartSize, advancedOptions, functions)
	if err != nil {
		filename := ""
		if task, exists := h.store.Get(uid); exists {
			filename = task.Filename
		}

		h.store.UpdateStatus(uid, "Error: "+err.Error())
		h.app.Event.Emit("downloadError", HyperDownloadError{UID: uid, Filename: filename, Error: err.Error()})
		h.DeleteTask(uid)
		return err
	}

	if task, exists := h.store.Get(uid); exists {
		h.app.Event.Emit("downloadCompleted", task)
	}
	h.DeleteTask(uid)
	return nil
}
