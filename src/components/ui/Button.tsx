import type {AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode} from "react";
import "../style/Button.scss";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonBaseProps {
    readonly children: ReactNode;
    readonly variant?: ButtonVariant;
    readonly icon?: ReactNode;
    readonly iconOnlyLabel?: string;
}

type ButtonAsButtonProps = ButtonBaseProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
    readonly href?: undefined;
};

type ButtonAsAnchorProps = ButtonBaseProps &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
    readonly href: string;
};

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

export function Button({children, variant = "secondary", icon, iconOnlyLabel, className = "", ...props}: ButtonProps) {
    const classes = ["button", `button--${variant}`, iconOnlyLabel ? "button--icon-only" : "", className].filter(Boolean).join(" ");
    const content = (
        <>
            {icon}
            {iconOnlyLabel ? <span className="sr-only">{iconOnlyLabel}</span> : children}
        </>
    );

    if ("href" in props && props.href) {
        const anchorProps = props;

        return (
            <a className={classes} {...anchorProps}>
                {content}
            </a>
        );
    }

    const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
        <button className={classes} type={buttonProps.type ?? "button"} {...buttonProps}>
            {content}
        </button>
    );
}
