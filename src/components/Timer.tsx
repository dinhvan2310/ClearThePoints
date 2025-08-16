import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface TimerProps {
    className?: string;
    onTimeUpdate?: (time: number) => void;
}

export interface TimerRef {
    start: () => void;
    stop: () => void;
    reset: () => void;
    getTime: () => number;
}

export const Timer = forwardRef<TimerRef, TimerProps>(({ className = "", onTimeUpdate }, ref) => {
    const [displayTime, setDisplayTime] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateRef = useRef(0);
    const isRunningRef = useRef(false);

    const updateTimer = () => {
        if (!startTimeRef.current || !isRunningRef.current) return;
        
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTimeRef.current) / 1000;
        const roundedTime = Math.round(elapsedTime * 10) / 10;
        
        // Chỉ update UI khi thời gian thay đổi đáng kể (0.1s)
        if (roundedTime !== lastUpdateRef.current) {
            lastUpdateRef.current = roundedTime;
            setDisplayTime(roundedTime);
            onTimeUpdate?.(roundedTime);
        }
        
        if (isRunningRef.current) {
            animationFrameRef.current = requestAnimationFrame(updateTimer);
        }
    };

    const start = () => {
        if (isRunningRef.current) return;
        
        isRunningRef.current = true;
        startTimeRef.current = Date.now();
        animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    const stop = () => {
        isRunningRef.current = false;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    const reset = () => {
        stop();
        setDisplayTime(0);
        lastUpdateRef.current = 0;
        startTimeRef.current = null;
    };

    const getTime = () => {
        return displayTime;
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        start,
        stop,
        reset,
        getTime
    }), []);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const formatTime = (time: number): string => {
        return `${time.toFixed(1)}s`;
    };

    return (
        <p className={`font-mono text-lg ${className}`}>
            {formatTime(displayTime)}
        </p>
    );
});