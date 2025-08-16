import React from 'react';
import { cn } from '../lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>
function Button({ className, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                'border rounded-md py-1 px-4 cursor-pointer',
                `hover:bg-zinc-100`,
                className
            )}
            {...props}
        />
    )
}

export default Button