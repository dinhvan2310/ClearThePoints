import { useCallback, useRef, useState } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Row from '../../../components/Row';
import { Timer, type TimerRef } from '../../../components/Timer';
import type { GameState } from '../utils/types';
import GameCanvas, { type GameCanvasRef } from './GameCanvas';

export default function GameBoard() {
    const timerRef = useRef<TimerRef | null>(null);
    const gameCanvasRef = useRef<GameCanvasRef | null>(null);
    const [gameState, setGameState] = useState<GameState>('idle')
    const [autoPlay, setAutoPlay] = useState<boolean>(false)
    const [numPoints, setNumPoints] = useState<number>(5);


    const handleGameComplete = useCallback((gameState: GameState) => {
        setGameState(gameState)
        if (gameState === 'cleared' || gameState === 'failed') {
            gameCanvasRef.current?.stop()
            timerRef.current?.stop()
        }
    }, [])

    // render
    const renderTitle = useCallback(() => {
        if (gameState === 'idle' || gameState === 'running') {
            return <h1 className="text-2xl font-bold">LET'S PLAY</h1>
        } else if (gameState === 'cleared') {
            return <h1 className="text-2xl font-bold text-green-500">ALL CLEARED</h1>
        } else if (gameState === 'failed') {
            return <h1 className="text-2xl font-bold text-red-500">GAME OVER</h1>
        }
    }, [gameState])
    const renderButtonStartGame = useCallback(() => {
        if (gameState === 'idle') {
            return (
                <Button onClick={() => {
                    setGameState('running')
                    gameCanvasRef.current?.play(numPoints)
                    timerRef.current?.start()
                    setAutoPlay(false)
                }}>
                    Play
                </Button>
            )
        } else if (gameState === 'running' || gameState === 'cleared' || gameState === 'failed') {
            return (
                <Button onClick={() => {
                    timerRef.current?.reset()
                    setGameState('running')
                    gameCanvasRef.current?.play(numPoints)
                    timerRef.current?.start()
                    setAutoPlay(false)
                }}>
                    Restart
                </Button>
            )
        }
    }, [gameState, numPoints])

    return (
        <main className="mx-auto max-w-3xl h-[100vh] py-4 flex flex-col overflow-hidden">
            <header className="flex flex-col gap-2 pb-4">
                {renderTitle()}
                <Row>
                    <div className="flex-1">
                        <p>Points:</p>
                    </div>
                    <div className="flex-3">
                        <Input type="number" value={numPoints} onChange={(e) => {
                            setNumPoints(Number(e.target.value))
                        }} />
                    </div>
                </Row>
                <Row>
                    <div className="flex-1">
                        <p>Time:</p>
                    </div>
                    <div className="flex-3">
                        <Timer ref={timerRef} />
                    </div>
                </Row>
                <Row>
                    {renderButtonStartGame()}
                    {gameState === 'running' && (
                        <Button onClick={() => {
                            setAutoPlay(!autoPlay)
                            gameCanvasRef.current?.autoPlay()
                        }}>
                            {autoPlay ? 'Auto Play OFF' : 'Auto Play ON'}
                        </Button>
                    )}
                </Row>
            </header>
            <GameCanvas ref={gameCanvasRef}
                onGameComplete={handleGameComplete}
            />
        </main>

    );
}


