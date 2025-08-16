import { forwardRef, useImperativeHandle, useState } from 'react';
import Row from './Row';

interface CounterProps {
    className?: string;
    onCountUpdate?: (count: number) => void;
}

export interface CounterRef {
    countUp: () => void;
    reset: () => void;
    setCount: (count: number) => void;
    getCount: () => number;
    setVisible: (visible: boolean) => void;
}

export const Counter = forwardRef<CounterRef, CounterProps>(({ className = "", onCountUpdate }, ref) => {
    const [countState, setCountState] = useState(1);
    const [visibleState, setVisibleState] = useState(false)
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        countUp,
        reset,
        setCount,
        getCount,
        setVisible
    }), []);

    const countUp = () => {
        setCountState(countState + 1);
        onCountUpdate?.(countState + 1);
    }

    const reset = () => {
        setCountState(1);
        onCountUpdate?.(1);
    }

    const getCount = () => {
        return countState;
    }

    const setCount = (count: number) => {
        setCountState(count);
        onCountUpdate?.(count);
    }

    const setVisible = (visible: boolean) => {
        setVisibleState(visible);
    }
    if (!visibleState) return (
        <Row>
            <p>&nbsp;</p>
        </Row>
    )
    return (
        <Row>
            <p>Next</p>
            <p className={`${className}`}>
                {countState}
            </p>
        </Row>
    );
});