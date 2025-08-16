import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>
function Input({ ...props }: InputProps) {
    return (
        <input
            className='border border-zinc-300 rounded-md p-1'
            {...props}
        />
    )
}

export default Input