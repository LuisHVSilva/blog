import type {ReactNode} from "react";
import "../style/Container.scss";

interface ContainerProps {
    readonly children: ReactNode;
    readonly className?: string;
}

export function Container({children, className = ""}: ContainerProps) {
    return <div className={`container ${className}`.trim()}>{children}</div>;
}
