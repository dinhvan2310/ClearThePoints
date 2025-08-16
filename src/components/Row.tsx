import { cn } from "../lib/utils";

type RowProps = {
    children: React.ReactNode;
    className?: string;
}
function Row({ children, className }: RowProps) {
    return (
        <div className={cn('flex flex-row gap-2', className)}>
            {children}
        </div>
    )
}

export default Row