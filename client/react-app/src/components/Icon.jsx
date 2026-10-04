function Icon({ size = 18, children, ...props }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            {children}
        </svg>
    );
}

export const CheckIcon = (props) => (
    <Icon {...props}><path d="M20 6 9 17l-5-5" /></Icon>
);

export const PlusIcon = (props) => (
    <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>
);

export const SearchIcon = (props) => (
    <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
);

export const CloseIcon = (props) => (
    <Icon {...props}><path d="M18 6 6 18M6 6l12 12" /></Icon>
);

export const PencilIcon = (props) => (
    <Icon {...props}><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></Icon>
);

export const TrashIcon = (props) => (
    <Icon {...props}>
        <path d="M4 7h16M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    </Icon>
);

export const ListIcon = (props) => (
    <Icon {...props}><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></Icon>
);

export const CircleIcon = (props) => (
    <Icon {...props}><circle cx="12" cy="12" r="8.5" /></Icon>
);

export const CheckCircleIcon = (props) => (
    <Icon {...props}><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Icon>
);

export const AlertIcon = (props) => (
    <Icon {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.5M12 16h.01" /></Icon>
);

export const InboxIcon = (props) => (
    <Icon {...props}>
        <path d="M21 13h-5l-1.5 2.5h-5L8 13H3" />
        <path d="M5.5 5.5 3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5l-2.5-7.5A2 2 0 0 0 16.6 4H7.4a2 2 0 0 0-1.9 1.5Z" />
    </Icon>
);
