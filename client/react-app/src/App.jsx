import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AllDoneState from "./components/AllDoneState";
import Backdrop from "./components/Backdrop";
import ConfirmDialog from "./components/ConfirmDialog";
import { AlertIcon, CheckCircleIcon, InboxIcon, PlusIcon, SearchIcon } from "./components/Icon";
import SearchField from "./components/SearchField";
import Sidebar from "./components/Sidebar";
import SortMenu from "./components/SortMenu";
import StateMessage from "./components/StateMessage";
import StatsBar from "./components/StatsBar";
import TaskComposer from "./components/TaskComposer";
import TaskList, { TaskListSkeleton } from "./components/TaskList";
import Toaster from "./components/Toaster";
import { useHashView } from "./hooks/useHashView";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { usePointerEffects } from "./hooks/usePointerEffects";
import { UNDO_WINDOW_MS, useTodos } from "./hooks/useTodos";
import { useToasts } from "./hooks/useToasts";
import { launchConfetti } from "./lib/confetti";
import { flyToView } from "./lib/flyToView";
import { formatToday, getGreeting, getViewFor, pluralize, SORT_OPTIONS, VIEWS } from "./lib/tasks";

const HIGHLIGHT_MS = 1600;
const NO_IDS = new Set();
const TODO_VIEW = VIEWS[0];
const SORT_STORAGE_KEY = "awesome-todos:sort";

function readSortPreference() {
    try {
        const saved = window.localStorage.getItem(SORT_STORAGE_KEY);
        return SORT_OPTIONS.some((option) => option.id === saved) ? saved : SORT_OPTIONS[0].id;
    } catch {
        return SORT_OPTIONS[0].id;
    }
}

function getEmptyState(view, query) {
    if (query) {
        return {
            icon: <SearchIcon size={22} />,
            title: "No matching tasks",
            description: `Nothing in ${view.title.toLowerCase()} matches “${query}”.`,
            action: "clear-search",
        };
    }
    if (view.id === "completed") {
        return {
            icon: <CheckCircleIcon size={22} />,
            title: "Nothing completed yet",
            description: "Check off a task and it will land here.",
        };
    }
    return {
        icon: <InboxIcon size={22} />,
        title: "Your list is clear",
        description: "Add your first task to start getting things done.",
        action: "add-task",
    };
}

function centerOf(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export default function App() {
    const view = useHashView();
    const { toasts, notify, dismiss } = useToasts();
    const reportError = useCallback((message) => notify({ message, tone: "error", duration: 6000 }), [notify]);
    const { todos, status, reload, addTodo, toggleTodo, renameTodo, removeTodo, removeTodos } =
        useTodos({ onError: reportError });

    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState(null);
    const [departing, setDeparting] = useState({ viewId: view.id, ids: NO_IDS });
    const [isConfirmingClear, setConfirmingClear] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [sortOrder, setSortOrder] = useState(readSortPreference);
    const [composerFocusRequest, setComposerFocusRequest] = useState(0);
    const composerRef = useRef(null);
    const searchRef = useRef(null);

    const startNewTask = useCallback(() => {
        if (window.location.hash !== TODO_VIEW.href) window.location.hash = TODO_VIEW.href;
        setComposerFocusRequest((count) => count + 1);
    }, []);
    const clearComposerFocusRequest = useCallback(() => setComposerFocusRequest(0), []);

    const shortcuts = useMemo(() => ({
        n: startNewTask,
        "/": () => searchRef.current?.focus(),
    }), [startNewTask]);
    useKeyboardShortcuts(shortcuts);
    usePointerEffects();

    useEffect(() => {
        if (!highlight) return;
        const timer = setTimeout(() => setHighlight(null), HIGHLIGHT_MS);
        return () => clearTimeout(timer);
    }, [highlight]);

    const counts = useMemo(() => {
        const completed = todos.filter((todo) => todo.status).length;
        return { all: todos.length, active: todos.length - completed, completed };
    }, [todos]);

    const searchTerm = query.trim().toLowerCase();
    const matchesSearch = (task) => task.todo.toLowerCase().includes(searchTerm);
    const departingIds = departing.viewId === view.id ? departing.ids : NO_IDS;
    const sortOption = SORT_OPTIONS.find((option) => option.id === sortOrder);
    const visibleTasks = todos
        .filter((task) => (view.matches(task) || departingIds.has(task._id)) && matchesSearch(task))
        .sort(sortOption.compare);
    const leavingIds = new Set(visibleTasks.filter((task) => !view.matches(task)).map((task) => task._id));

    const handleCreate = async (title) => {
        const created = await addTodo(title);
        if (view.matches(created) && matchesSearch(created)) {
            setHighlight({ id: created._id, kind: "added" });
        } else {
            notify({
                message: "Task added to To do",
                action: { label: "Show", onClick: () => { setQuery(""); window.location.hash = TODO_VIEW.href; } },
            });
        }
    };

    const handleToggle = (task, origin) => {
        const updated = { ...task, status: !task.status };
        const destination = getViewFor(updated);
        const title = origin.closest(".task-row")?.querySelector(".task__title-text");

        if (updated.status && counts.active === 1) launchConfetti(centerOf(origin));
        flyToView({ source: title ?? origin, href: destination.href, label: task.todo, isCompleting: updated.status });

        if (!view.matches(updated)) {
            setDeparting((current) => ({
                viewId: view.id,
                ids: new Set(current.viewId === view.id ? current.ids : NO_IDS).add(task._id),
            }));
        }
        setAnnouncement(updated.status ? `Completed “${task.todo}”` : `Moved “${task.todo}” back to To do`);

        toggleTodo(task).then(
            () => notify({
                message: updated.status ? "Moved to Completed" : "Moved back to To do",
                group: "move",
                action: {
                    label: "Undo",
                    onClick: () => {
                        setHighlight({ id: task._id, kind: "updated" });
                        toggleTodo(updated).catch(() => reportError("Couldn't undo that change. Please try again."));
                    },
                },
            }),
            () => reportError("Couldn't update the task. Please try again."),
        );
    };

    const handleDeparted = (id) => {
        setDeparting((current) => {
            const ids = new Set(current.ids);
            ids.delete(id);
            return { ...current, ids };
        });
    };

    const handleRename = (task, title) => {
        renameTodo(task, title).then(
            () => {
                setHighlight({ id: task._id, kind: "updated" });
                setAnnouncement("Task updated");
            },
            () => reportError("Couldn't save your changes. Please try again."),
        );
    };

    const handleDelete = (task) => {
        const undo = removeTodo(task);
        notify({
            message: "Task deleted",
            duration: UNDO_WINDOW_MS,
            action: {
                label: "Undo",
                onClick: () => {
                    undo();
                    setHighlight({ id: task._id, kind: "updated" });
                },
            },
        });
    };

    const handleSortChange = (order) => {
        setSortOrder(order);
        try {
            window.localStorage.setItem(SORT_STORAGE_KEY, order);
        } catch {
            // Sorting still works for this visit without storage.
        }
    };

    const handleClearCompleted = async () => {
        const completed = todos.filter((todo) => todo.status);
        setConfirmingClear(false);
        try {
            await removeTodos(completed);
            notify({ message: `Cleared ${pluralize(completed.length, "completed task")}` });
        } catch {
            reportError("Some tasks couldn't be deleted, so they were restored.");
        }
    };

    const isAllDone = status === "ready" && counts.all > 0 && counts.active === 0;
    const showFooter = status === "ready" && counts.completed > 0 && view.id === "completed";

    let content;
    if (status === "loading") {
        content = <TaskListSkeleton />;
    } else if (status === "error") {
        content = (
            <StateMessage
                tone="error"
                icon={<AlertIcon size={22} />}
                title="Couldn't load your tasks"
                description="Check your connection and try again."
                action={<button type="button" className="btn btn--secondary" onClick={reload}>Try again</button>}
            />
        );
    } else if (visibleTasks.length > 0) {
        content = (
            <TaskList
                tasks={visibleTasks}
                highlight={highlight}
                departingIds={leavingIds}
                onToggle={handleToggle}
                onRename={handleRename}
                onDelete={handleDelete}
                onDeparted={handleDeparted}
            />
        );
    } else if (isAllDone && view.id === TODO_VIEW.id && !searchTerm) {
        content = <AllDoneState completedCount={counts.completed} onCelebrate={() => launchConfetti()} />;
    } else {
        const { action, ...emptyState } = getEmptyState(view, query.trim());
        content = (
            <StateMessage
                {...emptyState}
                action={action && (
                    <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={action === "clear-search" ? () => setQuery("") : startNewTask}
                    >
                        {action === "clear-search" ? "Clear search" : "Add a task"}
                    </button>
                )}
            />
        );
    }

    let summary = "Loading your tasks…";
    if (status === "error") summary = "Your tasks couldn't be loaded.";
    else if (status === "ready" && view.id === "completed") {
        summary = counts.completed > 0
            ? `You've finished ${pluralize(counts.completed, "task")}. Uncheck one to move it back.`
            : "Tasks you check off will appear here.";
    } else if (status === "ready") {
        if (counts.all === 0) summary = "Plan your day by adding your first task.";
        else if (isAllDone) summary = "Everything is done. Nice work!";
        else summary = `You have ${pluralize(counts.active, "open task")}. Check one off to move it to Completed.`;
    }
    const viewCount = view.id === "completed" ? counts.completed : counts.active;

    return (
        <div className="app">
            <Backdrop />

            <Sidebar currentView={view} counts={counts} />

            <main className="main">
                <div className="main__inner">
                    <header className="topbar">
                        <p className="topbar__greeting">
                            {getGreeting()}
                            <span className="topbar__date">{formatToday()}</span>
                        </p>
                        {counts.all > 0 && <SearchField value={query} onChange={setQuery} inputRef={searchRef} />}
                    </header>

                    <div className="page-title">
                        <div className="page-title__text">
                            <h1 className="page-title__heading">{view.title}</h1>
                            <p className="page-title__summary">{summary}</p>
                        </div>
                        <button type="button" className="btn btn--primary page-title__action" onClick={startNewTask}>
                            <PlusIcon size={16} strokeWidth="2.25" />
                            New task
                        </button>
                    </div>

                    <StatsBar todos={todos} counts={counts} />

                    <section className="board" aria-labelledby="board-title" data-spotlight>
                        <div className="board__toolbar">
                            <div className="board__heading">
                                <h2 id="board-title" className="board__title">
                                    {view.id === "completed" ? "Completed tasks" : "Open tasks"}
                                </h2>
                                {status === "ready" && <span className="board__count">{viewCount}</span>}
                            </div>
                            {status === "ready" && viewCount > 1 && <SortMenu value={sortOrder} onChange={handleSortChange} />}
                        </div>

                        {view.id === TODO_VIEW.id && (
                            <TaskComposer
                                onCreate={handleCreate}
                                inputRef={composerRef}
                                focusRequest={composerFocusRequest}
                                onFocusHandled={clearComposerFocusRequest}
                            />
                        )}

                        <div key={view.id} className="tasks">
                            {content}
                        </div>

                        {showFooter && (
                            <footer className="board__footer">
                                <span>{pluralize(counts.completed, "completed task")}</span>
                                <button
                                    type="button"
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => setConfirmingClear(true)}
                                >
                                    Clear completed
                                </button>
                            </footer>
                        )}
                    </section>
                </div>
            </main>

            <Toaster toasts={toasts} onDismiss={dismiss} />

            <ConfirmDialog
                open={isConfirmingClear}
                title={`Delete ${pluralize(counts.completed, "completed task")}?`}
                description="This permanently removes them from your list. This can't be undone."
                confirmLabel="Delete"
                onConfirm={handleClearCompleted}
                onCancel={() => setConfirmingClear(false)}
            />

            <p className="visually-hidden" role="status">{announcement}</p>
        </div>
    );
}
