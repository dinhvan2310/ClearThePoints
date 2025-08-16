import { Animation } from "konva/lib/Animation";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { Counter, type CounterRef } from "../../../components/Counter";

import { spawnPoints } from "../utils/spawnPoints";
import type { GameState, PointType } from "../utils/types";
import Point, { type PointRef } from "./Point";

export type GameCanvasRef = {
    play: (numPoints: number) => void;
    stop: () => void;
    autoPlay: () => void;
}

interface GameCanvasProps {
    onGameComplete?: (gameState: GameState) => void;
}

const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(({ onGameComplete }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const counterRef = useRef<CounterRef | null>(null);
    const pointsRef = useRef<PointRef[]>([]);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [disabled, setDisabled] = useState(false);
    const [points, setPoints] = useState<PointType[]>([]);
    const nextExpectedLabel = useRef<number>(1)
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const autoPlayIntervalRef = useRef<number | null>(null);

    // useEffect
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const { width, height } = container.getBoundingClientRect();
        setContainerWidth(width);
        setContainerHeight(height);
    }, []);

    const setPointRef = useCallback((index: number) => (pointRef: PointRef | null) => {
        if (pointRef) {
            pointsRef.current[index] = pointRef;
        }
    }, []);

    const handlePointClick = useCallback((pointId: string, label: number, anim: Animation) => {
        if (label === nextExpectedLabel.current) {
            // Done Game
            if (label === points.length) {
                counterRef.current?.setVisible(false);
                const checkAnimationComplete = () => {
                    if (anim.isRunning()) {
                        requestAnimationFrame(checkAnimationComplete);
                    } else {
                        onGameComplete?.('cleared');
                        setDisabled(true);
                    }
                };
                checkAnimationComplete();
                // Continue Game
            } else {
                nextExpectedLabel.current += 1;
                counterRef.current?.setCount(nextExpectedLabel.current);
            }
            // Failed Game
        } else {
            onGameComplete?.('failed');
            setDisabled(true);
            counterRef.current?.setVisible(false);
        }
    }, [onGameComplete, points.length]);

    const play = useCallback((numPoints: number) => {
        // turn of autoplay
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
        }
        setIsAutoPlaying(false);

        pointsRef.current = [];
        setPoints(spawnPoints(numPoints, containerWidth, containerHeight));
        nextExpectedLabel.current = 1
        counterRef.current?.setCount(1);
        setDisabled(false);
        counterRef.current?.setVisible(true)
    }, [containerWidth, containerHeight])

    const autoPlay = useCallback(() => {
        if (isAutoPlaying) {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
                autoPlayIntervalRef.current = null;
            }
            setIsAutoPlaying(false);
            return;
        }

        setIsAutoPlaying(true);

        const handleClick = () => {
            const pointIndex = points.findIndex(p => p.label === nextExpectedLabel.current);
            if (pointIndex !== -1 && pointsRef.current[pointIndex]) {
                const pointRef = pointsRef.current[pointIndex];
                if (pointRef && !disabled) {
                    pointRef.click();
                }
            }
        };

        const startAutoPlay = () => {
            if (nextExpectedLabel.current === points.length) {
                handleClick();
                if (autoPlayIntervalRef.current) {
                    clearInterval(autoPlayIntervalRef.current);
                    autoPlayIntervalRef.current = null;
                }
                setIsAutoPlaying(false);
                return;
            }
            handleClick();
        };

        autoPlayIntervalRef.current = setInterval(startAutoPlay, 1000);
    }, [isAutoPlaying, points, nextExpectedLabel.current]);

    const stop = useCallback(() => {
        // turn of autoplay
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
        }
        setIsAutoPlaying(false);

        pointsRef.current.forEach(pointRef => {
            pointRef?.stopAnimation();
        });
    }, []);

    useEffect(() => {
        return () => {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
        };
    }, []);

    useImperativeHandle(ref, () => ({
        play,
        stop,
        autoPlay
    }), [play, stop, autoPlay]);

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1" ref={containerRef}>
                <Stage width={containerWidth} height={containerHeight} pixelRatio={1} className='border border-gray-500'>
                    <Layer>
                        <MemoizedPoints
                            points={points}
                            handlePointClick={handlePointClick}
                            setPointRef={setPointRef}
                            disabled={disabled}
                        />
                    </Layer>
                </Stage>
            </div>
            <Counter ref={counterRef} />
        </div>
    );
});

export default memo(GameCanvas);

const MemoizedPoints = memo(({
    points,
    handlePointClick,
    setPointRef,
    disabled
}: {
    points: PointType[],
    handlePointClick: (pointId: string, label: number, anim: Animation) => void,
    setPointRef: (index: number) => (pointRef: PointRef | null) => void,
    disabled: boolean,
}) => {
    return (
        <>
            {points.sort((a, b) => b.label - a.label).map((p, index) => (
                <Point
                    key={p.id}
                    point={p}
                    onClick={handlePointClick}
                    ref={setPointRef(index)}
                    disabled={disabled}
                />
            ))}</>
    )
})