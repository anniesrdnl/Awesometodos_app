import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CalendarPage from "./components/CalendarPage";
import ConfirmDialog from "./components/ConfirmDialog";
import { AlertIcon, CheckCircleIcon, InboxIcon, SearchIcon } from "./components/Icon";
import SearchField from "./components/SearchField";
import Sidebar from "./components/Sidebar";
import SortMenu from "./components/SortMenu";
import StateMessage from "./components/StateMessage";
import TaskComposer from "./components/TaskComposer";
import TaskList, { TaskListSkeleton } from "./components/TaskList";
import Toaster from "./components/Toaster";
import { useHashView } from "./hooks/useHashView";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { UNDO_WINDOW_MS, useTodos } from "./hooks/useTodos";
import { useToasts } from "./hooks/useToasts";
import { formatDueDate, formatToday, pluralize, SORT_OPTIONS, toDateKey, VIEWS } from "./lib/tasks";

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

function getEmptyState(view, query, counts) {
    if (query) {
        return {
            icon: <SearchIcon size={20} />,
            title: "No matching tasks",
            description: `Nothing in ${view.title} matches “${query}”. Try another word.`,
            action: "clear-search",
        };
    }
    if (view.id === "completed") {
        return {
            icon: <CheckCircleIcon size={20} />,
            title: "Nothing completed yet",
            description: "Tasks you check off will show up here.",
        };
    }
    if (counts.all > 0) {
        return {
            icon: <CheckCircleIcon size={20} />,
            title: "All done",
            description: `You've completed ${pluralize(counts.completed, "task")}. Add what's next whenever you're ready.`,
            action: "view-completed",
        };
    }
    return {
        icon: <InboxIcon size={20} />,
        title: "Start with one task",
        description: "Type it in the field above and press Enter.",
    };
}

function EmptyStateAction({ action, onClearSearch }) {
    if (action === "clear-search") {
        return <button type="button" className="btn btn--secondary" onClick={onClearSearch}>Clear search</button>;
    }
    if (action === "view-completed") {
        return <a className="btn btn--secondary" href="#/completed">View completed</a>;
    }
    return null;
}

export default function App() {
    const view = useHashView();
    const { toasts, notify, dismiss } = useToasts();
    const reportError = useCallback((message) => notify({ message, tone: "error", duration: 6000 }), [notify]);
    const { todos, status, reload, addTodo, toggleTodo, renameTodo, setDueDate, removeTodo, removeTodos } =
        useTodos({ onError: reportError });

    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState(null);
    const [departing, setDeparting] = useState({ viewId: view.id, ids: NO_IDS });
    const [isConfirmingClear, setConfirmingClear] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
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

    useEffect(() => {
        if (!highlight) return;
        const timer = setTimeout(() => setHighlight(null), HIGHLIGHT_MS);
        return () => clearTimeout(timer);
    }, [highlight]);

    const counts = useMemo(() => {
        const completed = todos.filter((todo) => todo.status).length;
        const scheduled = todos.filter((todo) => todo.dueDate && !todo.status).length;
        return { all: todos.length, active: todos.length - completed, completed, calendar: scheduled };
    }, [todos]);

    const searchTerm = query.trim().toLowerCase();
    const matchesSearch = (task) => task.todo.toLowerCase().includes(searchTerm);
    const departingIds = departing.viewId === view.id ? departing.ids : NO_IDS;
    const sortOption = SORT_OPTIONS.find((option) => option.id === sortOrder);
    const isCalendarView = view.id === "calendar";
    const visibleTasks = todos
        .filter((task) => (view.matches(task) || departingIds.has(task._id)) && matchesSearch(task))
        .sort(sortOption.compare);
    const leavingIds = new Set(visibleTasks.filter((task) => !view.matches(task)).map((task) => task._id));

    const handleCreate = async (title, dueDate) => {
        const created = await addTodo(title, dueDate);
        if (matchesSearch(created)) {
            setHighlight({ id: created._id, kind: "added" });
        } else {
            notify({
                message: "Task added",
                action: { label: "Show", onClick: () => setQuery("") },
            });
        }
    };

    const handleToggle = (task) => {
        const updated = { ...task, status: !task.status };

        if (!view.matches(updated)) {
            setDeparting((current) => ({
                viewId: view.id,
                ids: new Set(current.viewId === view.id ? current.ids : NO_IDS).add(task._id),
            }));
        }
        setAnnouncement(updated.status ? `Completed “${task.todo}”` : `Moved “${task.todo}” back to To do`);

        toggleTodo(task).then(
            () => notify({
                message: updated.status ? "Task completed" : "Moved back to To do",
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

    const handleSetDueDate = (task, dueDate) => {
        setDueDate(task, dueDate).then(
            () => {
                setHighlight({ id: task._id, kind: "updated" });
                setAnnouncement(dueDate ? `Due ${formatDueDate(dueDate)}` : "Due date removed");
            },
            () => reportError("Couldn't save the due date. Please try again."),
        );
    };

    const handleCreateOnDay = async (title, dueDate) => {
        const created = await addTodo(title, dueDate);
        setHighlight({ id: created._id, kind: "added" });
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

    const isReady = status === "ready";
    const isCompletedView = view.id === "completed";
    const viewCount = isCompletedView ? counts.completed : counts.active;

    let content;
    if (status === "loading") {
        content = <TaskListSkeleton />;
    } else if (status === "error") {
        content = (
            <StateMessage
                tone="error"
                icon={<AlertIcon size={20} />}
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
                onSetDueDate={handleSetDueDate}
                onDelete={handleDelete}
                onDeparted={handleDeparted}
            />
        );
    } else {
        const { action, ...emptyState } = getEmptyState(view, query.trim(), counts);
        content = (
            <StateMessage
                {...emptyState}
                action={action && <EmptyStateAction action={action} onClearSearch={() => setQuery("")} />}
            />
        );
    }

    let listSummary = isCompletedView ? pluralize(viewCount, "completed task") : pluralize(viewCount, "open task");
    if (searchTerm) listSummary = `${pluralize(visibleTasks.length, "match", "matches")} in ${view.title}`;

    if (isCalendarView) {
        return (
            <div className="app">
                <Sidebar currentView={view} counts={counts} isReady={isReady} />

                <main className="main">
                    <div className="main__inner main__inner--wide">
                        <header className="page-header">
                            <div className="page-header__text">
                                <p className="page-header__date">{formatToday()}</p>
                                <h1 className="page-header__title">{view.title}</h1>
                            </div>
                        </header>

                        <CalendarPage
                            todos={todos}
                            status={status}
                            reload={reload}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            highlight={highlight}
                            onCreate={handleCreateOnDay}
                            onToggle={handleToggle}
                            onRename={handleRename}
                            onSetDueDate={handleSetDueDate}
                            onDelete={handleDelete}
                            onDeparted={handleDeparted}
                        />
                    </div>
                </main>

                <Toaster toasts={toasts} onDismiss={dismiss} />
                <p className="visually-hidden" role="status">{announcement}</p>
            </div>
        );
    }

    return (
        <div className="app">
            <Sidebar currentView={view} counts={counts} isReady={isReady} />

            <main className="main">
                <div className="main__inner">
                    <header className="page-header">
                        <div className="page-header__text">
                            <p className="page-header__date">{formatToday()}</p>
                            <h1 className="page-header__title">{view.title}</h1>
                        </div>
                        {counts.all > 0 && <SearchField value={query} onChange={setQuery} inputRef={searchRef} />}
                    </header>

                    <section className="board" aria-labelledby="board-title">
                        <h2 id="board-title" className="visually-hidden">
                            {isCompletedView ? "Completed tasks" : "Open tasks"}
                        </h2>

                        {!isCompletedView && (
                            <TaskComposer
                                onCreate={handleCreate}
                                inputRef={composerRef}
                                focusRequest={composerFocusRequest}
                                onFocusHandled={clearComposerFocusRequest}
                            />
                        )}

                        {isReady && visibleTasks.length > 0 && (
                            <div className="board__toolbar">
                                <p className="board__summary">{listSummary}</p>
                                <div className="board__actions">
                                    {isCompletedView && (
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => setConfirmingClear(true)}
                                        >
                                            Clear completed
                                        </button>
                                    )}
                                    {viewCount > 1 && <SortMenu value={sortOrder} onChange={handleSortChange} />}
                                </div>
                            </div>
                        )}

                        <div key={view.id} className="tasks">
                            {content}
                        </div>
                    </section>
                </div>
            </main>

            <Toaster toasts={toasts} onDismiss={dismiss} />

            <ConfirmDialog
                open={isConfirmingClear}
                title={`Delete ${pluralize(counts.completed, "completed task")}?`}
                description="This permanently removes them from your list and can't be undone."
                confirmLabel="Delete"
                onConfirm={handleClearCompleted}
                onCancel={() => setConfirmingClear(false)}
            />

            <p className="visually-hidden" role="status">{announcement}</p>
        </div>
    );
}
