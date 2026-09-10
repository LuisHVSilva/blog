import type {SVGProps} from "react";

export type IconName =
    | "arrowRight"
    | "arrowUpRight"
    | "article"
    | "balance"
    | "book"
    | "chevronRight"
    | "cloud"
    | "copy"
    | "code"
    | "contrast"
    | "database"
    | "github"
    | "hub"
    | "info"
    | "javascript"
    | "layers"
    | "list"
    | "memory"
    | "menu"
    | "monitoring"
    | "person"
    | "react"
    | "search"
    | "shield"
    | "star"
    | "terminal"
    | "verified"
    | "x";

interface IconProps extends SVGProps<SVGSVGElement> {
    readonly name: IconName;
}

const paths: Record<IconName, readonly string[]> = {
    arrowRight: ["M5 12h14", "m13 6 6 6-6 6"],
    arrowUpRight: ["M7 17 17 7", "M8 7h9v9"],
    article: ["M7 3h7l5 5v13H7z", "M14 3v5h5", "M10 13h6", "M10 17h6"],
    balance: ["M12 3v18", "M5 6h14", "M6 6l-3 7h6L6 6z", "M18 6l-3 7h6l-3-7z"],
    book: ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20", "M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"],
    chevronRight: ["m9 18 6-6-6-6"],
    cloud: ["M17.5 19H7a5 5 0 1 1 1.7-9.7A7 7 0 0 1 22 12.5 4.5 4.5 0 0 1 17.5 19z"],
    copy: ["M8 8h11v11H8z", "M5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1"],
    code: ["m16 18 6-6-6-6", "m8 6-6 6 6 6"],
    contrast: ["M12 22a10 10 0 1 0 0-20v20z"],
    database: ["M4 6c0 2.2 3.6 4 8 4s8-1.8 8-4-3.6-4-8-4-8 1.8-8 4z", "M4 6v6c0 2.2 3.6 4 8 4s8-1.8 8-4V6", "M4 12v6c0 2.2 3.6 4 8 4s8-1.8 8-4v-6"],
    github: ["M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 20.3 4s-1.3-.4-4.1 1.5A14.2 14.2 0 0 0 9 5.5C6.2 3.6 4.9 4 4.9 4A5.8 5.8 0 0 0 3.4 8.1c0 5.8 3.5 7 6.8 7.4a3.4 3.4 0 0 0-1 2.6V22"],
    hub: ["M12 5v14", "M5 12h14", "M5 5h4v4H5z", "M15 5h4v4h-4z", "M5 15h4v4H5z", "M15 15h4v4h-4z"],
    info: ["M12 16v-4", "M12 8h.01", "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"],
    javascript: ["M7 8v7a2 2 0 0 1-2 2", "M12 17c1.7 0 3-1 3-2.5 0-1.8-1.5-2.4-3-3s-3-1.2-3-3C9 7 10.3 6 12 6c1.2 0 2.1.4 2.7 1.2", "M4 3h16v18H4z"],
    layers: ["m12 2 9 5-9 5-9-5 9-5z", "m3 12 9 5 9-5", "m3 17 9 5 9-5"],
    list: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
    memory: ["M6 19v3", "M10 19v3", "M14 19v3", "M18 19v3", "M6 2v3", "M10 2v3", "M14 2v3", "M18 2v3", "M4 5h16v14H4z"],
    menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
    monitoring: ["M3 3v18h18", "m7 13 3-3 3 2 5-6"],
    person: ["M20 21a8 8 0 0 0-16 0", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
    react: ["M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0", "M12 12c5.5 0 10-1.8 10-4s-4.5-4-10-4S2 5.8 2 8s4.5 4 10 4z", "M12 12c2.8 4.8 6.6 7.8 8.5 6.7s1-5.8-1.8-10.5S12.1.4 10.2 1.5 9.2 7.2 12 12z", "M12 12c-2.8 4.8-3.8 9.1-1.8 10.2s5.7-1.9 8.5-6.7S22 5 20.2 4 14.8 7.2 12 12z"],
    search: ["m21 21-4.3-4.3", "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"],
    shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
    star: ["m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3L5.8 21 7 14.2 2 9.3l6.9-1L12 2z"],
    terminal: ["m4 17 6-6-6-6", "M12 19h8"],
    verified: ["M12 2 15 5l1.5 3.5L22 12l-3.5 3.5L17 19l-5 3-5-3-1.5-3.5L2 12l3.5-3.5L7 5l5-3z", "m8.5 12 2.2 2.2 4.8-5"],
    x: ["M18 6 6 18", "m6 6 12 12"],
};

export function Icon({name, ...props}: IconProps) {
    return (
        <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round"
             strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" {...props}>
            {paths[name].map((path) => (
                <path d={path} key={path}/>
            ))}
        </svg>
    );
}
