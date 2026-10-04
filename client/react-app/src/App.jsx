import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfirmDialog from "./components/ConfirmDialog";
import { AlertIcon, CheckCircleIcon, InboxIcon, SearchIcon } from "./components/Icon";
import SearchField from "./components/SearchField";
import Sidebar from "./components/Sidebar";
import StateMessage from "./components/StateMessage";
import TaskComposer from "./components/TaskComposer";
import TaskList, { TaskListSkeleton } from "./components/TaskList";
import Toaster from "./components/Toaster";
import Overview from "./components/Overview";
import { useHashView } from "./hooks/useHashView";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { UNDO_WINDOW_MS, useTodos } from "./hooks/useTodos";
import { useToasts } from "./hooks/useToasts";
import { formatToday, pluralize } from "./lib/tasks";

const HIGHLIGHT_MS = 1600;
const NO_IDS = new Set();

function getEmptyState(view, counts, query) {
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
            description: "Tasks you check off will show up here.",
        };
    }
    if (view.id === "active" && counts.all > 0) {
        return {
            icon: <CheckCircleIcon size={22} />,
            title: "All caught up",
            description: "Every task is done. Enjoy the clear list.",
        };
    }
    return {
        icon: <InboxIcon size={22} />,
        title: "Your list is clear",
        description: "Add your first task to start getting things done.",
        action: "add-task",
    };
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
    const composerRef = useRef(null);
    const searchRef = useRef(null);

    const shortcuts = useMemo(() => ({
        n: () => composerRef.current?.focus(),
        "/": () => searchRef.current?.focus(),
    }), []);
    useKeyboardShortcuts(shortcuts);

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
    const visibleTasks = todos
        .filter((task) => (view.matches(task) || departingIds.has(task._id)) && matchesSearch(task))
        .reverse();

    const handleCreate = async (title) => {
        const created = await addTodo(title);
        if (view.matches(created) && matchesSearch(created)) {
            setHighlight({ id: created._id, kind: "added" });
        } else {
            notify({
                message: "Task added to Active",
                action: { label: "Show", onClick: () => { setQuery(""); window.location.hash = "#/active"; } },
            });
        }
    };

    const handleToggle = (task) => {
        if (view.id !== "all") {
            setDeparting((current) => ({
                viewId: view.id,
                ids: new Set(current.viewId === view.id ? current.ids : NO_IDS).add(task._id),
            }));
        }
        setAnnouncement(task.status ? `Marked “${task.todo}” as not done` : `Completed “${task.todo}”`);
        toggleTodo(task).catch(() => reportError("Couldn't update the task. Please try again."));
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

    const handleLocateTask = (task) => {
        if (!view.matches(task)) window.location.hash = "#/";
        setQuery("");
        setHighlight({ id: task._id, kind: "located" });
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
    } else if (visibleTasks.length === 0) {
        const { action, ...emptyState } = getEmptyState(view, counts, query.trim());
        content = (
            <StateMessage
                {...emptyState}
                action={action && (
                    <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={action === "clear-search" ? () => setQuery("") : () => composerRef.current?.focus()}
                    >
                        {action === "clear-search" ? "Clear search" : "Add a task"}
                    </button>
                )}
            />
        );
    } else {
        content = (
            <TaskList
                tasks={visibleTasks}
                highlight={highlight}
                departingIds={departingIds}
                onToggle={handleToggle}
                onRename={handleRename}
                onDelete={handleDelete}
                onDeparted={handleDeparted}
            />
        );
    }

    const showFooter = status === "ready" && counts.completed > 0 && view.id !== "active";

    return (
        <div className="app">
            <Sidebar currentView={view} counts={counts} />

            <main className="main">
                <div className="main__inner">
                    <header className="page-header">
                        <div className="page-header__text">
                            <h1 className="page-header__title">{view.title}</h1>
                            <p className="page-header__meta">
                                {formatToday()}
                                {status === "ready" && counts.all > 0 && ` · ${counts.active} remaining`}
                            </p>
                        </div>
                        {counts.all > 0 && <SearchField value={query} onChange={setQuery} inputRef={searchRef} />}
                    </header>

                    <div className="workspace">
                        <div className="workspace__primary">
                            <TaskComposer onCreate={handleCreate} inputRef={composerRef} />

                            <section key={view.id} className="tasks" aria-label={view.title}>
                                {content}
                            </section>

                            {showFooter && (
                                <footer className="list-footer">
                                    <button
                                        type="button"
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => setConfirmingClear(true)}
                                    >
                                        Clear completed
                                    </button>
                                </footer>
                            )}
                        </div>

                        <Overview
                            todos={todos}
                            counts={counts}
                            isReady={status === "ready"}
                            onNewTask={shortcuts.n}
                            onSearch={shortcuts["/"]}
                            onLocateTask={handleLocateTask}
                        />
                    </div>
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
